'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { User } from '@/types';

interface Partner {
  id: number;
  name: string;
  description: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function PartnerPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modes
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  
  // Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerDescription, setPartnerDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Universitas',
    'Perusahaan',
    'Organisasi',
    'Lembaga Pemerintah',
    'Media',
    'Lainnya'
  ];

  // Fetch user & partners
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

    // Get partners
    void fetchPartners(token as string);
  }, []);

  const fetchPartners = async (token: string) => {
    try {
      console.log('Fetching partners...');
      const res = await fetch(apiUrl('/api/partners'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Partners response:', data);
      if (data.status) {
        setPartners(data.data);
      } else {
        console.error('Partners API error:', data.message);
      }
    } catch (err) {
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      setIsSubmitting(false);
      return;
    }

    try {
      const isEdit = mode === 'edit' && selectedPartner;
      const url = isEdit 
        ? apiUrl(`/api/partners/${selectedPartner.id}`)
        : apiUrl('/api/partners');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: partnerName,
          description: partnerDescription,
          contact_person: contactPerson,
          email: email,
          phone: phone,
          address: address,
          category: category,
        })
      });

      const data = await res.json();
      if (data.status) {
        alert(isEdit ? 'Partnership berhasil diupdate!' : 'Partnership berhasil dibuat!');
        setPartnerName('');
        setPartnerDescription('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
        setCategory('');
        setSelectedPartner(null);
        setMode('list');
        void fetchPartners(token);
      } else {
        alert(data.message || (isEdit ? 'Gagal mengupdate partnership' : 'Gagal membuat partnership'));
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setPartnerName(partner.name);
    setPartnerDescription(partner.description);
    setContactPerson(partner.contact_person);
    setEmail(partner.email);
    setPhone(partner.phone);
    setAddress(partner.address);
    setCategory(partner.category);
    setMode('edit');
  };

  const handleDeletePartner = async (partnerId: number) => {
    if (!confirm('Hapus partnership ini? Tindakan ini tidak dapat dibatalkan.')) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/partners/${partnerId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.status) {
        alert('Partnership berhasil dihapus!');
        void fetchPartners(token);
      } else {
        alert(data.message || 'Gagal menghapus partnership');
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
            <h1 className="text-xl font-semibold text-gray-900">Database Partnership</h1>
            <p className="text-xs text-gray-500 mt-0.5">Kelola mitra organisasi</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setPartnerName('');
              setPartnerDescription('');
              setContactPerson('');
              setEmail('');
              setPhone('');
              setAddress('');
              setCategory('');
              setSelectedPartner(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i> Tambah Partnership
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* LIST PARTNERS */}
        {mode === 'list' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {partners.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
                  <p className="text-sm text-gray-600">Belum ada partnership</p>
                </div>
              ) : (
                partners.map(partner => (
                  <div key={partner.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{partner.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{partner.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">{partner.category}</span>
                          </div>
                          <div>
                            <i className="fas fa-user mr-1"></i> {partner.contact_person}
                          </div>
                          <div>
                            <i className="fas fa-envelope mr-1"></i> {partner.email}
                          </div>
                          <div>
                            <i className="fas fa-phone mr-1"></i> {partner.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPartner(partner)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
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
                setSelectedPartner(null);
                setPartnerName('');
                setPartnerDescription('');
                setContactPerson('');
                setEmail('');
                setPhone('');
                setAddress('');
                setCategory('');
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200"
            >
              ← Kembali
            </button>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'create' ? 'Tambah Partnership Baru' : 'Edit Partnership'}
              </h2>
              <form onSubmit={handleCreatePartner} className="space-y-4">
                {/* Partner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mitra</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Misal: PT. Teknologi Maju Indonesia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={partnerDescription}
                    onChange={(e) => setPartnerDescription(e.target.value)}
                    placeholder="Jelaskan tentang partnership ini..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kontak</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Nama kontak person"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 xxx xxxx xxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat lengkap mitra"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setSelectedPartner(null);
                      setPartnerName('');
                      setPartnerDescription('');
                      setContactPerson('');
                      setEmail('');
                      setPhone('');
                      setAddress('');
                      setCategory('');
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
                    {isSubmitting ? 'Menyimpan...' : (mode === 'edit' ? 'Update Partnership' : 'Simpan Partnership')}
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
