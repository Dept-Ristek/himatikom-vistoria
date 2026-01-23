'use client';

import React, { useState } from 'react';

interface Member {
    id: number;
    nim: string;
    name: string;
    email: string;
    phone: string;
    angkatan: string;
    status: 'active' | 'inactive';
    joined_date: string;
}

export default function DataAnggotaPage() {
    const [members] = useState<Member[]>([
        {
            id: 1,
            nim: '10602061',
            name: 'Budi Santoso',
            email: 'budi@students.unsika.ac.id',
            phone: '081234567890',
            angkatan: '2024',
            status: 'active',
            joined_date: '2024-09-15'
        },
        {
            id: 2,
            nim: '10602062',
            name: 'Siti Nurhaliza',
            email: 'siti@students.unsika.ac.id',
            phone: '082345678901',
            angkatan: '2024',
            status: 'active',
            joined_date: '2024-09-20'
        },
        {
            id: 3,
            nim: '10602063',
            name: 'Ahmad Rizki',
            email: 'ahmad@students.unsika.ac.id',
            phone: '083456789012',
            angkatan: '2024',
            status: 'active',
            joined_date: '2024-10-01'
        },
        {
            id: 4,
            nim: '10602064',
            name: 'Dewi Lestari',
            email: 'dewi@students.unsika.ac.id',
            phone: '084567890123',
            angkatan: '2024',
            status: 'active',
            joined_date: '2024-10-05'
        },
        {
            id: 5,
            nim: '10602065',
            name: 'Rendra Pratama',
            email: 'rendra@students.unsika.ac.id',
            phone: '085678901234',
            angkatan: '2024',
            status: 'inactive',
            joined_date: '2024-09-25'
        },
        {
            id: 6,
            nim: '10602001',
            name: 'Nur Azizah',
            email: 'nur.azizah@students.unsika.ac.id',
            phone: '086789012345',
            angkatan: '2023',
            status: 'active',
            joined_date: '2023-09-10'
        },
        {
            id: 7,
            nim: '10602002',
            name: 'Hanif Irfan',
            email: 'hanif@students.unsika.ac.id',
            phone: '087890123456',
            angkatan: '2023',
            status: 'active',
            joined_date: '2023-09-12'
        },
        {
            id: 8,
            nim: '10602003',
            name: 'Tina Wijaya',
            email: 'tina@students.unsika.ac.id',
            phone: '088901234567',
            angkatan: '2023',
            status: 'active',
            joined_date: '2023-10-01'
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterAngkatan, setFilterAngkatan] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Filter members
    const filteredMembers = members.filter(member => {
        const matchesSearch = 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.nim.includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAngkatan = filterAngkatan === 'all' || member.angkatan === filterAngkatan;
        const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
        
        return matchesSearch && matchesAngkatan && matchesStatus;
    });

    const activeCount = members.filter(m => m.status === 'active').length;
    const inactiveCount = members.filter(m => m.status === 'inactive').length;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUniqueAngkatan = () => {
        return [...new Set(members.map(m => m.angkatan))].sort().reverse();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Data Anggota HIMATIKOM</h1>
                <p className="text-gray-500">Kelola data anggota himpunan (bukan pengurus)</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Anggota */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                            <h3 className="text-3xl font-bold text-blue-600 mt-2">{members.length}</h3>
                        </div>
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                            <i className="fas fa-users"></i>
                        </div>
                    </div>
                </div>

                {/* Anggota Aktif */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Anggota Aktif</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-2">{activeCount}</h3>
                        </div>
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
                            <i className="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>

                {/* Anggota Tidak Aktif */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                            <h3 className="text-3xl font-bold text-gray-600 mt-2">{inactiveCount}</h3>
                        </div>
                        <div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-xl">
                            <i className="fas fa-user-slash"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cari Anggota</label>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, NIM, atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Filter Angkatan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Angkatan</label>
                            <select
                                value={filterAngkatan}
                                onChange={(e) => setFilterAngkatan(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Semua Angkatan</option>
                                {getUniqueAngkatan().map(angkatan => (
                                    <option key={angkatan} value={angkatan}>
                                        Angkatan {angkatan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                        Menampilkan {filteredMembers.length} dari {members.length} anggota
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-700">No</th>
                                <th className="p-4 text-left font-semibold text-gray-700">NIM</th>
                                <th className="p-4 text-left font-semibold text-gray-700">Nama</th>
                                <th className="p-4 text-left font-semibold text-gray-700">Email</th>
                                <th className="p-4 text-left font-semibold text-gray-700">No. Telepon</th>
                                <th className="p-4 text-left font-semibold text-gray-700">Angkatan</th>
                                <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                                <th className="p-4 text-left font-semibold text-gray-700">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member, index) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-600">{index + 1}</td>
                                        <td className="p-4 font-mono text-gray-800 font-semibold">{member.nim}</td>
                                        <td className="p-4 font-medium text-gray-800">{member.name}</td>
                                        <td className="p-4 text-gray-600 text-xs">{member.email}</td>
                                        <td className="p-4 text-gray-600">{member.phone}</td>
                                        <td className="p-4 text-gray-600">{member.angkatan}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                member.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {member.status === 'active' ? '✓ Aktif' : '✗ Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">{formatDate(member.joined_date)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        <i className="fas fa-search mr-2"></i>Tidak ada anggota yang sesuai dengan filter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Catatan:</strong> Data menunjukkan anggota himpunan (bukan pengurus/panitia). Untuk mengelola pengurus, gunakan menu Manajemen Pengurus.
            </div>
        </div>
    );
}
