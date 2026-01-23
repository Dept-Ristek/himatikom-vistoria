'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { User } from '@/types';

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export default function KomunitasPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modes
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  // Form State
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [communityCategory, setCommunityCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Olahraga',
    'Seni',
    'Akademik',
    'Teknologi',
    'Sosial',
    'Lingkungan',
    'Lainnya'
  ];

  // Fetch user & communities
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Get current user
    fetch(apiUrl('/api/auth/me'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status) setCurrentUser(data.data);
    });

    // Get communities
    void fetchCommunities(token as string);
  }, []);

  const fetchCommunities = async (token: string) => {
    try {
      console.log('Fetching communities...');
      const res = await fetch(apiUrl('/api/communities'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Communities response:', data);
      if (data.status) {
        setCommunities(data.data);
      } else {
        console.error('Communities API error:', data.message);
      }
    } catch (err) {
      console.error('Fetch communities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      setIsSubmitting(false);
      return;
    }

    try {
      const isEdit = mode === 'edit' && selectedCommunity;
      const url = isEdit 
        ? apiUrl(`/api/communities/${selectedCommunity.id}`)
        : apiUrl('/api/communities');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: communityName,
          description: communityDescription,
          category: communityCategory,
        })
      });

      const data = await res.json();
      if (data.status) {
        alert(isEdit ? 'Komunitas berhasil diupdate!' : 'Komunitas berhasil dibuat!');
        setCommunityName('');
        setCommunityDescription('');
        setCommunityCategory('');
        setSelectedCommunity(null);
        setMode('list');
        void fetchCommunities(token);
      } else {
        alert(data.message || (isEdit ? 'Gagal mengupdate komunitas' : 'Gagal membuat komunitas'));
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setCommunityName(community.name);
    setCommunityDescription(community.description);
    setCommunityCategory(community.category);
    setMode('edit');
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (!confirm('Hapus komunitas ini? Tindakan ini tidak dapat dibatalkan.')) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/communities/${communityId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.status) {
        alert('Komunitas berhasil dihapus!');
        void fetchCommunities(token);
      } else {
        alert(data.message || 'Gagal menghapus komunitas');
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Manajemen Komunitas</h1>
            <p className="text-xs text-gray-500 mt-0.5">Kelola komunitas mahasiswa</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setCommunityName('');
              setCommunityDescription('');
              setCommunityCategory('');
              setSelectedCommunity(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i> Buat Komunitas
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* LIST COMMUNITIES */}
        {mode === 'list' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {communities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
                  <p className="text-sm text-gray-600">Belum ada komunitas</p>
                </div>
              ) : (
                communities.map(community => (
                  <div key={community.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">{community.category}</span>
                          <span className="font-medium">{community.member_count}</span> anggota
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCommunity(community)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCommunity(community.id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition"
                          title="Hapus"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CREATE/EDIT FORM */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setMode('list');
                setSelectedCommunity(null);
                setCommunityName('');
                setCommunityDescription('');
                setCommunityCategory('');
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200"
            >
              ← Kembali
            </button>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'create' ? 'Buat Komunitas' : 'Edit Komunitas'}
              </h2>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                {/* Community Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Komunitas</label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="Misal: Komunitas Badminton"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    placeholder="Jelaskan komunitas ini..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={communityCategory}
                    onChange={(e) => setCommunityCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setSelectedCommunity(null);
                      setCommunityName('');
                      setCommunityDescription('');
                      setCommunityCategory('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : (mode === 'edit' ? 'Update Komunitas' : 'Buat Komunitas')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
