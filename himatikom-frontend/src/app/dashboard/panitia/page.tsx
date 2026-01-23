'use client';

import React, { useState, useEffect } from 'react';
import { Agenda, Attendance } from '@/types';
import { apiUrl } from '@/lib/api';

// Type untuk Panitia (CommitteeApplication)
// PENTING: Panitia BUKAN pengurus!
// - Pengurus = user dengan role='pengurus' (struktur organisasi tetap)
// - Panitia = anggota (role='anggota') yang diterima di recruitment (status='accepted')
interface Committee {
  id: number;
  user_id: number;
  committee_position_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  motivation_letter: string;
  position: {
    id: number;
    name: string;
    quota: number;
    requirements: string;
    status: 'open' | 'closed';
    proker: {
      id: number;
      name: string;
      description: string;
      department: string;
      start_date: string;
      end_date: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// Helper function untuk mapping warna departemen
const getDepartmentColor = (dept: string): string => {
  const colorMap: Record<string, string> = {
    'PDO': 'bg-blue-100 text-blue-700',
    'Kominfo': 'bg-purple-100 text-purple-700',
    'PMB': 'bg-green-100 text-green-700',
    'Relasi': 'bg-yellow-100 text-yellow-700',
    'KWU': 'bg-red-100 text-red-700',
    'Ristek': 'bg-indigo-100 text-indigo-700',
    'BPH': 'bg-pink-100 text-pink-700',
  };
  return colorMap[dept] || 'bg-gray-100 text-gray-700';
};

export default function PanitiaPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'tugas' | 'laporan'>('info');
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  // Fetch Data (Committee & Agenda)
  const fetchData = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const [commRes, agnRes] = await Promise.all([
        fetch(apiUrl('/api/recruitment/my-committee'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(apiUrl('/api/agendas'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [commData, agnData] = await Promise.all([
        commRes.json(),
        agnRes.json()
      ]);

      if (commData.status && commData.data) setCommittees(commData.data);
      if (agnData.status && agnData.data) setAgendas(agnData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter tasks by proker name
  const getTasks = (prokerName: string) => {
    if (!selectedCommittee) return [];
    return agendas.filter(a => 
      a.title.toLowerCase().includes(prokerName.toLowerCase()) || 
      (a.description && a.description.toLowerCase().includes(prokerName.toLowerCase()))
    );
  };

  // Dummy upload handler
  const handleUpload = () => {
    alert("Fitur Upload Laporan belum ada (Sedang dikembangkan nanti).");
  };

  const activeCommittees = committees.filter(c => c.status === 'accepted');

  if (loading) return <div className="p-8 text-center">Memuat data panitia...</div>;

  if (activeCommittees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-user-tie text-2xl text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Bukan Panitia Aktif</h2>
        <p className="text-gray-500 text-center max-w-md">
          Anda belum terdaftar sebagai panitia aktif. Silakan lamar di menu "Lamar Panitia".
        </p>
      </div>
    );
  }

  if (activeCommittees.length > 0 && !selectedCommittee) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Panitia</h1>
          <p className="text-gray-500">Pilih jabatan di sebelah kiri untuk melihat tugas Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeCommittees.map((comm: Committee) => (
            <div 
              key={comm.id} 
              onClick={() => setSelectedCommittee(comm)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                (selectedCommittee as Committee | null)?.id === comm.id 
                  ? 'bg-blue-50 border-blue-500 shadow-md' 
                  : 'bg-white border-gray-200 hover:shadow-sm hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{comm.position.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getDepartmentColor(comm.position.proker.department)}`}>
                    {comm.position.proker.department}
                  </span>
                </div>
                {(selectedCommittee as Committee | null)?.id === comm.id && (
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <i className="fas fa-chevron-left text-sm"></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedCommittee) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-100 p-6">
          <h2 className="text-xl font-bold text-blue-900">{selectedCommittee.position.name}</h2>
          <div className="text-sm text-blue-700">Proker: {selectedCommittee.position.proker.name}</div>
          <p className="text-xs text-blue-600 mt-1">
            Departemen {selectedCommittee.position.proker.department}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button 
              onClick={() => setActiveTab('info')}
              className={activeTab === 'info' ? 'flex-1 py-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600' : 'flex-1 py-3 text-sm font-semibold text-gray-500 border-transparent'}
            >
              Info
            </button>
            <button 
              onClick={() => setActiveTab('tugas')}
              className={activeTab === 'tugas' ? 'flex-1 py-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600' : 'flex-1 py-3 text-sm font-semibold text-gray-500 border-transparent'}
            >
              Tugas
            </button>
            <button 
              onClick={() => setActiveTab('laporan')}
              className={activeTab === 'laporan' ? 'flex-1 py-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600' : 'flex-1 py-3 text-sm font-semibold text-gray-500 border-transparent'}
            >
              Laporan
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-900">Deskripsi Proker</h4>
                <p className="text-sm text-blue-800 mt-1">
                  {selectedCommittee.position.proker.description || 'Tidak ada deskripsi proker ini.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Departemen</p>
                  <p className="font-semibold text-gray-800">{selectedCommittee.position.proker.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Periode</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedCommittee.position.proker.start_date).toLocaleDateString('id-ID')} - 
                    {new Date(selectedCommittee.position.proker.end_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tugas' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">Agenda Terkait</h3>
              <div className="space-y-3">
                {getTasks(selectedCommittee.position.proker.name).length > 0 ? (
                  getTasks(selectedCommittee.position.proker.name).map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800 line-clamp-1">{task.title}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {new Date(task.start_time).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {task.description || 'Tidak ada deskripsi.'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Belum ada agenda yang cocok dengan nama proker: {selectedCommittee.position.proker.name}.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="flex flex-col items-center h-full">
              <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-upload text-2xl"></i>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800">Upload Laporan</h3>
                <p className="text-sm text-gray-500">
                  Silakan unggah bukti laporan kegiatan {selectedCommittee.position.proker.name}.
                </p>
                <button 
                  onClick={handleUpload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mt-4"
                >
                  Pilih File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}