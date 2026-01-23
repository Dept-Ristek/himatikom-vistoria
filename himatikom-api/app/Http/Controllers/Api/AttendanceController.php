<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        // 1. Cari Agenda berdasarkan QR Code
        $agenda = Agenda::where('qr_code', $request->qr_code)->first();

        if (!$agenda) {
            return response()->json([
                'status' => false,
                'message' => 'QR Code tidak valid (Agenda tidak ditemukan).'
            ], 404);
        }

        // 2. Cek Waktu (Apakah agenda sedang berlangsung?) - LEBIH FLEKSIBEL
        // Format timestamps sebagai string untuk comparison
        $now = now();
        $startTime = $agenda->start_time;
        $endTime = $agenda->end_time;
        
        // Debug info (bisa dihapus nanti)
        Log::info('Attendance Scan Debug', [
            'qr_code' => $request->qr_code,
            'now' => $now->toDateTimeString(),
            'start_time' => $startTime->toDateTimeString(),
            'end_time' => $endTime->toDateTimeString(),
            'is_valid_time' => $now->between($startTime, $endTime)
        ]);

        // Cek dengan margin 15 menit (untuk timezone mismatch)
        $startTimeWithMargin = $startTime->copy()->subMinutes(15);
        $endTimeWithMargin = $endTime->copy()->addMinutes(15);
        
        if (!$now->between($startTimeWithMargin, $endTimeWithMargin)) {
            return response()->json([
                'status' => false,
                'message' => 'Agenda belum dimulai atau sudah berakhir.',
                'debug' => [
                    'now' => $now->toDateTimeString(),
                    'expected_start' => $startTime->toDateTimeString(),
                    'expected_end' => $endTime->toDateTimeString()
                ]
            ], 403);
        }

        // 3. Cek apakah user sudah absen sebelumnya
        $existing = Attendance::where('agenda_id', $agenda->id)
                             ->where('user_id', Auth::id())
                             ->first();

        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'Anda sudah melakukan absensi pada agenda ini.'
            ], 409);
        }

        // 4. Simpan Absensi
        Attendance::create([
            'user_id' => Auth::id(),
            'agenda_id' => $agenda->id,
            'scanned_at' => now(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Absensi Berhasil!',
            'data' => [
                'agenda' => $agenda->title
            ]
        ], 200);
    }

    /**
     * Delete attendance - hanya pembuat agenda yang bisa delete
     */
    public function destroy($id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json([
                'status' => false,
                'message' => 'Data absensi tidak ditemukan'
            ], 404);
        }

        // Check if user is the creator of this agenda
        $agenda = $attendance->agenda;
        if ($agenda->user_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memiliki izin untuk menghapus data absensi ini'
            ], 403);
        }

        $attendance->delete();

        return response()->json([
            'status' => true,
            'message' => 'Data absensi berhasil dihapus'
        ], 200);
    }

    /**
     * Manual input attendance - hanya pembuat agenda yang bisa input
     */
    public function manualInput(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'agenda_id' => 'required|integer|exists:agendas,id'
        ]);

        $agenda = Agenda::find($request->agenda_id);

        // Check if user is the creator of this agenda
        if ($agenda->user_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memiliki izin untuk melakukan ini'
            ], 403);
        }

        // Check if user already has attendance
        $existing = Attendance::where('agenda_id', $request->agenda_id)
                             ->where('user_id', $request->user_id)
                             ->first();

        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'Peserta sudah tercatat dalam absensi ini'
            ], 409);
        }

        // Create attendance
        $attendance = Attendance::create([
            'user_id' => $request->user_id,
            'agenda_id' => $request->agenda_id,
            'scanned_at' => now()
        ]);

            return response()->json([
                'status' => true,
                'message' => 'Peserta berhasil ditambahkan',
                'data' => $attendance
            ], 201);
        }
    }