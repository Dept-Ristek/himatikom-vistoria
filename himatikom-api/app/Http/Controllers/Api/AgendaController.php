<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AgendaController extends Controller
{
    /**
     * Ambil semua agenda
     */
    public function index()
    {
        // Ambil agenda terbaru di atas, dengan user yang membuat agenda
        $agendas = Agenda::with('user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $agendas
        ], 200);
    }

    /**
     * Buat agenda baru & Generate QR Code String
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date_format:Y-m-d\TH:i',
            'end_time' => 'required|date_format:Y-m-d\TH:i|after:start_time',
            'type' => 'nullable|in:pengurus,semua',
        ]);

        // GENERATE UNIQUE STRING UNTUK QR
        // Format: AGENDA-{RANDOM 8 KARAKTER}
        // Contoh: AGENDA-X8Y9Z1A2
        $qrCodeString = 'AGENDA-' . Str::random(8);

        // Cek keunikan (opsional, tapi bagus untuk keamanan)
        while (Agenda::where('qr_code', $qrCodeString)->exists()) {
            $qrCodeString = 'AGENDA-' . Str::random(8);
        }

        $agenda = Agenda::create([
            'title' => $request->title,
            'description' => $request->description,
            'qr_code' => $qrCodeString,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'user_id' => Auth::id(),
            'type' => $request->type ?? 'semua',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Agenda berhasil dibuat',
            'data' => $agenda->load('user')
        ], 201);
    }

    /**
     * Update agenda
     */
    public function update(Request $request, $id)
    {
        $agenda = Agenda::find($id);
        if (!$agenda) {
            return response()->json(['status' => false, 'message' => 'Agenda tidak ditemukan'], 404);
        }

        // Check if user is the creator of this agenda
        if ($agenda->user_id !== Auth::id()) {
            return response()->json(['status' => false, 'message' => 'Anda tidak memiliki izin untuk mengubah agenda ini'], 403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'nullable|date_format:Y-m-d\TH:i',
            'end_time' => 'nullable|date_format:Y-m-d\TH:i',
            'type' => 'nullable|in:pengurus,semua',
        ]);

        // Update hanya field yang dikirim
        if ($request->has('title')) {
            $agenda->title = $request->title;
        }
        if ($request->has('description')) {
            $agenda->description = $request->description;
        }
        if ($request->has('start_time')) {
            $agenda->start_time = $request->start_time;
        }
        if ($request->has('end_time')) {
            $agenda->end_time = $request->end_time;
        }
        if ($request->has('type')) {
            $agenda->type = $request->type;
        }

        $agenda->save();

        return response()->json([
            'status' => true,
            'message' => 'Agenda berhasil diperbarui',
            'data' => $agenda->load('user')
        ], 200);
    }

    /**
     * Hapus agenda
     */
    public function destroy($id)
    {
        $agenda = Agenda::find($id);
        if (!$agenda) {
            return response()->json(['status' => false, 'message' => 'Agenda tidak ditemukan'], 404);
        }

        // Check if user is the creator of this agenda
        if ($agenda->user_id !== Auth::id()) {
            return response()->json(['status' => false, 'message' => 'Anda tidak memiliki izin untuk menghapus agenda ini'], 403);
        }

        $agenda->delete();

        return response()->json([
            'status' => true,
            'message' => 'Agenda berhasil dihapus'
        ], 200);
    }

    // ... kode sebelumnya (index, store, destroy)

    /**
     * Detail Agenda + Daftar Hadir
     */
    public function show($id)
    {
        // Load agenda, user yang membuat agenda, dan user yang melakukan absensi (attendances.user)
        $agenda = Agenda::with(['user', 'attendances.user'])->find($id);

        if (!$agenda) {
            return response()->json([
                'status' => false,
                'message' => 'Agenda tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $agenda
        ], 200);
    }

    public function export($id, Request $request)
    {
        // 1. COBA AUTHENTIKASI DARI HEADER (Bearer Token)
        try {
            // Jika middleware tidak mengautentikasi, coba manual
            $user = $request->user();
            
            if (!$user) {
                // Fallback: Cek dari query parameter untuk backward compatibility
                $tokenString = $request->query('token');
                if ($tokenString) {
                    $token = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenString);
                    if (!$token) {
                        return response()->json(['status' => false, 'message' => 'Token tidak valid'], 401);
                    }
                    Auth::setUser($token->tokenable);
                    $user = $token->tokenable;
                } else {
                    return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
                }
            }
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Authentication failed: ' . $e->getMessage()], 401);
        }

        // 2. FETCH AGENDA
        $agenda = Agenda::with(['attendances.user'])->find($id);

        if (!$agenda) {
            return response()->json(['status' => false, 'message' => 'Agenda tidak ditemukan'], 404);
        }

        // 3. GENERATE CSV CONTENT
        try {
            $fileName = "Absensi-" . str_replace(' ', '_', $agenda->title) . "-" . date('Y-m-d') . ".csv";

            // Gunakan Maatwebsite Excel jika tersedia, jika tidak gunakan CSV standar
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ];

            // Create CSV content
            $csvContent = [];
            $csvContent[] = ['No', 'NIM', 'Nama', 'Jabatan', 'Waktu Scan'];

            foreach ($agenda->attendances as $index => $attendance) {
                $csvContent[] = [
                    $index + 1,
                    $attendance->user->nim ?? '-',
                    $attendance->user->name,
                    $attendance->user->position ?? $attendance->user->role,
                    date('d-m-Y H:i:s', strtotime($attendance->scanned_at))
                ];
            }

            // Convert to CSV string
            $output = fopen('php://memory', 'r+');
            foreach ($csvContent as $row) {
                fputcsv($output, $row);
            }
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);

            return response($csv, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
