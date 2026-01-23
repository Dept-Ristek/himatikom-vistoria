<?php

namespace Database\Seeders;

use App\Models\CommitteeApplication;
use App\Models\CommitteePosition;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommitteeApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua anggota (role='anggota')
        $anggota = User::where('role', 'anggota')->get();

        // Ambil semua lowongan panitia
        $positions = CommitteePosition::all();

        // Data mapping: anggota ke posisi panitia yang diterima
        // Format: [anggota_index, position_index, status, motivation_letter]
        $applications = [
            // Budi Santoso melamar dan diterima sebagai Panitia MABIM
            [0, 0, 'accepted', 'Saya ingin berkontribusi dalam MABIM untuk membimbing anggota baru.'],
            
            // Siti Nurhaliza melamar dan diterima sebagai Panitia Digital Festival
            [1, 3, 'accepted', 'Saya tertarik dengan event Digital Festival, ingin menjadi panitia.'],
            
            // Ahmad Hidayat melamar dan diterima sebagai Seksi Dokumentasi Digital Festival
            [2, 4, 'accepted', 'Saya ahli fotografi dan ingin mendokumentasikan Digital Festival.'],
            
            // Dewi Lestari melamar dan diterima sebagai Panitia LATKOM-TIK
            [3, 1, 'accepted', 'Saya ingin meningkatkan skill di LATKOM-TIK sebagai panitia.'],
            
            // Rudi Prasetyo melamar dan diterima sebagai Panitia Arthle-TIK x Dies Natalis
            [4, 5, 'accepted', 'Saya bersemangat menjadi panitia Arthle-TIK x Dies Natalis.'],
            
            // Rina Wijaya melamar dan diterima sebagai Seksi Dokumentasi Dies Natalis
            [5, 8, 'accepted', 'Saya ingin mendokumentasikan Dies Natalis HIMATIKOM.'],
            
            // Bayu Irawan melamar dan diterima sebagai Panitia Dies Natalis HIMATIKOM
            [6, 7, 'accepted', 'Saya ingin berkontribusi besar dalam Dies Natalis HIMATIKOM.'],
            
            // Eka Putri melamar dan diterima sebagai Panitia Workshop HIMATIKOM
            [7, 9, 'accepted', 'Saya tertarik menjadi panitia Workshop HIMATIKOM.'],
            
            // Fajar Ramadan melamar dan diterima sebagai Panitia HIMATIKOM EXPO
            [8, 11, 'accepted', 'Saya ingin menjadi panitia HIMATIKOM EXPO untuk promosi produk.'],
            
            // Hana Kusuma melamar dan diterima sebagai Seksi Dokumentasi HIMATIKOM EXPO
            [9, 12, 'accepted', 'Saya ingin mendokumentasikan HIMATIKOM EXPO dengan kreatif.'],
        ];

        foreach ($applications as $app) {
            $anggotaIndex = $app[0];
            $positionIndex = $app[1];
            $status = $app[2];
            $motivation = $app[3];

            // Get user by index
            $user = $anggota->skip($anggotaIndex)->first();
            
            // Get position by index
            $position = $positions->skip($positionIndex)->first();

            if ($user && $position) {
                CommitteeApplication::create([
                    'user_id' => $user->id,
                    'committee_position_id' => $position->id,
                    'status' => $status,
                    'motivation_letter' => $motivation,
                ]);
            }
        }
    }
}
