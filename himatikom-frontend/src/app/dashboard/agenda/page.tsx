'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';

export interface Agenda {
    id: number;
    title: string;
    description: string | null;
    qr_code: string;
    type: 'pengurus' | 'semua';
    start_time: string;
    end_time: string;
    user_id: number;
    user: {
        id: number;
        name: string;
        role: string;
    };
}

export default function AgendaManagePage() {
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [filterTab, setFilterTab] = useState<'all' | 'mine' | 'pengurus'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // State untuk form text
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [agendaType, setAgendaType] = useState<'pengurus' | 'semua'>('semua');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Ref untuk input waktu
    const startDateRef = useRef<HTMLInputElement>(null);
    const startHourRef = useRef<HTMLSelectElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const endHourRef = useRef<HTMLSelectElement>(null);

    const router = useRouter();

    const fetchAgendas = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(apiUrl('/api/agendas'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status) setAgendas(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendas();
        
        // Fetch current user
        const token = localStorage.getItem('access_token');
        if (token) {
            fetch(apiUrl('/api/auth/me'), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status && data.data) {
                    setCurrentUserId(data.data.id);
                    setCurrentUserRole(data.data.role);
                }
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const startDate = startDateRef.current?.value;
        const startHour = startHourRef.current?.value || '00';
        const endDate = endDateRef.current?.value;
        const endHour = endHourRef.current?.value || '00';

        if (!title || !startDate || !endDate) {
            alert('Mohon lengkapi Judul, Tanggal Mulai, dan Tanggal Selesai.');
            setSubmitting(false);
            return;
        }

        const startTime = `${startDate}T${startHour}:00`;
        const endTime = `${endDate}T${endHour}:00`;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert('Token tidak ditemukan.');
                return;
            }

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? apiUrl(`/api/agendas/${editingId}`) : apiUrl('/api/agendas');
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    start_time: startTime,
                    end_time: endTime,
                    type: agendaType,
                }),
            });

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                alert('Respons server tidak valid.');
                setSubmitting(false);
                return;
            }

            if (!res.ok) {
                // Show detailed validation errors
                const errorMessage = data.message || 'Periksa input kembali.';
                const errors = data.errors ? Object.values(data.errors).flat().join(', ') : '';
                alert('Gagal menyimpan: ' + errorMessage + (errors ? ' - ' + errors : ''));
                console.log('Response:', data);
                setSubmitting(false);
                return;
            }

            // Sukses
            setIsModalOpen(false);
            setTitle('');
            setDescription('');
            setAgendaType('semua');
            setEditingId(null);
            
            // Reset inputs
            if (startDateRef.current) startDateRef.current.value = '';
            if (startHourRef.current) startHourRef.current.value = '00';
            if (endDateRef.current) endDateRef.current.value = '';
            if (endHourRef.current) endHourRef.current.value = '00';

            alert('Agenda berhasil disimpan!');
            fetchAgendas();

        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus agenda ini?')) return;

        const token = localStorage.getItem('access_token');
        await fetch(apiUrl(`/api/agendas/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        fetchAgendas();
    };

    const openEditModal = (agenda: Agenda) => {
        setTitle(agenda.title);
        setDescription(agenda.description || '');
        setAgendaType(agenda.type);
        setEditingId(agenda.id);
        
        const startDateTime = new Date(agenda.start_time);
        const endDateTime = new Date(agenda.end_time);
        
        const startDateStr = startDateTime.toISOString().split('T')[0]; 
        const startHourStr = String(startDateTime.getHours()).padStart(2, '0'); 
        
        const endDateStr = endDateTime.toISOString().split('T')[0]; 
        const endHourStr = String(endDateTime.getHours()).padStart(2, '0'); 
        
        if (startDateRef.current) startDateRef.current.value = startDateStr;
        if (startHourRef.current) startHourRef.current.value = startHourStr;
        if (endDateRef.current) endDateRef.current.value = endDateStr;
        if (endHourRef.current) endHourRef.current.value = endHourStr;
        
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setAgendaType('semua');
        setEditingId(null);
        if (startDateRef.current) startDateRef.current.value = '';
        if (startHourRef.current) startHourRef.current.value = '00';
        if (endDateRef.current) endDateRef.current.value = '';
        if (endHourRef.current) endHourRef.current.value = '00';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                </div>
                {currentUserRole === 'pengurus' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
                    >
                        <i className="fas fa-plus mr-2"></i>Tambah
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            {!loading && agendas.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                            filterTab === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilterTab('mine')}
                        className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                            filterTab === 'mine'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Saya
                    </button>
                    {currentUserRole === 'pengurus' && (
                        <button
                            onClick={() => setFilterTab('pengurus')}
                            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                                filterTab === 'pengurus'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pengurus
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-500 text-sm mt-2">Memuat...</p>
                </div>
            ) : agendas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">Belum ada agenda</p>
                </div>
            ) : (
                /* Agenda Grid */
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {agendas
                        .filter(agenda => {
                            // Jika user adalah pengurus, tampilkan semua agenda
                            if (currentUserRole === 'pengurus') {
                                if (filterTab === 'mine') return agenda.user_id === currentUserId;
                                if (filterTab === 'pengurus') return agenda.user_id !== currentUserId;
                                return true;
                            }
                            // Jika user bukan pengurus, hanya tampilkan agenda tipe 'semua'
                            return agenda.type === 'semua';
                        })
                        .map((agenda) => (
                        <div
                            key={agenda.id}
                            className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition"
                        >
                            {/* Card Content */}
                            <div className="p-3">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {agenda.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(agenda.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {agenda.user?.name}
                                </p>
                            </div>

                            {/* QR or Actions */}
                            {currentUserId === agenda.user_id ? (
                                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-center">
                                    <div className="bg-white p-2 rounded border border-gray-200">
                                        <QRCodeSVG
                                            value={agenda.qr_code}
                                            size={80}
                                            bgColor={"#ffffff"}
                                            fgColor={"#000000"}
                                            level={"L"}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {/* Footer */}
                            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
                                <span className="text-gray-500">
                                    {new Date(agenda.start_time).getHours()}:00 - {new Date(agenda.end_time).getHours()}:00
                                </span>
                                <div className="flex gap-1">
                                    {currentUserId === agenda.user_id && (
                                        <>
                                            <button
                                                onClick={() => openEditModal(agenda)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                                title="Edit"
                                            >
                                                <i className="fas fa-pen text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(agenda.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                title="Hapus"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => router.push(`/dashboard/agenda/${agenda.id}`)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                        title="Detail"
                                    >
                                        <i className="fas fa-arrow-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL TAMBAH/EDIT AGENDA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded w-full max-w-md">
                        
                        {/* Modal Header */}
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Edit Agenda' : 'Buat Agenda'}
                            </h2>
                            <button 
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Judul agenda"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Deskripsi"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Agenda</label>
                                    <select
                                        value={agendaType}
                                        onChange={e => setAgendaType(e.target.value as 'pengurus' | 'semua')}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    >
                                        <option value="semua">Semua (Pengurus + Anggota)</option>
                                        <option value="pengurus">Pengurus Saja</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {agendaType === 'semua' 
                                            ? 'Agenda akan tampil untuk semua pengguna' 
                                            : 'Agenda hanya tampil untuk akun pengurus'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            ref={startDateRef}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Jam Mulai</label>
                                        <select
                                            ref={startHourRef}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={String(i).padStart(2, '0')}>
                                                    {String(i).padStart(2, '0')}:00
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                                        <input
                                            type="date"
                                            ref={endDateRef}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Jam Selesai</label>
                                        <select
                                            ref={endHourRef}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={String(i).padStart(2, '0')}>
                                                    {String(i).padStart(2, '0')}:00
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 py-3 border-t border-gray-200 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`px-4 py-1.5 rounded text-white text-sm transition ${
                                    submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {submitting ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}