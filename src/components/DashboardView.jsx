import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  XCircle
} from 'lucide-react';
import { db } from '../lib/db';

export default function DashboardView({ isLoggedIn, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Announcement Form State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annId, setAnnId] = useState(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annIsActive, setAnnIsActive] = useState(true);

  const loadData = () => {
    setProducts(db.getProducts());
    setSuppliers(db.getSuppliers());
    setStocks(db.getStocks());
    setAnnouncements(db.getAnnouncements());
  };

  useEffect(() => {
    loadData();
    // Refresh data every 3 seconds to capture updates
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculations
  const totalProducts = products.length;
  const totalSuppliers = suppliers.length;
  
  const lowStockItems = stocks.filter(s => s.stockActual <= s.stockMin);
  const totalLowStock = lowStockItems.length;

  // Total stock value (stockActual * product.price)
  const totalStockValue = stocks.reduce((acc, stock) => {
    const product = products.find(p => p.id === stock.productId);
    if (product) {
      return acc + (stock.stockActual * product.price);
    }
    return acc;
  }, 0);

  // Total investment/buying cost (stockActual * product.cost)
  const totalInvestmentValue = stocks.reduce((acc, stock) => {
    const product = products.find(p => p.id === stock.productId);
    if (product) {
      return acc + (stock.stockActual * product.cost);
    }
    return acc;
  }, 0);

  // Projected Profit on current stock
  const projectedProfit = totalStockValue - totalInvestmentValue;

  // Format currency helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Manage Announcements (Add / Edit)
  const handleOpenAnnModal = (ann) => {
    if (ann) {
      setAnnId(ann.id);
      setAnnTitle(ann.title);
      setAnnContent(ann.content);
      setAnnIsActive(ann.isActive);
    } else {
      setAnnId(null);
      setAnnTitle('');
      setAnnContent('');
      setAnnIsActive(true);
    }
    setShowAnnModal(true);
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    if (annId) {
      // Edit
      const existing = announcements.find(a => a.id === annId);
      if (existing) {
        db.updateAnnouncement({
          ...existing,
          title: annTitle,
          content: annContent,
          isActive: annIsActive
        });
      }
    } else {
      // Add
      db.addAnnouncement({
        title: annTitle,
        content: annContent,
        isActive: annIsActive
      });
    }

    loadData();
    setShowAnnModal(false);
  };

  const handleDeleteAnnouncement = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      db.deleteAnnouncement(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KEY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric Card 1: Projected Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Jual Sembako</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatIDR(totalStockValue)}</h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp size={14} /> Proyeksi Untung: {formatIDR(projectedProfit)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Metric Card 2: Investment Value */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset Modal Stok</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatIDR(totalInvestmentValue)}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Dari {totalProducts} jenis produk sembako
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers size={24} />
          </div>
        </div>

        {/* Metric Card 3: Low Stocks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis</span>
            <h3 className={`text-2xl font-bold ${totalLowStock > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {totalLowStock} <span className="text-sm font-medium text-slate-500">Produk</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {totalLowStock > 0 ? 'Segera lakukan pemesanan ulang!' : 'Semua stok dalam batas aman'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${totalLowStock > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Metric Card 4: Suppliers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mitra Supplier</span>
            <h3 className="text-2xl font-bold text-slate-800">{totalSuppliers} <span className="text-sm font-medium text-slate-500">Mitra</span></h3>
            <p className="text-xs text-blue-600 font-medium hover:underline cursor-pointer" onClick={() => onNavigate('supplier')}>
              Kelola daftar supplier &rarr;
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users size={24} />
          </div>
        </div>

      </div>

      {/* 2. CHARTS & STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Alerts Mini Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              Peringatan Stok Sembako Menipis (Reorder)
            </h4>
            <button 
              onClick={() => onNavigate('stok')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Atur Stok &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3">Pemasok</th>
                  <th className="py-2.5 px-3 text-center">Batas Aman</th>
                  <th className="py-2.5 px-3 text-center">Stok Aktual</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Semua stok aman dan terpenuhi!
                    </td>
                  </tr>
                ) : (
                  lowStockItems.slice(0, 5).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-700">{item.productName}</td>
                      <td className="py-3 px-3 text-slate-500">{item.supplierName}</td>
                      <td className="py-3 px-3 text-center text-slate-500 font-semibold">{item.stockMin}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-600">{item.stockActual}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[9px] rounded-full border border-rose-200">
                          Reorder
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements & Store Info (Admin Editable) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Megaphone size={18} className="text-amber-500" />
              Papan Pengumuman Toko
            </h4>
            {isLoggedIn && (
              <button 
                onClick={() => handleOpenAnnModal()}
                className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                title="Tambah Pengumuman Baru"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-64 pr-1">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada pengumuman toko yang dipasang.
              </div>
            ) : (
              announcements.map(ann => (
                <div 
                  key={ann.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    ann.isActive 
                      ? 'bg-amber-50/40 border-amber-100' 
                      : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      {ann.isActive ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                      )}
                      {ann.title}
                    </h5>
                    
                    {isLoggedIn && (
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleOpenAnnModal(ann)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Edit Pengumuman"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{ann.content}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {ann.date}
                    </span>
                    <span className={`font-semibold ${ann.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {ann.isActive ? 'Aktif' : 'Arsip'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {annId ? 'Edit Pengumuman Toko' : 'Tambah Pengumuman Baru'}
              </h3>
              <button 
                onClick={() => setShowAnnModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnnouncement} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Judul Pengumuman</label>
                <input 
                  type="text" 
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Contoh: Promo Sembako Murah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Isi Pengumuman</label>
                <textarea 
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Tulis detail pengumuman, promo, atau info operasional toko di sini..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="annIsActive"
                  checked={annIsActive}
                  onChange={(e) => setAnnIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="annIsActive" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                  Tampilkan pengumuman ini secara aktif di dashboard
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                >
                  {annId ? 'Simpan Perubahan' : 'Tambah Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
