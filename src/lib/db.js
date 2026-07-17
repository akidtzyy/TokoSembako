const DEFAULT_PRODUCTS = [
  // 1. Beras & Gandum (9 items)
  { id: 'p1', code: 'BRG-001', name: 'Beras Pandan Wangi Super 5kg', category: 'Beras & Gandum', price: 78000, cost: 68000, unit: 'Karung', image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/MTA-21601792/day_2_day_day_2_day_beras_pandan_wangi_5kg_full02_kdy0teci.jpeg', isPopular: true },
  { id: 'p2', code: 'BRG-002', name: 'Beras Cianjur Kepala Selera 5kg', category: 'Beras & Gandum', price: 74000, cost: 65000, unit: 'Karung', image: 'https://i0.wp.com/raisa.aeonstore.id/wp-content/uploads/2023/05/3899182.jpg?fit=700%2C700&ssl=1' },
  { id: 'p3', code: 'BRG-003', name: 'Beras Merah Organik Sehat 1kg', category: 'Beras & Gandum', price: 28000, cost: 23000, unit: 'Bungkus', image: 'https://down-id.img.susercontent.com/file/id-11134207-81ztc-mefelguylbls1d' },
  { id: 'p4', code: 'BRG-004', name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Beras & Gandum', price: 14500, cost: 12500, unit: 'Bungkus', image: 'https://order.lottemart.co.id/_next/image?url=https%3A%2F%2Fcoreimages.lottemart.co.id%2Ford%2F06%2F1017239000&w=1920&q=75', isPopular: true },
  { id: 'p5', code: 'BRG-005', name: 'Tepung Cakra Kembar Premium 1kg', category: 'Beras & Gandum', price: 15500, cost: 13000, unit: 'Bungkus', image: 'https://solvent-production.s3.amazonaws.com/media/images/products/2021/04/2031a.jpg' },
  { id: 'p6', code: 'BRG-006', name: 'Tepung Beras Rose Brand 500g', category: 'Beras & Gandum', price: 8500, cost: 7000, unit: 'Bungkus', image: 'https://order.lottemart.co.id/_next/image?url=https%3A%2F%2Fcoreimages.lottemart.co.id%2Ford%2F06%2F1035633000&w=1920&q=75' },
  { id: 'p7', code: 'BRG-007', name: 'Tepung Ketan Putih Rose Brand 500g', category: 'Beras & Gandum', price: 9500, cost: 8000, unit: 'Bungkus', image: 'https://id-test-11.slatic.net/p/b665b4102760d9b997e6803c17507e27.jpg' },
  { id: 'p8', code: 'BRG-008', name: 'Tepung Maizena Maizenaku 250g', category: 'Beras & Gandum', price: 6500, cost: 5200, unit: 'Bungkus', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8VSVAfTsumUjpmt6T37H-sU8eHk2ojnCfIVbVefaeIw&s' },
  { id: 'p9', code: 'BRG-009', name: 'Gandum Oatmeal Quaker Merah 800g', category: 'Beras & Gandum', price: 46000, cost: 41000, unit: 'Kotak', image: 'https://down-id.img.susercontent.com/file/2548f65524abc55637d4f5033e406dd4' },  

  // 2. Minyak Goreng & Mentega (5 items)
  { id: 'p10', code: 'MNG-001', name: 'Minyak Goreng Bimoli Spesial 2L', category: 'Minyak Goreng & Mentega', price: 38500, cost: 34000, unit: 'Pouch', image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//94/MTA-3406188/bimoli_bimoli-2ltr-special-refill_full02.jpg', isPopular: true },
  { id: 'p11', code: 'MNG-002', name: 'Minyak Goreng Sania Premium 1L', category: 'Minyak Goreng & Mentega', price: 19500, cost: 17000, unit: 'Pouch', image: 'https://image.astronauts.cloud/product-images/2024/4/SaniaMinyakGorengPouchCookingOil1_aba7b712-6490-4645-88bb-b23d1ad2a54b_900x900.png' },
  { id: 'p12', code: 'MNG-003', name: 'Margarin Blue Band Serbaguna 200g', category: 'Minyak Goreng & Mentega', price: 9200, cost: 7800, unit: 'Sachet', image: 'https://down-id.img.susercontent.com/file/id-11134207-7r991-lqvajygh5w3x6e', isPopular: true },
  { id: 'p13', code: 'MNG-004', name: 'Simas Margarin Dapur 200g', category: 'Minyak Goreng & Mentega', price: 6500, cost: 5200, unit: 'Sachet', image: 'https://coreimages.lottemart.co.id/ord/06/1084348000' },
  { id: 'p14', code: 'MNG-005', name: 'Minyak Wijen Lee Kum Kee 115ml', category: 'Minyak Goreng & Mentega', price: 29000, cost: 25000, unit: 'Botol', image: 'https://image.astronauts.cloud/product-images/2024/4/LeeKumKeeMinyakWijen115mlSesameOil1_76fba4b8-7455-46f4-a8c5-d55c2966dfe2_900x900.png' },
  { id: 'p15', code: 'MNG-060', name: 'Minyak Zaitun Bertolli Extra Virgin 250ml', category: 'Minyak Goreng & Mentega', price: 65000, cost: 57000, unit: 'Botol', image: 'https://down-id.img.susercontent.com/file/180bb3b42b97a118b61abfd1ff641940' },

  // 3. Gula & Pemanis (5 items)
  { id: 'p16', code: 'GUL-001', name: 'Gula Pasir Gulaku Putih Premium 1kg', category: 'Gula & Pemanis', price: 17500, cost: 15000, unit: 'Bungkus', image: 'https://media.monotaro.id/mid01/big/Perlengkapan%20Dapur%20%26%20Horeka/Makanan/Gula/Gula%20Pasir/Gulaku%20Gula%20Pasir%20Premium%20Putih%20(Sugar)/80P101558288-34.jpg', isPopular: true },
  { id: 'p17', code: 'GUL-002', name: 'Gula Pasir Rose Brand Kuning 1kg', category: 'Gula & Pemanis', price: 16800, cost: 14500, unit: 'Bungkus', image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//104/MTA-57537049/rose-brand_gula-rosebrand-1-kg-kuning_full01.jpg' },
  { id: 'p18', code: 'GUL-003', name: 'Gula Batu Super Manis Alami 500g', category: 'Gula & Pemanis', price: 12000, cost: 9800, unit: 'Bungkus', image: 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/047617fbc02849ffb7b9a0847a3ffe31~tplv-aphluv4xwc-white-pad-v1:500:500.jpeg' },
  { id: 'p19', code: 'GUL-004', name: 'Sirup Marjan Boudoin Cocopandan 460ml', category: 'Gula & Pemanis', price: 22500, cost: 19000, unit: 'Botol', image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/106/MTA-184363657/no_brand_marjan_boudoin_syrup_rasa_cocopandan_460ml_full01_lzu4b44y.webp', isPopular: true },
  { id: 'p20', code: 'GUL-005', name: 'Sirup ABC Squash Orange Segar 460ml', category: 'Gula & Pemanis', price: 14500, cost: 12000, unit: 'Botol', image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//92/MTA-21780118/abc_abc-syrup-squash-orange-460ml-btl_full01.jpg' },

  // 4. Mie & Pasta (2 items)
  { id: 'p21', code: 'MIE-001', name: 'Indomie Goreng Spesial Murah', category: 'Mie & Pasta', price: 3100, cost: 2600, unit: 'Pcs', image: 'https://image.astronauts.cloud/product-images/2024/4/IndomieGorengSpesialMieinstan1_19ed38d5-421f-4813-bd66-25cf83f1909c_900x900.png', isPopular: true },
  { id: 'p22', code: 'MIE-002', name: 'Indomie Kuah Soto Mie Gurih', category: 'Mie & Pasta', price: 3000, cost: 2550, unit: 'Pcs', image: 'https://c.alfagift.id/product/1/1_A09430004766_20210705132929931_base.jpg', isPopular: true },

  // 5. Susu & Olahan Susu (2 items)
  { id: 'p23', code: 'SSU-001', name: 'Susu Kental Manis Frisian Flag Emas 370g', category: 'Susu & Olahan Susu', price: 12500, cost: 10800, unit: 'Kaleng', image: 'https://www.frisianflag.com/storage/app/media/Produk/BKM-545gr.png', isPopular: true },
  { id: 'p24', code: 'SSU-002', name: 'Susu UHT Ultra Milk Full Cream 1L', category: 'Susu & Olahan Susu', price: 18500, cost: 16000, unit: 'Kotak', image: 'https://tokoelmanna.com/wp-content/uploads/2021/04/uht-plain.jpg', isPopular: true },
];

const DEFAULT_SUPPLIERS = [
  { id: 's1', code: 'SPL-001', name: 'PT Sinar Mas Distribusi', contact: '0812-3456-7890', email: 'info@sinarmasdist.com', address: 'Jl. Industri No. 12, Jakarta Utara' },
  { id: 's2', code: 'SPL-002', name: 'CV Pangan Makmur', contact: '0857-9988-7766', email: 'marketing@panganmakmur.com', address: 'Kawasan Industri Candi Blok B-4, Semarang' },
  { id: 's3', code: 'SPL-003', name: 'PT Indofood CBP Sukses Makmur', contact: '021-5701500', email: 'corporate@indofood.co.id', address: 'Sudirman Plaza, Indofood Tower, Jakarta Selatan' },
  { id: 's4', code: 'SPL-004', name: 'UD Tani Sejahtera', contact: '0821-4433-2211', email: 'tanisejahtera.ud@gmail.com', address: 'Jl. Raya Agro No. 8, Cianjur' }
];

// Generate 23 corresponding stock entries automatically linked to the 23 products
const generateDefaultStocks = () => {
  return DEFAULT_PRODUCTS.map((prod, index) => {
    let supplierId = 's2';
    let supplierName = 'CV Pangan Makmur';
    if (prod.category === 'Beras & Gandum') {
      supplierId = 's4';
      supplierName = 'UD Tani Sejahtera';
    } else if (prod.category === 'Mie & Pasta') {
      supplierId = 's3';
      supplierName = 'PT Indofood CBP Sukses Makmur';
    } else if (index % 3 === 0) {
      supplierId = 's1';
      supplierName = 'PT Sinar Mas Distribusi';
    }

    let stockMin = 20;
    let stockActual = 40 + (index % 7) * 12;

    if (index === 4 || index === 11 || index === 21 || index === 43 || index === 50 || index === 60) {
      stockMin = 30;
      stockActual = 8; // Low stock alert!
    }

    return {
      id: `st_${prod.id}`,
      productId: prod.id,
      productName: prod.name,
      supplierId,
      supplierName,
      stockMin,
      stockActual,
      lastUpdated: '2026-02-24'
    };
  });
};

const DEFAULT_STOCKS = generateDefaultStocks();

// High Quality Sales Data spanning January & February 2026
const DEFAULT_SALES = [
  { id: 't1', invoice: 'TRX-20260224-001', date: '2026-02-24', items: [{ productId: 'p1', productName: 'Beras Pandan Wangi Super 5kg', quantity: 2, price: 78000, total: 156000 }, { productId: 'p11', productName: 'Minyak Goreng Bimoli Spesial 2L', quantity: 1, price: 38500, total: 38500 }], totalAmount: 194500, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't2', invoice: 'TRX-20260224-002', date: '2026-02-24', items: [{ productId: 'p31', productName: 'Indomie Goreng Spesial Murah', quantity: 10, price: 3100, total: 31000 }, { productId: 'p21', productName: 'Gula Pasir Gulaku Putih Premium 1kg', quantity: 4, price: 17500, total: 70000 }], totalAmount: 101000, cashier: 'Dika (Admin)', paymentMethod: 'QRIS' },
  { id: 't3', invoice: 'TRX-20260223-001', date: '2026-02-23', items: [{ productId: 'p41', productName: 'Susu Kental Manis Frisian Flag Emas 370g', quantity: 5, price: 12500, total: 62500 }, { productId: 'p4', productName: 'Tepung Terigu Segitiga Biru 1kg', quantity: 3, price: 14500, total: 43500 }], totalAmount: 106000, cashier: 'Dika (Admin)', paymentMethod: 'Transfer Bank' },
  { id: 't4', invoice: 'TRX-20260222-001', date: '2026-02-22', items: [{ productId: 'p1', productName: 'Beras Pandan Wangi Super 5kg', quantity: 4, price: 78000, total: 312000 }], totalAmount: 312000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't5', invoice: 'TRX-20260221-001', date: '2026-02-21', items: [{ productId: 'p13', productName: 'Minyak Goreng SunCo Higienis 2L', quantity: 2, price: 39500, total: 79000 }, { productId: 'p26', productName: 'Madu Pramuka Alami Bunga Randu 350ml', quantity: 1, price: 75000, total: 75000 }], totalAmount: 154000, cashier: 'Dika (Admin)', paymentMethod: 'QRIS' },
  { id: 't6', invoice: 'TRX-20260220-001', date: '2026-02-20', items: [{ productId: 'p55', productName: 'Kecap Manis Bango Botol Kedelai Hitam 520ml', quantity: 3, price: 24500, total: 73500 }], totalAmount: 73500, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't7', invoice: 'TRX-20260218-001', date: '2026-02-18', items: [{ productId: 'p63', productName: 'Kopi Kapal Api Special Mix Mantap 165g', quantity: 8, price: 14500, total: 116000 }], totalAmount: 116000, cashier: 'Dika (Admin)', paymentMethod: 'Transfer Bank' },
  { id: 't8', invoice: 'TRX-20260215-001', date: '2026-02-15', items: [{ productId: 'p4', productName: 'Tepung Terigu Segitiga Biru 1kg', quantity: 5, price: 14500, total: 72500 }, { productId: 'p11', productName: 'Minyak Goreng Bimoli Spesial 2L', quantity: 3, price: 38500, total: 115500 }], totalAmount: 188000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't9', invoice: 'TRX-20260210-001', date: '2026-02-10', items: [{ productId: 'p1', productName: 'Beras Pandan Wangi Super 5kg', quantity: 5, price: 78000, total: 390000 }], totalAmount: 390000, cashier: 'Dika (Admin)', paymentMethod: 'QRIS' },
  { id: 't10', invoice: 'TRX-20260205-001', date: '2026-02-05', items: [{ productId: 'p43', productName: 'Susu UHT Ultra Milk Full Cream 1L', quantity: 10, price: 18500, total: 185000 }], totalAmount: 185000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  // January 2026 sales
  { id: 't11', invoice: 'TRX-20260128-001', date: '2026-01-28', items: [{ productId: 'p1', productName: 'Beras Pandan Wangi Super 5kg', quantity: 3, price: 78000, total: 234000 }, { productId: 'p21', productName: 'Gula Pasir Gulaku Putih Premium 1kg', quantity: 5, price: 17500, total: 87500 }], totalAmount: 321500, cashier: 'Dika (Admin)', paymentMethod: 'Transfer Bank' },
  { id: 't12', invoice: 'TRX-20260125-001', date: '2026-01-25', items: [{ productId: 'p11', productName: 'Minyak Goreng Bimoli Spesial 2L', quantity: 6, price: 38500, total: 231000 }], totalAmount: 231000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't13', invoice: 'TRX-20260120-001', date: '2026-01-20', items: [{ productId: 'p32', productName: 'Indomie Kuah Soto Mie Gurih', quantity: 40, price: 3000, total: 120000 }], totalAmount: 120000, cashier: 'Dika (Admin)', paymentMethod: 'QRIS' },
  { id: 't14', invoice: 'TRX-20260115-001', date: '2026-01-15', items: [{ productId: 'p46', productName: 'Susu Steril Bear Brand Nestlé 189ml', quantity: 12, price: 10500, total: 126000 }], totalAmount: 126000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' },
  { id: 't15', invoice: 'TRX-20260110-001', date: '2026-01-10', items: [{ productId: 'p26', productName: 'Madu Pramuka Alami Bunga Randu 350ml', quantity: 2, price: 75000, total: 150000 }, { productId: 'p65', productName: 'Milo Bubuk Energi Aktif Cokelat 1kg', quantity: 2, price: 84000, total: 168000 }], totalAmount: 318000, cashier: 'Dika (Admin)', paymentMethod: 'Transfer Bank' },
  { id: 't16', invoice: 'TRX-20260105-001', date: '2026-01-05', items: [{ productId: 'p4', productName: 'Tepung Terigu Segitiga Biru 1kg', quantity: 10, price: 14500, total: 145000 }], totalAmount: 145000, cashier: 'Dika (Admin)', paymentMethod: 'Tunai' }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Promo Sembako Murah', content: 'Diskon 10% untuk pembelian Beras Pandan Wangi setiap hari Jumat Berkah!', date: '2026-02-20', isActive: true },
];

// Helper to safely access localStorage
const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage key:', key, error);
  }
};

export const initDB = (force = false) => {
  if (force || !localStorage.getItem('sembako_products')) {
    setStorageItem('sembako_products', DEFAULT_PRODUCTS);
    setStorageItem('sembako_suppliers', DEFAULT_SUPPLIERS);
    setStorageItem('sembako_stocks', DEFAULT_STOCKS);
    setStorageItem('sembako_sales', DEFAULT_SALES);
    setStorageItem('sembako_announcements', DEFAULT_ANNOUNCEMENTS);
    setStorageItem('sembako_auth', { loggedIn: false, user: null });
  }
};

// Initialize DB immediately on import
initDB();

export const db = {
  // Products
  getProducts: () => getStorageItem('sembako_products', DEFAULT_PRODUCTS),
  saveProducts: (products) => setStorageItem('sembako_products', products),
  addProduct: (product) => {
    const products = db.getProducts();
    const newProduct = { ...product, id: 'p_' + Date.now() };
    products.push(newProduct);
    db.saveProducts(products);

    // Auto-create stock entry
    const stocks = db.getStocks();
    const newStock = {
      id: 'st_' + Date.now(),
      productId: newProduct.id,
      productName: newProduct.name,
      supplierId: db.getSuppliers()[0]?.id || '',
      supplierName: db.getSuppliers()[0]?.name || 'Tanpa Supplier',
      stockMin: 10,
      stockActual: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    stocks.push(newStock);
    db.saveStocks(stocks);

    return newProduct;
  },
  updateProduct: (updatedProduct) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      db.saveProducts(products);
      
      // Update name in stocks
      const stocks = db.getStocks();
      stocks.forEach(s => {
        if (s.productId === updatedProduct.id) {
          s.productName = updatedProduct.name;
        }
      });
      db.saveStocks(stocks);
    }
  },
  deleteProduct: (id) => {
    const products = db.getProducts().filter(p => p.id !== id);
    db.saveProducts(products);
    // Delete stock entry too
    const stocks = db.getStocks().filter(s => s.productId !== id);
    db.saveStocks(stocks);
  },

  // Suppliers
  getSuppliers: () => getStorageItem('sembako_suppliers', DEFAULT_SUPPLIERS),
  saveSuppliers: (suppliers) => setStorageItem('sembako_suppliers', suppliers),
  addSupplier: (supplier) => {
    const suppliers = db.getSuppliers();
    const newSupplier = { ...supplier, id: 's_' + Date.now() };
    suppliers.push(newSupplier);
    db.saveSuppliers(suppliers);
    return newSupplier;
  },
  updateSupplier: (updatedSupplier) => {
    const suppliers = db.getSuppliers();
    const index = suppliers.findIndex(s => s.id === updatedSupplier.id);
    if (index !== -1) {
      suppliers[index] = updatedSupplier;
      db.saveSuppliers(suppliers);
      
      // Update supplier name in stocks
      const stocks = db.getStocks();
      stocks.forEach(s => {
        if (s.supplierId === updatedSupplier.id) {
          s.supplierName = updatedSupplier.name;
        }
      });
      db.saveStocks(stocks);
    }
  },
  deleteSupplier: (id) => {
    const suppliers = db.getSuppliers().filter(s => s.id !== id);
    db.saveSuppliers(suppliers);
    // Update stock entries with deleted supplier
    const stocks = db.getStocks();
    stocks.forEach(s => {
      if (s.supplierId === id) {
        s.supplierId = '';
        s.supplierName = 'Tanpa Supplier';
      }
    });
    db.saveStocks(stocks);
  },

  // Stocks
  getStocks: () => getStorageItem('sembako_stocks', DEFAULT_STOCKS),
  saveStocks: (stocks) => setStorageItem('sembako_stocks', stocks),
  updateStock: (updatedStock) => {
    const stocks = db.getStocks();
    const index = stocks.findIndex(s => s.id === updatedStock.id);
    if (index !== -1) {
      stocks[index] = {
        ...updatedStock,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      db.saveStocks(stocks);
    }
  },
  adjustStockQuantity: (productId, quantityChange) => {
    const stocks = db.getStocks();
    const index = stocks.findIndex(s => s.productId === productId);
    if (index !== -1) {
      stocks[index].stockActual = Math.max(0, stocks[index].stockActual + quantityChange);
      stocks[index].lastUpdated = new Date().toISOString().split('T')[0];
      db.saveStocks(stocks);
    }
  },

  // Sales (RESTORED & IMPROVED FOR MANAGEMENT)
  getSales: () => getStorageItem('sembako_sales', DEFAULT_SALES),
  saveSales: (sales) => setStorageItem('sembako_sales', sales),
  addSale: (sale) => {
    const sales = db.getSales();
    const newSale = {
      ...sale,
      id: 't_' + Date.now(),
      invoice: 'TRX-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + String(sales.length + 1).padStart(3, '0')
    };
    sales.unshift(newSale);
    db.saveSales(sales);
    return newSale;
  },
  deleteSale: (id) => {
    const sales = db.getSales().filter(s => s.id !== id);
    db.saveSales(sales);
  },

  // Announcements
  getAnnouncements: () => getStorageItem('sembako_announcements', DEFAULT_ANNOUNCEMENTS),
  saveAnnouncements: (announcements) => setStorageItem('sembako_announcements', announcements),
  addAnnouncement: (announcement) => {
    const announcements = db.getAnnouncements();
    const newAnn = {
      ...announcement,
      id: 'a_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    announcements.unshift(newAnn);
    db.saveAnnouncements(announcements);
    return newAnn;
  },
  updateAnnouncement: (ann) => {
    const announcements = db.getAnnouncements();
    const index = announcements.findIndex(a => a.id === ann.id);
    if (index !== -1) {
      announcements[index] = ann;
      db.saveAnnouncements(announcements);
    }
  },
  deleteAnnouncement: (id) => {
    const announcements = db.getAnnouncements().filter(a => a.id !== id);
    db.saveAnnouncements(announcements);
  },

  // Auth Status
  getAuth: () => getStorageItem('sembako_auth', { loggedIn: false, user: null }),
  setAuth: (loggedIn, user) => setStorageItem('sembako_auth', { loggedIn, user }),

  // Reset database to default
  resetDB: () => {
    initDB(true);
  }
};
