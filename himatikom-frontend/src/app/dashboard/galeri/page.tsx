'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { apiUrl, getMediaUrl } from '@/lib/api';

interface GalleryMedia {
  id: number;
  gallery_id: number;
  media_url: string;
  media_path: string;
  media_type: 'image' | 'video';
  order: number;
  created_at: string;
  updated_at: string;
}

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string;
  media_type: 'image' | 'video';
  media_count: number;
  media: GalleryMedia[];
  order: number;
  featured: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface UploadFile {
  file: File;
  preview?: string;
}

export default function GaleriPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerGallery, setMediaViewerGallery] = useState<Gallery | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Create form
  const [createForm, setCreateForm] = useState({ title: '', description: '' });
  const [createFiles, setCreateFiles] = useState<UploadFile[]>([]);

  // Edit form
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editFiles, setEditFiles] = useState<UploadFile[]>([]);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ type: 'gallery' | 'media', id: number } | null>(null);

  // Fetch galleries
  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl('/api/gallery'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setGalleries(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch galleries');
      }
    } catch (err) {
      setError('Error fetching galleries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Handle file select for create
  const handleFileSelectCreate = (event: any) => {
    const files = event?.target?.files;
    if (!files) return;
    const validFiles: UploadFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if ((isImage || isVideo) && file.size <= 100 * 1024 * 1024) {
        const uploadFile: UploadFile = { file };
        
        // Generate preview
        if (isImage || isVideo) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadFile.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
        
        validFiles.push(uploadFile);
      } else if (file.size > 100 * 1024 * 1024) {
        setError(`${file.name} exceeds 100MB limit`);
      }
    }
    if (validFiles.length > 0) {
      setCreateFiles([...createFiles, ...validFiles]);
      setError(null);
    }
  };

  // Handle file select for edit
  const handleFileSelectEdit = (event: any) => {
    const files = event?.target?.files;
    if (!files) return;
    const validFiles: UploadFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if ((isImage || isVideo) && file.size <= 100 * 1024 * 1024) {
        const uploadFile: UploadFile = { file };
        
        // Generate preview
        if (isImage || isVideo) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadFile.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
        
        validFiles.push(uploadFile);
      } else if (file.size > 100 * 1024 * 1024) {
        setError(`${file.name} exceeds 100MB limit`);
      }
    }
    if (validFiles.length > 0) {
      setEditFiles([...editFiles, ...validFiles]);
      setError(null);
    }
  };

  // Remove file from create
  const removeCreateFile = (index: number) => {
    setCreateFiles(createFiles.filter((_, i) => i !== index));
  };

  // Remove file from edit
  const removeEditFile = (index: number) => {
    setEditFiles(editFiles.filter((_, i) => i !== index));
  };

  // Create gallery with media
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.title || createFiles.length === 0) {
      setError('Please enter title and select at least one media file');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', createForm.title);
      formData.append('description', createForm.description);
      createFiles.forEach((file) => {
        formData.append('media[]', file.file);
      });

      const res = await fetch(apiUrl('/api/gallery'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.status) {
        await fetchGalleries();
        setShowCreateModal(false);
        setCreateForm({ title: '', description: '' });
        setCreateFiles([]);
        setError(null);
        
        // Open media viewer for newly created gallery
        setMediaViewerGallery(data.data);
        setCurrentMediaIndex(0);
        setShowMediaViewer(true);
      } else {
        setError(data.message || 'Create failed');
      }
    } catch (err) {
      setError('Create error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update gallery
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGallery) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl(`/api/gallery/${selectedGallery.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description
        })
      });

      const data = await res.json();
      if (data.status) {
        if (editFiles.length > 0) {
          await addMediaToGallery(selectedGallery.id);
        }

        setShowEditModal(false);
        setSelectedGallery(null);
        setEditForm({ title: '', description: '' });
        setEditFiles([]);
        setError(null);
        await fetchGalleries();
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Update error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add media to gallery
  const addMediaToGallery = async (galleryId: number) => {
    if (editFiles.length === 0) return;

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      editFiles.forEach((file) => {
        formData.append('media[]', file.file);
      });

      const res = await fetch(apiUrl(`/api/gallery/${galleryId}/add-media`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.status) {
        await fetchGalleries();
        setEditFiles([]);
      }
    } catch (err) {
      console.error('Error adding media:', err);
    }
  };

  // Delete media
  const handleDeleteMedia = async (mediaId: number) => {
    console.log('Delete media clicked:', mediaId);
    setDeleteConfirmModal({ type: 'media', id: mediaId });
  };

  // Confirm delete media
  const confirmDeleteMedia = async () => {
    if (!deleteConfirmModal || deleteConfirmModal.type !== 'media') return;
    
    const mediaId = deleteConfirmModal.id;
    setDeleteConfirmModal(null);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const url = apiUrl(`/api/gallery-media/${mediaId}`);
      console.log('Delete media URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.status) {
        console.log('Delete media successful');
        setError(null);
        await fetchGalleries();
        if (selectedGallery) {
          const updated = galleries.find(g => g.id === selectedGallery.id);
          if (updated) setSelectedGallery(updated);
        }
        alert('Media berhasil dihapus!');
      } else {
        console.log('Delete media failed:', data.message);
        setError(data.message || 'Failed to delete media');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Error deleting media: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (gallery: Gallery) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl(`/api/gallery/${gallery.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: !gallery.featured })
      });

      const data = await res.json();
      if (data.status) {
        setGalleries(galleries.map(g => g.id === gallery.id ? data.data : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete gallery
  const handleDeleteGallery = async (id: number) => {
    console.log('Delete button clicked for gallery:', id);
    setDeleteConfirmModal({ type: 'gallery', id });
  };

  // Confirm delete gallery
  const confirmDeleteGallery = async () => {
    if (!deleteConfirmModal || deleteConfirmModal.type !== 'gallery') return;
    
    const id = deleteConfirmModal.id;
    setDeleteConfirmModal(null);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'exists' : 'missing');
      
      const url = apiUrl(`/api/gallery/${id}`);
      console.log('Delete URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.status) {
        console.log('Delete successful, filtering galleries');
        setGalleries(galleries.filter(g => g.id !== id));
        setError(null);
        alert('Gallery berhasil dihapus!');
      } else {
        console.log('Delete failed:', data.message);
        setError(data.message || 'Failed to delete gallery');
      }
    } catch (err) {
      console.error('Error deleting gallery:', err);
      setError('Error deleting gallery: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setEditForm({ title: gallery.title, description: gallery.description || '' });
    setEditFiles([]);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Galeri</h1>
              <p className="text-sm text-gray-500 mt-0.5">Kelola foto dan video</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3 block"></i>
              <p className="text-gray-600 text-sm">Memuat...</p>
            </div>
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-image text-5xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500 mb-6">Belum ada galeri</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Buat Galeri Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {galleries.map((gallery) => (
              <div 
                key={gallery.id} 
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition duration-300 group flex flex-col"
              >
                {/* Thumbnail - Clickable for media viewer */}
                <div 
                  className="relative overflow-hidden bg-gray-100 aspect-square cursor-pointer"
                  onClick={() => {
                    setMediaViewerGallery(gallery);
                    setCurrentMediaIndex(0);
                    setShowMediaViewer(true);
                  }}
                >
                  {gallery.media_type === 'video' ? (
                    <>
                      <video
                        src={getMediaUrl(gallery.thumbnail_url)}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                        <i className="fas fa-play text-white text-3xl"></i>
                      </div>
                    </>
                  ) : (
                    <img
                      src={getMediaUrl(gallery.thumbnail_url)}
                      alt={gallery.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/himatikom.png';
                      }}
                    />
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {gallery.featured && (
                      <div className="bg-amber-500 text-white p-1.5 rounded text-xs">
                        <i className="fas fa-star"></i>
                      </div>
                    )}
                    {gallery.media_count > 1 && (
                      <div className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                        {gallery.media_count} media
                      </div>
                    )}
                  </div>
                </div>
                {/* End Thumbnail */}

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{gallery.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{gallery.description || '-'}</p>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(gallery)}
                      style={{ pointerEvents: 'auto' }}
                      className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition hover:bg-amber-50 text-amber-600 active:scale-95"
                      title="Toggle Featured"
                    >
                      <i className="fas fa-star mr-1"></i><span className="hidden sm:inline">Featured</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(gallery)}
                      style={{ pointerEvents: 'auto' }}
                      className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition hover:bg-blue-50 text-blue-600 active:scale-95"
                      title="Edit gallery"
                    >
                      <i className="fas fa-edit mr-1"></i><span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(gallery.id)}
                      style={{ pointerEvents: 'auto' }}
                      className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition hover:bg-red-50 text-red-600 active:scale-95"
                      title="Delete gallery"
                    >
                      <i className="fas fa-trash mr-1"></i><span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowCreateModal(false);
            setCreateForm({ title: '', description: '' });
            setCreateFiles([]);
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Galeri Baru</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ title: '', description: '' });
                  setCreateFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Judul</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Masukkan judul"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Deskripsi (Opsional)</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Media</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                    const files = Array.from(e.dataTransfer.files).filter(
                      (file: any) => file.type.startsWith('image/') || file.type.startsWith('video/')
                    );
                    handleFileSelectCreate({ target: { files: files as any } } as any);
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                >
                  <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2 block"></i>
                  <p className="text-sm text-gray-700 mb-1">Drag & drop atau klik</p>
                  <label className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                    untuk upload
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelectCreate}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview */}
              {createFiles.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-700 mb-2">{createFiles.length} file terpilih</p>
                  <div className="grid grid-cols-3 gap-2">
                    {createFiles.map((fileObj, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full aspect-square rounded bg-gray-200 overflow-hidden">
                          {fileObj.file.type.startsWith('video/') ? (
                            <>
                              {fileObj.preview && <video src={fileObj.preview} className="w-full h-full object-cover" />}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <i className="fas fa-play text-white text-sm"></i>
                              </div>
                            </>
                          ) : (
                            fileObj.preview && <img src={fileObj.preview} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCreateFile(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ title: '', description: '' });
                    setCreateFiles([]);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || createFiles.length === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : ''}Buat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {showMediaViewer && mediaViewerGallery && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={() => {
            setShowMediaViewer(false);
            setMediaViewerGallery(null);
            setCurrentMediaIndex(0);
          }}
        >
          <div 
            className="flex flex-col h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Always visible and clickable */}
            <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 bg-black relative z-20">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base font-medium text-white truncate">{mediaViewerGallery.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Media {currentMediaIndex + 1} dari {mediaViewerGallery.media.length}</p>
              </div>
              <button
                onClick={() => {
                  setShowMediaViewer(false);
                  setMediaViewerGallery(null);
                  setCurrentMediaIndex(0);
                }}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-white transition p-1"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Media Display - Takes up space between header and footer */}
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black">
              {mediaViewerGallery.media[currentMediaIndex]?.media_type === 'video' ? (
                <video
                  key={mediaViewerGallery.media[currentMediaIndex]?.id}
                  src={getMediaUrl(mediaViewerGallery.media[currentMediaIndex]?.media_url)}
                  crossOrigin="anonymous"
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  key={mediaViewerGallery.media[currentMediaIndex]?.id}
                  src={getMediaUrl(mediaViewerGallery.media[currentMediaIndex]?.media_url)}
                  alt={`Media ${currentMediaIndex + 1}`}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Footer - Controls always visible and clickable */}
            <div className="flex-shrink-0 bg-black border-t border-gray-800 p-3 sm:p-4 relative z-20">
              {/* Description */}
              {mediaViewerGallery.description && (
                <p className="text-xs sm:text-sm text-gray-300 mb-3 line-clamp-2">{mediaViewerGallery.description}</p>
              )}
              
              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                  disabled={currentMediaIndex === 0}
                  className="flex-shrink-0 p-2 text-white bg-gray-800 hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-600"
                  title="Previous"
                >
                  <i className="fas fa-chevron-left text-sm"></i>
                </button>

                {/* Thumbnails Container */}
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-1.5 pb-1">
                    {mediaViewerGallery.media.map((media, idx) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentMediaIndex(idx)}
                        className={`flex-shrink-0 w-10 h-10 rounded border-2 overflow-hidden transition active:scale-95 ${
                          idx === currentMediaIndex
                            ? 'border-blue-500 ring-2 ring-blue-500'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        title={`Media ${idx + 1}`}
                      >
                        {media.media_type === 'video' ? (
                          <div className="relative w-full h-full bg-gray-700 flex items-center justify-center">
                            <video
                              src={getMediaUrl(media.media_url)}
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.style.display = 'none';
                              }}
                            />
                            <i className="fas fa-play text-white text-xs absolute"></i>
                          </div>
                        ) : (
                          <img
                            src={getMediaUrl(media.media_url)}
                            alt={`Thumbnail ${idx}`}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/himatikom.png';
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentMediaIndex(Math.min(mediaViewerGallery.media.length - 1, currentMediaIndex + 1))}
                  disabled={currentMediaIndex === mediaViewerGallery.media.length - 1}
                  className="flex-shrink-0 p-2 text-white bg-gray-800 hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-600"
                  title="Next"
                >
                  <i className="fas fa-chevron-right text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedGallery && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditModal(false);
            setSelectedGallery(null);
            setEditForm({ title: '', description: '' });
            setEditFiles([]);
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Gallery</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedGallery(null);
                  setEditForm({ title: '', description: '' });
                  setEditFiles([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Judul Gallery</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Masukkan judul gallery"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi gallery (opsional)"
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current Media List */}
              {selectedGallery.media.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Media yang Ada ({selectedGallery.media.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedGallery.media.map((media) => (
                      <div key={media.id} className="flex items-center justify-between bg-white p-2 sm:p-3 rounded border border-gray-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="text-sm sm:text-base">
                            {media.media_type === 'video' ? (
                              <i className="fas fa-video text-red-500"></i>
                            ) : (
                              <i className="fas fa-image text-blue-500"></i>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{media.media_path.split('/').pop()}</p>
                            <p className="text-xs text-gray-500">Media #{media.order + 1}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(media.id)}
                          style={{ pointerEvents: 'auto' }}
                          className="ml-2 text-red-600 hover:text-red-700 p-1 active:scale-95 transition"
                          title="Delete media"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add More Media Section */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tambah Media</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                    const files = Array.from(e.dataTransfer.files).filter(
                      (file: any) => file.type.startsWith('image/') || file.type.startsWith('video/')
                    );
                    handleFileSelectEdit({ target: { files: files as any } } as any);
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center transition cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex flex-col items-center">
                    <i className="fas fa-cloud-upload-alt text-3xl sm:text-4xl text-gray-400 mb-2 sm:mb-3"></i>
                    <p className="text-xs sm:text-sm text-gray-700 mb-1">Drag files here or</p>
                    <label className="text-xs sm:text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-semibold">
                      click to browse
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelectEdit}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max 100MB per file</p>
                  </div>
                </div>
              </div>

              {/* New Files List */}
              {editFiles.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">File Baru ({editFiles.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                    {editFiles.map((fileObj, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300">
                          {fileObj.file.type.startsWith('video/') ? (
                            <>
                              {fileObj.preview ? (
                                <video
                                  src={fileObj.preview}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                  <i className="fas fa-video text-2xl text-gray-500"></i>
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <i className="fas fa-play text-white text-lg"></i>
                              </div>
                            </>
                          ) : (
                            <>
                              {fileObj.preview ? (
                                <img
                                  src={fileObj.preview}
                                  alt={`Preview ${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                  <i className="fas fa-image text-2xl text-gray-500"></i>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEditFile(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Remove"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {editFiles.map((fileObj, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded text-xs border border-gray-200">
                        <span className="truncate flex-1">{fileObj.file.name}</span>
                        <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGallery(null);
                    setEditForm({ title: '', description: '' });
                    setEditFiles([]);
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
          onClick={() => setDeleteConfirmModal(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <i className="fas fa-exclamation text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {deleteConfirmModal.type === 'gallery' ? 'Hapus Gallery?' : 'Hapus Media?'}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {deleteConfirmModal.type === 'gallery' 
                  ? 'Apakah Anda yakin ingin menghapus gallery ini? Tindakan ini tidak dapat dibatalkan.'
                  : 'Apakah Anda yakin ingin menghapus media ini? Tindakan ini tidak dapat dibatalkan.'}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmModal.type === 'gallery') {
                      confirmDeleteGallery();
                    } else {
                      confirmDeleteMedia();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
