import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { db } from '../lib/db';

export default function SidebarAdmin({
  activeTab,
  setIsMobileOpen,
  isLoggedIn,
  adminName,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [lowStockItems, setLowStockItems] = useState([]);

  // Notif Stok Barang Sedikit
  useEffect(() => {
    db.getStocks().then(stks => {
      setLowStockItems(stks.filter(s => s.stockActual <= s.stockMin));
    }).catch(() => { });
  }, []);

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Ringkasan';
      case 'barang': return 'Kelola Data Barang (Produk)';
      case 'supplier': return 'Kelola Data Supplier';
      case 'stok': return 'Manajemen Stok Sembako';
      case 'upload': return 'Media Manager & Upload Gambar';
      default: return 'Toko Sembako II Permata';
    }
  };

  return (
    <header className="bg-white h-16 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">

      {/* Left side: Hamburger (Mobile) and Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-xs text-slate-500 hidden md:block">
            Sistem Informasi Sembako & Manajemen Inventaris v1.0
          </p>
        </div>
      </div>

      {/* Right side: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors relative"
            title="Pemberitahuan"
          >
            <Bell size={20} />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-slate-800">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="font-semibold text-sm text-slate-700">Notifikasi Stok Rendah</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                    {lowStockItems.length} Peringatan
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      <CheckCircle size={24} className="mx-auto text-emerald-500 mb-1" />
                      Semua stok barang aman & terpenuhi!
                    </div>
                  ) : (
                    lowStockItems.map(item => (
                      <div key={item.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex gap-3 transition-colors">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-slate-800 truncate">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">
                            Stok aktual: <strong className="text-rose-600">{item.stockActual}</strong> (Batas min: {item.stockMin})
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Supplier: {item.supplierName}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Tutup Notifikasi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-sm font-semibold hidden sm:inline max-w-[120px] truncate">
              {adminName || 'Tamu'}
            </span>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-slate-800 text-sm">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800 truncate">{adminName || 'Tamu'}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {isLoggedIn ? 'Administrator' : 'Mode Peninjau'}
                  </p>
                </div>

                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                  >
                    Keluar (Logout)
                  </button>
                ) : (
                  <div className="p-2 text-xs text-slate-500 text-center">
                    Silakan login untuk akses penuh admin panel.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
