'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';

interface Community {
  id: number;
  name: string;
  description: string;
  icon?: string;
  members_count?: number;
  is_member?: boolean;
}

export default function KomunitasMemberPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCommunities, setMyCommunities] = useState<number[]>([]);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Fetch komunitas
  useEffect(() => {
    const fetchCommunities = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(apiUrl('/api/communities'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status && Array.isArray(data.data)) {
          setCommunities(data.data);
          // Ambil komunitas yang user sudah join
          const joined = data.data
            .filter((c: Community) => c.is_member)
            .map((c: Community) => c.id);
          setMyCommunities(joined);
        }
      } catch (err) {
        console.error('Error fetching communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [router]);

  const handleJoinCommunity = async (communityId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setJoiningId(communityId);

    try {
      const res = await fetch(apiUrl(`/api/communities/${communityId}/join`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.status) {
        // Update state
        setMyCommunities([...myCommunities, communityId]);
        setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, is_member: true } : c
        ));
      } else {
        alert(data.message || 'Gagal bergabung dengan komunitas');
      }
    } catch (err) {
      console.error('Error joining community:', err);
      alert('Terjadi kesalahan saat bergabung');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Jelajahi Komunitas</h1>
        <p className="text-blue-100 text-lg">Bergabunglah dengan komunitas dan terhubung dengan anggota lainnya</p>
      </div>

      {/* Komunitas yang sudah diikuti */}
      {myCommunities.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Komunitas Saya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities
              .filter(c => myCommunities.includes(c.id))
              .map((community) => (
                <div 
                  key={community.id} 
                  className="bg-white rounded-xl border-2 border-blue-500 p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/dashboard/komunitas-member/${community.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                      <i className={`fas ${community.icon || 'fa-users'}`}></i>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Bergabung
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {community.description || 'Komunitas HIMATIKOM'}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <i className="fas fa-users"></i>
                    <span>{community.members_count || 0} Anggota</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Semua Komunitas */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {myCommunities.length > 0 ? 'Komunitas Lainnya' : 'Semua Komunitas'}
        </h2>

        {communities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Komunitas</h3>
            <p className="text-gray-500">Tunggu pengurus membuat komunitas baru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities
              .filter(c => !myCommunities.includes(c.id))
              .map((community) => (
                <div 
                  key={community.id} 
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xl">
                      <i className={`fas ${community.icon || 'fa-users'}`}></i>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {community.description || 'Komunitas HIMATIKOM'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <i className="fas fa-users"></i>
                      <span>{community.members_count || 0} Anggota</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    disabled={joiningId === community.id}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      joiningId === community.id
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                    }`}
                  >
                    {joiningId === community.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin text-sm"></i>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus text-sm"></i>
                        <span>Bergabung</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
