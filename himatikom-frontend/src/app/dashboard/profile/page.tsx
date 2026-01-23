'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { apiUrl } from '@/lib/api';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form states
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Helper untuk resolve URL Avatar
    const getAvatarUrl = (avatar: string | null): string => {
        if (!avatar) return '';
        // Jika sudah URL lengkap
        if (avatar.startsWith('http')) return avatar;
        // Jika path dari storage (contoh: "/storage/avatars/filename.jpg")
        const filename = avatar.split('/').pop();
        if (!filename) return '';
        // Construct URL endpoint
        const baseUrl = apiUrl('/').replace(/\/$/, ''); // Hapus trailing slash
        return `${baseUrl}/storage/avatars/${filename}`;
    };

    // Fetch User
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(apiUrl('/api/auth/me'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data);
                    setBio(data.data.bio || '');
                    setEmail(data.data.email || '');
                    if (data.data.avatar) {
                        setPreviewUrl(getAvatarUrl(data.data.avatar));
                    }
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi Tipe
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'File harus berupa gambar (JPG, PNG, dll)' });
                return;
            }
            // Validasi Ukuran (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
                return;
            }

            setSelectedFile(file);
            setMessage(null); // Clear error

            // Create Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setMessage({ type: 'error', text: 'Sesi habis. Silakan login ulang.' });
                return;
            }

            const formData = new FormData();
            formData.append('bio', bio);
            formData.append('email', email);
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            const res = await fetch(apiUrl('/api/auth/profile-update'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.status) {
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
                setSelectedFile(null);
                setIsEditing(false);
                
                // Update local user state
                if (data.data) {
                    setUser(data.data);
                    if (data.data.avatar) {
                        setPreviewUrl(getAvatarUrl(data.data.avatar));
                    }
                }
            } else {
                const errorMsg = data.message || 'Gagal memperbarui profil';
                setMessage({ type: 'error', text: errorMsg });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form ke data awal user
        if (user) {
            setBio(user.bio || '');
            setEmail(user.email || '');
            setSelectedFile(null);
            setPreviewUrl(user.avatar ? getAvatarUrl(user.avatar) : '');
        }
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profil Saya</h1>
                    <p className="text-gray-500 text-sm md:text-base">Kelola identitas dan tampilan profil.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition flex items-center gap-2"
                    >
                        <i className="fas fa-pen text-xs"></i> Edit Profil
                    </button>
                )}
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl`}></i>
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Header Banner & Avatar */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 w-full relative">
                    <div className="absolute -bottom-12 left-6 md:left-12">
                        <div className="relative group">
                            {/* Avatar Image */}
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                                <img 
                                    src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=256&font-size=0.33`} 
                                    alt={user?.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=256`;
                                    }}
                                />
                            </div>
                            
                            {/* Edit Avatar Button Overlay */}
                            {isEditing && (
                                <label className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow-sm border-2 border-white">
                                    <i className="fas fa-camera text-xs"></i>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Header Action */}
                    {isEditing && (
                        <div className="absolute top-4 right-4">
                            <button 
                                onClick={handleCancelEdit}
                                className="bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm transition"
                            >
                                Batal
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Content */}
                <div className="pt-14 px-6 md:px-10 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Identity & Bio (Editable) */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 font-medium">{user?.position || user?.role}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {user?.nim}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-400 text-xs">Bergabung sejak {new Date(user?.created_at || '').getFullYear()}</span>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full bg-blue-50 border-blue-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                    disabled={submitting}
                                    />
                                </div>

                                {/* Bio Input */}
                                <div>
                                    <div className="flex justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Bio</label>
                                        <span className="text-xs text-gray-400">{bio.length}/500</span>
                                    </div>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 500))}
                                        placeholder="Tulis bio singkat tentang dirimu..."
                                        rows={4}
                                        maxLength={500}
                                        className="w-full bg-blue-50 border-blue-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                        disabled={submitting}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <><i className="fas fa-circle-notch fa-spin"></i> Simpan...</>
                                        ) : (
                                            <><i className="fas fa-save"></i> Simpan Perubahan</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                                        {email || <span className="text-gray-400 italic">Email belum diisi</span>}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                                    <div className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg text-sm border border-gray-100 min-h-[80px]">
                                        {bio || <span className="text-gray-400 italic">Belum ada bio...</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Stats & Actions */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                        
                        {/* Account Details */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Status Akun</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Role</span>
                                    <span className="text-xs font-bold text-blue-700 capitalize bg-blue-50 px-2 py-1 rounded">{user?.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Jabatan</span>
                                    <span className="text-xs font-medium text-gray-900 text-right capitalize">{user?.position || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">NIM</span>
                                    <span className="text-xs font-mono text-gray-700">{user?.nim}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                                <i className="fas fa-info-circle text-blue-600"></i> Tips Profil
                            </h3>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Foto profil yang jelas membantu temanmu mengenali Anda. Gunakan foto wajah yang terang.
                            </p>
                        </div>

                        {/* Logout Button */}
                        {!isEditing && (
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('access_token');
                                    router.push('/login');
                                }}
                                className="w-full bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 px-4 py-3 rounded-lg font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-sign-out-alt"></i> Keluar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}