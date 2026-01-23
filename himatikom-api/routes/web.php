<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// API login endpoint (for redirect handling)
Route::get('/login', function () {
    return response()->json([
        'message' => 'Unauthorized - Please login first'
    ], 401)->header('Content-Type', 'application/json');
})->name('login');