'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import { useCart } from '@/context/CartContext'; // Pastikan CartContext ada
import { apiUrl } from '@/lib/api';

// Helper function to get avatar URL from user avatar
const getAvatarUrl = (avatar: string | null, userName: string): string => {
  if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
  if (avatar.startsWith('http')) return avatar;
  const filename = avatar.split('/').pop();
  if (!filename) return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
  return `${apiUrl('/api').replace(/\/$/, '')}/avatars/${filename}`;
};

// Helper function to render Font Awesome icons properly
const getIconClass = (icon: string): string => {
  const iconName = icon.startsWith('fa-') ? icon : `fa-${icon}`;
  return `fas ${iconName}`;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { totalItems } = useCart();
  const [isCommittee, setIsCommittee] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [expandedCommonMenu, setExpandedCommonMenu] = useState(true);
  const [expandedSpecificMenu, setExpandedSpecificMenu] = useState(true);

  // --- LOGIC: Cek Status Panitia ---
  const checkCommitteeStatus = async () => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    try {
      // TAMBAHKAN HEADER AUTHORIZATION (Bug fix umum)
      const res = await fetch(apiUrl('/api/recruitment/my-committee'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.status && data.data.length > 0) {
        const active = data.data.some((app: any) => app.status === 'accepted');
        setIsCommittee(active);
      } else {
        setIsCommittee(false);
      }
    } catch (err) {
      console.error('Error checking committee:', err);
    }
  };

  // Ambil data user & Cek status panitia
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

      const data = await res.json();

      if (data.status) {
        setUser(data.data);
        checkCommitteeStatus();
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  // --- LOGIC: MENU GENERATION ---
  const getMenuItems = () => {
    if (!user) return { common: [], specific: [] };

    type MenuItem = { name: string; href: string; icon: string; badge?: number };

    // MENU UMUM
    const common: MenuItem[] = [
      { name: 'Beranda', href: '/dashboard', icon: 'fa-home' },
      { name: 'Ngestuck', href: '/dashboard/ngestuck', icon: 'fa-comments' },
      { name: 'Hubungi Ristek', href: '/dashboard/support', icon: 'fa-headset' },
    ];

    let specificMenus: MenuItem[] = [];

    // PENGURUS
    if (user.role === 'pengurus') {
        specificMenus.push(
            { name: 'Scan QR', href: '/dashboard/scan', icon: 'fa-qrcode' },
            { name: 'Manajemen Agenda', href: '/dashboard/agenda', icon: 'fa-calendar-alt' },
            { name: 'Manajemen Berita', href: '/dashboard/berita', icon: 'fa-newspaper' }
        );

        if (user.position) {
          switch (user.position) {
            case 'Ketua Himpunan':
            case 'Wakil Ketua Himpunan':
              specificMenus.push(
                { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: 'fa-file-excel' },
                { name: 'Data Anggota', href: '/dashboard/users', icon: 'fa-users' },
              );
              break;
            case 'Sekretaris':
              specificMenus.push(
                { name: 'Arsip Surat', href: '/dashboard/arsip', icon: 'fa-folder-open' },
              );
              break;
            case 'Bendahara':
              specificMenus.push(
                { name: 'Input Kas', href: '/dashboard/keuangan', icon: 'fa-coins' },
                { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: 'fa-chart-line' },
              );
              break;
            case 'Biro Kominfo':
            case 'Kepala Biro Kominfo':
            case 'Anggota Biro Kominfo Divisi Multimedia':
            case 'Anggota Biro Kominfo Divisi Jurnalistik':
              specificMenus.push(
                { name: 'Galeri Foto', href: '/dashboard/galeri', icon: 'fa-images' },
              );
              break;
            case 'Departemen Pengembangan Disiplin Organisasi':
            case 'Kepala Departemen Pengembangan Disiplin Organisasi':
            case 'Anggota Departemen Pengembangan Disiplin Organisasi':
            case 'PDO':
            case 'Kepala PDO':
              specificMenus.push(
                { name: 'Rekrutmen', href: '/dashboard/rekrutmen', icon: 'fa-user-plus' },
              );
              break;
            case 'Departemen Pengembangan Minat dan Bakat':
            case 'Kepala Departemen Pengembangan Minat dan Bakat':
            case 'Anggota Departemen Pengembangan Minat dan Bakat':
              specificMenus.push(
                { name: 'Manajemen Komunitas', href: '/dashboard/komunitas', icon: 'fa-users' },
              );
              break;
            case 'Departemen Relasi':
            case 'Kepala Departemen Relasi':
            case 'Anggota Departemen Relasi':
              specificMenus.push(
                { name: 'Partnership', href: '/dashboard/partner', icon: 'fa-handshake' },
              );
              break;
            case 'Departemen Kewirausahaan (KWU)':
            case 'Kepala Departemen Kewirausahaan':
            case 'Anggota Departemen Kewirausahaan':
              specificMenus.push(
                { name: 'Manajemen Produk', href: '/dashboard/store/manage', icon: 'fa-box' },
              );
              break;
            case 'Departemen Riset dan Teknologi (Ristek)':
            case 'Kepala Departemen Riset dan Teknologi':
            case 'Anggota Departemen Riset dan Teknologi':
              specificMenus.push(
                { name: 'Ticket System', href: '/dashboard/tickets', icon: 'fa-ticket-alt' },
              );
              break;
          }
        }
    } else if (isCommittee) {
        specificMenus.push(
            { name: 'Dashboard Panitia', href: '/dashboard/panitia', icon: 'fa-tasks' }
        );
    } else {
        specificMenus.push(
            { name: 'Store', href: '/dashboard/store', icon: 'fa-shopping-bag' },
            {
              name: 'Keranjang',
              href: '/dashboard/store/cart',
              icon: 'fa-shopping-cart',
              badge: totalItems > 0 ? totalItems : undefined,
            },
            { name: 'Komunitas', href: '/dashboard/komunitas-member', icon: 'fa-users' },
            { name: 'Lamar Panitia', href: '/dashboard/lamaran', icon: 'fa-user-tag' },
            { name: 'Scan QR', href: '/dashboard/scan', icon: 'fa-qrcode' }
        );
    }

    return { common, specific: specificMenus };
  };

  const allMenus = getMenuItems();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
        
        /* Custom Scrollbar for Sidebar */
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
      `}</style>

      <div className="min-h-screen flex font-sans text-gray-800">
        
        {/* OVERLAY MOBILE */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* SIDEBAR */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex lg:flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Sidebar Header with Logo */}
          <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900 shadow-lg border-b border-slate-800">
            <Link href="/dashboard" className="flex flex-col items-center gap-3">
              <img 
                src="/images/himatikom.png" 
                alt="HIMATIKOM Logo" 
                className="w-16 h-16 object-contain"
              />
              <div className="text-center">
                <h2 className="text-lg font-bold tracking-wide text-white">HIMATIKOM</h2>
                <p className="text-xs text-slate-400">Himpunan Mahasiswa Teknologi Informasi dan Komputer</p>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-6 right-6 lg:hidden text-slate-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-6">
            
            {/* Profile Card - Clickable */}
            <Link 
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 border border-slate-700 shadow-sm hover:bg-slate-700 hover:border-slate-600 transition cursor-pointer"
            >
              <img 
                src={user ? getAvatarUrl(user.avatar, user.name) : 'https://ui-avatars.com/api/?name=User'}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=128`;
                }}
              />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.position || 'Member'}
                </p>
              </div>
              <i className="fas fa-arrow-right text-slate-500"></i>
            </Link>

            {/* Navigation Menu */}
            <nav className="space-y-4">
              {/* MENU UMUM Section */}
              {allMenus.common.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCommonMenu(!expandedCommonMenu)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 uppercase px-4 mb-2 hover:text-slate-300 transition"
                  >
                    <span>Menu Umum</span>
                    <i className={`fas fa-chevron-down text-[10px] transition-transform ${expandedCommonMenu ? 'rotate-180' : ''}`}></i>
                  </button>
                  {expandedCommonMenu && (
                    <div className="space-y-1">
                      {allMenus.common.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <i className={`${getIconClass(item.icon)} w-5 text-center ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}></i>
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-red-400">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MENU KHUSUS Section */}
              {allMenus.specific.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedSpecificMenu(!expandedSpecificMenu)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 uppercase px-4 mb-2 hover:text-slate-300 transition"
                  >
                    <span>Menu Khusus</span>
                    <i className={`fas fa-chevron-down text-[10px] transition-transform ${expandedSpecificMenu ? 'rotate-180' : ''}`}></i>
                  </button>
                  {expandedSpecificMenu && (
                    <div className="space-y-1">
                      {allMenus.specific.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <i className={`${getIconClass(item.icon)} w-5 text-center ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}></i>
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-red-400">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Landing Page Link */}
              <div className="pt-2 border-t border-slate-700">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                >
                  <i className="fas fa-globe w-5 text-center"></i>
                  <span>Kembali ke Landing Page</span>
                </Link>
              </div>
            </nav>
          </div>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
            >
              <i className="fas fa-sign-out-alt w-5 text-center"></i> Keluar
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Header Sticky */}
          <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <i className="fas fa-bars"></i>
            </button>
            
            {/* Logo/Title - Center on mobile, Left on desktop */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-sm md:text-base font-semibold text-slate-800">
                {allMenus.common.find(m => m.href === pathname)?.name || allMenus.specific.find(m => m.href === pathname)?.name || 'HIMATIKOM Dashboard'}
              </h2>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Notification Bell */}
              <button className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition">
                <i className="fas fa-bell"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar Dropdown - Desktop Only */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-3 border-l border-slate-200"
                >
                  <img 
                    src={user ? getAvatarUrl(user.avatar, user.name) : 'https://ui-avatars.com/api/?name=User'}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 hover:border-blue-400 transition"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=128`;
                    }}
                  />
                  <i className={`fas fa-chevron-down text-xs text-slate-600 transition ${showUserDropdown ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Akun</p>
                    </div>
                    <Link href="/dashboard/profile" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <i className="fas fa-user text-slate-500 w-4"></i> Profil
                    </Link>
                    <Link href="/" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <i className="fas fa-globe text-slate-500 w-4"></i> Landing Page
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt text-red-500 w-4"></i> Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}