'use client';

import React, { useState, useEffect } from 'react';
import { Ticket } from '@/types';
import { apiUrl } from '@/lib/api';

export default function SupportPage() {
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Bug', 
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMyTickets = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/tickets/my'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(data.status) setMyTickets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const token = localStorage.getItem('access_token');
    if(!token) {
        alert('Sesi habis. Silakan login ulang.');
        return;
    }
    
    try {
      const res = await fetch(apiUrl('/api/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status) {
        alert('Laporan berhasil dikirim ke Tim Ristek!');
        setFormData({ category: 'Bug', description: '' });
        fetchMyTickets();
      } else {
        alert('Gagal: ' + (data.message || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Style Status
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': 
        return { 
            bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
            text: 'Menunggu',
            icon: 'fa-clock'
        };
      case 'process': 
        return { 
            bg: 'bg-blue-50 text-blue-700 border-blue-200', 
            text: 'Diproses',
            icon: 'fa-cog fa-spin'
        };
      case 'done': 
        return { 
            bg: 'bg-green-50 text-green-700 border-green-200', 
            text: 'Selesai',
            icon: 'fa-check-circle'
        };
      default: 
        return { 
            bg: 'bg-gray-50 text-gray-700 border-gray-200', 
            text: status,
            icon: 'fa-question'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Bantuan</h1>
            <p className="text-gray-500 mt-1">Laporkan masalah teknis atau fitur baru ke Tim Ristek.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* KOLOM KIRI: FORM LAPORAN (Sticky) */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-headset text-sm"></i>
                    </div>
                    <h3 className="font-bold text-gray-900">Buat Tiket Baru</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kategori Masalah</label>
                        <select 
                            className="w-full bg-blue-50 border-blue-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Bug">Bug / Error Sistem</option>
                            <option value="Feature">Permintaan Fitur Baru</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Deskripsi Detail</label>
                        <textarea 
                            required
                            rows={6}
                            placeholder="Ceritakan detail masalah yang Anda alami. Cantumkan screenshot jika perlu..."
                            className="w-full bg-blue-50 border-blue-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none placeholder:text-blue-300"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition
                            ${submitting 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i> Mengirim...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i> Kirim Laporan
                            </>
                        )}
                    </button>
                    
                    <div className="text-[10px] text-gray-400 text-center pt-2">
                        Tiket akan diproses maksimal 1x24 jam.
                    </div>
                </form>
            </div>
        </div>

        {/* KOLOM KANAN: RIWAYAT TIKET */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-gray-900">Riwayat Tiket Saya</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                    Total {myTickets.length} Tiket
                </span>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600"></div>
                </div>
            ) : myTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center text-3xl mb-4">
                        <i className="fas fa-ticket-alt"></i>
                    </div>
                    <h3 className="text-gray-900 font-bold">Belum Ada Tiket</h3>
                    <p className="text-gray-500 text-sm mt-1">Kamu belum pernah melaporkan masalah.</p>
                </div>
            ) : (
                myTickets.map((ticket) => {
                    const statusStyle = getStatusStyle(ticket.status);
                    return (
                        <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            
                            {/* Header Ticket: ID & Status */}
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-mono">#{ticket.id}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusStyle.bg} flex items-center gap-1.5`}>
                                        <i className={`fas ${statusStyle.icon} text-[10px]`}></i> {statusStyle.text}
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase">
                                        {ticket.category}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>

                            {/* Body Ticket: Description */}
                            <div className="p-5">
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    {ticket.description}
                                </p>
                            </div>

                            {/* Footer Ticket: Solution or Info */}
                            <div className={`px-5 py-4 border-t ${ticket.status === 'done' && ticket.solution ? 'border-green-100 bg-green-50/30' : 'border-gray-100'}`}>
                                {ticket.status === 'done' && ticket.solution ? (
                                    <div className="flex gap-3">
                                        <div className="mt-0.5 text-green-600"><i className="fas fa-check-double"></i></div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-green-700 uppercase mb-1">Solusi Ristek</p>
                                            <p className="text-sm text-green-900 leading-snug">{ticket.solution}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <i className={`fas ${ticket.status === 'process' ? 'fa-circle-notch fa-spin' : 'fa-hourglass-half'}`}></i>
                                        <span>{ticket.status === 'process' ? 'Tiket sedang dianalisis oleh Ristek...' : 'Menunggu antrian...'}</span>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })
            )}
        </div>

      </div>
    </div>
  );
}