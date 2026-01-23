'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';

export default function StorePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedItem, setAddedItem] = useState<number | null>(null);
    const { addToCart, cart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch Products
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        fetch(apiUrl('/api/store'), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.status) setProducts(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        addToCart(product);
        setAddedItem(product.id);
        setTimeout(() => setAddedItem(null), 2000);
    };

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        if (selectedProduct && selectedProduct.images) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
        }
    };

    const prevImage = () => {
        if (selectedProduct && selectedProduct.images) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images!.length) % selectedProduct.images!.length);
        }
    };

    const totalCart = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">HIMATIKOM Store</h1>
                        <p className="text-gray-500 text-sm sm:text-base mt-2">Temukan merchandise dan perlengkapan pilihan</p>
                    </div>

                    {/* Cart Summary Badge */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                            <div className="flex items-center gap-2 text-gray-700">
                                <i className="fas fa-box text-lg text-gray-400"></i>
                                <span className="font-semibold">{products.length} Produk</span>
                            </div>
                        </div>
                        {totalCart > 0 && (
                            <button 
                                onClick={() => router.push('/dashboard/store/cart')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 relative"
                            >
                                <i className="fas fa-shopping-cart"></i>
                                <span>Keranjang</span>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                    {totalCart}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* GRID PRODUK */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {/* Skeleton Loading */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                                <div className="bg-gray-300 h-36 sm:h-44 w-full"></div>
                                <div className="p-3 sm:p-4 space-y-2">
                                    <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                                    <div className="bg-gray-300 h-3 w-full rounded"></div>
                                    <div className="bg-gray-300 h-3 w-2/3 rounded"></div>
                                    <div className="flex gap-2 pt-2">
                                        <div className="bg-gray-300 h-8 flex-1 rounded"></div>
                                        <div className="bg-gray-300 h-8 w-10 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Produk</h3>
                        <p className="text-gray-500">Produk akan segera tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {products.map((product) => (
                            <div 
                                key={product.id} 
                                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-200 group flex flex-col cursor-pointer"
                                onClick={() => handleOpenModal(product)}
                            >
                                
                                {/* Product Image */}
                                <div className="relative h-36 sm:h-44 bg-gray-100 overflow-hidden">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <i className="fas fa-image text-4xl sm:text-5xl"></i>
                                        </div>
                                    )}

                                    {/* Stock Badge */}
                                    {product.stock < 10 && product.stock > 0 && (
                                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            Sisa {product.stock}
                                        </div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            Habis
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-3 sm:p-4 flex flex-col flex-1">
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 min-h-[2rem]">
                                        {product.name}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1 text-[11px] sm:text-xs">
                                        {product.description || 'Produk berkualitas dari HIMATIKOM'}
                                    </p>

                                    <div className="flex items-end justify-between gap-2 mt-auto">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Harga</p>
                                            <p className="text-base sm:text-lg font-bold text-blue-600">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddToCart(product, e)}
                                            disabled={product.stock === 0}
                                            className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                                                addedItem === product.id
                                                    ? 'bg-green-600 text-white'
                                                    : product.stock === 0
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {addedItem === product.id ? (
                                                <>
                                                    <i className="fas fa-check text-xs"></i>
                                                    <span className="hidden sm:inline text-xs">OK</span>
                                                </>
                                            ) : product.stock === 0 ? (
                                                <>
                                                    <i className="fas fa-ban text-xs"></i>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-cart-plus text-xs"></i>
                                                    <span className="hidden sm:inline text-xs">Tambah</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Image Carousel */}
                            <div className="space-y-4">
                                <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden group/carousel">
                                    {selectedProduct.image ? (
                                        <Image
                                            src={selectedProduct.images && selectedProduct.images.length > 0 
                                                ? selectedProduct.images[currentImageIndex].image_url 
                                                : selectedProduct.image}
                                            alt={selectedProduct.name}
                                            fill
                                            className="object-cover"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <i className="fas fa-image text-6xl"></i>
                                        </div>
                                    )}

                                    {/* Image Navigation Buttons */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100"
                                            >
                                                <i className="fas fa-chevron-left text-xl"></i>
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100"
                                            >
                                                <i className="fas fa-chevron-right text-xl"></i>
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {currentImageIndex + 1} / {selectedProduct.images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Strip */}
                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`flex-shrink-0 h-16 w-16 rounded-lg border-2 transition-all overflow-hidden ${
                                                    currentImageIndex === idx
                                                        ? 'border-blue-600'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <Image
                                                    src={img.image_url}
                                                    alt={`${selectedProduct.name} ${idx + 1}`}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                    unoptimized={true}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                                    <p className="text-gray-700">
                                        {selectedProduct.description || 'Produk berkualitas dari HIMATIKOM'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Harga</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rp {selectedProduct.price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Stok Tersedia</p>
                                        <p className={`text-2xl font-bold ${
                                            selectedProduct.stock > 0 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {selectedProduct.stock > 0 ? selectedProduct.stock : 'Habis'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedProduct.stock > 0) {
                                            handleAddToCart(selectedProduct);
                                            handleCloseModal();
                                        }
                                    }}
                                    disabled={selectedProduct.stock === 0}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        selectedProduct.stock === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    <i className="fas fa-cart-plus"></i>
                                    <span>Tambah ke Keranjang</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}