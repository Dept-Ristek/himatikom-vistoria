'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Community } from '@/types';
import { apiUrl } from '@/lib/api';
import Link from 'next/link';

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!communityId) return;

    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(apiUrl(`/api/communities/${communityId}`), {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Komunitas tidak ditemukan');
          } else {
            setError('Gagal memuat komunitas');
          }
          return;
        }

        const data = await response.json();
        setCommunity(data.data);
        setIsMember(data.data.is_member || false);
      } catch (err) {
        setError('Terjadi kesalahan saat memuat komunitas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const handleJoinCommunity = async () => {
    try {
      setIsJoining(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl(`/api/communities/${communityId}/join`), {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsMember(true);
        if (community) {
          setCommunity({
            ...community,
            member_count: (community.member_count || 0) + 1,
          });
        }
      }
    } catch (err) {
      console.error('Error joining community:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      setIsJoining(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl(`/api/communities/${communityId}/leave`), {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsMember(false);
        if (community) {
          setCommunity({
            ...community,
            member_count: Math.max(0, (community.member_count || 1) - 1),
          });
        }
      }
    } catch (err) {
      console.error('Error leaving community:', err);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button skeleton */}
          <div className="mb-6 h-10 bg-gray-200 rounded w-24 animate-pulse" />

          {/* Card skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/komunitas-member"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            ← Kembali
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">
              {error || 'Komunitas tidak ditemukan'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/komunitas-member"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
        >
          ← Kembali
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-32 sm:h-40" />

          {/* Content */}
          <div className="p-6 sm:p-8 -mt-16 relative z-10">
            {/* Community Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {community.name}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                    {community.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    👥 <strong>{community.member_count || 0}</strong> anggota
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3 sm:flex-col md:flex-row">
                {isMember ? (
                  <button
                    onClick={handleLeaveCommunity}
                    disabled={isJoining}
                    className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isJoining ? 'Memproses...' : 'Keluar'}
                  </button>
                ) : (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={isJoining}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isJoining ? 'Memproses...' : 'Bergabung'}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Tentang Komunitas
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {community.description}
                </p>
              </div>
            )}

            {/* Creator Info */}
            {community.user && (
              <div className="border-t pt-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Dibuat oleh
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {community.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {community.user.name}
                    </p>
                    {community.user.nim && (
                      <p className="text-sm text-gray-600">{community.user.nim}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Members List */}
            {community.members && community.members.length > 0 && (
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Anggota ({community.members.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {community.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mb-2">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="font-medium text-sm text-gray-900 text-center truncate w-full">
                        {member.name}
                      </p>
                      {member.nim && (
                        <p className="text-xs text-gray-600 text-center mt-1">
                          {member.nim}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
