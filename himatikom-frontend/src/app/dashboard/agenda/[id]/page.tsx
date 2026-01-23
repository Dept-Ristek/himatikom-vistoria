'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { User } from '@/types';
import { apiUrl } from '@/lib/api';

// Import QRCodeSVG dynamically
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });

// Tipe Data
interface Attendance {
    id: number;
    scanned_at: string;
    user: User;
}

interface AgendaDetail {
    id: number;
    title: string;
    description: string;
    qr_code: string;
    start_time: string;
    end_time: string;
    user_id: number;
    attendances: Attendance[];
}

export default function AgendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [agenda, setAgenda] = useState<AgendaDetail | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [isManualInputOpen, setIsManualInputOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [submitManualLoading, setSubmitManualLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { id } = use(params);
    const router = useRouter();
    
    // Ensure component only renders on client side for QR code
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch current user
    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const res = await fetch(apiUrl('/api/auth/me'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status && data.data) {
                setCurrentUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    // Perbaikan Fungsi Export
    const handleExport = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert('Token tidak ditemukan');
                return;
            }

            const response = await fetch(apiUrl(`/api/agendas/${id}/export`), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `export-${agenda?.title || 'agenda'}-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal mengexport data. Silakan coba lagi.');
        }
    };

    // Delete attendance
    const handleDeleteAttendance = async (attendanceId: number, attendeeName: string) => {
        if (!confirm(`Hapus kehadiran ${attendeeName}?`)) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(apiUrl(`/api/attendances/${attendanceId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status) {
                alert('Kehadiran berhasil dihapus');
                fetchAgendaData();
            } else {
                alert('Gagal menghapus: ' + (data.message || 'Terjadi kesalahan'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan koneksi');
        }
    };

    // Fetch all users untuk manual input
    const fetchAllUsers = async () => {
        setLoadingUsers(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(apiUrl('/api/auth/users'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status && Array.isArray(data.data)) {
                setAllUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Handle manual input attendance
    const handleManualInput = async () => {
        if (!selectedUserId) {
            alert('Pilih peserta terlebih dahulu');
            return;
        }

        setSubmitManualLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(apiUrl('/api/attendance/manual'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    agenda_id: id
                })
            });
            const data = await res.json();
            if (data.status) {
                alert('Peserta berhasil ditambahkan');
                setSelectedUserId('');
                setIsManualInputOpen(false);
                fetchAgendaData();
            } else {
                alert('Gagal menambahkan: ' + (data.message || 'Terjadi kesalahan'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan koneksi');
        } finally {
            setSubmitManualLoading(false);
        }
    };

    // Filter users - exclude already attended dan filter by search query
    const filteredUsers = allUsers.filter(user => {
        const alreadyAttended = agenda?.attendances?.some(att => att.user.id === user.id);
        if (alreadyAttended) return false;

        const searchLower = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            (user.nim && user.nim.toLowerCase().includes(searchLower))
        );
    });

    const handleEdit = () => {
        router.push(`/dashboard/agenda`); // Kembali ke manage page untuk edit
    };

    // Fungsi untuk fetch data agenda
    const fetchAgendaData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(apiUrl(`/api/agendas/${id}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status) {
                setAgenda(data.data);
            }
        } catch (error) {
            console.error('Error fetching agenda data:', error);
        }
    };

    // Check if current user is creator
    useEffect(() => {
        if (currentUser && agenda) {
            setIsCreator(agenda.user_id === currentUser.id);
        }
    }, [currentUser, agenda]);

    // Fetch Data saat mount
    useEffect(() => {
        setLoading(true);
        fetchCurrentUser().then(() => {
            fetchAgendaData().then(() => setLoading(false));
        });
    }, [id]);

    // Auto-refresh data setiap 5 detik untuk menampilkan attendance terbaru
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAgendaData();
        }, 5000); // Refresh setiap 5 detik

        // Setup visibility change listener untuk refresh saat tab aktif
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchAgendaData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
            <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
    );
    
    if (!agenda) return <div className="p-8 text-center text-gray-500">Agenda tidak ditemukan.</div>;

    const totalHadir = agenda.attendances.length;
    const startDate = new Date(agenda.start_time);
    const endDate = new Date(agenda.end_time);

    return (
        <div className="space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-start gap-2">
                <button
                    onClick={() => window.history.back()}
                    className="text-gray-600 hover:text-blue-600 text-sm flex items-center gap-1 transition"
                >
                    <i className="fas fa-arrow-left"></i> Kembali
                </button>
                <div className="flex gap-2">
                    {isCreator && (
                        <button
                            onClick={() => {
                                fetchAllUsers();
                                setIsManualInputOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                        >
                            <i className="fas fa-plus mr-1"></i>Input Manual
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                    >
                        <i className="fas fa-download mr-1"></i>Export
                    </button>
                </div>
            </div>

            {/* Agenda Detail */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-4">
                    <h1 className="text-xl font-bold">{agenda.title}</h1>
                    <div className="flex flex-col gap-1 mt-2 text-blue-100 text-xs">
                        <span className="flex items-center gap-1">
                            <i className="far fa-calendar"></i> {startDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                            <i className="far fa-clock"></i> {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-gray-600 text-sm">
                        {agenda.description || '-'}
                    </p>
                </div>
            </div>

            {/* QR Code Section */}
            {isCreator && (
                <div className="bg-white rounded border border-gray-200 overflow-hidden p-4 flex flex-col items-center">
                    <h3 className="text-sm font-medium text-gray-800 mb-3">QR Code Absensi</h3>
                    <div className="bg-white p-2 rounded border border-gray-200">
                        {isClient ? (
                            <QRCodeSVG
                                value={agenda?.qr_code || ''}
                                size={140}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"L"}
                            />
                        ) : (
                            <div className="w-[140px] h-[140px] bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">Loading...</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-mono">{agenda?.qr_code}</p>
                </div>
            )}

            {/* Attendance List Section */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50">
                    <div>
                        <h2 className="text-sm font-bold text-gray-800">Daftar Hadir</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Total: <span className="font-medium">{totalHadir} orang</span></p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"
                        >
                            <i className="fas fa-file-excel"></i> Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2 font-medium text-gray-700">Nama</th>
                                <th className="px-4 py-2 font-medium text-gray-700">NIM</th>
                                <th className="px-4 py-2 font-medium text-gray-700">Role</th>
                                <th className="px-4 py-2 font-medium text-gray-700">Waktu Scan</th>
                                {isCreator && <th className="px-4 py-2 text-center font-medium text-gray-700">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {totalHadir > 0 ? (
                                agenda?.attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-700 font-medium">{att.user.name}</td>
                                        <td className="px-4 py-2 text-gray-600 font-mono">{att.user.nim}</td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                                                {att.user.position || att.user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {new Date(att.scanned_at).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        {isCreator && (
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleDeleteAttendance(att.id, att.user.name)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isCreator ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                                        Belum ada peserta yang absen
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INPUT MANUAL ATTENDANCE */}
            {isManualInputOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded w-full max-w-sm shadow-lg">
                        <div className="bg-blue-600 text-white px-4 py-3 rounded-t">
                            <h3 className="font-bold text-sm">Input Manual Peserta</h3>
                        </div>

                        <div className="p-4 space-y-3">
                            {loadingUsers ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Search Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Cari Peserta
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Nama atau NIM..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setSelectedUserId('');
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                            />
                                            <i className="fas fa-search absolute right-3 top-2.5 text-gray-400 text-xs"></i>
                                        </div>
                                    </div>

                                    {/* User Select */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Pilih Peserta
                                        </label>
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">-- Pilih peserta --</option>
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.nim})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    {searchQuery ? 'Tidak ada hasil' : 'Semua sudah absen'}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-2 rounded border border-gray-200">
                                        Peserta yang belum absen: <span className="font-medium">{filteredUsers.length}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 px-4 py-3 flex gap-2 justify-end bg-gray-50 rounded-b">
                            <button
                                onClick={() => {
                                    setIsManualInputOpen(false);
                                    setSelectedUserId('');
                                    setSearchQuery('');
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleManualInput}
                                disabled={submitManualLoading || !selectedUserId}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition flex items-center gap-1"
                            >
                                {submitManualLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i>
                                        Tambahkan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}