import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Layers, 
  Image as ImageIcon, 
  Lock, 
  Unlock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isLoggedIn,
  onLogout,
  adminName
}) {
  const menuItems = [
    { id: 'landing', name: 'Lihat Toko Publik', icon: Store, requiresAuth: false },
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, requiresAuth: false },
    { id: 'barang', name: 'Data Barang', icon: Package, requiresAuth: false },
    { id: 'supplier', name: 'Supplier', icon: Users, requiresAuth: false },
    { id: 'stok', name: 'Stok Barang', icon: Layers, requiresAuth: false },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileOpen(false); // Close mobile menu after selection
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 h-16 gap-2">
        {/* Hapus overflow-hidden dan ganti dengan min-w-0 flex-1 agar teks bisa fleksibel memakai sisa ruang */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-600 rounded-lg text-white shrink-0">
            <Store size={22} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-wider bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent whitespace-nowrap block">
              SEMBAKO II PERMATA
            </span>
          )}
        </div>
        {/* Collapse Button (Desktop Only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Admin Profile Summary */}
      {!isCollapsed && (
        <div className="p-4 mx-3 my-4 bg-slate-800/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-lg">
              {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate text-white">{adminName || 'Tamu'}</h4>
              <p className="text-xs text-slate-400 truncate">
                {isLoggedIn ? 'Administrator' : 'Mode Peninjau'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isRestricted = item.requiresAuth && !isLoggedIn;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isCollapsed ? item.name : ''}
              disabled={isRestricted}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.name}</span>
              )}

              {/* Locked Badge */}
              {!isCollapsed && isRestricted && (
                <Lock size={14} className="text-slate-500 shrink-0" />
              )}

              {/* Tooltip for Collapsed Sidebar */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap shadow-lg">
                  {item.name} {isRestricted ? '(Butuh Login)' : ''}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="truncate">Keluar (Logout)</span>}
          </button>
        ) : (
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Store size={20} />
            {!isCollapsed && <span className="truncate">Halaman Depan</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar (Fixed Width or Collapsed) */}
      <aside className={`hidden md:block h-screen sticky top-0 shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer (Slide-out) */}
      <aside className={`fixed inset-y-0 left-0 w-64 z-50 md:hidden transition-transform duration-300 transform ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
