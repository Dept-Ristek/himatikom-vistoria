<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // STRUKTUR ARRAY: [NIM, Nama, Email, Detail Jabatan (Position), Level (Mapping)]
        // Saya memasukkan Detail Jabatan ke dalam kolom 'position'
        
        $users = [
            // PIMPINAN UTAMA
            ['10602060','Wibi Kholik','ketua@himatikom.com','Ketua Himpunan','ketua'],
            ['10111007','Ananda Marcella','wakil@himatikom.com','Wakil Ketua Himpunan','kepala'],

            // BADAN PENGURUS HARIAN (BPH)
            ['10111029','Layang Puspa Hanifah','sekretaris1@himatikom.com','Sekretaris','Sekretaris 1'],
            ['10112016','Aulia Putri Ramadhina','sekretaris2@himatikom.com','Sekretaris','Sekretaris 2'],
            ['10111011','Dealya Sulistia','bendahara1@himatikom.com','Bendahara','Bendahara 1'],
            ['10112015','Arlinda Dwi Ragindiani','bendahara2@himatikom.com','Bendahara','Bendahara 2'],

            // BIRO KOMINFO
            ['10602015','Fika Fauziyatul Aisyi','kominfo@himatikom.com','Kepala Biro Kominfo','kepala'],
            ['10602029','Marshall Cahyadiningrat',null,'Anggota Biro Kominfo Divisi Multimedia','anggota'],
            ['10111051','Nurul Fitriani',null,'Anggota Biro Kominfo Divisi Multimedia','anggota'],
            ['10603058','Septian Hidayatussya\'ban',null,'Anggota Biro Kominfo Divisi Jurnalistik','anggota'],
            ['10603056','Sahrul Ramdani',null,'Anggota Biro Kominfo Divisi Jurnalistik','anggota'],
            ['10603060','Shinta Dian Putri',null,'Anggota Biro Kominfo Divisi Jurnalistik','anggota'],

            // DEPARTEMEN PENGEMBANGAN DISIPLIN ORGANISASI (PDO)
            ['10602034','Muhammad Dhiyaul Haq Nur Azhar','pdo@himatikom.com','Kepala Departemen Pengembangan Disiplin Organisasi','kepala'],
            ['10112079','Vina Noviyanti',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],
            ['10603015','Deandra Abdul Aziz',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],
            ['10112041','M. Farel Fauza Aditya',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],
            ['10603003','Aep Hidayat Nurjaya',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],
            ['10602063','Zahra Arifiani',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],
            ['10112011','Ali',null,'Anggota Departemen Pengembangan Disiplin Organisasi','anggota'],

            // DEPARTEMEN PENGEMBANGAN MINAT DAN BAKAT (PMB)
            ['10111061','Maulida Wahyuni','pmb@himatikom.com','Kepala Departemen Pengembangan Minat dan Bakat','kepala'],
            ['10602037','Muhmmad Raihan',null,'Anggota Departemen Pengembangan Minat dan Bakat','anggota'],
            ['10111024','Iska Kamila',null,'Anggota Departemen Pengembangan Minat dan Bakat','anggota'],
            ['10603027','Ghisya Pratama',null,'Anggota Departemen Pengembangan Minat dan Bakat','anggota'],
            ['10603011','Bonnie Adam Jauza',null,'Anggota Departemen Pengembangan Minat dan Bakat','anggota'],
            ['10603050','Puji Novianti',null,'Anggota Departemen Pengembangan Minat dan Bakat','anggota'],

            // DEPARTEMEN RELASI
            ['10111023','Hadi Asrul Sani','relasi@himatikom.com','Kepala Departemen Relasi','kepala'],
            ['10602001','Adhwaa Rajib Aqilah',null,'Anggota Departemen Relasi','anggota'],
            ['10112031','Farid Nur Fahrudin',null,'Anggota Departemen Relasi','anggota'],
            ['10112049','Muhammad Nizar Zulhaqy',null,'Anggota Departemen Relasi','anggota'],
            ['10602043','R. Natasya Aura Rahman',null,'Anggota Departemen Relasi','anggota'],
            ['10603006','Amaliah Sa’adah',null,'Anggota Departemen Relasi','anggota'],
            ['10602023','Jihan Ayu Maha Rani','kwu@himatikom.com','Kepala Departemen Kewirausahaan','kepala'],
            ['10603048','Nuha Khairun Nisa',null,'Anggota Departemen Kewirausahaan','anggota'],
            ['10603043','M. Hilman Firsya Adiwiguna',null,'Anggota Departemen Kewirausahaan','anggota'],
            ['10111046','Nardine Nur Asyifa',null,'Anggota Departemen Kewirausahaan','anggota'],
            ['10112067','Regina Ayu Cahyanti',null,'Anggota Departemen Kewirausahaan','anggota'],
            ['10603044','Muhammad Naufal Albari',null,'Anggota Departemen Kewirausahaan','anggota'],

            // DEPARTEMEN RISET DAN TEKNOLOGI (RISTEK)
            ['10602035','Muhammad Hamzah Husni Hadromi','ristek@himatikom.com','Kepala Departemen Riset dan Teknologi','kepala'],
            ['10603061','Sultan Faid Amani',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10603037','M. Alif Hafiturohman',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10603013','Daffa Riyadhul Ijlal',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10112063','Raffi Saputra',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10603051','Raysal Gena Saputra Anom',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10603026','Farrel Prasetya Gumilar',null,'Anggota Departemen Riset dan Teknologi','anggota'],
            ['10603005','Ahmad Maulidun',null,'Anggota Departemen Riset dan Teknologi','anggota'],
        ];

        foreach ($users as $u) {
            User::create([
                'nim'      => $u[0],
                'name'     => $u[1],
                'email'    => $u[2], // Bisa null
                'password' => Hash::make($u[0]), // Password = NIM
                'role'     => 'pengurus', // Semua data di atas adalah Pengurus
                'position' => $u[3], // Mapping "Detail Jabatan"
                'avatar'   => null,
            ]);
        }

        // ========== ANGGOTA BIASA (role='anggota') ==========
        // Ini adalah data anggota yang akan melamar sebagai PANITIA
        $anggota = [
            ['10701001', 'Budi Santoso', 'budi@student.unhas.ac.id'],
            ['10701002', 'Siti Nurhaliza', 'siti@student.unhas.ac.id'],
            ['10701003', 'Ahmad Hidayat', 'ahmad@student.unhas.ac.id'],
            ['10701004', 'Dewi Lestari', 'dewi@student.unhas.ac.id'],
            ['10701005', 'Rudi Prasetyo', 'rudi@student.unhas.ac.id'],
            ['10701006', 'Rina Wijaya', 'rina@student.unhas.ac.id'],
            ['10701007', 'Bayu Irawan', 'bayu@student.unhas.ac.id'],
            ['10701008', 'Eka Putri', 'eka@student.unhas.ac.id'],
            ['10701009', 'Fajar Ramadan', 'fajar@student.unhas.ac.id'],
            ['10701010', 'Hana Kusuma', 'hana@student.unhas.ac.id'],
        ];

        foreach ($anggota as $a) {
            User::create([
                'nim'      => $a[0],
                'name'     => $a[1],
                'email'    => $a[2],
                'password' => Hash::make($a[0]), // Password = NIM
                'role'     => 'anggota', // INI ADALAH ANGGOTA (bukan pengurus)
                'position' => null,
                'avatar'   => null,
            ]);
        }
    }
}