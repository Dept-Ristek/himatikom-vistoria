<?php

namespace Database\Seeders;

use App\Models\CommitteePosition;
use App\Models\Proker;
use Illuminate\Database\Seeder;

class CommitteePositionSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua proker yang sudah di-seed
        $prokers = Proker::all();

        // Buat lowongan panitia untuk setiap proker
        foreach ($prokers as $proker) {
            // Setiap proker bisa punya 1-2 lowongan panitia
            CommitteePosition::create([
                'proker_id' => $proker->id,
                'name' => 'Panitia ' . $proker->name,
                'quota' => 3,
                'requirements' => 'Tanggung jawab, disiplin, dan siap bekerja keras',
                'status' => 'open',
            ]);

            // Untuk proker besar, tambah 1 lowongan lagi
            if (in_array($proker->name, ['Digital Festival', 'Dies Natalis HIMATIKOM', 'HIMATIKOM EXPO'])) {
                CommitteePosition::create([
                    'proker_id' => $proker->id,
                    'name' => 'Seksi Dokumentasi ' . $proker->name,
                    'quota' => 2,
                    'requirements' => 'Ahli fotografi/videografi, kreatif',
                    'status' => 'open',
                ]);
            }
        }
    }
}
