import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Plus, 
  Minus, 
  Edit,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db';

export default function StokView() {
  const [stocks, setStocks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedCategory] = useState('Semua');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Stock Edit state
  const [showModal, setShowModal] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [formData, setFormData] = useState({
    stockMin: 10,
    stockActual: 0,
    supplierId: ''
  });

  const loadData = async () => {
    const [stks, sups, prods] = await Promise.all([
      db.getStocks(),
      db.getSuppliers(),
      db.getProducts(),
    ]);
    setStocks(stks);
    setSuppliers(sups);
    setProducts(prods);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset page to 1 when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Filter & Search stock items
  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isLow = s.stockActual <= s.stockMin;
    const matchesStatus = selectedStatus === 'Semua' || 
                          (selectedStatus === 'Menipis' && isLow) || 
                          (selectedStatus === 'Aman' && !isLow);

    return matchesSearch && matchesStatus;
  });

  // Paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  // Quick adjustment of stock level (+/-)
  const handleQuickAdjust = async (stockId, amount) => {
    const stockItem = stocks.find(s => s.id === stockId);
    if (stockItem) {
      const updatedStock = {
        ...stockItem,
        stockActual: Math.max(0, stockItem.stockActual + amount)
      };
      await db.updateStock(updatedStock);
      await loadData();
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (stock) => {
    setCurrentStock(stock);
    setFormData({
      stockMin: stock.stockMin,
      stockActual: stock.stockActual,
      supplierId: stock.supplierId
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'supplierId' ? value : Number(value)
    }));
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!currentStock) return;

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    const supplierName = supplier ? supplier.name : 'Tanpa Supplier';

    await db.updateStock({
      ...currentStock,
      stockMin: formData.stockMin,
      stockActual: formData.stockActual,
      supplierId: formData.supplierId,
      supplierName
    });

    await loadData();
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROLS & STATS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama barang atau nama supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* Status Select */}
            <div className="relative min-w-[180px]">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 appearance-none cursor-pointer font-medium text-slate-700"
              >
                <option value="Semua">Semua Status Stok</option>
                <option value="Aman">Stok Aman (Normal)</option>
                <option value="Menipis">Stok Menipis / Reorder</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. STOCKS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">Nama Sembako</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Mitra Supplier</th>
                <th className="py-3.5 px-4 text-center">Stok Minimal</th>
                <th className="py-3.5 px-4 text-center">Stok Fisik Aktual</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Pembaruan Terakhir</th>
                <th className="py-3.5 px-4 text-center">Penyesuaian Cepat (Stok)</th>
                <th className="py-3.5 px-4 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    <Layers className="mx-auto size-12 text-slate-300 mb-2" />
                    Tidak ada stok produk sembako ditemukan.
                  </td>
                </tr>
              ) : (
                currentStocks.map(stock => {
                  const product = products.find(p => p.id === stock.productId);
                  const isLow = stock.stockActual <= stock.stockMin;

                  return (
                    <tr key={stock.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-rose-50/10' : ''}`}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{stock.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {product?.code || 'BRG-N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-full text-[10px]">
                          {product?.category || 'Lainnya'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{stock.supplierName}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {stock.stockMin} {product?.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                          {stock.stockActual} {product?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle size={12} /> Reorder / Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle size={12} /> Stok Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {stock.lastUpdated || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleQuickAdjust(stock.id, -5)}
                            className="p-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Kurangi 5 stok"
                          >
                            <Minus size={12} />
                          </button>
                          <button 
                            onClick={() => handleQuickAdjust(stock.id, -1)}
                            className="p-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Kurangi 1 stok"
                          >
                            <span className="text-[10px] font-bold px-0.5">-1</span>
                          </button>
                          <button 
                            onClick={() => handleQuickAdjust(stock.id, 1)}
                            className="p-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Tambah 1 stok"
                          >
                            <span className="text-[10px] font-bold px-0.5">+1</span>
                          </button>
                          <button 
                            onClick={() => handleQuickAdjust(stock.id, 5)}
                            className="p-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Tambah 5 stok"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleOpenEditModal(stock)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-slate-50">
          {currentStocks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <Layers className="mx-auto size-12 text-slate-300 mb-2" />
              Tidak ada data stok ditemukan.
            </div>
          ) : (
            currentStocks.map(stock => {
              const product = products.find(p => p.id === stock.productId);
              const isLow = stock.stockActual <= stock.stockMin;

              return (
                <div key={stock.id} className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 ${
                  isLow ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{stock.productName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Kode: {product?.code || 'BRG-N/A'}</p>
                    </div>
                    {isLow ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[9px] rounded-full border border-rose-200">
                        Menipis
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full border border-emerald-200">
                        Aman
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Stok Minimal</span>
                      <span className="font-semibold text-slate-700">{stock.stockMin} {product?.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Stok Aktual</span>
                      <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {stock.stockActual} {product?.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Pemasok</span>
                      <span className="font-semibold text-slate-700 truncate block" title={stock.supplierName}>
                        {stock.supplierName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleQuickAdjust(stock.id, -5)}
                        className="p-1 px-2 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200"
                      >
                        -5
                      </button>
                      <button 
                        onClick={() => handleQuickAdjust(stock.id, -1)}
                        className="p-1 px-2 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200"
                      >
                        -1
                      </button>
                      <button 
                        onClick={() => handleQuickAdjust(stock.id, 1)}
                        className="p-1 px-2 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => handleQuickAdjust(stock.id, 5)}
                        className="p-1 px-2 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200"
                      >
                        +5
                      </button>
                    </div>

                    <button 
                      onClick={() => handleOpenEditModal(stock)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                    >
                      <Edit size={12} /> Atur
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            <div>
              Menampilkan <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> sampai <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredStocks.length)}</span> dari <span className="font-bold text-slate-700">{filteredStocks.length}</span> produk stok
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${
                  currentPage === 1 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${
                  currentPage === totalPages 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. EDIT STOCK LIMITS MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                Penyesuaian Stok & Supplier
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer border-0 bg-transparent"
              >
                <X />
              </button>
            </div>
            
            <form onSubmit={handleSaveStock} className="p-5 space-y-4">
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">Produk Sembako:</p>
                <h4 className="font-bold text-slate-800 text-sm">{currentStock?.productName}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Stok Minimal (Safety)</label>
                  <input 
                    type="number" 
                    name="stockMin"
                    value={formData.stockMin}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Stok Aktual Fisik</label>
                  <input 
                    type="number" 
                    name="stockActual"
                    value={formData.stockActual}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Hubungkan Mitra Supplier</label>
                <select 
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="">Tanpa Supplier (Mandiri)</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 cursor-pointer border-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
