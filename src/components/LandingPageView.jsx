import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Star,
  Percent,
  Truck,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  Store,
  ShieldAlert,
  Key,
  ChevronLeft,
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { db } from '../lib/db';

export default function LandingPageView({ isLoggedIn, onNavigate, onLoginSuccess, onLogout }) {
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login Modal Pop-up State (Sistem Login Umum)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Pagination States untuk Katalog Sembako (10 item per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cart / Checkout State (Pemesanan Multi-item ke WhatsApp)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Ref for catalog scroll
  const catalogRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const [prods, stks, anns] = await Promise.all([
        db.getProducts(),
        db.getStocks(),
        db.getAnnouncements(),
      ]);
      setProducts(prods);
      setStocks(stks);
      setAnnouncements(anns.filter(a => a.isActive));
    };
    loadData();

    // Load cart from sessionStorage if exists
    const savedCart = sessionStorage.getItem('sembako_public_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    sessionStorage.setItem('sembako_public_cart', JSON.stringify(newCart));
  };

  const categories = [
    'Semua',
    'Beras & Gandum',
    'Minyak Goreng & Mentega',
    'Gula & Pemanis',
    'Mie & Pasta',
    'Susu & Olahan Susu'
  ];

  // Reset page ke 1 ketika kategori atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Filter products for the main catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get Popular Products (flagged isPopular or top 6)
  const popularProducts = products.filter(p => p.isPopular).slice(0, 6);

  // Get Latest Products (last 4 items in array)
  const latestProducts = [...products].reverse().slice(0, 4);

  // Format IDR Helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Scroll to Catalog Section
  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Search Submit from Hero
  const handleHeroSearch = (e) => {
    e.preventDefault();
    scrollToCatalog();
  };

  // Add to Cart Logic
  const handleAddToCart = (product) => {
    const stockInfo = stocks.find(s => s.productId === product.id);
    const maxStock = stockInfo ? stockInfo.stockActual : 0;

    if (maxStock <= 0) {
      alert(`Maaf, stok untuk "${product.name}" sedang kosong.`);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    let newCart;

    if (existingItem) {
      if (existingItem.quantity >= maxStock) {
        alert(`Maaf, stok fisik terbatas hanya tinggal ${maxStock} ${product.unit}.`);
        return;
      }
      newCart = cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      );
    } else {
      newCart = [...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        unit: product.unit,
        image: product.image,
        total: product.price
      }];
    }

    saveCart(newCart);
    // Open cart drawer so user sees it added
    setIsCartOpen(true);
  };

  // Adjust Quantity in Cart
  const handleAdjustCartQuantity = (productId, delta) => {
    const stockInfo = stocks.find(s => s.productId === productId);
    const maxStock = stockInfo ? stockInfo.stockActual : 9999;

    const newCart = cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > maxStock) {
          alert(`Stok terbatas! Maksimal pembelian ${maxStock} ${item.unit}.`);
          return item;
        }
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.price
        };
      }
      return item;
    }).filter(Boolean);

    saveCart(newCart);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    saveCart(newCart);
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja?')) {
      saveCart([]);
    }
  };

  // Calculate Cart Totals
  const cartTotalAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Generate Multi-item WhatsApp Order Link & Redirect
  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja Anda masih kosong!');
      return;
    }

    if (!customerName.trim()) {
      alert('Mohon isi Nama Lengkap Anda untuk pemesanan!');
      return;
    }

    // Build the beautiful WhatsApp message
    let message = `*PESANAN SEMBAKO - TOKO SEMBAKO II PERMATA*\n`;
    message += `==================================\n\n`;
    message += `*Nama Pemesan:* ${customerName}\n`;
    if (customerAddress.trim()) {
      message += `*Alamat Kirim:* ${customerAddress}\n`;
    }
    message += `*Tanggal Pesan:* ${new Date().toLocaleDateString('id-ID')}\n\n`;
    message += `*DAFTAR BELANJA:* \n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. _${item.productName}_ \n`;
      message += `   Jumlah: *${item.quantity} ${item.unit}* x ${formatIDR(item.price)} = *${formatIDR(item.total)}*\n`;
    });

    message += `\n==================================\n`;
    message += `*TOTAL PEMBAYARAN:* *${formatIDR(cartTotalAmount)}*\n\n`;
    message += `Mohon konfirmasi ketersediaan stok dan total ongkos kirim ke alamat saya. Terima kasih!`;

    // Encode message for WhatsApp URL
    const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;

    // Redirect to WhatsApp
    window.open(waUrl, '_blank');

    // Optionally clear cart after checkout
    saveCart([]);
    setIsCartOpen(false);
    setCustomerName('');
    setCustomerAddress('');
  };

  // Handle Modal Login Submit (Sistem Login Umum)
  const handleModalLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    // Simulate connection delay (perfect for eventual XAMPP MySQL setup)
    setTimeout(() => {
      setLoginLoading(false);

      const usernameLower = loginUsername.toLowerCase();

      if (usernameLower === 'admin' && loginPassword === 'admin123') {
        // Login sebagai Admin -> dialihkan ke panel admin
        onLoginSuccess(loginUsername, 'Dika (Admin)');
        setShowLoginModal(false);
        alert('Selamat datang Admin Dika! Tombol akses Admin Panel sekarang aktif di pojok kanan atas.');
      } else if (usernameLower === 'user' && loginPassword === 'user123') {
        // Login sebagai User Umum -> tetap di landing page, status ter-login sebagai pelanggan biasa
        onLoginSuccess(loginUsername, 'Pelanggan Setia');
        setShowLoginModal(false);
        alert('Berhasil masuk sebagai Pelanggan! Nikmati katalog harga promo sembako.');
      } else {
        setLoginError('Kombinasi Username atau Password salah! Masukkan akun demo yang terdaftar.');
      }
    }, 800);
  };

  // Safety check to get current logged in username
  const currentUserObj = db.getAuth()?.user || null;
  const isCurrentUserAdmin = currentUserObj?.username === 'admin';

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">

      {/* 1. PUBLIC NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Store size={22} />
              </div>
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
                SEMBAKO II PERMATA
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0">
                Beranda
              </button>
              <button onClick={scrollToCatalog} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0">
                Katalog Harga
              </button>
              {/* FIX: Mengarahkan langsung ke page PopularProductsView */}
              <button
                onClick={() => onNavigate('popular-products')}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0"
              >
                Produk Terpopuler
              </button>

              {/* Cart Status Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer bg-transparent border-0"
                title="Keranjang Belanja"
              >
                <ShoppingCart size={20} />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-white animate-pulse">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              <span className="h-4 w-px bg-slate-200" />

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    Halo, {currentUserObj?.name || 'Pelanggan'}
                  </span>

                  {/* HANYA ADMIN yang bisa melihat dan mengakses tombol Admin Panel */}
                  {isCurrentUserAdmin && (
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-0"
                    >
                      <Unlock size={14} />
                      <span>Masuk Admin Panel</span>
                    </button>
                  )}

                  {/* Tombol LOGOUT pada Halaman Beranda Publik */}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                    title="Keluar dari Akun"
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/10 cursor-pointer border-0"
                >
                  <Lock size={14} />
                  <span>Masuk / Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button & Mobile Cart */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700 bg-transparent border-0 cursor-pointer"
              >
                <ShoppingCart size={22} />
                {cartTotalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white font-bold text-[8px] rounded-full flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 bg-transparent border-0 cursor-pointer"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-inner">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 block bg-transparent border-0 cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                scrollToCatalog();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 block bg-transparent border-0 cursor-pointer"
            >
              Katalog Harga
            </button>
            <button
              onClick={() => {
                onNavigate('popular-products');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 block bg-transparent border-0 cursor-pointer"
            >
              Produk Terpopuler
            </button>

            <div className="h-px bg-slate-100 my-2" />

            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-slate-500 bg-slate-100 py-1.5 rounded-lg">
                  Halo, {currentUserObj?.name || 'Pelanggan'}
                </div>

                {/* HANYA ADMIN yang bisa melihat tombol Admin Panel di Mobile */}
                {isCurrentUserAdmin && (
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold border-0 cursor-pointer"
                  >
                    <Unlock size={14} />
                    Masuk Admin Panel
                  </button>
                )}

                {/* Tombol LOGOUT Mobile */}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border-0 cursor-pointer"
                >
                  <LogOut size={14} />
                  Keluar Akun
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold border-0 cursor-pointer"
              >
                <Lock size={14} />
                Masuk / Login
              </button>
            )}
          </div>
        )}
      </nav>

      {/* 2. ANNOUNCEMENT TICKER BANNER */}
      {announcements.length > 0 && (
        <div className="bg-amber-500 text-slate-950 py-2 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold">
            <Sparkles size={14} className="animate-bounce shrink-0" />
            <span className="truncate text-center">
              {announcements[0].title}: {announcements[0].content}
            </span>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION WITH SEARCH */}
      <section className="relative bg-slate-900 text-white py-16 md:py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/grocery-hero.webp"
            alt="Grocery Store Background"
            className="w-full h-full object-cover opacity-25 object-center"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 md:space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
            <Sparkles size={12} />
            <span>Katalog Sembako Digital & Inventaris</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Sembako Lengkap, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">Harga Hemat</span>, Layanan Sahabat
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
              Kami menyediakan kebutuhan pokok keluarga terlengkap mulai dari Beras, Minyak Goreng, Gula, Susu, hingga bumbu dapur dengan harga grosir terbaik. Stok di bawah ini selalu ter-update secara otomatis dari gudang fisik kami.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-xl bg-white p-2 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari Beras, Minyak, Gula, Tepung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-slate-800 text-sm bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer border-0"
            >
              Cari & Lihat Stok
            </button>
          </form>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-400 shrink-0" size={16} />
              <span>Stok Gudang Real-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-400 shrink-0" size={16} />
              <span>Harga Transparan & Bersaing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-400 shrink-0" size={16} />
              <span>Pemesanan WA Mudah</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-400 shrink-0" size={16} />
              <span>Bisa Ambil di Toko / COD</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. VALUE PROPOSITION / FEATURES */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">

            <div className="p-5 space-y-2 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Percent size={22} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">Harga Grosir Termurah</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kami bermitra langsung dengan distributor resmi sehingga mampu menawarkan harga beli terbaik untuk Anda.
              </p>
            </div>

            <div className="p-5 space-y-2 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Truck size={22} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">Siap Kirim & COD</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Melayani pesan antar langsung ke rumah Anda untuk area sekitar atau menggunakan metode pembayaran di tempat (COD).
              </p>
            </div>

            <div className="p-5 space-y-2 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={22} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">Stok Selalu Terjamin</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem kami terintegrasi langsung dengan database stok fisik toko, menjamin informasi ketersediaan barang akurat.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. POPULAR PRODUCTS (TERPOPULER) */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={22} />
                Produk Sembako Terpopuler / Terlaris
              </h2>
              <p className="text-xs text-slate-500">Paling banyak dibeli oleh pelanggan rumah tangga maupun warung makan.</p>
            </div>
            {/* FIX: Klik untuk lihat semua mengarahkan ke page PopularProductsView */}
            <button
              onClick={() => onNavigate('popular-products')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0"
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularProducts.map(product => {
              const stockInfo = stocks.find(s => s.productId === product.id);
              const stockActual = stockInfo ? stockInfo.stockActual : 0;
              const isLow = stockInfo ? stockActual <= stockInfo.stockMin : false;

              return (
                <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    {/* Image */}
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      {isLow ? (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-500 text-white font-bold text-[8px] rounded uppercase">
                          Stok Tipis
                        </span>
                      ) : (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-white font-bold text-[8px] rounded uppercase">
                          Ready
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <span className="text-[8px] font-bold text-slate-400 font-mono block">{product.code}</span>
                      <h5 className="font-bold text-slate-800 text-xs truncate" title={product.name}>
                        {product.name}
                      </h5>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-blue-700 text-xs">{formatIDR(product.price)}</span>
                      <span className="text-[9px] text-slate-400">{product.unit}</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-lg text-[10px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart size={10} />
                      + Keranjang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. MAIN CATALOG WITH DETAILED PRICE LIST & PAGINATION (10 ITEMS PER PAGE) */}
      <section ref={catalogRef} className="py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Section Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Katalog Lengkap & Daftar Harga Sembako
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Cari harga dan lihat ketersediaan stok fisik secara real-time. Tambahkan beberapa barang ke keranjang untuk memesan sekaligus via WhatsApp.
            </p>
          </div>

          {/* Search & Category Tabs */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">

            {/* Search input */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Ketik nama sembako yang ingin dicari (contoh: minyak, beras, terigu)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Catalog Grid (PAGINATED - Max 10 items) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {currentItems.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <ShoppingBag className="mx-auto size-16 text-slate-300 mb-3" />
                <h4 className="font-bold text-sm text-slate-700">Produk Tidak Ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Coba masukkan kata kunci pencarian lain atau pilih kategori yang berbeda.</p>
              </div>
            ) : (
              currentItems.map(product => {
                const stockInfo = stocks.find(s => s.productId === product.id);
                const stockActual = stockInfo ? stockInfo.stockActual : 0;
                const isLow = stockInfo ? stockActual <= stockInfo.stockMin : false;
                const isOutOfStock = stockActual <= 0;

                return (
                  <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group">

                    {/* Card Media */}
                    <div className="w-full aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                        }}
                      />

                      {/* Stock Status Tag */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 bg-slate-950 text-white font-extrabold text-[9px] rounded shadow-xs uppercase">
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-[9px] rounded shadow-xs flex items-center gap-1">
                            <AlertTriangle size={10} /> Stok Tipis: {stockActual}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[9px] rounded shadow-xs flex items-center gap-1">
                            <CheckCircle2 size={10} /> Stok: {stockActual} {product.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-bold text-slate-400 font-mono tracking-wider uppercase">{product.code}</span>
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{product.category}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 h-10 group-hover:text-blue-700 transition-colors" title={product.name}>
                          {product.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100/80 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">Harga:</span>
                          <span className="font-extrabold text-blue-700 text-sm sm:text-base">{formatIDR(product.price)}</span>
                        </div>

                        {isOutOfStock ? (
                          <button
                            disabled
                            className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-bold text-center cursor-not-allowed border-0"
                          >
                            Stok Habis
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-900/10 border-0"
                          >
                            <ShoppingCart size={12} />
                            + Keranjang Belanja
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION CONTROLS (10 items per page) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${currentPage === 1
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'bg-white text-slate-600 hover:bg-slate-50 cursor-pointer'
                  }`}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      scrollToCatalog();
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${currentPage === page
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10'
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
                className={`p-2 rounded-lg border border-slate-200 flex items-center justify-center transition-all ${currentPage === totalPages
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'bg-white text-slate-600 hover:bg-slate-50 cursor-pointer'
                  }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 7. LATEST PRODUCTS (PRODUK TERBARU) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              Produk Terbaru di Gudang Kami
            </h2>
            <p className="text-xs text-slate-500">Baru masuk minggu ini. Tambahkan ke keranjang untuk memesan via WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestProducts.map(product => {
              const stockInfo = stocks.find(s => s.productId === product.id);
              const stockActual = stockInfo ? stockInfo.stockActual : 0;

              return (
                <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex gap-4 items-center group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">{product.category}</span>
                    <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-700 transition-colors" title={product.name}>
                      {product.name}
                    </h4>
                    <p className="font-extrabold text-blue-700 text-xs">{formatIDR(product.price)}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Stok: {stockActual} {product.unit}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer text-xs"
                      >
                        + Beli
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. SHOPPING CART SIDEBAR (DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">

              {/* Drawer Header */}
              <div className="px-4 py-5 bg-slate-50 border-b border-slate-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="text-blue-600" size={20} />
                  Keranjang Belanja Anda ({cartTotalItems})
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 bg-transparent border-0 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <ShoppingBag size={48} className="mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">Keranjang Anda masih kosong</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan pilih produk sembako berkualitas kami di katalog.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cart.map(item => (
                      <div key={item.productId} className="py-4 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{item.productName}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatIDR(item.price)} / {item.unit}</p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <button
                              onClick={() => handleAdjustCartQuantity(item.productId, -1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 bg-transparent border-0 cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-xs font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleAdjustCartQuantity(item.productId, 1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 bg-transparent border-0 cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Total per item & Delete */}
                        <div className="text-right shrink-0 min-w-[80px]">
                          <p className="text-xs font-extrabold text-slate-900">{formatIDR(item.total)}</p>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold mt-1 bg-transparent border-0 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Form (WhatsApp Checkout) */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">

                  {/* Totals Summary */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Total Item:</span>
                      <span>{cartTotalItems} barang</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-200/60 pt-2">
                      <span>TOTAL BELANJA:</span>
                      <span className="text-blue-700">{formatIDR(cartTotalAmount)}</span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleWhatsAppCheckout} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Nama Lengkap Pemesan</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Ibu Ani"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Alamat Kirim / Catatan (Opsional)</label>
                      <textarea
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Contoh: Perumahan Graha Indah Blok C-4, Jakarta Selatan..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleClearCart}
                        className="px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer bg-white"
                        title="Kosongkan Keranjang"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        <MessageSquare size={16} />
                        Kirim Pesanan Ke WhatsApp
                      </button>
                    </div>
                  </form>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 9. POPUP LOGIN MODAL (SISTEM LOGIN UMUM - POP-UP FORM) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-up">

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Lock className="text-blue-600" size={16} /> Portal Masuk Toko Sembako
              </span>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(null);
                }}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer bg-transparent border-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Login Form */}
            <div className="p-6 space-y-4">

              {/* Logo Branding inside Modal */}
              <div className="text-center space-y-1">
                <div className="inline-flex p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/10 mb-2">
                  <Store size={24} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base">Sistem Sembako II Permata</h4>
                <p className="text-xs text-slate-400">Silakan login untuk menikmati fitur khusus pelanggan atau masuk sebagai admin.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
                  <ShieldAlert size={16} className="text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleModalLoginSubmit} className="space-y-4">

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Username</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username (admin / user)..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                    disabled={loginLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                    disabled={loginLoading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
                >
                  {loginLoading ? (
                    <span className="border-2 border-white/30 border-t-white h-4 w-4 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Unlock size={14} />
                      Masuk Ke Akun
                    </>
                  )}
                </button>

              </form>

              {/* Demo Credentials Cheat Sheet */}
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-500 font-mono">
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  <Key size={12} className="text-blue-600" /> Akun Demo Uji Coba:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-slate-200/60">
                    <p className="font-bold text-slate-800">1. Akun Admin:</p>
                    <p>User: <span className="font-bold text-blue-600">admin</span></p>
                    <p>Pass: <span className="font-bold text-blue-600">admin123</span></p>
                    <p className="text-[9px] text-slate-400 mt-1">*Akses Admin Panel</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/60">
                    <p className="font-bold text-slate-800">2. Akun Pelanggan:</p>
                    <p>User: <span className="font-bold text-emerald-600">user</span></p>
                    <p>Pass: <span className="font-bold text-emerald-600">user123</span></p>
                    <p className="text-[9px] text-slate-400 mt-1">*Hanya Lihat Toko</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating Cart Button (Desktop & Mobile) */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 cursor-pointer border-0 hover:scale-105 transition-transform"
        >
          <ShoppingCart size={22} />
          <span className="text-xs font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full">
            {cartTotalItems}
          </span>
        </button>
      )}

      {/* 9. FOOTER / CONTACT SECTION */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">

          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Store size={22} />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                SEMBAKO II PERMATA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sembako II Permata adalah pusat grosir & eceran sembako berkualitas tinggi di Pekanbaru. Menyediakan kebutuhan pangan pokok terlengkap untuk keluarga, warung makan, dan toko kelontong Anda.
            </p>
          </div>

          {/* Col 2: Operational Hours */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Clock size={16} className="text-blue-400" /> Jam Operasional
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex justify-between">
                <span>Senin - Jumat:</span>
                <span className="font-bold text-white">07.00 - 21.00 WIB</span>
              </li>
              <li className="flex justify-between">
                <span>Sabtu - Minggu:</span>
                <span className="font-bold text-white">08.00 - 20.00 WIB</span>
              </li>
              <li className="flex justify-between text-amber-400 font-semibold">
                <span>Hari Libur Nasional:</span>
                <span>Tetap Buka</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Phone size={16} className="text-blue-400" /> Hubungi Kami
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <span>WhatsApp: 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-500 shrink-0" />
                <span>Jl. Parit Indah, Tengkerang Labuai, Bukit Raya, Kota Pekanbaru</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Location Map Interaktif */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <MapPin size={16} className="text-blue-400" /> Lokasi Toko
            </h4>
            <div className="flex flex-col gap-2">
              {/* Wadah Peta Embed */}
              <div className="h-28 w-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.681544900202!2d101.48129797472347!3d0.47442369952093427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5afabe915c9f5%3A0x44dadc389ec6460f!2sIndomaret%20%7C%20Tengkerang%20Labuai%20-%20Kota%20Pekanbaru!5e0!3m2!1sid!2sid!4v1783852785178!5m2!1sid!2sid"
                  className="w-full h-full filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2">
          <p>© 2026 Sembako II Permata. Hak Cipta Dilindungi Undang-Undang.</p>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex gap-4">
            <button onClick={() => alert('Fitur kebijakan privasi akan segera hadir.')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-0">Kebijakan Privasi</button>
          </div>
        </div>

      </footer>

    </div>
  );
}