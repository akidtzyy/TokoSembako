require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================================
// PRODUCTS
// ============================================================
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY code ASC');
    // Map snake_case ke camelCase agar kompatibel dengan frontend
    const products = rows.map(mapProduct);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { code, name, category, price, cost, unit, image, isPopular } = req.body;
    const id = 'p_' + Date.now();
    await pool.query(
      'INSERT INTO products (id, code, name, category, price, cost, unit, image, is_popular) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, code, name, category, price || 0, cost || 0, unit || 'Pcs', image || '', isPopular ? 1 : 0]
    );
    // Auto-create stock entry
    const firstSupplier = await pool.query('SELECT id, name FROM suppliers LIMIT 1');
    const supplierId = firstSupplier[0][0]?.id || null;
    const supplierName = firstSupplier[0][0]?.name || 'Tanpa Supplier';
    await pool.query(
      'INSERT INTO stocks (id, product_id, product_name, supplier_id, supplier_name, stock_min, stock_actual, last_updated) VALUES (?,?,?,?,?,?,?,?)',
      ['st_' + id, id, name, supplierId, supplierName, 10, 0, new Date().toISOString().split('T')[0]]
    );
    const [newProd] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(mapProduct(newProd[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, category, price, cost, unit, image, isPopular } = req.body;
    await pool.query(
      'UPDATE products SET code=?, name=?, category=?, price=?, cost=?, unit=?, image=?, is_popular=? WHERE id=?',
      [code, name, category, price, cost, unit, image, isPopular ? 1 : 0, id]
    );
    // Update product name in stocks
    await pool.query('UPDATE stocks SET product_name=? WHERE product_id=?', [name, id]);
    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(mapProduct(updated[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// SUPPLIERS
// ============================================================
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY code ASC');
    res.json(rows.map(mapSupplier));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { code, name, contact, email, address } = req.body;
    const id = 's_' + Date.now();
    await pool.query(
      'INSERT INTO suppliers (id, code, name, contact, email, address) VALUES (?,?,?,?,?,?)',
      [id, code, name, contact || '', email || '', address || '']
    );
    const [newSup] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.status(201).json(mapSupplier(newSup[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, contact, email, address } = req.body;
    await pool.query(
      'UPDATE suppliers SET code=?, name=?, contact=?, email=?, address=? WHERE id=?',
      [code, name, contact, email, address, id]
    );
    // Update supplier name in stocks
    await pool.query('UPDATE stocks SET supplier_name=? WHERE supplier_id=?', [name, id]);
    const [updated] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.json(mapSupplier(updated[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    // Clear supplier from stocks
    await pool.query("UPDATE stocks SET supplier_id=NULL, supplier_name='Tanpa Supplier' WHERE supplier_id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// STOCKS
// ============================================================
app.get('/api/stocks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stocks');
    res.json(rows.map(mapStock));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId, supplierName, stockMin, stockActual } = req.body;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'UPDATE stocks SET supplier_id=?, supplier_name=?, stock_min=?, stock_actual=?, last_updated=? WHERE id=?',
      [supplierId || null, supplierName || 'Tanpa Supplier', stockMin, stockActual, today, id]
    );
    const [updated] = await pool.query('SELECT * FROM stocks WHERE id = ?', [id]);
    res.json(mapStock(updated[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adjust quantity (tambah/kurang stok)
app.patch('/api/stocks/adjust/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantityChange } = req.body;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'UPDATE stocks SET stock_actual = GREATEST(0, stock_actual + ?), last_updated=? WHERE product_id=?',
      [quantityChange, today, productId]
    );
    const [updated] = await pool.query('SELECT * FROM stocks WHERE product_id = ?', [productId]);
    res.json(mapStock(updated[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// SALES
// ============================================================
app.get('/api/sales', async (req, res) => {
  try {
    const [salesRows] = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC, id DESC');
    const [itemsRows] = await pool.query('SELECT * FROM sale_items');

    const sales = salesRows.map(sale => {
      const items = itemsRows
        .filter(item => item.sale_id === sale.id)
        .map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }));
      return {
        id: sale.id,
        invoice: sale.invoice,
        date: sale.sale_date instanceof Date
          ? sale.sale_date.toISOString().split('T')[0]
          : String(sale.sale_date).split('T')[0],
        totalAmount: sale.total_amount,
        cashier: sale.cashier,
        paymentMethod: sale.payment_method,
        items,
      };
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { items, totalAmount, cashier, paymentMethod, date } = req.body;
    const id = 't_' + Date.now();
    const saleDate = date || new Date().toISOString().split('T')[0];
    const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM sales');
    const counter = String(countRows[0].cnt + 1).padStart(3, '0');
    const invoice = 'TRX-' + saleDate.replace(/-/g, '') + '-' + counter;

    await pool.query(
      'INSERT INTO sales (id, invoice, sale_date, total_amount, cashier, payment_method) VALUES (?,?,?,?,?,?)',
      [id, invoice, saleDate, totalAmount, cashier, paymentMethod || 'Tunai']
    );

    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, total) VALUES (?,?,?,?,?,?)',
          [id, item.productId, item.productName, item.quantity, item.price, item.total]
        );
      }
    }

    const [newSale] = await pool.query('SELECT * FROM sales WHERE id = ?', [id]);
    res.status(201).json({
      id,
      invoice,
      date: saleDate,
      totalAmount,
      cashier,
      paymentMethod,
      items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ANNOUNCEMENTS
// ============================================================
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY ann_date DESC');
    res.json(rows.map(mapAnnouncement));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    const id = 'a_' + Date.now();
    const annDate = new Date().toISOString().split('T')[0];
    await pool.query(
      'INSERT INTO announcements (id, title, content, ann_date, is_active) VALUES (?,?,?,?,?)',
      [id, title, content, annDate, isActive !== false ? 1 : 0]
    );
    const [newAnn] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    res.status(201).json(mapAnnouncement(newAnn[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    await pool.query(
      'UPDATE announcements SET title=?, content=?, is_active=? WHERE id=?',
      [title, content, isActive ? 1 : 0, id]
    );
    const [updated] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    res.json(mapAnnouncement(updated[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username } = req.body;
    // Simple auth: check if username is 'admin' or 'kasir'
    const validUsers = {
      admin: { name: 'Dika (Admin)', role: 'Owner' },
      kasir: { name: 'Kasir Toko', role: 'User' },
    };
    const user = validUsers[username];
    if (user) {
      res.json({ success: true, user: { username, ...user } });
    } else {
      res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// HELPER MAPPERS (snake_case → camelCase)
// ============================================================
function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    price: row.price,
    cost: row.cost,
    unit: row.unit,
    image: row.image,
    isPopular: row.is_popular === 1,
  };
}

function mapSupplier(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    contact: row.contact,
    email: row.email,
    address: row.address,
  };
}

function mapStock(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    stockMin: row.stock_min,
    stockActual: row.stock_actual,
    lastUpdated: row.last_updated instanceof Date
      ? row.last_updated.toISOString().split('T')[0]
      : String(row.last_updated).split('T')[0],
  };
}

function mapAnnouncement(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    date: row.ann_date instanceof Date
      ? row.ann_date.toISOString().split('T')[0]
      : String(row.ann_date).split('T')[0],
    isActive: row.is_active === 1,
  };
}

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🚀 Toko Sembako API Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'toko_sembako'} @ ${process.env.DB_HOST || 'localhost'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});
