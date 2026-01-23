<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowStorageCors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add CORS headers for all storage file requests
        if ($request->is('storage/*')) {
            // Always add CORS headers for storage requests, even on errors
            $response->header('Access-Control-Allow-Origin', '*');
            $response->header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
            $response->header('Access-Control-Max-Age', '86400');
            
            // Ensure proper cache headers
            if ($response->status() === 200) {
                $response->header('Cache-Control', 'public, max-age=3600');
            }
        }

        return $response;
    }
}
