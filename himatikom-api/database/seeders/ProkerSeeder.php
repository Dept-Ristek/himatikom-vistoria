<?php

namespace Database\Seeders;

use App\Models\Proker;
use Illuminate\Database\Seeder;

class ProkerSeeder extends Seeder
{
    public function run(): void
    {
        // DEPARTEMEN PENGEMBANGAN DISIPLIN ORGANISASI (PDO)
        Proker::create([
            'name' => 'MABIM',
            'description' => 'Membimbing Anggota Baru, Pendampingan, dan Teknis Kegiatan.',
            'department' => 'PDO',
            'start_date' => '2025-09-01',
            'end_date' => '2025-09-30',
        ]);

        Proker::create([
            'name' => 'LATKOM-TIK',
            'description' => 'Membimbing, Pengelolaan, dan Teknis Kegiatan.',
            'department' => 'PDO',
            'start_date' => '2025-09-01',
            'end_date' => '2025-09-30',
        ]);

        Proker::create([
            'name' => 'MUBES',
            'description' => 'Pembinaan, Pengelolaan, dan Teknis Kegiatan.',
            'department' => 'PDO',
            'start_date' => '2025-09-01',
            'end_date' => '2025-09-30',
        ]);

        // DEPARTEMEN PENGEMBANGAN MINAT DAN BAKAT (PMB)
        Proker::create([
            'name' => 'Digital Festival',
            'description' => 'Event besar nasional, membutuhkan panitia lengkap.',
            'department' => 'PMB',
            'start_date' => '2025-11-20',
            'end_date' => '2025-11-22',
        ]);

        Proker::create([
            'name' => 'Arthle-TIK x Dies Natalis',
            'description' => 'Perhelatan multi bidang, membutuhkan panitia lintas divisi.',
            'department' => 'PMB',
            'start_date' => '2025-12-20',
            'end_date' => '2025-12-22',
        ]);

        Proker::create([
            'name' => 'Iftar Bersama HIMATIKOM',
            'description' => 'Event tahunan, membutuhkan panitia penuh.',
            'department' => 'PMB',
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-01',
        ]);

        Proker::create([
            'name' => 'Latihan Dasar Kepemimpinan (LDK)',
            'description' => 'Pelatihan softskill untuk mahasiswa baru.',
            'department' => 'PMB',
            'start_date' => '2025-06-10',
            'end_date' => '2025-06-12',
        ]);

        // DEPARTEMEN RELASI
        Proker::create([
            'name' => 'Dies Natalis HIMATIKOM',
            'description' => 'Kegiatan besar tahunan, membutuhkan panitia penuh.',
            'department' => 'Relasi',
            'start_date' => '2025-12-01',
            'end_date' => '2025-12-20',
        ]);

        Proker::create([
            'name' => 'IFtar',
            'description' => 'Buka puasa bersama, membutuhkan panitia acara dan konsumsi.',
            'department' => 'Relasi',
            'start_date' => '2025-03-20',
            'end_date' => '2025-03-20',
        ]);

        // DEPARTEMEN KEWAIRAUSAHAAN (KWU)
        Proker::create([
            'name' => 'Workshop HIMATIKOM',
            'description' => 'Membutuhkan panitia acara, pemateri, dan teknis pelaksanaan.',
            'department' => 'KWU',
            'start_date' => '2025-05-15',
            'end_date' => '2025-05-15',
        ]);

        Proker::create([
            'name' => 'HIMATIKOM EXPO',
            'description' => 'Event pameran produk kerajinan mahasiswa.',
            'department' => 'KWU',
            'start_date' => '2025-06-15',
            'end_date' => '2025-06-17',
        ]);
    }
}