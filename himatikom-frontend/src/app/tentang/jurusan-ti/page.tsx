'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function JurusanTIPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tentangDropdown, setTentangDropdown] = useState(false);
  const [himatikkomDropdown, setHimatikkomDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const focusAreas = [
    {
      name: 'Software Engineering',
      description: 'Pengembangan aplikasi dan sistem perangkat lunak berkualitas tinggi',
      skills: ['Object-Oriented Programming', 'Web Development', 'Mobile Apps', 'Software Architecture']
    },
    {
      name: 'Database & Big Data',
      description: 'Manajemen dan analisis data besar untuk pengambilan keputusan strategis',
      skills: ['Database Design', 'SQL & NoSQL', 'Data Analytics', 'Business Intelligence']
    },
    {
      name: 'Cybersecurity',
      description: 'Keamanan informasi dan perlindungan sistem dari ancaman cyber',
      skills: ['Network Security', 'Encryption', 'Threat Analysis', 'Security Audit']
    },
    {
      name: 'Cloud Computing',
      description: 'Infrastruktur cloud dan layanan komputasi terdistribusi',
      skills: ['AWS & Azure', 'Cloud Architecture', 'DevOps', 'Containerization']
    },
    {
      name: 'Artificial Intelligence',
      description: 'Pengembangan sistem cerdas dan machine learning',
      skills: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision']
    },
    {
      name: 'Web & Mobile Development',
      description: 'Pembuatan aplikasi web dan mobile yang responsif dan user-friendly',
      skills: ['Frontend Development', 'Backend Development', 'REST API', 'Cross-Platform']
    },
  ];

  const careerPaths = [
    {
      title: 'Software Developer',
      companies: 'Tech Giants, Startup, Enterprise',
      salary: 'Rp 8-15 Juta'
    },
    {
      title: 'Systems Analyst',
      companies: 'Financial Services, Government',
      salary: 'Rp 8-12 Juta'
    },
    {
      title: 'Database Administrator',
      companies: 'Banking, Healthcare, E-commerce',
      salary: 'Rp 7-13 Juta'
    },
    {
      title: 'Security Officer',
      companies: 'Cybersecurity Firms, Enterprises',
      salary: 'Rp 9-16 Juta'
    },
    {
      title: 'Cloud Architect',
      companies: 'Cloud Providers, Tech Companies',
      salary: 'Rp 12-20 Juta'
    },
    {
      title: 'Data Scientist',
      companies: 'Finance, E-commerce, Tech',
      salary: 'Rp 10-18 Juta'
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
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
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-laptop-code text-5xl text-blue-600"></i>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Jurusan Teknologi Informasi dan Komputer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Mempersiapkan profesional teknologi informasi untuk era digital
          </p>
          <p className="text-lg text-blue-600 font-semibold">
            Program D3 & D4
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tentang Jurusan</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Jurusan Teknologi Informasi dan Komputer (JTIK) merupakan bagian dari Politeknik Negeri Subang yang berfokus pada pendidikan vokasi dalam bidang teknologi informasi. Kami berkomitmen untuk menghasilkan lulusan yang kompeten, terampil, dan siap bersaing di dunia kerja global.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dengan kurikulum yang disesuaikan dengan kebutuhan industri dan dosen berpengalaman, kami memastikan mahasiswa mendapatkan pengetahuan teoritis dan keterampilan praktis yang relevan.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Kami menawarkan dua program studi: Diploma III (3 tahun) untuk lulusan SMA/SMK, dan Diploma IV (4 tahun) untuk pengembangan karir yang lebih mendalam dan peluang untuk melanjutkan ke jenjang S2.
            </p>
          </div>
        </div>
      </section>

      {/* Program Studi */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Program Studi</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* D3 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-graduation-cap text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Diploma III (D3)</h3>
              <p className="text-gray-600 mb-6">Program 3 tahun untuk mengembangkan skill teknis dan profesional.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Durasi: 3 Tahun (6 Semester)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Syarat: Lulusan SMA/SMK</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Fokus: Praktik & Industri</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Karir: Programmer, Junior Developer</span>
                </li>
              </ul>
            </div>

            {/* D4 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-book text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Diploma IV (D4)</h3>
              <p className="text-gray-600 mb-6">Program 4 tahun dengan fokus pengembangan industri dan riset.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Durasi: 4 Tahun (8 Semester)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Syarat: Lulusan SMA/SMK (D3)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Fokus: Riset & Pengembangan</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700">Karir: Senior Developer, Analyst, S2</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Area Fokus Pembelajaran</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{area.name}</h3>
                <p className="text-gray-700 mb-4 text-sm">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Prospek Karir</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((path, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-briefcase text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{path.title}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <strong>Industri:</strong> {path.companies}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-semibold">{path.salary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Keunggulan Program</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-code text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Kurikulum Relevan Industri</h3>
                <p className="text-gray-600">Disesuaikan dengan kebutuhan pasar kerja dan tren teknologi terkini.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-flask text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Laboratorium Modern</h3>
                <p className="text-gray-600">Fasilitas lab dengan peralatan dan software terbaru untuk pembelajaran praktis.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Dosen Bersertifikat</h3>
                <p className="text-gray-600">Tim pengajar dengan kredensial internasional dan pengalaman industri luas.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-handshake text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Kerjasama Industri</h3>
                <p className="text-gray-600">Partnership dengan perusahaan tech ternama untuk magang dan rekrutmen.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-certificate text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sertifikasi Internasional</h3>
                <p className="text-gray-600">Program persiapan untuk sertifikasi cloud, cybersecurity, dan programming.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-global text-white text-lg"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Akreditasi & Pengakuan</h3>
                <p className="text-gray-600">Program terakreditasi dengan pengakuan nasional dan internasional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Tertarik Bergabung?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Daftar sekarang dan jadilah bagian dari komunitas teknologi profesional kami.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Masuk Ke Platform
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Jurusan Teknologi Informasi dan Komputer</h3>
            <p className="text-gray-400 mb-4">Politeknik Negeri Subang</p>
            <p className="text-gray-500">&copy; 2026 JTIK Politeknik Negeri Subang. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
