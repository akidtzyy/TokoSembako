import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  X, 
  Package, 
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db';

export default function DataBarangView({ isLoggedIn, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Beras & Gandum',
    price: 0,
    cost: 0,
    unit: 'Pcs',
    image: '',
    description: ''
  });

  // Load products
  const loadProducts = () => {
    setProducts(db.getProducts());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Reset page to 1 when search or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Categories list
  const categories = [
    'Semua',
    'Beras & Gandum',
    'Minyak Goreng & Mentega',
    'Gula & Pemanis',
    'Mie & Pasta',
    'Susu & Olahan Susu',
    'Bumbu & Bahan Dapur',
    'Minuman & Camilan'
  ];

  // Form categories (excluding 'Semua')
  const formCategories = categories.filter(c => c !== 'Semua');

  const units = ['Pcs', 'Bungkus', 'Pouch', 'Karung', 'Liter', 'Kg', 'Dus', 'Kaleng', 'Kotak', 'Botol'];

  // Filter & Search products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Open Modal for Create or Edit
  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        code: product.code,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        unit: product.unit,
        image: product.image || '',
        description: product.description || ''
      });
    } else {
      setCurrentProduct(null);
      // Generate next product code SKU
      const nextCode = `BRG-${String(products.length + 1).padStart(3, '0')}`;
      setFormData({
        code: nextCode,
        name: '',
        category: 'Beras & Gandum',
        price: 0,
        cost: 0,
        unit: 'Pcs',
        image: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'cost' ? Number(value) : value
    }));
  };

  // Base64 file reader for simulated image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0 || formData.cost <= 0) {
      alert('Mohon isi nama barang, harga beli, dan harga jual yang valid!');
      return;
    }

    if (formData.price < formData.cost) {
      if (!confirm('Peringatan: Harga jual lebih rendah daripada harga beli (rugi). Tetap simpan?')) {
        return;
      }
    }

    // Set default image if none provided
    const imageToSave = formData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

    if (currentProduct) {
      // Edit
      db.updateProduct({
        ...currentProduct,
        ...formData,
        image: imageToSave
      });
    } else {
      // Create
      db.addProduct({
        ...formData,
        image: imageToSave
      });
    }

    loadProducts();
    setShowModal(false);
  };

  const handleDeleteProduct = (id) => {
    if (!isLoggedIn) {
      alert('Anda harus login sebagai admin untuk menghapus barang!');
      onNavigate('landing');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus produk ini? Semua data stok terkait juga akan terhapus.')) {
      db.deleteProduct(id);
      loadProducts();
    }
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Mock Export CSV
  const handleExportCSV = () => {
    const headers = 'Kode Barang,Nama Barang,Kategori,Harga Beli,Harga Jual,Satuan\n';
    const rows = filteredProducts.map(p => 
      `"${p.code}","${p.name}","${p.category}",${p.cost},${p.price},"${p.unit}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Data_Barang_Sembako.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROLS & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama barang atau kode SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="relative min-w-[180px]">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 appearance-none cursor-pointer font-medium text-slate-700"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Ekspor ke Excel/CSV"
            >
              <Download size={14} />
              <span>Ekspor</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Cetak Daftar Barang"
            >
              <Printer size={14} />
              <span>Cetak</span>
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md shadow-blue-900/10 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Barang</span>
            </button>
          </div>

        </div>

        {/* Auth Mode Alert */}
        {!isLoggedIn && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="text-amber-500" />
              Anda berada dalam <strong>Mode Peninjau (Tamu)</strong>. Anda dapat melihat, menambah, dan mengedit data, namun fitur hapus memerlukan login admin.
            </span>
            <button 
              onClick={() => onNavigate('landing')}
              className="text-blue-600 font-bold hover:underline shrink-0 cursor-pointer"
            >
              Login Admin &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 2. PRODUCTS TABLE / GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">Gambar</th>
                <th className="py-3.5 px-4">Kode SKU</th>
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Beli</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    <Package className="mx-auto size-12 text-slate-300 mb-2" />
                    Tidak ada produk sembako yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                currentProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 tracking-wider">{product.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate" title={product.name}>
                      {product.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-semibold">
                      {formatIDR(product.cost)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-700 font-bold">
                      {formatIDR(product.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-100">
                        {product.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer"
                          title="Edit Barang"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                            isLoggedIn 
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200' 
                              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          }`}
                          title={isLoggedIn ? "Hapus Barang" : "Hapus Barang (Butuh Login)"}
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

        {/* Mobile Grid View */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-slate-50">
          {currentProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <Package className="mx-auto size-12 text-slate-300 mb-2" />
              Tidak ada produk sembako ditemukan.
            </div>
          ) : (
            currentProducts.map(product => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{product.code}</span>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full mt-1">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Harga Beli</span>
                    <span className="font-semibold text-slate-700">{formatIDR(product.cost)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Harga Jual</span>
                    <span className="font-bold text-blue-700">{formatIDR(product.price)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Satuan: <strong className="text-slate-800">{product.unit}</strong>
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isLoggedIn
                          ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                          : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            <div>
              Menampilkan <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> sampai <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredProducts.length)}</span> dari <span className="font-bold text-slate-700">{filteredProducts.length}</span> produk sembako
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

      {/* 3. ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {currentProduct ? 'Edit Data Sembako' : 'Tambah Sembako Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer border-0 bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Kode SKU / Barcode</label>
                  <input 
                    type="text" 
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono font-bold text-slate-700"
                    required
                    readOnly={!!currentProduct}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Satuan Barang</label>
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Barang Sembako</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Minyak Goreng Filma 2 Liter"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Kategori Sembako</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {formCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Harga Beli Modal (Rp)</label>
                  <input 
                    type="number" 
                    name="cost"
                    value={formData.cost || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: 15000"
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Harga Jual Konsumen (Rp)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: 18000"
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Deskripsi Produk (Opsional)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tulis spesifikasi produk, merek, atau informasi penempatan rak..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Simulated Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Foto Produk Sembako</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="image-input"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="image-input"
                      className="inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Pilih Gambar File
                    </label>
                    <p className="text-[10px] text-slate-400">Format JPG, PNG, atau WEBP. Rekomendasi rasio 1:1.</p>
                  </div>
                </div>
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
                  {currentProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
