'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';
import { getAvatarUrl } from '@/lib/avatar';
import { User } from '@/types';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user: User;
  media?: Array<{
    id: number;
    filename: string;
    type: 'image' | 'video';
    url: string;
  }>;
}

export default function NgestuckPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Umum');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ file: File; preview: string; type: 'image' | 'video' }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch User
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

  // 2. Fetch Posts
  const fetchPosts = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/ngestuck'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(data.status) setPosts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 3. Submit Post
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !content) return;

    const token = localStorage.getItem('access_token');
    if(!token) return;

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        
        // Add media files
        mediaFiles.forEach((file) => {
            formData.append('media[]', file);
        });

        const res = await fetch(apiUrl('/api/ngestuck'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if(res.ok) {
            // Reset Form
            setTitle('');
            setContent('');
            setMediaFiles([]);
            setMediaPreviews([]);
            setShowModal(false);
            fetchPosts();
        } else {
            alert('Gagal memposting topik');
        }
    } catch (err) {
        alert('Terjadi kesalahan koneksi');
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newFiles = [...mediaFiles, ...files].slice(0, 5); // Max 5 files
    setMediaFiles(newFiles);

    // Create previews
    const previews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video'
    }));
    setMediaPreviews(previews);
  };

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    newPreviews.forEach(p => URL.revokeObjectURL(p.preview));
    setMediaPreviews(newPreviews);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Ngestuck</h1>
          <p className="text-xs text-gray-500 mt-0.5">Forum diskusi teknologi</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {/* Search & Actions */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          <button 
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1"
          >
            <i className="fas fa-plus text-xs"></i>
            <span className="hidden sm:inline">Topik</span>
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-sm text-gray-600">Belum ada diskusi</p>
          </div>
        ) : posts.filter(post => {
          const query = searchQuery.toLowerCase();
          return (
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query)
          );
        }).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <i className="fas fa-search text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-sm text-gray-600">Tidak ada hasil pencarian</p>
          </div>
        ) : (
          posts.filter(post => {
            const query = searchQuery.toLowerCase();
            return (
              post.title.toLowerCase().includes(query) ||
              post.content.toLowerCase().includes(query) ||
              post.category.toLowerCase().includes(query)
            );
          }).map((post) => (
            <Link href={`/dashboard/ngestuck/${post.id}`} key={post.id}>
              <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition cursor-pointer group">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                  {post.title}
                </h3>

                {/* Content Preview */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {post.content}
                </p>

                {/* Media Thumbnails */}
                {post.media && post.media.length > 0 && (
                  <div className="flex gap-1 mb-2 overflow-x-auto">
                    {post.media.slice(0, 4).map((media) => (
                      <div key={media.id} className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="media" className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                            <i className="fas fa-play text-xs"></i>
                          </div>
                        )}
                      </div>
                    ))}
                    {post.media.length > 4 && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                        +{post.media.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={getAvatarUrl(post.user.avatar, post.user.name)}
                      alt={post.user.name}
                      className="w-5 h-5 rounded-full"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random&size=96`;
                      }}
                    />
                    <span className="text-xs text-gray-600">{post.user.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-blue-600 transition">Balas →</span>
                </div>
              </div>
            </Link>
          ))
        )
      }
      </div>

      {/* MODAL BUAT TOPIK */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-sm">Topik Baru</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePost} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="Umum">Umum</option>
                  <option value="Coding">Coding</option>
                  <option value="Bug">Bug / Error</option>
                  <option value="UI/UX">UI/UX Design</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Judul</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul topik..."
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Jelaskan masalahmu..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Media (Opsional)</label>
                <input 
                  type="file" 
                  onChange={handleMediaChange}
                  multiple
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/avi,video/quicktime,video/webm"
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <p className="text-[10px] text-gray-500 mt-1">Max 5 file, 50MB</p>
              </div>

              {/* Media Preview */}
              {mediaPreviews.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preview ({mediaPreviews.length}/5)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {mediaPreviews.map((media, index) => (
                      <div key={index} className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden group">
                        {media.type === 'image' ? (
                          <img src={media.preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-play text-xs text-gray-400"></i>
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          <i className="fas fa-times text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
                >
                  Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}