'use client';

import React, { useState, useEffect } from 'react';
import { NewsArticle } from '@/types';
import { apiUrl } from '@/lib/api';

export default function NewsManagePage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    category: 'Pengumuman',
  });

  const fetchNews = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/news'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) setNews(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const url = editingId 
      ? apiUrl(`/api/news/${editingId}`)
      : apiUrl('/api/news');
    const method = editingId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      closeModal();
      fetchNews();
    } catch (err) {
      alert('Gagal menyimpan berita');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;

    const token = localStorage.getItem('access_token');
    await fetch(apiUrl(`/api/news/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchNews();
  };

  const openEditModal = (item: NewsArticle) => {
    setFormData({
      title: item.title,
      content: item.content,
      image_url: item.image_url || '',
      category: item.category,
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', image_url: '', category: 'Pengumuman' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Berita</h1>
          <p className="text-gray-500">Kelola informasi dan artikel organisasi.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Tulis Berita
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="p-4">Judul</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Penulis</th>
                        <th className="p-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center">Memuat...</td></tr>
                    ) : news.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="font-semibold text-gray-800 line-clamp-1">{item.title}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                    {item.category}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{item.user.name}</td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => openEditModal(item)}
                                    className="text-blue-500 hover:text-blue-700 mr-3"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Berita' : 'Tulis Berita Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Judul Berita</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border p-2 rounded"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select 
                        className="w-full border p-2 rounded bg-gray-50"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Berita Kegiatan">Berita Kegiatan</option>
                        <option value="Info Akademik">Info Akademik</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL Gambar Utama</label>
                    <input 
                        type="url"
                        placeholder="https://..."
                        className="w-full border p-2 rounded"
                        value={formData.image_url}
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-1">Biarkan kosong untuk tanpa gambar.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Isi Berita</label>
                    <textarea 
                        required
                        rows={8}
                        className="w-full border p-2 rounded"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                    />
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