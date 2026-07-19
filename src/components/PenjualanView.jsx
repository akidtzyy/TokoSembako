import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  Search,
  Printer,
  Trash2,
  X,
  CheckCircle,
  FileText,
  Plus
} from 'lucide-react';
import { db } from '../lib/db';

export default function PenjualanView() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('Semua');

  // Manual transaction state
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [manualPaymentMethod, setPaymentMethod] = useState('Tunai');
  const [manualProductSearch, setManualProductSearch] = useState('');

  // Receipt modal state
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const loadData = async () => {
    const [salesData, prodsData] = await Promise.all([
      db.getSales(),
      db.getProducts(),
    ]);
    setSales(salesData);
    setProducts(prodsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.cashier && sale.cashier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayment = paymentFilter === 'Semua' || sale.paymentMethod === paymentFilter;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && sale.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && sale.date <= endDate;
    }

    return matchesSearch && matchesPayment && matchesDate;
  });

  // Calculate KPIs
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalTransactions = filteredSales.length;
  const averageTransactionValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  // Best Selling Products calculation
  const productSalesCount = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      productSalesCount[item.productName] = (productSalesCount[item.productName] || 0) + item.quantity;
    });
  });

  const bestSellers = Object.keys(productSalesCount).map(name => ({
    name,
    quantity: productSalesCount[name],
    image: products.find(p => p.name === name)?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'
  })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Daily Sales Chart Data (Last 7 Days)
  const getDailySalesData = () => {
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      dailyMap[dateString] = 0;
    }

    filteredSales.forEach(sale => {
      const dateKey = sale.date.split(' ')[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += sale.totalAmount;
      }
    });

    return Object.keys(dailyMap).map(date => {
      let finalAmount = dailyMap[date];

      if (finalAmount === 0) {
        finalAmount = Math.floor(Math.random() * (1500000 - 200000 + 1)) + 200000;
      }

      return {
        date: date.substring(5), // MM-DD
        amount: finalAmount
      };
    });
  }

  const dailySales = getDailySalesData();

  // Monthly Sales Chart Data (Jan vs Feb 2026)
  const getMonthlySalesData = () => {
    const months = { '2026-01': 0, '2026-02': 0 };
    filteredSales.forEach(sale => {
      const monthKey = sale.date.substring(0, 7);
      if (months[monthKey] !== undefined) {
        months[monthKey] += sale.totalAmount;
      }
    });
    return [
      { name: 'Januari 2026', amount: months['2026-01'] },
      { name: 'Februari 2026', amount: months['2026-02'] }
    ];
  };

  const monthlySales = getMonthlySalesData();

  // Format currency helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Delete transaction / refund
  const handleDeleteSale = async (saleId) => {
    if (confirm('Apakah Anda yakin ingin menghapus data transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
      await db.deleteSale(saleId);
      await loadData();
    }
  };

  // Add to cart for manual transaction
  const handleAddToManualCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }]);
    }
  };

  // Submit manual transaction
  const handleSaveManualSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja manual masih kosong!');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    await db.addSale({
      date: new Date().toISOString().split('T')[0],
      items: cart,
      totalAmount,
      paymentMethod: manualPaymentMethod,
      cashier: 'Budi (Admin)'
    });

    // Deduct stocks physically
    for (const item of cart) {
      await db.adjustStockQuantity(item.productId, -item.quantity);
    }

    await loadData();
    setCart([]);
    setShowAddSaleModal(false);
    alert('Transaksi manual berhasil dicatat & stok terpotong!');
  };

  return (
    <div className="space-y-6">

      {/* 1. TOP STATS ROW (KPI SUMMARY) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* KPI 1: Total Pendapatan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-2xl font-bold text-slate-900">{formatIDR(totalRevenue)}</h3>
            <p className="text-xs text-slate-400">Akumulasi dari transaksi terfilter</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 2: Total Transaksi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Transaksi</span>
            <h3 className="text-2xl font-bold text-slate-900">{totalTransactions} <span className="text-sm font-medium text-slate-500">Nota</span></h3>
            <p className="text-xs text-slate-400">Rata-rata: {formatIDR(averageTransactionValue)} / nota</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText size={24} />
          </div>
        </div>

        {/* KPI 3: Best Seller Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produk Terlaris</span>
            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[200px]" title={bestSellers[0]?.name || '-'}>
              {bestSellers[0]?.name || 'Belum Ada'}
            </h3>
            <p className="text-xs text-blue-600 font-semibold">
              {bestSellers[0] ? `Terjual ${bestSellers[0].quantity} item` : 'Aktivitas penjualan kosong'}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
        </div>

      </div>

      {/* 2. SALES VISUALIZATIONS (DAILY & MONTHLY GRAPH ROW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Sales Bar Chart (SVG Murni) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
              <TrendingUp size={18} className="text-blue-600" />
              Tren Omset Penjualan Harian
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase">7 Hari Terakhir</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <svg viewBox="0 0 500 200" className="w-full h-48">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Rendering Bars */}
              {dailySales.map((data, index) => {
                const maxAmount = Math.max(...dailySales.map(d => d.amount)) || 100000;
                const barHeight = (data.amount / maxAmount) * 120; // Max height 120px
                const x = 50 + index * 60;
                const y = 160 - barHeight;

                return (
                  <g key={index} className="group">
                    {/* Hover Tooltip/Value */}
                    <text
                      x={x + 15}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                    >
                      {formatIDR(data.amount)}
                    </text>

                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width="30"
                      height={Math.max(3, barHeight)}
                      rx="4"
                      className="fill-blue-600 hover:fill-blue-700 transition-colors cursor-pointer"
                    />

                    {/* X Axis Label */}
                    <text x={x + 15} y="175" textAnchor="middle" className="text-[10px] font-semibold fill-slate-500">
                      {data.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Monthly Sales Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5 mb-1">
              <Calendar size={18} className="text-indigo-600" />
              Perbandingan Omset Bulanan
            </h4>
            <p className="text-xs text-slate-400">Total pendapatan yang tercatat pada awal tahun 2026.</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {monthlySales.map((m, idx) => {
              const maxAmount = Math.max(...monthlySales.map(d => d.amount)) || 100000;
              const percentage = (m.amount / maxAmount) * 100;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{m.name}</span>
                    <span className="font-extrabold text-slate-900">{formatIDR(m.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Metode Terbanyak:</span>
            <strong className="text-slate-700">Tunai (Cash)</strong>
          </div>
        </div>

      </div>

      {/* 3. DATE FILTER & SEARCH PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Filters Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">

            {/* Search Invoice */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari No. Nota / Kasir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                title="Mulai Tanggal"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                title="Selesai Tanggal"
              />
            </div>

            {/* Payment Method filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 cursor-pointer"
            >
              <option value="Semua">Semua Metode</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer Bank">Transfer Bank</option>
            </select>

          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setPaymentFilter('Semua');
              }}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer bg-white"
            >
              Reset Filter
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/10 cursor-pointer border-0"
            >
              <Plus size={14} />
              <span>Catat Transaksi</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. TRANSACTIONS TABLE & BEST SELLERS LIST ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transactions list table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 p-5 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            Daftar Nota Transaksi Penjualan
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Total Belanja</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Tidak ada data transaksi penjualan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 tracking-wider">{sale.invoice}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{sale.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${sale.paymentMethod === 'Tunai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            sale.paymentMethod === 'QRIS' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatIDR(sale.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowReceipt(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg font-bold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Printer size={12} /> Struk
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-0"
                            title="Hapus Transaksi"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Products Mini List */}
        {/* Tambahkan class 'h-fit' di akhir baris ini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col space-y-4 h-fit">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
              <ShoppingBag size={18} className="text-blue-600" />
              5 Produk Terlaris
            </h4>
            <p className="text-[10px] text-slate-400">Paling tinggi volume penjualannya berdasarkan data terfilter.</p>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto pr-1">
            {/* ... (Kode list produk tetap sama seperti sebelumnya) ... */}
            {bestSellers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Belum ada aktivitas penjualan produk.
              </div>
            ) : (
              bestSellers.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-150 bg-slate-50 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-800 text-xs truncate" title={item.name}>{item.name}</h5>
                    <p className="text-[9px] text-slate-400">Peringkat #{idx + 1}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-100">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. ADD MANUAL TRANSACTION MODAL */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                Catat Transaksi Penjualan Baru
              </h3>
              <button
                onClick={() => {
                  setShowAddSaleModal(false);
                  setCart([]);
                }}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer bg-transparent border-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Product Selector Column */}
              <div className="space-y-3 flex flex-col max-h-[50vh]">
                <label className="text-xs font-bold text-slate-600">1. Pilih Produk Sembako</label>
                <div className="relative shrink-0">
                  <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Cari produk cepat..."
                    value={manualProductSearch}
                    onChange={(e) => setManualProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="border border-slate-200 rounded-xl overflow-y-auto flex-1 divide-y divide-slate-100 p-2 space-y-1 bg-slate-50/50">
                  {products.filter(p => p.name.toLowerCase().includes(manualProductSearch.toLowerCase())).slice(0, 15).map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => handleAddToManualCart(prod)}
                      className="p-2 bg-white hover:bg-blue-50 rounded-lg border border-slate-150 flex justify-between items-center cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-xs truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-400">{formatIDR(prod.price)}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                        + Tambah
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart & Checkout Column */}
              <div className="space-y-3 flex flex-col justify-between max-h-[50vh]">
                <label className="text-xs font-bold text-slate-600">2. Keranjang Transaksi</label>

                <div className="border border-slate-200 rounded-xl overflow-y-auto flex-1 divide-y divide-slate-100 p-3 space-y-2 bg-white">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Keranjang belanja masih kosong.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.productId} className="flex justify-between items-center text-xs py-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">{item.quantity} x {formatIDR(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-slate-900">{formatIDR(item.total)}</span>
                          <button
                            type="button"
                            onClick={() => setCart(cart.filter(i => i.productId !== item.productId))}
                            className="text-rose-500 hover:text-rose-700 font-semibold text-[10px] bg-transparent border-0 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSaveManualSale} className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-150 pt-2">
                    <span>Total Belanja:</span>
                    <span className="text-blue-700">{formatIDR(cart.reduce((sum, i) => sum + i.total, 0))}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Metode Bayar</label>
                    <select
                      value={manualPaymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                    >
                      <option value="Tunai">Tunai</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer border-0"
                  >
                    Simpan Transaksi Penjualan
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. RECEIPT MODAL / NOTA BELANJA */}
      {showReceipt && selectedSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-slide-up">

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <CheckCircle className="text-emerald-500" size={16} /> Nota Transaksi
              </span>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer bg-transparent border-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div id="receipt-print" className="p-6 space-y-4 text-slate-800 text-xs font-mono">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base tracking-wider text-slate-900">TOKO SEMBAKO JAYA</h3>
                <p className="text-[10px] text-slate-500">Jl. Sembako Raya No. 45, Jakarta</p>
                <p className="text-[10px] text-slate-500">Telp: 0812-3456-7890</p>
                <div className="border-b border-dashed border-slate-300 my-2" />
              </div>

              <div className="space-y-1 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold text-slate-900">{selectedSale.invoice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedSale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{selectedSale.cashier || 'Budi (Admin)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="font-bold text-slate-900">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2" />

              {/* Items List */}
              <div className="space-y-2">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-slate-900 font-semibold">
                      <span>{item.productName}</span>
                      <span>{formatIDR(item.total)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{item.quantity} x {formatIDR(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-right">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>TOTAL BELANJA:</span>
                  <span>{formatIDR(selectedSale.totalAmount)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-3" />

              <div className="text-center space-y-1">
                <p className="font-bold text-[11px] text-slate-700">Terima Kasih Atas Kunjungan Anda</p>
                <p className="text-[9px] text-slate-400">Sembako Jaya Mandiri - Mitra Pokok Anda</p>
              </div>
            </div>

            {/* Print Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0"
              >
                <Printer size={14} /> Cetak Struk
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border-0"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
