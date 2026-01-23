'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  user_id: number;
  user: {
    id: number;
    name: string;
    nim: string;
  };
  images?: Array<{
    id: number;
    filename: string;
    url: string;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function BeritaManagement() {
  const router = useRouter();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    category: 'umum',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayedImageIndex, setDisplayedImageIndex] = useState<Record<number, number>>({});

  // Check role on mount
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('access_token');
    
    if (!token || role !== 'pengurus') {
      router.push('/dashboard');
      return;
    }
    
    setUserRole(role);
    fetchNews();
  }, [router]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl('/api/news'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNews(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load berita');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? apiUrl(`/api/news/${editingId}`)
        : apiUrl('/api/news');

      // Gunakan FormData untuk upload file
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('content', formData.content);
      uploadData.append('category', formData.category);
      
      // Append gambar jika ada
      imageFiles.forEach((file, index) => {
        uploadData.append(`images[${index}]`, file);
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) throw new Error('Failed to save');
      
      // Reset form
      setFormData({ title: '', content: '', image_url: '', category: 'umum' });
      setImageFiles([]);
      setImagePreviews([]);
      setCurrentImageIndex(0);
      setEditingId(null);
      setShowForm(false);
      fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save berita');
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setFormData({
      title: article.title,
      content: article.content,
      image_url: '',
      category: article.category,
    });
    
    // Load existing images if available
    if (article.images && article.images.length > 0) {
      const previews = article.images.map(img => img.url);
      setImagePreviews(previews);
      setCurrentImageIndex(0);
    } else {
      setImagePreviews([]);
      setCurrentImageIndex(0);
    }
    
    setImageFiles([]);
    setEditingId(article.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(apiUrl(`/api/news/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete');
      fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', image_url: '', category: 'umum' });
    setImageFiles([]);
    setImagePreviews([]);
    setCurrentImageIndex(0);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setCurrentImageIndex(0);
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    if (currentImageIndex >= imageFiles.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (userRole !== 'pengurus') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-red-100">
        <i className="fas fa-exclamation-triangle text-4xl text-red-100 mb-4"></i>
        <h3 className="text-lg font-bold text-red-600">Akses Ditolak</h3>
        <p className="text-gray-500">Hanya pengurus yang dapat mengelola berita.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <h1 className="text-lg font-bold text-gray-900">Manajemen Berita</h1>
        <button
          onClick={() => {
            if (showForm) {
                resetForm();
            } else {
                setShowForm(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"
        >
          <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i>
          {showForm ? 'Tutup' : 'Buat'}
        </button>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-xs flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* Form Section (Expandable) */}
      {showForm && (
        <div className="bg-white rounded border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            {editingId ? 'Edit Berita' : 'Buat Berita Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Judul & Kategori Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Judul berita..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="umum">Umum</option>
                  <option value="pengumuman">Pengumuman</option>
                  <option value="kegiatan">Kegiatan</option>
                  <option value="prestasi">Prestasi</option>
                  <option value="beasiswa">Beasiswa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gambar Artikel (Maksimal 5 file)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="text-[10px] text-gray-500 mt-1">Format: JPG, PNG, WebP | Max 5 file</p>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Preview ({imagePreviews.length} file)</span>
                    <span className="text-[10px] text-gray-500">{currentImageIndex + 1}/{imagePreviews.length}</span>
                  </div>
                  
                  {/* Main Preview */}
                  <div className="relative bg-gray-100 rounded h-40 overflow-hidden flex items-center justify-center">
                    <img
                      src={imagePreviews[currentImageIndex]}
                      alt={`Preview ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Buttons */}
                    {imagePreviews.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imagePreviews.length) % imagePreviews.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imagePreviews.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="flex gap-1 overflow-x-auto">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-12 h-12 rounded overflow-hidden border-2 transition ${
                            index === currentImageIndex ? 'border-blue-500' : 'border-gray-300 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preview} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-red-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Konten Artikel</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Konten artikel..."
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded font-medium transition text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition text-xs"
              >
                {editingId ? 'Update' : 'Publikasikan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded border border-gray-200">
          <i className="fas fa-newspaper text-gray-300 text-3xl mb-3"></i>
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Berita</h3>
          <p className="text-gray-500 text-xs mt-1">Mulai membuat artikel pertama</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {news.map((article) => (
            <Link key={article.id} href={`/dashboard/berita/${article.id}`} className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md hover:border-gray-300 transition">
              
              {/* Image Section */}
              <div className="relative h-48 bg-gray-100 overflow-hidden group">
                {article.images && article.images.length > 0 ? (
                  <>
                    <img
                      src={article.images[displayedImageIndex[article.id] || 0].url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows - Only show if more than 1 image */}
                    {article.images && article.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const currentIdx = displayedImageIndex[article.id] || 0;
                            const newIdx = (currentIdx - 1 + article.images!.length) % article.images!.length;
                            setDisplayedImageIndex({ ...displayedImageIndex, [article.id]: newIdx });
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded transition opacity-0 group-hover:opacity-100"
                          title="Gambar sebelumnya"
                        >
                          <i className="fas fa-chevron-left text-xs"></i>
                        </button>
                        <button
                          onClick={() => {
                            const currentIdx = displayedImageIndex[article.id] || 0;
                            const newIdx = (currentIdx + 1) % article.images!.length;
                            setDisplayedImageIndex({ ...displayedImageIndex, [article.id]: newIdx });
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded transition opacity-0 group-hover:opacity-100"
                          title="Gambar berikutnya"
                        >
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-medium">
                          {(displayedImageIndex[article.id] || 0) + 1} / {article.images!.length}
                        </div>
                      </>
                    )}
                  </>
                ) : article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <i className="fas fa-image text-gray-400 text-2xl"></i>
                  </div>
                )}
                
                {/* Category Badge */}
                <span className="absolute top-2 right-2 bg-white text-blue-700 text-xs font-medium px-2 py-1 rounded border border-gray-200 uppercase">
                  {article.category}
                </span>
              </div>

              {/* Content Section */}
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                  {article.title}
                </h3>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed flex-grow">
                  {article.content}
                </p>

                {/* Footer: Meta & Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                    <span className="font-medium">{article.user.name}</span>
                    <span>{new Date(article.created_at).toLocaleDateString('id-ID')}</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(article)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded text-xs font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded text-xs font-medium transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}