'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// --- Types & Data ---

interface OrgPerson {
  name: string;
  role: string; // Role like "Ketua Himpunan"
}

interface OrgGroup {
  title?: string; // Judul Bagian (opsional, misal "Level 1")
  items: Array<{
    id: string;
    name: string;
    role: string;
    subRole?: string; // Sub-role atau kategori jabatan
    members?: string[]; // Untuk Biro/Dept
    colorTheme: string; // Warna tema Tailwind
  }>;
}

const orgData: OrgGroup[] = [
  // Level 1: Pimpinan
  {
    items: [
      { id: 'keta', name: 'Wibi Kholik', role: 'Ketua Himpunan', colorTheme: 'red' },
      { id: 'wakil', name: 'Ananda Marcella', role: 'Wakil Ketua', colorTheme: 'red' }
    ]
  },
  // Level 2: BPH
  {
    items: [
      { id: 'sec1', name: 'Layang Puspa', role: 'Sekretaris 1', colorTheme: 'purple' },
      { id: 'sec2', name: 'Aulia Putri', role: 'Sekretaris 2', colorTheme: 'purple' },
      { id: 'ben1', name: 'Dealya Sulistia', role: 'Bendahara 1', colorTheme: 'purple' },
      { id: 'ben2', name: 'Arlinda Dwi', role: 'Bendahara 2', colorTheme: 'purple' }
    ]
  },
  // Level 3: Biro Kominfo (Posisi Dibawah BPH, Diatas Dept)
  {
    items: [
      { 
        id: 'biro', 
        name: 'Fika Fauziyatul Aisyi', 
        role: 'Kepala Biro', 
        subRole: 'Biro Kominfo',
        members: ['Marshall Cahyadiningrat', 'Nurul Fitriani', 'Septian Hidayatussya\'ban', 'Sahrul Ramdani', 'Shinta Dian Putri'],
        colorTheme: 'blue' 
      }
    ]
  },
  // Level 4: Departemen (Posisi Paling Bawah)
  {
    items: [
      { 
        id: 'pdo', 
        name: 'Muhammad Dhiyaul', 
        role: 'Kadep PDO', 
        subRole: 'Dept. Disiplin Org.',
        members: ['Vina Noviyanti', 'Deandra Abdul Aziz', 'M. Farel Fauza', 'Aep Hidayat', 'Zahra Arifiani', 'Ali'],
        colorTheme: 'green' 
      },
      { 
        id: 'pmb', 
        name: 'Maulida Wahyuni', 
        role: 'Kadep PMB', 
        subRole: 'Dept. Minat & Bakat',
        members: ['Muhammad Raihan', 'Iska Kamila', 'Ghisya Pratama', 'Bonnie Adam', 'Puji Novianti'],
        colorTheme: 'yellow' 
      },
      { 
        id: 'relasi', 
        name: 'Hadi Asrul Sani', 
        role: 'Kadep Relasi', 
        subRole: 'Dept. Hubungan',
        members: ['Adhwaa Rajib', 'Farid Nur Fahrudin', 'M. Nizar Zulhaqy', 'Natasya Aura', 'Amaliah Sa\'adah'],
        colorTheme: 'indigo' 
      },
      { 
        id: 'kwu', 
        name: 'Jihan Ayu Maha', 
        role: 'Kadep KWU', 
        subRole: 'Dept. Kewirausahaan',
        members: ['Nuha Khairun', 'M. Hilman Firsya', 'Nardine Nur Asyifa', 'Regina Ayu', 'Muhammad Naufal'],
        colorTheme: 'orange' 
      },
      { 
        id: 'ristek', 
        name: 'Muhammad Hamzah', 
        role: 'Kadep Ristek', 
        subRole: 'Dept. Riset & Tekno',
        members: ['Sultan Faid', 'M. Alif Hafiturohman', 'Daffa Riyadhul', 'Raffi Saputra', 'Raysal Gena', 'Farrel Prasetya', 'Ahmad Maulidun'],
        colorTheme: 'pink' 
      }
    ]
  }
];

// --- Components ---

export default function HimatikkomPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tentangDropdown, setTentangDropdown] = useState(false);
  const [himatikkomDropdown, setHimatikkomDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  // Color Maps for dynamic styling
  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    red: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
    blue: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    green: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
    indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    pink: { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Custom Scrollbar for Member Lists */
        .member-list::-webkit-scrollbar {
          width: 4px;
        }
        .member-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .member-list::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>

      <div className="bg-white min-h-screen text-gray-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
        
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
        <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-blue-50/50 to-white -z-10 rounded-b-[2rem] md:rounded-b-[3rem]"></div>
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center items-center gap-6 md:gap-8 flex-wrap">
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                <Image src="/images/himatikom.png" alt="HIMATIKOM Logo" fill className="object-contain" />
              </div>
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                <Image src="/images/kabinet-vistoria.png" alt="Kabinet Vistoria Logo" fill className="object-contain" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">HIMATIKOM</h1>
            <p className="text-base md:text-lg text-gray-600 mb-1">Himpunan Mahasiswa Teknologi Informasi dan Komputer</p>
            <p className="text-lg md:text-xl font-semibold text-blue-600">Kabinet Vistoria 2026</p>
          </div>
        </section>

        {/* STRUKTUR ORGANISASI - 1 KOTAK VERTIKAL */}
        <section className="py-16 md:py-24 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Struktur Organisasi</h2>
              <p className="text-sm md:text-lg text-gray-500">Hierarki Kabinet Vistoria</p>
            </div>

            {/* CONTAINER "1 KOTAK" */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-xl p-6 md:p-12 flex flex-col items-center gap-4 md:gap-8">
              
              {/* Looping Data Level */}
              {orgData.map((group, groupIdx) => (
                <div key={groupIdx} className="w-full flex flex-col items-center relative z-10">
                  
                  {/* Row of Cards */}
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {group.items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`
                          relative bg-white rounded-xl border-t-4 p-4 md:p-5 shadow-sm hover:shadow-lg transition-all duration-300
                          ${item.members ? 'w-64 md:w-72' : 'w-40 md:w-48 text-center'}
                          ${colorMap[item.colorTheme].border}
                        `}
                      >
                        {/* Badge Header */}
                        <div className={`absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorMap[item.colorTheme].badge}`}>
                          {item.subRole || 'Jabatan'}
                        </div>

                        {/* Content */}
                        <div className="mt-2">
                          <h4 className={`font-bold text-gray-900 text-sm md:text-base mb-0.5 line-clamp-1 ${colorMap[item.colorTheme].text}`}>
                            {item.name}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">{item.role}</p>
                          
                          {/* Member List (Scrollable if exists) */}
                          {item.members && (
                            <div className={`mt-3 pt-3 border-t border-gray-100 ${colorMap[item.colorTheme].bg} rounded-lg p-2`}>
                              <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Anggota:</p>
                              <div className="h-20 overflow-y-auto member-list pr-1 space-y-0.5">
                                {item.members.map((member, mIdx) => (
                                  <p key={mIdx} className="text-xs text-gray-700 leading-tight">• {member}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connector Line (Vertical) - Tampil antar level kecuali level terakhir */}
                  {groupIdx < orgData.length - 1 && (
                    <div className="relative flex justify-center w-full py-2">
                      <div className="h-10 md:h-16 w-0.5 bg-gray-300"></div>
                      {/* Arrow Head */}
                      <div className="absolute bottom-2 md:bottom-4 w-2 h-2 bg-gray-300 rotate-45" style={{ transform: 'translateY(1px) rotate(45deg)' }}></div>
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* Tentang HIMATIKOM Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto space-y-16">
            
            {/* Header Info */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Tentang HIMATIKOM</h2>
              <p className="text-gray-600 text-sm md:text-base">Himpunan Mahasiswa Teknologi Informasi dan Komputer</p>
              <p className="text-gray-600 text-sm md:text-base">Politeknik Negeri Subang</p>
              <p className="text-blue-600 font-semibold">Kabinet Vistoria - Periode 2025/2026</p>
            </div>

            {/* Visi Section */}
            <div className="bg-blue-50/50 rounded-2xl p-6 md:p-8 border border-blue-200">
              <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-4">Visi</h3>
              <p className="text-gray-700 italic text-sm md:text-base leading-relaxed mb-4 font-semibold">
                "Mewujudkan Himpunan Teknologi Informasi dan Komputer POLSUB yang kokoh secara organisasi, responsif terhadap aspirasi, dan progresif dalam aksi, melalui semangat partisipasi, inovasi, dan kolaborasi untuk menciptakan peluang, pengalaman, dan dampak nyata bagi kemajuan bersama."
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Visi ini menegaskan bahwa HIMATIKOM diharapkan menjadi wadah pengembangan ide, kreativitas, serta inovasi mahasiswa tanpa batas. Selain itu, visi ini menekankan pentingnya konsistensi dalam proses pengkaderan agar tercipta pemimpin yang kompeten, unggul, dan mampu menghadapi tantangan zaman di bidang Teknologi Informasi dan Komputer.
              </p>
            </div>

            {/* Misi Section */}
            <div className="bg-purple-50/50 rounded-2xl p-6 md:p-8 border border-purple-200">
              <h3 className="text-xl md:text-2xl font-bold text-purple-900 mb-6">Misi (G.A.C.O.R)</h3>
              <div className="space-y-4">
                {[
                  { title: 'Gerak Sinergis', desc: 'Membangun budaya kekeluargaan yang solid dan kolaboratif sebagai pondasi kekuatan organisasi.' },
                  { title: 'Aspiratif dan Responsif', desc: 'Menghadirkan ruang komunikasi terbuka dan aktif dalam menampung aspirasi anggota.' },
                  { title: 'Ciptakan Inovasi', desc: 'Mengembangkan program kerja yang kreatif, kolaboratif, dan relevan.' },
                  { title: 'Optimalkan Potensi', desc: 'Mewadahi minat dan bakat anggota secara optimal.' },
                  { title: 'Raih Dampak Nyata', desc: 'Mendorong hasil program kerja yang terukur dan bermanfaat.' }
                ].map((misi, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base">{misi.title}</h4>
                      <p className="text-gray-600 text-xs md:text-sm">{misi.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Makna Kabinet & Nilai Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50/50 rounded-2xl p-6 md:p-8 border border-amber-200">
                <h3 className="text-lg md:text-xl font-bold text-amber-900 mb-4">Makna Kabinet Vistoria</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Kabinet Vistoria dimaknai sebagai kepengurusan yang memiliki pandangan jauh ke depan, bergerak progresif, penuh kemenangan, serta membawa kejayaan melalui inovasi dan kolaborasi. Vistoria merupakan gabungan <strong>Vision</strong> dan <strong>Historia</strong> yang melambangkan visi besar yang diwujudkan melalui kerja nyata hingga tercipta jejak pencapaian organisasi secara berkelanjutan.
                </p>
              </div>

              <div className="bg-green-50/50 rounded-2xl p-6 md:p-8 border border-green-200">
                <h3 className="text-lg md:text-xl font-bold text-green-900 mb-4">Nilai Kebudayaan HIMATIKOM</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  HIMATIKOM berasaskan kekeluargaan. Setiap masalah diselesaikan secara musyawarah. Mahasiswa baru tidak dipanggil MABA, melainkan "adik" atau nama personal. Anggota saling menyapa dengan sebutan <strong>Kakak</strong>, <strong>Aa</strong>, atau <strong>Teteh</strong> sesuai usia.
                </p>
              </div>
            </div>

            {/* BPH Section */}
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Badan Pengurus Harian (BPH)</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sekretaris */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 md:p-8 border border-purple-200">
                  <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-pen-fancy"></i> Sekretaris
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase mb-2">Tugas Pokok dan Fungsi</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Membantu ketua dan mengelola administrasi</li>
                        <li>Mengarsipkan dokumen</li>
                        <li>Membuat surat</li>
                        <li>Menerima laporan sekretaris departemen</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase mb-2">Kebijakan</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Membuat grup sekretaris proker</li>
                        <li>Upload dokumen ke Google Drive sesuai format</li>
                        <li>Melapor sebelum dan sesudah upload</li>
                        <li>Pengajuan surat maksimal H-3</li>
                        <li>Wajib koordinasi setiap pembuatan dokumen</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bendahara */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 md:p-8 border border-orange-200">
                  <h4 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-wallet"></i> Bendahara
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase mb-2">Tugas Pokok dan Fungsi</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Mengelola pemasukan dan pengeluaran</li>
                        <li>Mencatat transaksi</li>
                        <li>Menyusun laporan keuangan</li>
                        <li>Memfasilitasi pembiayaan proker</li>
                        <li>Merumuskan kebijakan keuangan</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase mb-2">Kebijakan</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Kas dibayarkan minggu kedua setiap bulan</li>
                        <li>Grup koordinasi bendahara kelas</li>
                        <li>Pencatatan dana proker</li>
                        <li>Penyetoran sisa dana H+10–H+14</li>
                        <li>Bendahara himpunan wajib masuk grup proker</li>
                        <li>Pengajuan dana tambahan H-5 ke ketua dan H-3 ke bendahara</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biro Kominfo Section */}
            <div className="space-y-6 bg-blue-50/50 rounded-2xl p-6 md:p-8 border border-blue-200">
              <h3 className="text-xl md:text-2xl font-bold text-blue-900">Biro Kominfo</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-images"></i> Divisi Multimedia
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                    <li>Mengelola media sosial</li>
                    <li>Konsistensi konten</li>
                    <li>Pengelolaan YouTube</li>
                    <li>Timeline posting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-newspaper"></i> Divisi Jurnalistik
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                    <li>Publikasi acara</li>
                    <li>Pengelolaan website</li>
                    <li>Arsip digital</li>
                    <li>Penyuntingan publikasi</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200">
                <h4 className="font-bold text-blue-700 mb-3">Program Kerja: Short Movie</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Pendokumentasian seluruh program kerja departemen dalam bentuk video berseri tiap 3 bulan untuk mengaktifkan YouTube dan TikTok HIMATIKOM.
                </p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-2">Kebijakan</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>SOP pengajuan konten maksimal H-3</li>
                    <li>Toleransi pelanggaran maksimal 3 kali</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Departemen Section */}
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Departemen</h3>

              {[
                {
                  name: 'Departemen Pengembangan Disiplin Organisasi (PDO)',
                  color: 'green',
                  tugas: ['Mengawasi kehadiran', 'Penegakan aturan', 'Rekrutmen panitia', 'Pengelolaan alat organisasi'],
                  programKerja: ['MABIM', 'LATKOM-TIK', 'MUBES'],
                  agenda: ['LANTANG (layanan aspirasi online)', 'SILA (diskusi berkala tiap 2 bulan)']
                },
                {
                  name: 'Departemen Pengembangan Minat dan Bakat (PMB)',
                  color: 'yellow',
                  tugas: ['Mewadahi minat dan bakat anggota', 'Mengembangkan potensi mahasiswa'],
                  programKerja: ['Digital Festival', 'ARTHELE-TIK X Dies Natalis'],
                  agenda: ['Batik in Campus', 'GEMASTIK', 'Info-Loker']
                },
                {
                  name: 'Departemen Relasi',
                  color: 'indigo',
                  tugas: ['Membangun hubungan eksternal', 'Menjalin kerjasama strategis'],
                  programKerja: ['Studi Banding', 'HIMATIKOM Go To School', 'Iftar', 'Dies Natalis'],
                  agenda: ['RAMAL', 'We Share We Care', 'DISMANJUR']
                },
                {
                  name: 'Departemen Kewirausahaan (KWU)',
                  color: 'orange',
                  tugas: ['Mengembangkan jiwa entrepreneur mahasiswa', 'Mengelola unit bisnis'],
                  programKerja: ['HIMATIKOM Cell', 'Danusan', 'HIMATIKOM Store', 'Made in HIMATIKOM', 'Workshop Kewirausahaan'],
                  agenda: []
                },
                {
                  name: 'Departemen Riset dan Teknologi (Ristek)',
                  color: 'pink',
                  tugas: ['Mengembangkan teknologi dan inovasi', 'Maintenance sistem'],
                  programKerja: ['HIMATIKOM Development', 'Ngestuck', 'Learn with HIMATIKOM'],
                  agenda: ['IT Club', 'Robotik'],
                  kebijakan: ['Pengajuan sistem minimal 2 bulan sebelum digunakan', 'Detail fitur wajib jelas', 'Persetujuan ketua dan wakil ketua']
                }
              ].map((dept, idx) => (
                <div key={idx} className={`bg-${dept.color}-50/50 rounded-2xl p-6 md:p-8 border border-${dept.color}-200`}>
                  <h4 className={`text-lg font-bold text-${dept.color}-900 mb-4`}>{dept.name}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className={`text-xs font-bold text-${dept.color}-700 uppercase mb-2`}>Tugas Pokok</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        {dept.tugas.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>

                    {dept.programKerja.length > 0 && (
                      <div>
                        <p className={`text-xs font-bold text-${dept.color}-700 uppercase mb-2`}>Program Kerja</p>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                          {dept.programKerja.map((pk, i) => <li key={i}>{pk}</li>)}
                        </ul>
                      </div>
                    )}

                    {dept.agenda.length > 0 && (
                      <div>
                        <p className={`text-xs font-bold text-${dept.color}-700 uppercase mb-2`}>Agenda</p>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                          {dept.agenda.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    )}

                    {dept.kebijakan && dept.kebijakan.length > 0 && (
                      <div>
                        <p className={`text-xs font-bold text-${dept.color}-700 uppercase mb-2`}>Kebijakan</p>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                          {dept.kebijakan.map((k, i) => <li key={i}>{k}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                       <i className="fas fa-users text-xs"></i>
                   </div>
                 </div>
                <h3 className="text-lg font-bold tracking-tight">HIMATIKOM Vistoria</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">Himpunan Mahasiswa Teknologi Informasi dan Komputer</p>
              <p className="text-gray-400 mb-4 text-sm">Politeknik Negeri Subang</p>
              <div className="border-t border-gray-800 pt-6">
                <p className="text-gray-500 text-xs">&copy; 2026 HIMATIKOM. Semua hak dilindungi.</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}