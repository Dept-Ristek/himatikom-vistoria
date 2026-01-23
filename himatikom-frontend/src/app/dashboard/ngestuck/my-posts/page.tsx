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
  replies?: any[];
  media?: Array<{
    id: number;
    filename: string;
    type: 'image' | 'video';
    url: string;
  }>;
}

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', category: 'Umum' });
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState<string[]>([]);
  const [deleteExistingMediaIds, setDeleteExistingMediaIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl('/api/ngestuck/my-posts'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) setPosts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setEditForm({
      title: post.title,
      content: post.content,
      category: post.category
    });
    setEditMediaFiles([]);
    setEditMediaPreviews([]);
    setDeleteExistingMediaIds([]);
  };

  const handleEditMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...editMediaFiles, ...files].slice(0, 5);
    setEditMediaFiles(newFiles);
    
    const previews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
    
    setTimeout(() => setEditMediaPreviews(previews), 100);
  };

  const handleRemoveEditMedia = (index: number) => {
    setEditMediaFiles(editMediaFiles.filter((_, i) => i !== index));
  };

  const handleDeleteExistingMedia = (mediaId: number) => {
    setDeleteExistingMediaIds([...deleteExistingMediaIds, mediaId]);
  };

  const handleRestoreExistingMedia = (mediaId: number) => {
    setDeleteExistingMediaIds(deleteExistingMediaIds.filter(id => id !== mediaId));
  };

  const handleSaveEdit = async (postId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      formData.append('category', editForm.category);
      
      editMediaFiles.forEach((file) => {
        formData.append('media[]', file);
      });

      deleteExistingMediaIds.forEach((mediaId) => {
        formData.append('delete_media[]', mediaId.toString());
      });

      const res = await fetch(apiUrl(`/api/ngestuck/${postId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setEditingId(null);
        fetchMyPosts();
      } else {
        const errorData = await res.json();
        console.error('Error:', errorData);
        alert(errorData.message || 'Gagal mengupdate postingan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleDelete = async (postId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(apiUrl(`/api/ngestuck/${postId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setDeleteConfirm(null);
        fetchMyPosts();
      } else {
        alert('Gagal menghapus postingan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Postingan Saya</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola forum Anda</p>
        </div>
        <Link href="/dashboard/ngestuck">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm transition">
            Kembali ke Forum
          </button>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <i className="fas fa-file-alt text-4xl text-gray-300 mb-3 block"></i>
            <h3 className="text-gray-700 font-semibold">Belum Ada Postingan</h3>
            <p className="text-gray-600 text-sm">Mulai buat topik pertama Anda</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {post.category}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded text-sm"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(post.id)}
                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded text-sm"
                    title="Hapus"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>

              {post.media && post.media.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {post.media.slice(0, 3).map((media) => (
                    <div key={media.id} className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="media" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">
                          <i className="fas fa-video"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                {new Date(post.created_at).toLocaleDateString('id-ID')} • {post.replies?.length || 0} balasan
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Hapus Postingan?</h3>
            <p className="text-sm text-gray-600 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Postingan</h2>
              <button
                onClick={() => setEditingId(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Kategori</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="Umum">Umum</option>
                  <option value="Coding">Coding</option>
                  <option value="Bug">Bug / Error</option>
                  <option value="UI/UX">UI/UX Design</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Judul</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Konten</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                  required
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Tambah Media Baru ({editMediaFiles.length}/5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleEditMediaSelect}
                    className="hidden"
                    id="edit-media-input"
                  />
                  <label htmlFor="edit-media-input" className="cursor-pointer block">
                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2 block"></i>
                    <p className="text-sm text-gray-600">
                      Klik untuk upload atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 50MB per file (JPG, PNG, MP4, WebM, dll)
                    </p>
                  </label>
                </div>
              </div>

              {/* Media Preview */}
              {(editMediaPreviews.length > 0 || posts.find(p => p.id === editingId)?.media?.length) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                    Media Preview
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Existing media */}
                    {posts.find(p => p.id === editingId)?.media?.map((media) => {
                      const isDeleted = deleteExistingMediaIds.includes(media.id);
                      return (
                        <div key={media.id} className="relative group">
                          <div className={isDeleted ? 'opacity-40' : ''}>
                            {media.type === 'image' ? (
                              <img src={media.url} alt="media" className="w-full h-24 object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i className="fas fa-video text-2xl text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition flex items-center justify-center">
                            {isDeleted ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreExistingMedia(media.id)}
                                className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition"
                                title="Restore"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingMedia(media.id)}
                                className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                title="Hapus"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* New media */}
                    {editMediaPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img src={preview} alt="preview" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditMedia(index)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          title="Hapus"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingId)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
