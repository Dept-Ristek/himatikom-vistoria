'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { apiUrl, getAPIBaseUrl } from '@/lib/api';

interface ProductImage {
  id: number;
  image_url: string;
  order: number;
}

interface ProductWithImages extends Product {
  images?: ProductImage[];
}

export default function ProductManagePage() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    imageFiles: [] as File[], // Array for max 5 image files
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const [imageIds, setImageIds] = useState<(number | null)[]>([]); // Track image IDs

  const fetchProducts = async () => {
    const token = localStorage.getItem('access_token');
    const apiBase = getAPIBaseUrl();
    try {
      const res = await fetch(apiUrl('/api/products'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        // Sanitize image URLs to ensure they're full URLs pointing to backend
        const sanitizedProducts = data.data.map((product: ProductWithImages) => ({
          ...product,
          images: (product.images || []).map((img: ProductImage) => ({
            ...img,
            image_url: img.image_url.startsWith('http') 
              ? img.image_url 
              : `${apiBase}${img.image_url}`
          }))
        }));
        setProducts(sanitizedProducts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newFiles = [...formData.imageFiles];
    const newPreviews = [...imagePreviews];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const tooLargeFiles = [];

    // Add files up to max 5 images
    for (let i = 0; i < files.length && newFiles.length < 5; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxFileSize) {
        tooLargeFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        continue;
      }
      
      newFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length <= newFiles.length) {
          setImagePreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (tooLargeFiles.length > 0) {
      alert(`File berikut terlalu besar (maks 5MB):\n${tooLargeFiles.join('\n')}`);
    }

    if (newFiles.length >= 5 && files.length > newFiles.length) {
      alert(`Sudah mencapai batas maksimal 5 gambar. ${files.length - newFiles.length} file diabaikan.`);
    }

    setFormData({ ...formData, imageFiles: newFiles });
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];
    const imageId = imageIds[index];
    
    // If it's an old image (URL from database), track it for deletion
    if (preview && (preview.startsWith('http') || preview.startsWith('/storage/')) && imageId) {
      setDeletedImageUrls([...deletedImageUrls, preview]);
    }
    
    const newFiles = formData.imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newIds = imageIds.filter((_, i) => i !== index);
    setFormData({ ...formData, imageFiles: newFiles });
    setImagePreviews(newPreviews);
    setImageIds(newIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const url = editingId 
      ? apiUrl(`/api/products/${editingId}`) // Update
      : apiUrl('/api/products'); // Store

    const isUpdate = editingId !== null;
    const method = 'POST'; // Always use POST (we'll use _method for PUT spoofing)

    // Prepare FormData for file upload
    const payload = new FormData();
    
    // Add _method field for Laravel method spoofing
    if (isUpdate) {
      payload.append('_method', 'PUT');
    }
    
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price.toString());
    payload.append('stock', formData.stock.toString());
    
    // Add image files only if there are new files
    if (formData.imageFiles.length > 0) {
      formData.imageFiles.forEach((file, index) => {
        if (file) {
          payload.append(`images[${index}]`, file);
        }
      });
    }
    
    // Send deleted image URLs for backend to delete
    if (deletedImageUrls.length > 0) {
      deletedImageUrls.forEach((url) => {
        if (url) {
          payload.append('deleted_images[]', url);
        }
      });
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error response:', data);
        let errorMsg = data.message || 'Unknown error';
        if (data.errors) {
          // Format validation errors
          const errorList = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msgs}`;
            })
            .join('\n');
          errorMsg += '\n\n' + errorList;
        }
        alert('Gagal menyimpan produk:\n' + errorMsg);
        return;
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      alert('Gagal menyimpan produk');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    const token = localStorage.getItem('access_token');
    await fetch(apiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchProducts();
  };

  const openEditModal = (product: ProductWithImages) => {
    const apiBase = getAPIBaseUrl();
    // Sanitize image URLs to ensure they're full backend URLs
    const sanitizedImageUrls = (product.images || []).map((img) => 
      img.image_url.startsWith('http') 
        ? img.image_url 
        : `${apiBase}${img.image_url}`
    );
    
    const imageIdList = (product.images || []).map((img) => img.id);
    
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      imageFiles: [],
    });
    setImagePreviews(sanitizedImageUrls);
    setImageIds(imageIdList);
    setDeletedImageUrls([]);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: 0, 
      stock: 0, 
      image: '',
      imageFiles: [],
    });
    setImagePreviews([]);
    setDeletedImageUrls([]);
    setImageIds([]);
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500">Kelola stok dan harga merchandise HIMATIKOM.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Tambah Produk
        </button>
      </div>

      {/* TABEL PRODUK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                    <tr>
                        <th className="p-4">Produk</th>
                        <th className="p-4">Harga</th>
                        <th className="p-4">Stok</th>
                        <th className="p-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{product.name}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1 w-48">{product.description}</div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-700">
                                Rp {product.price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {product.stock} Unit
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => openEditModal(product)}
                                    className="text-blue-500 hover:text-blue-700 mr-3"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border p-2 rounded"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea 
                        className="w-full border p-2 rounded"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            className="w-full border p-2 rounded"
                            value={formData.price || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData({...formData, price: val ? parseInt(val) : 0});
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stok</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            className="w-full border p-2 rounded"
                            value={formData.stock || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData({...formData, stock: val ? parseInt(val) : 0});
                            }}
                        />
                    </div>
                </div>

                {/* MULTIPLE IMAGES SECTION */}
                <div className="pt-2 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Produk <span className="text-xs text-gray-500">({imagePreviews.length}/5)</span>
                    </label>
                    
                    {/* File Input untuk multiple selection */}
                    <label className="block mb-3 border-2 border-dashed border-blue-300 rounded p-4 cursor-pointer hover:bg-blue-50 transition">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <i className="fas fa-cloud-upload-alt text-blue-500 text-2xl"></i>
                            <span className="text-sm font-medium text-blue-700">Pilih hingga 5 gambar</span>
                            <span className="text-xs text-blue-600">atau drag & drop gambar ke sini</span>
                        </div>
                        <input 
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* Preview gambar yang sudah dipilih */}
                    {imagePreviews.length > 0 && (
                        <div className="space-y-3">
                            {imagePreviews.map((preview, idx) => (
                                <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                                    <div className="flex gap-2">
                                        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="text-xs text-gray-600">
                                                Gambar {idx + 1}
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded hover:bg-red-100 w-fit"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">Maksimal 5 gambar. Format: JPG, PNG, GIF, WebP (maks 5MB per file)</p>
                </div>

                <div className="flex gap-2 pt-2">
                    <button 
                        type="button" 
                        onClick={closeModal}
                        className="flex-1 bg-gray-200 py-2 rounded"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-600 text-white py-2 rounded"
                    >
                        Simpan
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}