import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DataBarangView from './components/DataBarangView';
import SupplierView from './components/SupplierView';
import StokView from './components/StokView';
import LandingPageView from './components/LandingPageView';
import PopularProductsView from './components/PopularProductsView';
import PenjualanView from './components/PenjualanView';
import { db, initDB } from './lib/db';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');

  // Initialize DB and load auth state
  useEffect(() => {
    initDB();
    const auth = db.getAuth();
    if (auth && auth.loggedIn) {
      setIsLoggedIn(true);
      setAdminName(auth.user?.name || 'Dika (Admin)');
    } else {
      setIsLoggedIn(false);
      setAdminName('');
    }
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (username, name) => {
    const userObj = { username, name, role: username === 'admin' ? 'Owner' : 'User' };
    db.setAuth(true, userObj);
    setIsLoggedIn(true);
    setAdminName(name);

    // Strict redirect: Only dialihkan ke admin panel jika login sebagai admin
    if (username === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('landing'); // Tetap di beranda untuk user biasa
    }
  };

  // Handle Logout (Fitur Logout pada Halaman Beranda Publik)
  const handleLogout = () => {
    db.setAuth(false, null);
    setIsLoggedIn(false);
    setAdminName('');
    localStorage.removeItem('sembako_public_cart'); // Clear public cart on logout
    setActiveTab('landing'); // Redirect to public store landing page on logout
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh database toko sembako? Tindakan ini akan mengembalikan seluruh produk, stok, supplier, dan pengumuman ke pengaturan bawaan awal.')) {
      db.resetDB();
      // Reload current tab
      const current = activeTab;
      setActiveTab('dashboard');
      setTimeout(() => setActiveTab(current), 100);
      alert('Database toko sembako berhasil di-reset ke data demo bawaan!');
    }
  };

  // Render active component for Admin Dashboard view (removes Penjualan & separate Login Page)
  const renderContent = () => {
    // Strict Route Guard: User biasa tidak boleh mengakses admin panel
    const currentUserObj = db.getAuth()?.user || null;
    const isCurrentUserAdmin = currentUserObj?.username === 'admin';

    if (!isLoggedIn || !isCurrentUserAdmin) {
      // Force redirect back to landing page if they try to access admin tabs
      setTimeout(() => setActiveTab('landing'), 0);
      return null;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView isLoggedIn={isLoggedIn} onNavigate={setActiveTab} />;
      case 'barang':
        return <DataBarangView isLoggedIn={isLoggedIn} onNavigate={setActiveTab} />;
      case 'supplier':
        return <SupplierView isLoggedIn={isLoggedIn} onNavigate={setActiveTab} />;
      case 'stok':
        return <StokView />;
      case 'penjualan':
        return <PenjualanView />;
      default:
        return <DashboardView isLoggedIn={isLoggedIn} onNavigate={setActiveTab} />;
    }
  };

  // If we are on the public landing page, render it completely full screen
  if (activeTab === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <LandingPageView 
            isLoggedIn={isLoggedIn} 
            onNavigate={setActiveTab} 
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render Popular Products Detail Page
  if (activeTab === 'popular-products') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="popular-products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <PopularProductsView onNavigate={setActiveTab} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans antialiased text-slate-800">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        adminName={adminName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header 
          activeTab={activeTab} 
          setIsMobileOpen={setIsMobileSidebarOpen}
          isLoggedIn={isLoggedIn}
          adminName={adminName}
          onLogout={handleLogout}
          onResetData={handleResetData}
        />

        {/* Content Body with Transition */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
