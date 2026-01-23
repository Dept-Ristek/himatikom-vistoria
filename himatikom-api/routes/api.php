<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\NgestuckController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\RistekController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\CommitteeFormController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\PartnerController;
// routes/api.php


// Avatar file serving endpoint with CORS
Route::match(['GET', 'HEAD', 'OPTIONS'], '/avatars/{filename}', function ($filename) {
    // Handle preflight OPTIONS request
    if (request()->isMethod('OPTIONS')) {
        return response('', 204)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
            ->header('Access-Control-Max-Age', '86400');
    }
    
    $path = storage_path('app/public/avatars/' . $filename);
    
    if (!file_exists($path)) {
        return response()->json(['error' => 'Avatar not found'], 404)
            ->header('Access-Control-Allow-Origin', '*');
    }
    
    // Read file and return with CORS headers
    $fileContent = file_get_contents($path);
    $mimeType = mime_content_type($path) ?: 'application/octet-stream';
    
    return response($fileContent, 200)
        ->header('Content-Type', $mimeType)
        ->header('Content-Length', filesize($path))
        ->header('Cache-Control', 'public, max-age=86400')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
        ->header('Access-Control-Max-Age', '86400');
})->where('filename', '.*');

// News images file serving endpoint with CORS
Route::match(['GET', 'HEAD', 'OPTIONS'], '/news/image/{filename}', function ($filename) {
    // Handle preflight OPTIONS request
    if (request()->isMethod('OPTIONS')) {
        return response('', 204)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
            ->header('Access-Control-Max-Age', '86400');
    }
    
    $path = storage_path('app/public/news/' . $filename);
    
    if (!file_exists($path)) {
        return response()->json(['error' => 'News image not found'], 404)
            ->header('Access-Control-Allow-Origin', '*');
    }
    
    // Read file and return with CORS headers
    $fileContent = file_get_contents($path);
    $mimeType = mime_content_type($path) ?: 'application/octet-stream';
    
    return response($fileContent, 200)
        ->header('Content-Type', $mimeType)
        ->header('Content-Length', filesize($path))
        ->header('Cache-Control', 'public, max-age=86400')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
        ->header('Access-Control-Max-Age', '86400');
})->where('filename', '.*');

// Ngestuck media file serving endpoint with CORS
Route::match(['GET', 'HEAD', 'OPTIONS'], '/ngestuck/media/{mediaId}/{filename}', function ($mediaId, $filename) {
    // Handle preflight OPTIONS request
    if (request()->isMethod('OPTIONS')) {
        return response('', 204)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
            ->header('Access-Control-Max-Age', '86400');
    }
    
    $path = storage_path('app/public/ngestuck/' . $filename);
    
    if (!file_exists($path)) {
        return response()->json(['error' => 'Media not found'], 404)
            ->header('Access-Control-Allow-Origin', '*');
    }
    
    // Read file and return with CORS headers
    $fileContent = file_get_contents($path);
    $mimeType = mime_content_type($path) ?: 'application/octet-stream';
    
    return response($fileContent, 200)
        ->header('Content-Type', $mimeType)
        ->header('Content-Length', filesize($path))
        ->header('Cache-Control', 'public, max-age=86400')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
        ->header('Access-Control-Max-Age', '86400');
})->where('filename', '.*');

// Gallery media file serving endpoint with CORS
Route::match(['GET', 'HEAD', 'OPTIONS'], '/storage/gallery/{filename}', function ($filename) {
    // Handle preflight OPTIONS request
    if (request()->isMethod('OPTIONS')) {
        return response('', 204)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
            ->header('Access-Control-Max-Age', '86400');
    }
    
    $path = storage_path('app/public/gallery/' . $filename);
    
    if (!file_exists($path)) {
        return response()->json(['error' => 'Gallery media not found'], 404)
            ->header('Access-Control-Allow-Origin', '*');
    }
    
    // Read file and return with CORS headers
    $fileContent = file_get_contents($path);
    $mimeType = mime_content_type($path) ?: 'application/octet-stream';
    
    return response($fileContent, 200)
        ->header('Content-Type', $mimeType)
        ->header('Content-Length', filesize($path))
        ->header('Cache-Control', 'public, max-age=86400')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
        ->header('Access-Control-Max-Age', '86400');
})->where('filename', '.*');

Route::get('/status', function () {
    return response()->json([
        'status' => true,
        'message' => 'HIMATIKOM API is running smoothly',
        'version' => '1.0.0'
    ], 200);
});

// 2. Login (Publik)
Route::post('/auth/login', [AuthController::class, 'login']);

// 2.1 Get user profile by ID (untuk halaman profil publik)
Route::get('/auth/users/{id}', function ($id) {
    try {
        $user = App\Models\User::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $user
        ], 200);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => false,
            'message' => 'User not found'
        ], 404);
    }
});

// PUBLIC ROUTES - Produk (Store)
Route::get('/products', [StoreController::class, 'index']);

// PUBLIC ROUTES - Agenda & News (untuk landing page)
Route::get('/agendas', [AgendaController::class, 'index']);
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show']);

// PUBLIC ROUTES - Gallery (untuk landing page)
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/gallery/featured', [GalleryController::class, 'featured']);

// 3. Proteksi (Butuh Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/profile-update', [AuthController::class, 'profileUpdate']);
    Route::get('/auth/users', [AuthController::class, 'getAllUsers']);

    // ROUTE BARU: SCAN ABSENSI
    Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
    Route::post('/attendance/manual', [AttendanceController::class, 'manualInput']);
    Route::delete('/attendances/{id}', [AttendanceController::class, 'destroy']);

    // ROUTE NGESTUCK
    Route::prefix('ngestuck')->group(function () {
        Route::get('/', [NgestuckController::class, 'index']);
        Route::post('/', [NgestuckController::class, 'store']);
        Route::get('/my-posts', [NgestuckController::class, 'myPosts']);
        // ROUTE BARU: DETAIL & REPLY
        Route::get('/{id}', [NgestuckController::class, 'show']);
        Route::post('/{id}/reply', [NgestuckController::class, 'reply']);
        Route::put('/{id}', [NgestuckController::class, 'update']);
        Route::patch('/{id}', [NgestuckController::class, 'update']);
        Route::delete('/{id}', [NgestuckController::class, 'destroy']);
    });

    // ROUTE STORE
    Route::get('/store', [StoreController::class, 'index']);

    // ROUTE EXPORT AGENDA (Harus berada SEBELUM apiResource agar tidak konflik jika ada route dinamis lainnya)
    Route::get('/agendas/{id}/export', [AgendaController::class, 'export']);
    
    // ROUTE AGENDA RESOURCE - Create, Update, Delete (Protected)
    Route::post('/agendas', [AgendaController::class, 'store']);
    Route::put('/agendas/{id}', [AgendaController::class, 'update']);
    Route::patch('/agendas/{id}', [AgendaController::class, 'update']);
    Route::delete('/agendas/{id}', [AgendaController::class, 'destroy']);
    Route::get('/agendas/{id}', [AgendaController::class, 'show']);

    // ROUTE NEWS - Create, Update, Delete (Protected)
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::patch('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);

    // ROUTE STORE MANAGEMENT (Pengurus KWU) - Create, Update, Delete only
    Route::post('/products', [StoreController::class, 'store']);
    Route::post('/products/{id}', [StoreController::class, 'update']); // Allow POST for method spoofing
    Route::put('/products/{id}', [StoreController::class, 'update']);
    Route::patch('/products/{id}', [StoreController::class, 'update']);
    Route::delete('/products/{id}', [StoreController::class, 'destroy']);

    // ROUTE KEUANGAN (BENDAHARA)
    Route::apiResource('transactions', FinanceController::class);
    // ROUTE REKRUTMEN (PDO & ANGGOTA)
    Route::prefix('recruitment')->group(function () {
        // Semua user bisa melihat lowongan
        Route::get('/positions', [RecruitmentController::class, 'indexPositions']);

        // Anggota Melamar
        Route::post('/apply', [RecruitmentController::class, 'apply']);
        Route::get('/my-applications', [RecruitmentController::class, 'myApplications']);

        // PDO / Pengurus buat lowongan
        Route::post('/positions', [RecruitmentController::class, 'storePosition']);

        // PDO Seleksi (Ambil pelamar ID)
        Route::get('/positions/{positionId}/applicants', [RecruitmentController::class, 'applicantsByPosition']);
        Route::patch('/applications/{id}/select', [RecruitmentController::class, 'selectApplicant']);

        Route::get('/prokers', [RecruitmentController::class, 'indexProkers']);
        // Route baru ini:
        Route::get('/my-committee', [\App\Http\Controllers\Api\RecruitmentController::class, 'myCommittee']);
    });

    // --- ROUTE RISTEK (TIKET) ---
    // PENTING: Pastikan ini berada DI DALAM group auth:sanctum DAN sebelum apiResource
    Route::get('/tickets/my', [\App\Http\Controllers\Api\RistekController::class, 'myTickets']);

    // Route Resource standar (index, store, update, destroy, show)
    Route::apiResource('tickets', \App\Http\Controllers\Api\RistekController::class);

    // --- ROUTE DOCUMENTS (ARSIP SURAT) ---
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/breadcrumbs/path', [DocumentController::class, 'getBreadcrumbs']);

    // --- ROUTE GALLERY (BIRO KOMINFO) ---
    Route::apiResource('gallery', GalleryController::class);
    Route::post('/gallery/{gallery}/add-media', [GalleryController::class, 'addMedia']);
    Route::delete('/gallery-media/{media}', [GalleryController::class, 'deleteMedia']);

    // --- ROUTE COMMITTEE FORMS (PANITIA) ---
    Route::prefix('committee-forms')->group(function () {
        // Public: List forms & detail form
        Route::get('/', [CommitteeFormController::class, 'indexForms']);
        
        // Members: Register to form & Get my registrations
        Route::post('/register', [CommitteeFormController::class, 'registerForm']);
        Route::get('/my-registrations', [CommitteeFormController::class, 'myRegistrations']);
        
        // Admin: Get registrations, update status & delete registration
        Route::get('/{formId}/registrations', [CommitteeFormController::class, 'getRegistrations']);
        Route::patch('/registrations/{registrationId}/status', [CommitteeFormController::class, 'updateRegistrationStatus']);
        Route::delete('/registrations/{registrationId}', [CommitteeFormController::class, 'deleteRegistration']);
        
        Route::get('/{formId}', [CommitteeFormController::class, 'getForm']);

        // Admin only: Create, Update & Delete forms
        Route::post('/', [CommitteeFormController::class, 'createForm']);
        Route::put('/{formId}', [CommitteeFormController::class, 'updateForm']);
        Route::delete('/{formId}', [CommitteeFormController::class, 'deleteForm']);
    });

    // Communities CRUD
    Route::apiResource('communities', CommunityController::class);
    Route::post('communities/{communityId}/join', [CommunityController::class, 'join']);
    Route::post('communities/{communityId}/leave', [CommunityController::class, 'leave']);

    // Partners CRUD
    Route::apiResource('partners', PartnerController::class);
});
