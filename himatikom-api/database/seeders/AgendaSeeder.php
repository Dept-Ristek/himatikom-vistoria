<?php

namespace Database\Seeders;

use App\Models\Agenda;
use Illuminate\Database\Seeder;

class AgendaSeeder extends Seeder
{
    public function run(): void
    {
        Agenda::create([
            'title' => 'Rapat Evaluasi BPH',
            'description' => 'Rapat evaluasi kinerja bulanan.',
            'qr_code' => 'TEST-12345', // Ini kode yang akan kita scan nanti
            'start_time' => now()->subHour(),
            'end_time' => now()->addHours(2),
        ]);
    }
}