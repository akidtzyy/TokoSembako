import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Store
} from 'lucide-react';
import { db } from '../lib/db';

export default function PopularProductsView({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [prods, stks] = await Promise.all([
        db.getProducts(),
        db.getStocks(),
      ]);
      setProducts(prods);
      setStocks(stks);
    };
    loadData();
  }, []);

  // Get only popular products
  const popularProducts = products.filter(p => p.isPopular);

  // Format IDR Helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Generate WhatsApp Order Link
  const getWhatsAppLink = (product) => {
    const message = `Halo Toko Sembako II Permata, saya ingin memesan produk terpopuler berikut:\n\n*Nama Produk:* ${product.name}\n*Kode SKU:* ${product.code}\n*Harga:* ${formatIDR(product.price)}\n*Jumlah:* ... (Tulis jumlah pesanan Anda)\n\nMohon informasi ketersediaan dan pengirimannya. Terima kasih!`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">

      {/* Navbar Minimalis */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Back Button */}
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0"
            >
              <ArrowLeft size={18} />
              <span>Kembali ke Beranda</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Store size={18} />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-slate-800">
                SEMBAKO II PERMATA
              </span>
            </div>

          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-slate-900 text-white py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_1px] opacity-40" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold">
            <Star size={12} className="fill-amber-300" />
            <span>Katalog Produk Terlaris</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Produk Sembako Pilihan & Terpopuler
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Daftar produk kebutuhan pokok yang paling sering dipesan oleh pelanggan setia kami untuk kebutuhan rumah tangga maupun usaha kuliner.
          </p>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {popularProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Star className="mx-auto size-16 text-slate-300 mb-3" />
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Produk Terpopuler</h4>
              <p className="text-xs text-slate-400 mt-1">Silakan tandai beberapa produk sebagai populer di panel admin.</p>
            </div>
          ) : (
            popularProducts.map(product => {
              const stockInfo = stocks.find(s => s.productId === product.id);
              const stockActual = stockInfo ? stockInfo.stockActual : 0;
              const isLow = stockInfo ? stockActual <= stockInfo.stockMin : false;
              const isOutOfStock = stockActual <= 0;

              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group">

                  {/* Card Image */}
                  <div className="w-full aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                      }}
                    />

                    {/* Popular Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded-full shadow-xs flex items-center gap-1">
                      <Star size={10} className="fill-slate-950" /> Terpopuler
                    </div>

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
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
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
                        <a
                          href={getWhatsAppLink(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-900/10 text-decoration-none"
                        >
                          <MessageSquare size={12} />
                          Pesan via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
        <p>© 2026 Sembako II Permata. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>

    </div>
  );
}
