<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter; // Tambahkan ini
use Illuminate\Cache\RateLimiting\Limit;    // Tambahkan ini
use Illuminate\Http\Request;  

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // TAMBAHKAN KODE DI BAWAH INI
        // Ini mendefinisikan "throttle:api" yang kita pakai di bootstrap/app.php
        // Batasi 60 request per menit per User/IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        // SELESAI KODE TAMBAHAN
    }
}
