'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Ticket {
  id: number;
  user_id: number;
  category: string;
  description: string;
  status: 'pending' | 'process' | 'done';
  solution?: string;
  created_at: string;
  updated_at: string;
  user: User;
}

type FilterStatus = 'all' | 'pending' | 'process' | 'done';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replySolution, setReplySolution] = useState('');
  const [replyStatus, setReplyStatus] = useState<'pending' | 'process' | 'done'>('process');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/tickets'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'process':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'done':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'process':
        return 'Diproses';
      case 'done':
        return 'Selesai';
      default:
        return status;
    }
  };

  const openDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplySolution(ticket.solution || '');
    setReplyStatus(ticket.status);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedTicket(null);
    setReplySolution('');
    setReplyStatus('process');
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(apiUrl(`/api/tickets/${selectedTicket.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: replyStatus,
          solution: replySolution,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert('Gagal memperbarui tiket: ' + (data.message || 'Unknown error'));
        return;
      }

      // Update tickets list
      setTickets(tickets.map(t => t.id === selectedTicket.id ? data.data : t));
      closeDetail();
      alert('Tiket berhasil diperbarui');
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Gagal memperbarui tiket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Ticket System</h1>
        <p className="text-gray-500 mt-1">Kelola tiket dukungan teknis dari anggota</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Tiket</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{tickets.length}</p>
            </div>
            <i className="fas fa-ticket-alt text-2xl text-gray-300"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {tickets.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <i className="fas fa-hourglass-start text-2xl text-yellow-300"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Diproses</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {tickets.filter(t => t.status === 'process').length}
              </p>
            </div>
            <i className="fas fa-spinner text-2xl text-blue-300"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Selesai</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {tickets.filter(t => t.status === 'done').length}
              </p>
            </div>
            <i className="fas fa-check-circle text-2xl text-green-300"></i>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'process', 'done'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as FilterStatus)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'Semua' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500 font-medium">Tidak ada tiket</p>
            <p className="text-gray-400 text-sm mt-1">Belum ada tiket untuk filter ini</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openDetail(ticket)}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 truncate">
                      #{ticket.id} - {ticket.category}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-user-circle"></i>
                      <span>{ticket.user?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 flex-shrink-0">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Tiket #{selectedTicket.id}</h2>
                  <p className="text-blue-100 text-sm mt-1">{selectedTicket.category}</p>
                </div>
                <button
                  onClick={closeDetail}
                  className="text-blue-100 hover:text-white transition"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Informasi Tiket</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Pengaju</p>
                    <p className="text-gray-800">{selectedTicket.user?.name}</p>
                    <p className="text-sm text-gray-500">{selectedTicket.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Status</p>
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Tanggal Dibuat</p>
                    <p className="text-gray-800">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Deskripsi Masalah</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-gray-800">Balasan & Solusi</h3>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value as 'pending' | 'process' | 'done')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="process">Diproses</option>
                    <option value="done">Selesai</option>
                  </select>
                </div>

                {/* Solution Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solusi {replyStatus === 'done' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={replySolution}
                    onChange={(e) => setReplySolution(e.target.value)}
                    placeholder="Tuliskan solusi atau update status tiket..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={replyStatus === 'done'}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner animate-spin"></i>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Simpan Balasan
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Current Solution */}
              {selectedTicket.solution && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Solusi Sebelumnya</h4>
                  <p className="text-blue-800 text-sm whitespace-pre-wrap">{selectedTicket.solution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}