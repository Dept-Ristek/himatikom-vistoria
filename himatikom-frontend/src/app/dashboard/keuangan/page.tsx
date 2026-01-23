'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { apiUrl } from '@/lib/api';

export interface Transaction {
  id: number;
  type: 'in' | 'out';
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  user: User;
}

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [formData, setFormData] = useState({
    type: 'in', // default Pemasukan
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0], // default hari ini
  });

  const fetchTransactions = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/transactions'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) setTransactions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    await fetch(apiUrl('/api/transactions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    // Reset Form & Refresh
    setFormData({ ...formData, amount: 0, description: '' });
    fetchTransactions();
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Hapus riwayat transaksi ini?')) return;
    
    const token = localStorage.getItem('access_token');
    await fetch(apiUrl(`/api/transactions/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchTransactions();
  };

  // --- LOGIKA PERHITUNGAN SALDO (PERBAIKAN) ---
  
  // 1. Hitung Total Pemasukan
  const totalIn = transactions.filter(t => t.type === 'in').reduce((a, b) => a + b.amount, 0);
  
  // 2. Hitung Total Pengeluaran
  const totalOut = transactions.filter(t => t.type === 'out').reduce((a, b) => a + b.amount, 0);

  // 3. Hitung Saldo Akhir (Total Masuk - Total Keluar)
  const balance = totalIn - totalOut;

  // Format Rupiah (Tanpa desimal)
  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Kas</h1>
        <p className="text-sm text-gray-600 mt-1">Catat pemasukan dan pengeluaran organisasi</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Saldo Kas</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">{formatRp(balance)}</h2>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Pemasukan</p>
          <h2 className="text-2xl font-bold text-green-600 mt-3">{formatRp(totalIn)}</h2>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Pengeluaran</p>
          <h2 className="text-2xl font-bold text-red-600 mt-3">{formatRp(totalOut)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Input Transaksi</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Jenis</label>
                <select 
                  className="w-full border border-gray-200 p-2 text-sm"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as 'in' | 'out'})}
                >
                  <option value="in">Pemasukan</option>
                  <option value="out">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Nominal (Rp)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full border border-gray-200 p-2 text-sm"
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Keterangan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Cth: Beli Snack"
                  className="w-full border border-gray-200 p-2 text-sm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Tanggal</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-gray-200 p-2 text-sm"
                  value={formData.transaction_date}
                  onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>

        {/* RIWAYAT */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Riwayat Transaksi
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Belum ada transaksi</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Keterangan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Jenis</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Nominal</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-600 text-sm whitespace-nowrap">
                          {new Date(t.transaction_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-gray-800 text-sm">{t.description}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold ${
                            t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {t.type === 'in' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className={`px-6 py-3 text-right text-sm font-semibold ${
                          t.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.type === 'in' ? '+' : '-'} {formatRp(t.amount)}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}