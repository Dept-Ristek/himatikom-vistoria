'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function PoliteknikPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tentangDropdown, setTentangDropdown] = useState(false);
  const [himatikkomDropdown, setHimatikkomDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const jurusans = [
    {
      name: 'Teknik Informatika',
      icon: 'fa-laptop-code',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
    {
      name: 'Teknik Elektro',
      icon: 'fa-bolt',
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
    {
      name: 'Teknik Mesin',
      icon: 'fa-cog',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
    {
      name: 'Teknik Sipil',
      icon: 'fa-building',
      color: 'bg-gray-100',
      iconColor: 'text-gray-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
    {
      name: 'Akuntansi',
      icon: 'fa-calculator',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
    {
      name: 'Administrasi Bisnis',
      icon: 'fa-briefcase',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      programs: [
        'Program Diploma III (D3)',
        'Program Diploma IV (D4)',
      ]
    },
  ];

  return (
    <>
      {/* Import Font Inter & Animasi */}
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
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html { scroll-behavior: smooth; }
      `}</style>

      <div className="bg-white min-h-screen text-gray-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
        
        {/* Navigation - Konsisten dengan Landing Page */}
        <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-50 h-16 md:h-20 transition-all duration-300 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo Area */}
              <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="w-8 h-8 md:w-12 md:h-12 relative flex-shrink-0 bg-white rounded-full p-1">
                  <Image src="/images/himatikom.png" alt="HIMATIKOM Logo" fill className="object-contain" priority />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm md:text-[18px] font-bold text-gray-900 leading-none md:leading-tight tracking-tight">HIMATIKOM</p>
                  <p className="text-[10px] md:text-xs font-medium text-blue-600 tracking-wide mt-0.5">Kabinet Vistoria</p>
                </div>
              </Link>

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-blue-50/50 to-white -z-10 rounded-b-[2rem] md:rounded-b-[3rem]"></div>

          <div className="max-w-4xl mx-auto text-center fade-in-up">
            {/* Logo Polsub - Responsive Size */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 relative p-1 bg-white rounded-full shadow-sm">
                <Image
                  src="/images/polsub.png"
                  alt="Politeknik Negeri Subang"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Politeknik Negeri Subang
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-8 px-2">
              Institusi Pendidikan Tinggi Vokasi Terkemuka di Provinsi Jawa Barat
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto fade-in-up delay-100">
            <div className="bg-blue-50/50 rounded-xl p-6 md:p-8 border border-blue-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">Tentang Kami</h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                Politeknik Negeri Subang adalah institusi pendidikan tinggi vokasi yang berkomitmen untuk menghasilkan lulusan berkualitas tinggi dengan keahlian teknis yang kuat dan sikap profesional. Dengan fasilitas modern dan dosen berpengalaman, kami siap mempersiapkan mahasiswa untuk menghadapi tantangan dunia kerja.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Kami memiliki berbagai program studi di berbagai bidang industri, mulai dari Teknik Informatika, Teknik Elektro, Teknik Mesin, Teknik Sipil, Akuntansi, hingga Administrasi Bisnis, dengan program Diploma III dan Diploma IV.
              </p>
            </div>
          </div>
        </section>

        {/* Jurusan dan Program Studi */}
        <section className="py-16 md:py-24 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Jurusan & Program Studi</h2>
              <p className="text-sm md:text-lg text-gray-600 px-4">Pilihan program akademik berkualitas untuk masa depan Anda</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jurusans.map((jurusan, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 p-6 transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${jurusan.color} rounded-lg flex items-center justify-center mb-4`}>
                    <i className={`fas ${jurusan.icon} text-xl ${jurusan.iconColor}`}></i>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight">{jurusan.name}</h3>
                  <div className="space-y-2">
                    {jurusan.programs.map((program, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2">
                        <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0 text-xs"></i>
                        <span className="text-gray-600 text-sm md:text-base">{program}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Keunggulan Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-10 md:mb-12 text-center tracking-tight">Keunggulan Kami</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-blue-600 text-lg md:text-base"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Program Akreditasi Unggul</h3>
                  <p className="text-gray-600 text-sm md:text-base">Program studi yang tersertifikasi baik secara nasional maupun internasional.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-laptop text-blue-600 text-lg md:text-base"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Fasilitas Modern</h3>
                  <p className="text-gray-600 text-sm md:text-base">Laboratorium dan peralatan terkini untuk mendukung proses pembelajaran praktis.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-handshake text-blue-600 text-lg md:text-base"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Kerjasama Industri</h3>
                  <p className="text-gray-600 text-sm md:text-base">Partnerships dengan perusahaan terkemuka untuk praktik kerja dan rekrutmen.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chalkboard-teacher text-blue-600 text-lg md:text-base"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Dosen Praktisi</h3>
                  <p className="text-gray-600 text-sm md:text-base">Tim pengajar profesional dengan pengalaman industri yang luas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white pt-12 pb-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
               <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-8 relative">
                     <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-blue-600">
                        <i className="fas fa-university text-xs"></i>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Politeknik Negeri Subang</h3>
                </div>
              <p className="text-gray-400 mb-4 text-sm">Institusi Pendidikan Vokasi Berkualitas</p>
              <div className="border-t border-gray-800 pt-6">
                <p className="text-gray-500 text-xs">
                    &copy; 2026 Politeknik Negeri Subang. Semua hak dilindungi.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}