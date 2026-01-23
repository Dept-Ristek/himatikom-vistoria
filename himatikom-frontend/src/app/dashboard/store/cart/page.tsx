'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  // Nomor WhatsApp Tujuan (Ganti dengan nomor Pengurus Kewirausahaan)
  const ADMIN_PHONE = '6281234567890'; 

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Buat Pesan Otomatis
    let message = `*Halo HIMATIKOM Store!*%0A%0ASaya ingin memesan:%0A`;
    
    cart.forEach((item, index) => {
      const subtotal = item.product.price * item.quantity;
      message += `${index + 1}. ${item.product.name} (x${item.quantity})%0A   Harga: Rp ${subtotal.toLocaleString('id-ID')}%0A`;
    });

    const totalWithFormat = totalPrice.toLocaleString('id-ID');
    message += `%0A*TOTAL: Rp ${totalWithFormat}*%0A%0AMohon info pembayaran selanjutnya. Terima kasih!`;

    // Encode ke format URL
    const url = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
    
    // Buka WhatsApp
    window.open(url, '_blank');
    
    // (Opsional) Kosongkan keranjang setelah checkout
    // clearCart(); 
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-shopping-bag text-4xl text-gray-300"></i>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Keranjang Kosong</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">Belum ada barang. Mulai jelajahi produk eksklusif dari HIMATIKOM Store.</p>
          <button 
            onClick={() => router.push('/dashboard/store')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Lihat Produk
          </button>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/dashboard/store')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 transition-colors"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            Kembali ke Toko
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Keranjang Belanja</h1>
            <p className="text-gray-500 text-sm">{totalItems} item dalam keranjang</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LIST KERANJANG */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {cart.map((item) => {
                const subtotal = item.product.price * item.quantity;
                return (
                  <div key={item.product.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="p-4 sm:p-5 flex flex-col gap-4">
                      
                      {/* Top Section: Image + Info */}
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative group">
                          {item.product.image ? (
                            <Image 
                              src={item.product.image} 
                              alt={item.product.name} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized={true}
                            />
                          ) : item.product.images && item.product.images.length > 0 ? (
                            <Image 
                              src={item.product.images[0].image_url} 
                              alt={item.product.name} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <i className="fas fa-image text-lg sm:text-xl"></i>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{item.product.name}</h3>
                          <p className="text-blue-600 font-bold text-base sm:text-lg mb-2">
                            Rp {item.product.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">Subtotal: <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span></p>
                        </div>
                      </div>

                      {/* Bottom Section: Quantity + Delete */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                        {/* Quantity Control */}
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button 
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.product.id);
                              } else {
                                updateQuantity(item.product.id, item.quantity - 1);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 font-semibold text-sm"
                            aria-label="Kurangi jumlah"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-900 bg-gray-50">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 font-semibold text-sm"
                            aria-label="Tambah jumlah"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                          aria-label="Hapus dari keranjang"
                        >
                          <i className="fas fa-trash text-xs mr-1"></i>Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-6 flex items-center">
              <button 
                onClick={() => router.push('/dashboard/store')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <i className="fas fa-plus text-xs"></i>
                Lanjut Berbelanja
              </button>
            </div>
          </div>

          {/* SUMMARY & CHECKOUT - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 sticky top-6 h-fit shadow-sm">
              
              {/* Header */}
              <h2 className="font-bold text-gray-900 text-lg mb-6">Ringkasan Pesanan</h2>

              {/* Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah Item</span>
                  <span className="font-semibold text-gray-900">{totalItems} item</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Total Pembayaran</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 shadow-md hover:shadow-lg active:scale-95"
              >
                <i className="fab fa-whatsapp text-lg"></i>
                Pesan via WhatsApp
              </button>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Klik tombol untuk mengirim pesanan via WhatsApp
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}