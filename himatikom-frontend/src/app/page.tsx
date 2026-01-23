'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import GallerySection from './components/GallerySection';

interface Agenda {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  created_at: string;
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  user: { name: string };
  created_at: string;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tentangDropdown, setTentangDropdown] = useState(false);
  const [himatikkomDropdown, setHimatikkomDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingAgendas, setLoadingAgendas] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setUserRole(role);
    
    // Fetch agendas and news
    fetchAgendas();
    fetchNews();
  }, []);

  const fetchAgendas = async () => {
    try {
      const res = await fetch(apiUrl('/api/agendas'), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        setLoadingAgendas(false);
        return;
      }
      const data = await res.json();
      if (data.status && data.data) {
        setAgendas(data.data.slice(0, 6)); // Limit to 6 items
      }
    } catch (err) {
      console.error('Error fetching agendas:', err);
    } finally {
      setLoadingAgendas(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(apiUrl('/api/news'), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        setLoadingNews(false);
        return;
      }
      const data = await res.json();
      if (data.status && data.data) {
        setNews(data.data.slice(0, 6)); // Limit to 6 items
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  return (
    <>
      {/* Import Font Inter untuk tampilan yang nyaman dan modern */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth Scroll */
        html { scroll-behavior: smooth; }
      `}</style>

      <div className="bg-white min-h-screen text-gray-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
        
        {/* Navigation */}
        <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-50 h-16 md:h-20 transition-all duration-300 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo Area - Mobile Friendly with Text */}
              <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                <div className="w-8 h-8 md:w-12 md:h-12 relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white rounded-full p-1">
                  <Image
                    src="/images/himatikom.png"
                    alt="HIMATIKOM Logo"
                    fill
                    sizes="(max-width: 768px) 32px, 48px"
                    className="object-contain"
                    priority
                  />
                </div>
                {/* Text now visible on mobile too */}
                <div className="flex flex-col justify-center">
                  <p className="text-sm md:text-[18px] font-bold text-gray-900 leading-none md:leading-tight tracking-tight">HIMATIKOM</p>
                  <p className="text-[10px] md:text-xs font-medium text-blue-600 tracking-wide mt-0.5">Kabinet Vistoria</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                {/* Dropdown Tentang */}
                <div className="relative group h-full flex items-center">
                  <button className="text-gray-600 group-hover:text-blue-600 transition-colors font-medium flex items-center gap-1 py-2 text-sm lg:text-base">
                    Tentang
                    <i className="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border border-gray-100">
                    <div className="py-1">
                      <Link href="/tentang/polsub" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang Polsub
                      </Link>
                      <Link href="/tentang/jurusan-ti" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang Jurusan TI
                      </Link>
                      <Link href="/tentang/himatikom" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Tentang HIMATIKOM
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Dropdown HIMATIKOM */}
                <div className="relative group h-full flex items-center">
                  <button className="text-gray-600 group-hover:text-blue-600 transition-colors font-medium flex items-center gap-1 py-2 text-sm lg:text-base">
                    HIMATIKOM
                    <i className="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border border-gray-100">
                    <div className="py-1">
                      <Link href="/toko/himatikom" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-store mr-3 w-4 text-center"></i> Toko HIMATIKOM
                      </Link>
                      <Link href="/dashboard/ngestuck" className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <i className="fas fa-comments mr-3 w-4 text-center"></i> Ngestuck
                      </Link>
                    </div>
                  </div>
                </div>

                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-tachometer-alt"></i>
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 focus:outline-none active:scale-95 transition-transform"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'} text-xl transition-all duration-300`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-fade-in-down">
              <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
                
                {/* Mobile Dropdown Tentang */}
                <div>
                  <button
                    onClick={() => setTentangDropdown(!tentangDropdown)}
                    className="w-full text-left px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition flex items-center justify-between font-medium text-sm"
                  >
                    Tentang
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${tentangDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${tentangDropdown ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 space-y-1 pt-1">
                      <Link href="/tentang/polsub" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang Politeknik Negeri Subang</Link>
                      <Link href="/tentang/jurusan-ti" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang Jurusan Teknik Informatika</Link>
                      <Link href="/tentang/himatikom" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600">Tentang HIMATIKOM</Link>
                    </div>
                  </div>
                </div>

                {/* Mobile Dropdown HIMATIKOM */}
                <div>
                  <button
                    onClick={() => setHimatikkomDropdown(!himatikkomDropdown)}
                    className="w-full text-left px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition flex items-center justify-between font-medium text-sm"
                  >
                    HIMATIKOM
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${himatikkomDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${himatikkomDropdown ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 space-y-1 pt-1">
                      <Link href="/toko/himatikom" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"><i className="fas fa-store mr-2"></i>Toko HIMATIKOM</Link>
                      <Link href="/dashboard/ngestuck" className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"><i className="fas fa-comments mr-2"></i>Ngestuck</Link>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-20 px-4 bg-white relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-blue-50/50 to-white -z-10 rounded-b-[2rem] md:rounded-b-[3rem]"></div>

          <div className="max-w-5xl mx-auto text-center">
            {/* 3 Logos */}
            <div className="flex justify-center items-center gap-4 md:gap-8 lg:gap-12 mb-8 md:mb-10 flex-wrap fade-in-up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 relative p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/images/polsub.png"
                  alt="Politeknik Negeri Subang"
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative p-1 bg-white rounded-full shadow-lg shadow-blue-100 hover:shadow-xl transition-shadow delay-100">
                <Image
                  src="/images/himatikom.png"
                  alt="HIMATIKOM"
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                  className="object-contain"
                />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 relative p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow delay-200">
                <Image
                  src="/images/kabinet-vistoria.png"
                  alt="Kabinet Vistoria"
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Judul dan Deskripsi */}
            <div className="space-y-3 md:space-y-4 fade-in-up delay-300 px-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Himpunan Mahasiswa <br className="hidden sm:block" />
                <span className="text-blue-600">Teknologi Informasi & Komputer</span>
              </h1>
              <p className="text-base md:text-xl font-semibold text-blue-600">Kabinet Vistoria</p>
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                Platform manajemen organisasi mahasiswa terintegrasi untuk mengelola agenda, galeri, berita, dan berbagai kegiatan inovatif lainnya.
              </p>
            </div>
          </div>
        </section>

        {/* Agenda Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Agenda Mendatang</h2>
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
                Jangan lewatkan jadwal kegiatan penting HIMATIKOM Vistoria.
              </p>
            </div>

            {loadingAgendas ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
                  <p className="text-gray-600 mt-3">Memuat agenda...</p>
                </div>
              </div>
            ) : agendas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <i className="fas fa-calendar-times text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600">Belum ada agenda yang dijadwalkan.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {agendas.map((agenda) => (
                  <div key={agenda.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 md:p-8">
                      {/* Date Badge */}
                      <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                        <i className="fas fa-calendar-alt mr-1.5"></i>
                        {new Date(agenda.date).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight line-clamp-2">
                        {agenda.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
                        {agenda.description}
                      </p>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <i className="fas fa-map-marker-alt mr-2 text-blue-600"></i>
                        <span className="line-clamp-1">{agenda.location}</span>
                      </div>
                      
                      {/* View Button */}
                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                      >
                        Lihat Detail <i className="fas fa-arrow-right text-xs"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {agendas.length > 0 && (
              <div className="text-center mt-12">
                <Link 
                  href="/dashboard"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold"
                >
                  Lihat Semua Agenda
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Galeri Foto & Video</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Dokumentasi kegiatan dan momen berharga HIMATIKOM</p>
            </div>
            <GallerySection limit={6} onlyFeatured={true} />
          </div>
        </section>

        {/* News Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Berita Terbaru</h2>
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
                Ikuti perkembangan terkini dan informasi penting dari HIMATIKOM.
              </p>
            </div>

            {loadingNews ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
                  <p className="text-gray-600 mt-3">Memuat berita...</p>
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <i className="fas fa-newspaper text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600">Belum ada berita yang dipublikasikan.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {news.map((article) => (
                  <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-blue-100 flex flex-col">
                    {/* Image */}
                    {article.image_url && (
                      <div className="relative h-40 md:h-48 bg-gray-200 overflow-hidden">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      {/* Category Badge */}
                      <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
                        {article.category}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight line-clamp-2">
                        {article.title}
                      </h3>
                      
                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3 flex-1">
                        {article.content.replace(/<[^>]*>/g, '')}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-gray-500 text-xs md:text-sm pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-2">
                          <i className="fas fa-user-circle"></i>
                          {article.user.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fas fa-calendar"></i>
                          {new Date(article.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      
                      {/* Read More */}
                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors mt-4"
                      >
                        Baca Selengkapnya <i className="fas fa-arrow-right text-xs"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {news.length > 0 && (
              <div className="text-center mt-12">
                <Link 
                  href="/dashboard"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold"
                >
                  Lihat Semua Berita
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white pt-12 pb-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <div className="w-10 h-10 relative">
                     {/* Placeholder Logo Footer */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-blue-600">
                        <i className="fas fa-code"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">HIMATIKOM</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Kabinet Vistoria</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-sm">
                  Politeknik Negeri Subang. Inovasi, Kreasi, dan Dedikasi Mahasiswa Teknologi Informasi.
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Ikuti Kami</h4>
                <div className="flex gap-3">
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <i className="fab fa-facebook-f text-sm md:text-base text-white"></i>
                  </a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-400 transition-colors">
                    <i className="fab fa-twitter text-sm md:text-base text-white"></i>
                  </a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <i className="fab fa-instagram text-sm md:text-base text-white"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6 text-center">
              <p className="text-gray-500 text-xs">
                &copy; 2026 HIMATIKOM Vistoria. Semua hak dilindungi.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}