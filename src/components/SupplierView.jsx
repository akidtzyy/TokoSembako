import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db';

export default function SupplierView({ isLoggedIn, onNavigate }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  // Load suppliers
  const loadSuppliers = () => {
    setSuppliers(db.getSuppliers());
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter & Search suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const query = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(query) || 
           s.code.toLowerCase().includes(query) ||
           s.contact.toLowerCase().includes(query) ||
           s.email.toLowerCase().includes(query);
  });

  // Paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Open Modal for Create or Edit
  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        address: supplier.address
      });
    } else {
      setCurrentSupplier(null);
      // Generate next supplier code
      const nextCode = `SPL-${String(suppliers.length + 1).padStart(3, '0')}`;
      setFormData({
        code: nextCode,
        name: '',
        contact: '',
        email: '',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim()) {
      alert('Mohon isi nama supplier dan nomor kontak yang valid!');
      return;
    }

    if (currentSupplier) {
      // Edit
      db.updateSupplier({
        ...currentSupplier,
        ...formData
      });
    } else {
      // Create
      db.addSupplier(formData);
    }

    loadSuppliers();
    setShowModal(false);
  };

  const handleDeleteSupplier = (id) => {
    if (!isLoggedIn) {
      alert('Anda harus login sebagai admin untuk menghapus supplier!');
      onNavigate('landing');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus supplier ini? Hubungan supplier pada stok barang terkait akan diatur menjadi "Tanpa Supplier".')) {
      db.deleteSupplier(id);
      loadSuppliers();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP CONTROLS & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, kode, no. hp, atau email supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md shadow-blue-900/10 transition-colors self-start sm:self-auto cursor-pointer border-0"
          >
            <Plus size={16} />
            <span>Tambah Supplier</span>
          </button>

        </div>

        {/* Auth Alert */}
        {!isLoggedIn && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="text-amber-500" />
              Anda berada dalam <strong>Mode Peninjau (Tamu)</strong>. Hapus supplier memerlukan login admin.
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

      {/* 2. SUPPLIERS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">Kode Mitra</th>
                <th className="py-3.5 px-4">Nama Supplier</th>
                <th className="py-3.5 px-4">No. Telepon / WA</th>
                <th className="py-3.5 px-4">Alamat Email</th>
                <th className="py-3.5 px-4">Alamat Kantor</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    <Users className="mx-auto size-12 text-slate-300 mb-2" />
                    Tidak ada supplier terdaftar yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                currentSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 tracking-wider">{supplier.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{supplier.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        {supplier.contact}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" />
                        {supplier.email || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={supplier.address}>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{supplier.address || '-'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(supplier)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                            isLoggedIn 
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200' 
                              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          }`}
                          title={isLoggedIn ? "Hapus Supplier" : "Hapus Supplier (Butuh Login)"}
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
          {currentSuppliers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <Users className="mx-auto size-12 text-slate-300 mb-2" />
              Tidak ada supplier ditemukan.
            </div>
          ) : (
            currentSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{supplier.code}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{supplier.name}</h4>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenModal(supplier)}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        isLoggedIn ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span>{supplier.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span>{supplier.email || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-tight">{supplier.address || '-'}</span>
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
              Menampilkan <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> sampai <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredSuppliers.length)}</span> dari <span className="font-bold text-slate-700">{filteredSuppliers.length}</span> supplier mitra
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

      {/* 3. ADD / EDIT SUPPLIER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {currentSupplier ? 'Edit Data Supplier' : 'Registrasi Supplier Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer border-0 bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSupplier} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Kode Supplier (Otomatis)</label>
                <input 
                  type="text" 
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono font-bold text-slate-700"
                  required
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Perusahaan / Supplier</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: PT Sembako Makmur Raya"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nomor HP / WhatsApp Kontak</label>
                <input 
                  type="text" 
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Alamat Email Perusahaan</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: supplier@makmur.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Alamat Kantor / Gudang</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Tulis alamat lengkap pengiriman supply sembako..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {currentSupplier ? 'Simpan Perubahan' : 'Registrasi Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
