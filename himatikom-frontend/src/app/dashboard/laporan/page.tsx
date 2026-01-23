'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { User } from '@/types';

interface FinancialReport {
    id: number;
    type: 'in' | 'out';
    amount: number;
    description: string;
    transaction_date: string;
    created_at: string;
    user: User;
}

export default function LaporanKeuanganPage() {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [ currentDate ] = useState(new Date()); // Tanggal statis untuk konsistensi cetak

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(apiUrl('/api/transactions'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status && data.data) {
                setReports(data.data);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hitung total
    const totalIncome = reports
        .filter(r => r.type === 'in')
        .reduce((sum, r) => sum + r.amount, 0);
    
    const totalExpense = reports
        .filter(r => r.type === 'out')
        .reduce((sum, r) => sum + r.amount, 0);
    
    const balance = totalIncome - totalExpense;

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleExportExcel = () => {
        // CSV Logic
        const headers = ['No', 'Tanggal', 'Deskripsi', 'Kategori', 'Nominal', 'User'];
        const rows = reports.map((report, index) => [
            index + 1,
            formatDate(report.transaction_date),
            report.description,
            report.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
            report.amount,
            report.user?.name || '-'
        ]);

        rows.push(['', '', '', 'Total Pemasukan', totalIncome, '']);
        rows.push(['', '', '', 'Total Pengeluaran', totalExpense, '']);
        rows.push(['', '', '', 'Saldo Kas', balance, '']);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-6">
            
            {/* --- PRINT STYLES (Minimalist & Clean) --- */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape; /* Gunakan landscape agar tabel lebih lebar */
                        margin: 10mm 15mm 15mm 15mm; /* Margin tipis namun aman untuk printer */
                    }
                    body {
                        background: white;
                        font-family: 'Arial', sans-serif; /* Font standar printer */
                        color: #000;
                        -webkit-print-color-adjust: exact;
                    }

                    /* Sembunyikan elemen layar */
                    .no-print, .screen-only {
                        display: none !important;
                    }

                    /* Tampilkan elemen khusus print */
                    .print-only {
                        display: block !important;
                    }

                    /* Container utama print */
                    .print-container {
                        width: 100%;
                        max-width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    /* HEADER PRINT */
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }
                    .print-logos {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 5px;
                    }
                    .print-logos img {
                        height: 50px; /* Ukuran logo proporsional */
                        width: auto;
                        object-fit: contain;
                    }
                    .print-title {
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 0;
                        text-transform: uppercase;
                    }
                    .print-subtitle {
                        font-size: 10pt;
                        margin: 2px 0 0 0;
                        color: #444;
                    }

                    /* TABEL PRINT */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10pt;
                        margin-top: 10px;
                    }
                    th {
                        border: 1px solid #000;
                        background-color: #f2f2f2 !important; /* Light gray header */
                        padding: 6px 8px;
                        text-align: left;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    td {
                        border: 1px solid #000;
                        padding: 4px 8px;
                        vertical-align: middle;
                    }
                    
                    /* Alignment Kolom */
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }

                    /* Row styling */
                    tr:nth-child(even) {
                        background-color: #ffffff; /* Putih bersih, tanpa zebra striping untuk kesan formal */
                    }
                    
                    /* Styling Khusus Baris Total (Footer Table) */
                    .print-summary-row td {
                        background-color: #f9f9f9 !important;
                        font-weight: bold;
                        border-top: 2px solid #000;
                    }

                    /* FOOTER TANDA TANGAN */
                    .print-footer {
                        margin-top: 40px;
                        display: flex;
                        justify-content: flex-end;
                        page-break-inside: avoid;
                    }
                    .signature-block {
                        text-align: center;
                        width: 200px;
                    }
                    .signature-name {
                        margin-top: 50px; /* Jarak untuk tanda tangan */
                        font-weight: bold;
                        text-decoration: underline;
                    }
                }
                
                /* Screen Styles Override */
                @media screen {
                    .print-only { display: none; }
                }
            `}</style>

            {/* --- PRINT CONTENT START --- */}
            <div className="print-container">
                
                {/* Header (Print Only) */}
                <div className="print-header print-only">
                    <div className="print-logos">
                        {/* Pastikan path logo benar */}
                        <img src="/images/himatikom.png" alt="Logo HIMATIKOM" />
                        <img src="/images/kabinet-vistoria.png" alt="Logo Vistoria" />
                    </div>
                    <h1 className="print-title">Laporan Keuangan HIMATIKOM</h1>
                    <p className="print-subtitle">
                        Kabinet Vistoria - Periode {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="print-subtitle">
                        Dicetak pada: {currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Table Area */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                    
                    {/* Screen Toolbar */}
                    <div className="no-print p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                        <div>
                            <h2 className="font-bold text-gray-800">Riwayat Transaksi</h2>
                            <p className="text-xs text-gray-500">{reports.length} data ditemukan</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition shadow-sm">
                                <i className="fas fa-print mr-1"></i> Cetak
                            </button>
                            <button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition shadow-sm">
                                <i className="fas fa-file-excel mr-1"></i> Export
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards (Screen Only) */}
                    <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                        <div className="bg-green-50 p-3 rounded border border-green-100">
                            <p className="text-xs text-green-700 font-semibold uppercase">Pemasukan</p>
                            <h3 className="text-lg font-bold text-green-800">{formatRupiah(totalIncome)}</h3>
                        </div>
                        <div className="bg-red-50 p-3 rounded border border-red-100">
                            <p className="text-xs text-red-700 font-semibold uppercase">Pengeluaran</p>
                            <h3 className="text-lg font-bold text-red-800">{formatRupiah(totalExpense)}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <p className="text-xs text-blue-700 font-semibold uppercase">Saldo Kas</p>
                            <h3 className="text-lg font-bold text-blue-800">{formatRupiah(balance)}</h3>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-3 w-10 text-center no-print border-b">#</th>
                                    <th className="p-3 border-b">Tanggal</th>
                                    <th className="p-3 border-b">Deskripsi Transaksi</th>
                                    <th className="p-3 text-center border-b w-24">Tipe</th>
                                    <th className="p-3 text-right border-b w-32">Nominal</th>
                                    <th className="p-3 text-center border-b w-32 no-print">User</th>
                                </tr>
                            </thead>
                            
                            {/* Print Only Header (Kolom User di print disesuaikan jika perlu) */}
                            <thead className="print-only">
                                <tr>
                                    <th className="text-center" style={{width: '5%'}}>No</th>
                                    <th style={{width: '15%'}}>Tanggal</th>
                                    <th style={{width: '45%'}}>Uraian</th>
                                    <th className="text-center" style={{width: '10%'}}>Tipe</th>
                                    <th className="text-right" style={{width: '15%'}}>Nominal</th>
                                    <th className="text-center" style={{width: '10%'}}>User</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center">Memuat data...</td></tr>
                                ) : reports.length > 0 ? (
                                    reports.map((report, index) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 text-center text-gray-400 no-print">{index + 1}</td>
                                            <td className="p-3 whitespace-nowrap">{formatDate(report.transaction_date)}</td>
                                            <td className="p-3 font-medium text-gray-900">{report.description}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                    report.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {report.type === 'in' ? 'IN' : 'OUT'}
                                                </span>
                                            </td>
                                            <td className={`p-3 text-right font-mono font-medium ${
                                                report.type === 'in' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatRupiah(report.amount)}
                                            </td>
                                            <td className="p-3 text-center text-xs no-print">{report.user?.name || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Belum ada data transaksi.</td></tr>
                                )}
                                
                                {/* PRINT SUMMARY ROWS (Tampil di bagian bawah tabel saat print) */}
                                <tr className="print-only print-summary-row">
                                    <td colSpan={4} className="text-right pr-4">Total Pemasukan</td>
                                    <td className="text-right">{formatRupiah(totalIncome)}</td>
                                    <td></td>
                                </tr>
                                <tr className="print-only print-summary-row">
                                    <td colSpan={4} className="text-right pr-4">Total Pengeluaran</td>
                                    <td className="text-right text-red-700">{formatRupiah(totalExpense)}</td>
                                    <td></td>
                                </tr>
                                <tr className="print-only print-summary-row">
                                    <td colSpan={4} className="text-right pr-4 text-base">Saldo Akhir</td>
                                    <td className="text-right text-base text-blue-800">{formatRupiah(balance)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Signature (Print Only) */}
                    <div className="print-footer print-only">
                        <div className="signature-block">
                            <p>Mengetahui,</p>
                            <p>Bendahara HIMATIKOM</p>
                            <p className="signature-name">
                                Nama Bendahara
                            </p>
                        </div>
                    </div>
                    
                    {/* Screen Footer Info */}
                    <div className="no-print p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
                        Data bersifat rahasia dan hanya untuk keperluan internal organisasi.
                    </div>
                </div>
            </div>
        </div>
    );
}