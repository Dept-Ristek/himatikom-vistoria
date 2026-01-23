'use client';

import { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiUrl } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image: string;
  created_at: string;
}

interface CartItem {
  productId: number;
  quantity: number;
}

const TokoHimatikom: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tentangDropdown, setTentangDropdown] = useState(false);
  const [himatikkomDropdown, setHimatikkomDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State untuk Modal Keranjang Mobile
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Fetch products dari API
  useEffect((): void => {
    const fetchProducts = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/products'));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setError('Gagal mengambil data produk');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil produk';
        setError(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  // Tambah ke Keranjang
  const handleAddToCart = (productId: number): void => {
    setCart((prevCart: CartItem[]) => {
      const existingItem = prevCart.find((item: CartItem) => item.productId === productId);
      if (existingItem) {
        return prevCart.map((item: CartItem) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { productId, quantity: 1 }];
    });
    // Jika di mobile, animasikan tombol cart sedikit
    const btn = document.getElementById('floating-cart-btn');
    if (btn) {
      btn.classList.add('scale-90');
      setTimeout(() => btn.classList.remove('scale-90'), 150);
    }
  };

  // Hapus dari Keranjang
  const handleRemoveFromCart = (productId: number): void => {
    setCart((prevCart: CartItem[]) => prevCart.filter((item: CartItem) => item.productId !== productId));
  };

  const getCartTotal = (): number => {
    return cart.reduce((total: number, item: CartItem) => {
      const product = products.find((p: Product) => p.id === item.productId);
      const price = typeof product?.price === 'string' ? parseFloat(product.price) : (product?.price || 0);
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = (): number => {
    return cart.reduce((count: number, item: CartItem) => count + item.quantity, 0);
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numPrice);
  };

  const generateOrderMessage = (): string => {
    if (cart.length === 0) return 'Halo, saya ingin melakukan pemesanan';
    let message = 'Halo, saya ingin melakukan pemesanan:\n\n';
    let total = 0;
    cart.forEach((item: CartItem) => {
      const product = products.find((p: Product) => p.id === item.productId);
      if (product) {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const subtotal = price * item.quantity;
        total += subtotal;
        message += `${item.quantity}x ${product.name} = ${formatPrice(subtotal)}\n`;
      }
    });
    message += `\nTotal: ${formatPrice(total)}`;
    return message;
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Scrollbar Halus untuk List Produk dan Keranjang */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>

      <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100 selection:text-blue-700 pb-24 lg:pb-0">
        
        {/* Navbar */}
        <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-40 h-16 md:h-20 transition-all duration-300 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo Area */}
              <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="w-8 h-8 md:w-12 md:h-12 relative flex-shrink-0 bg-white rounded-full p-1">
                  <Image src="/images/himatikom.png" alt="HIMATIKOM Logo" fill className="object-contain" priority />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm md:text-[18px] font-bold text-gray-900 leading-none md:leading-tight tracking-tight">HIMATIKOM</p>
                  <p className="text-[10px] md:text-xs font-medium text-blue-600 tracking-wide mt-0.5">Kabinet Vistoria</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                {/* Dropdown Tentang */}
                <div className="relative group h-full flex items-center">
                  <button className="text-gray-600 group-hover:text-blue-600 transition-colors font-medium flex items-center gap-1 py-2 text-sm lg:text-base">
                    Tentang
                    <i className="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border border-gray-100">
                    <div className="py-1">
                      <Link href="/tentang/polsub" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang Polsub
                      </Link>
                      <Link href="/tentang/jurusan-ti" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang Jurusan TI
                      </Link>
                      <Link href="/tentang/himatikom" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang HIMATIKOM
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Dropdown HIMATIKOM */}
                <div className="relative group h-full flex items-center">
                  <button className="text-gray-600 group-hover:text-blue-600 transition-colors font-medium flex items-center gap-1 py-2 text-sm lg:text-base">
                    HIMATIKOM
                    <i className="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border border-gray-100">
                    <div className="py-1">
                      <Link href="/toko/himatikom" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-store mr-3 w-4 text-center"></i> Toko HIMATIKOM
                      </Link>
                      <Link href="/dashboard/ngestuck" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-comments mr-3 w-4 text-center"></i> Ngestuck
                      </Link>
                    </div>
                  </div>
                </div>

                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-tachometer-alt"></i>
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 focus:outline-none active:scale-95 transition-transform"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'} text-xl transition-all duration-300`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-fade-in-down">
              <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
                
                {/* Mobile Dropdown Tentang */}
                <div>
                  <button
                    onClick={() => setTentangDropdown(!tentangDropdown)}
                    className="w-full text-left px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition flex items-center justify-between font-medium text-sm"
                  >
                    Tentang
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${tentangDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${tentangDropdown ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 space-y-1 pt-1">
                      <Link href="/tentang/polsub" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang Politeknik Negeri Subang</Link>
                      <Link href="/tentang/jurusan-ti" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang Jurusan Teknik Informatika</Link>
                      <Link href="/tentang/himatikom" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang HIMATIKOM</Link>
                    </div>
                  </div>
                </div>

                {/* Mobile Dropdown HIMATIKOM */}
                <div>
                  <button
                    onClick={() => setHimatikkomDropdown(!himatikkomDropdown)}
                    className="w-full text-left px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition flex items-center justify-between font-medium text-sm"
                  >
                    HIMATIKOM
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${himatikkomDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${himatikkomDropdown ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 space-y-1 pt-1">
                      <Link href="/toko/himatikom" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"><i className="fas fa-store mr-2"></i>Toko HIMATIKOM</Link>
                      <Link href="/dashboard/ngestuck" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"><i className="fas fa-comments mr-2"></i>Ngestuck</Link>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          
          {/* Header */}
          <div className="mb-8">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Online Store</span>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Himatikom Store</h1>
            <p className="text-sm md:text-base text-gray-600">Merchandise dan kebutuhan organisasi.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SECTION PRODUK (Kiri - Full Width di Mobile) */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-800">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500">Produk tidak tersedia.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((product: Product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group"
                    >
                      {/* Gambar Produk - Responsif */}
                      <div className="relative h-32 sm:h-48 md:h-56 overflow-hidden bg-gray-100">
                        <img
                          src={product.image || 'https://placehold.co/400x400/f3f4f6/999999?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <span className="bg-white text-gray-900 px-3 py-1 rounded-lg font-bold text-xs shadow-lg transform rotate-[-5deg]">HABIS</span>
                          </div>
                        )}
                      </div>

                      {/* Info Produk */}
                      <div className="p-3 md:p-5 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* Harga & Stok */}
                        <div className="flex justify-between items-center mb-3 mt-auto">
                          <span className="text-sm md:text-xl font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md ${
                            product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Stok: {product.stock}
                          </span>
                        </div>

                        {/* Tombol Tambah */}
                        {product.stock > 0 ? (
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 md:py-2.5 rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-plus text-[10px] md:text-sm"></i> Tambah
                          </button>
                        ) : (
                          <button disabled className="w-full bg-gray-200 text-gray-400 font-semibold py-1.5 md:py-2.5 rounded-lg text-xs md:text-sm">
                            Habis
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION KERANJANG (Kanan - Hanya Desktop) */}
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28 max-h-[calc(100vh-8rem)] flex flex-col">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Keranjang</h2>
                  {getCartCount() > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{getCartCount()} Item</span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-shopping-basket text-4xl mb-3 text-gray-200"></i>
                      <p className="text-sm">Keranjang kosong</p>
                    </div>
                  ) : (
                    cart.map((item: CartItem) => {
                      const product = products.find((p: Product) => p.id === item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <img src={product.image || 'https://placehold.co/80x80'} alt="" className="w-12 h-12 object-cover rounded-lg bg-white" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-blue-600 font-semibold mb-1">{formatPrice(product.price)}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                              <button onClick={() => handleRemoveFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-xs"><i className="fas fa-trash"></i></button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Keranjang Desktop */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(getCartTotal())}</span>
                  </div>
                  <button 
                    onClick={() => window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(generateOrderMessage())}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg mb-2 flex items-center justify-center gap-2"
                  >
                    <i className="fab fa-whatsapp"></i> Pesan via WA
                  </button>
                  <button onClick={() => setCart([])} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-2 rounded-lg transition-colors text-sm">
                    Kosongkan
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TOMBOL FLOATING CART (Hanya Mobile) */}
        <button
          id="floating-cart-btn"
          onClick={() => setIsMobileCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-blue-700 active:scale-90 transition-all duration-300 border-4 border-white"
        >
          <i className="fas fa-shopping-bag text-xl"></i>
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-white">
              {getCartCount()}
            </span>
          )}
        </button>

        {/* MODAL KERANJANG MOBILE (Bottom Sheet) */}
        {isMobileCartOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
            {/* Backdrop Blur */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileCartOpen(false)}
            ></div>
            
            {/* Content Modal */}
            <div className="relative bg-white rounded-t-3xl shadow-2xl w-full max-h-[90vh] flex flex-col animate-slide-up">
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-1" onClick={() => setIsMobileCartOpen(false)}>
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Keranjang Saya</h2>
                <button onClick={() => setIsMobileCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* List Item Modal */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-12">
                    <i className="fas fa-shopping-basket text-5xl mb-4 text-gray-200"></i>
                    <p className="font-medium">Keranjang kosong</p>
                  </div>
                ) : (
                  cart.map((item: CartItem) => {
                    const product = products.find((p: Product) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <img src={product.image || 'https://placehold.co/80x80'} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</h4>
                            <p className="text-xs text-blue-600 font-bold mt-1">{formatPrice(product.price)}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">x{item.quantity}</span>
                            <button onClick={() => handleRemoveFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-xs px-3 py-1.5 bg-red-50 rounded-lg font-medium">Hapus</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Modal (Checkout) */}
              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-700">Total Belanja</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(getCartTotal())}</span>
                  </div>
                  <button 
                    onClick={() => {
                      window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(generateOrderMessage())}`, '_blank');
                      setIsMobileCartOpen(false);
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-3"
                  >
                    <i className="fab fa-whatsapp text-xl"></i> Pesan Sekarang
                  </button>
                  <button onClick={() => setCart([])} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
                    Kosongkan Keranjang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TokoHimatikom;