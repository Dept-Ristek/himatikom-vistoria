'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';
import { getAvatarUrl } from '@/lib/avatar';
import { User } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch current user
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(apiUrl('/api/auth/me'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) setCurrentUser(data.data);
    });
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(apiUrl(`/api/auth/users/${userId}`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status) {
          setUser(data.data);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">User tidak ditemukan</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link href="/dashboard/ngestuck" className="text-blue-600 hover:underline flex items-center gap-2">
          <i className="fas fa-arrow-left"></i>
          Kembali ke Ngestuck
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <img 
              src={getAvatarUrl(user.avatar, user.name)}
              alt={user.name}
              className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`;
              }}
            />

            {/* User Info */}
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 capitalize">{user.position || user.role}</p>
              <p className="text-gray-500 text-sm mt-1">NIM: {user.nim}</p>
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tentang</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-900 font-medium capitalize">{user.role}</p>
              </div>
              {user.position && (
                <div>
                  <p className="text-sm text-gray-500">Posisi</p>
                  <p className="text-gray-900 font-medium">{user.position}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Bergabung</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Status Verifikasi */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Email Terverifikasi:</span>
              <span className={`text-sm font-semibold ${user.email_verified_at ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.email_verified_at ? '✓ Ya' : '⏳ Belum'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
