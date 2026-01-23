'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';

interface FileItem {
  id: string | number;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  uploadedAt?: string;
  parentId: string | number | null;
  filePath?: string;
  itemCount?: number;
}

export default function ArsipSuratPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | number | null; name: string }[]>([
    { id: null, name: 'Arsip Surat' }
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents
  const fetchDocuments = async (folderId: string | number | null = null) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      const params = new URLSearchParams();
      if (folderId !== null) {
        params.append('parent_id', String(folderId));
      } else {
        params.append('parent_id', 'null');
      }

      const response = await fetch(apiUrl(`/api/documents?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil dokumen');
      const data = await response.json();

      if (data.status) {
        setItems(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentFolder);
  }, [currentFolder]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl('/api/documents'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          type: 'folder',
          parent_id: currentFolder || null,
        })
      });

      if (!response.ok) throw new Error('Gagal membuat folder');
      const data = await response.json();

      if (data.status) {
        setItems([...items, data.data]);
        setNewFolderName('');
        setShowNewFolderModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files) return;

    setIsUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const uploadPromises = Array.from(files).map(file => {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('parent_id', String(currentFolder));
        }

        return fetch(apiUrl('/api/documents'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });
      });

      const responses = await Promise.all(uploadPromises);
      const allSuccess = responses.every(r => r.ok);

      if (!allSuccess) throw new Error('Beberapa file gagal diunggah');

      const dataPromises = responses.map(r => r.json());
      const dataArray = await Promise.all(dataPromises);

      const newFiles = dataArray
        .filter(data => data.status)
        .map(data => data.data);

      setItems([...items, ...newFiles]);
      setIsUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload');
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) handleFileUpload(files);
  };

  const handleFolderClick = (folderId: string | number, folderName: string) => {
    setCurrentFolder(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number, folderId: string | number | null) => {
    setCurrentFolder(folderId);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleDeleteItem = async (id: string | number) => {
    if (!confirm('Yakin ingin menghapus?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl(`/api/documents/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal menghapus');
      const data = await response.json();

      if (data.status) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = (filePath: string, fileName: string) => {
    if (filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="px-4 md:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Arsip Surat</h1>
                <p className="text-sm text-slate-600 mt-1">Kelola dokumen dan folder organisasi</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                  title="Toggle view"
                >
                  <i className={`fas fa-${viewMode === 'grid' ? 'list' : 'th'}`}></i>
                </button>
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mt-4 text-sm overflow-x-auto pb-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => handleBreadcrumbClick(index, crumb.id)}
                    className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                      index === breadcrumbs.length - 1
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {crumb.name}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <i className="fas fa-chevron-right text-slate-400 text-xs"></i>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Cari file atau folder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-sm font-medium"
              >
                <i className="fas fa-folder-plus"></i>
                <span className="hidden sm:inline">Folder Baru</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
              >
                <i className={`fas fa-${isUploading ? 'spinner animate-spin' : 'upload'}`}></i>
                <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files as FileList)}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png,.zip"
              />
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mx-4 md:mx-8 mt-6 p-8 border-2 border-dashed rounded-lg transition ${
            dragOver
              ? 'bg-blue-50 border-blue-400'
              : 'bg-slate-50 border-slate-300'
          }`}
        >
          <div className="text-center">
            <i className={`fas fa-cloud-upload-alt text-4xl mb-3 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`}></i>
            <p className="text-slate-600 text-sm">
              Seret dan lepas file di sini atau klik tombol Upload
            </p>
            <p className="text-slate-500 text-xs mt-1">PDF, Word, Excel, PowerPoint, Gambar, ZIP</p>
          </div>
        </div>

        {/* File List/Grid */}
        <div className="px-4 md:px-8 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>{error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Memuat dokumen...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <i className="fas fa-inbox text-4xl text-slate-300 mb-3"></i>
              <p className="text-slate-500 text-sm">
                {searchTerm ? 'Tidak ada file yang cocok' : 'Folder ini kosong'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => item.type === 'folder' && handleFolderClick(item.id, item.name)}
                      className={`bg-white rounded-lg border border-slate-200 p-4 transition hover:shadow-md ${
                        item.type === 'folder' ? 'cursor-pointer' : 'cursor-default'
                      } hover:border-slate-300`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${
                          item.type === 'folder'
                            ? 'text-blue-500'
                            : 'text-slate-400'
                        }`}>
                          <i className={`fas fa-${
                            item.type === 'folder'
                              ? 'folder'
                              : 'file-pdf'
                          }`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate text-sm">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.type === 'folder'
                              ? `${item.itemCount || 0} items`
                              : formatFileSize(item.size || 0)}
                          </p>
                          {item.uploadedAt && (
                            <p className="text-xs text-slate-400 mt-1">{item.uploadedAt}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {item.type === 'file' && item.filePath && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(item.filePath!, item.name);
                            }}
                            className="flex-1 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <i className="fas fa-download mr-1"></i> Download
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="flex-1 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <i className="fas fa-trash mr-1"></i> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Tipe</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden md:table-cell">Ukuran</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden lg:table-cell">Tanggal</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                            index === filteredItems.length - 1 ? 'border-b-0' : ''
                          }`}
                        >
                          <td
                            className={item.type === 'folder' ? 'cursor-pointer' : ''}
                            onClick={() => item.type === 'folder' && handleFolderClick(item.id, item.name)}
                          >
                            <div className="px-4 py-3 flex items-center gap-3">
                              <i className={`fas fa-${
                                item.type === 'folder' ? 'folder text-blue-500' : 'file-pdf text-slate-400'
                              }`}></i>
                              <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">
                            {item.type === 'folder' ? 'Folder' : 'File'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                            {item.type === 'folder'
                              ? `${item.itemCount || 0} items`
                              : formatFileSize(item.size || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                            {item.uploadedAt || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              {item.type === 'file' && item.filePath && (
                                <button
                                  onClick={() => downloadFile(item.filePath!, item.name)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                                  title="Download"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                                title="Hapus"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Folder Baru</h2>
              </div>
              <div className="px-6 py-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Folder</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Masukkan nama folder..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                  }}
                />
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  Buat Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="px-4 md:px-8 py-4 border-t border-slate-200 bg-white text-xs text-slate-600">
          <p>{filteredItems.length} item ditampilkan</p>
        </div>
      </div>
    </>
  );
}
