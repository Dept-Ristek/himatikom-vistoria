<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        //API routes
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // KONFIGURASI CSRF (LARAVEL 11)
        // Kecualikan semua rute API dari pengecekan CSRF
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'http://localhost:8000/api/*',
            'storage/*',
        ]);

        // Add CORS middleware for storage files
        $middleware->append(\App\Http\Middleware\AllowStorageCors::class);

        // Sanctum config
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API errors instead of HTML
        $exceptions->shouldRenderJsonWhen(function ($request) {
            // Always return JSON for API routes
            if ($request->is('api/*')) {
                return true;
            }
            // Also check Accept header for JSON
            if ($request->expectsJson()) {
                return true;
            }
            return false;
        });

        // Custom rendering for authentication exceptions
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                    'error' => 'Invalid or missing authentication token'
                ], 401);
            }
            return null;
        });

        // Custom rendering for validation exceptions
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $e->errors()
                ], 422);
            }
            return null;
        });

        // Catch all other exceptions for API routes
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                Log::error('API Exception: ' . class_basename($e), [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'status' => false,
                    'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                    'error' => class_basename($e)
                ], 500);
            }
            return null;
        });
    })->create();
