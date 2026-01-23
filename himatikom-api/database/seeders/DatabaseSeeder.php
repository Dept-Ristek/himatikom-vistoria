<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Database\Seeders\ProkerSeeder;
use Database\Seeders\CommitteePositionSeeder;
use Database\Seeders\CommitteeApplicationSeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call([
            UserSeeder::class,
            ProkerSeeder::class,
            CommitteePositionSeeder::class,
            CommitteeApplicationSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
