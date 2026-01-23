'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, Reply, User } from '@/types';
import { apiUrl } from '@/lib/api';
import { getAvatarUrl } from '@/lib/avatar';

interface PostMedia {
  id: number;
  filename: string;
  type: 'image' | 'video';
  url: string;
}

interface PostWithMedia extends Post {
  media?: PostMedia[];
}

// 1. Definisikan tipe params yang benar
interface PageProps {
  params: Promise<{ id: string }>;
}

// 2. Jangan lupa export function dengan nama yang spesifik
export default function PostDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [post, setPost] = useState<PostWithMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<PostMedia | null>(null);

  // 3. Unwrap params menggunakan hook 'use' dari React
  const { id } = use(params);

  // Ambil data user
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        fetch(apiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if(data.status) setCurrentUser(data.data);
        });
    }
  }, []);

  // Fetch Detail Post
  const fetchPost = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl(`/api/ngestuck/${id}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setPost(data.data);
      } else {
        router.push('/dashboard/ngestuck');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Fungsi Kirim Reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const token = localStorage.getItem('access_token');
    if(!token) {
        alert('Sesi habis, silakan login ulang.');
        return;
    }

    try {
        const res = await fetch(apiUrl(`/api/ngestuck/${id}/reply`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ content: replyContent }),
        });

        const data = await res.json();

        if (data.status) {
            setReplyContent('');
            fetchPost(); // Refresh untuk melihat balasan baru
        } else {
            alert('Gagal membalas: ' + (data.message || 'Terjadi kesalahan'));
        }
    } catch (err) {
        alert('Terjadi kesalahan koneksi.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam yang lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
        </div>
    );
  }

  if (!post) {
    return <div className="p-8 text-center text-gray-500">Diskusi tidak ditemukan atau telah dihapus.</div>;
  }

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Header Navigation */}
      <button 
        onClick={() => router.back()} 
        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition"
      >
        <i className="fas fa-arrow-left"></i> Kembali
      </button>

      {/* POST CARD */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {post.category}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 py-3 border-y border-gray-200">
          <img 
            src={getAvatarUrl(post.user.avatar, post.user.name)}
            alt={post.user.name}
            className="w-10 h-10 rounded-full border border-gray-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random&size=128`;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{post.user.name}</p>
            <p className="text-xs text-gray-500">{post.user.role === 'pengurus' ? 'Pengurus' : 'Anggota'}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {post.content}
        </p>

        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-2">
            {post.media.map((media) => (
              <div 
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className="bg-gray-100 rounded overflow-hidden cursor-pointer h-32 md:h-40 group"
              >
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt="post media" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 group-hover:bg-gray-300 transition">
                    <i className="fas fa-play text-white text-2xl"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white text-2xl"
            >
              ✕
            </button>
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.url} alt="fullscreen" className="w-full h-auto rounded-lg" />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      {/* REPLIES SECTION */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          {post.replies?.length || 0} Balasan
        </h2>

        <div className="space-y-3 mb-4">
          {post.replies && post.replies.length > 0 ? (
            post.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={getAvatarUrl(reply.user.avatar, reply.user.name)}
                    alt={reply.user.name}
                    className="w-7 h-7 rounded-full border border-gray-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.name)}&background=random&size=96`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {reply.user.name}
                      {post.user.id === reply.user.id && (
                        <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Penulis</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8 text-sm">Belum ada balasan</p>
          )}
        </div>
      </div>

      {/* REPLY FORM (Sticky) */}
      <div className="fixed bottom-0 left-0 w-full md:static bg-white border-t border-gray-200 md:border-t md:border-gray-200 p-4 md:rounded-lg md:border z-40">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleReply} className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasanmu..."
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-16 md:h-20 transition"
              required
            ></textarea>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 rounded-lg font-medium text-sm md:text-base transition self-end"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}