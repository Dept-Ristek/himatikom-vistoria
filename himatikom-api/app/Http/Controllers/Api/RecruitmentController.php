<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommitteePosition;
use App\Models\CommitteeApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecruitmentController extends Controller
{

    /**
     * Ambil semua Proker (Untuk Dropdown saat buat lowongan)
     */
    public function indexProkers()
    {
        $prokers = \App\Models\Proker::orderBy('name')->get();
        return response()->json(['status' => true, 'data' => $prokers], 200);
    }
    /**
     * LIST LOWONGAN (Untuk Anggota)
     */
    public function indexPositions()
    {
        // Ambil lowongan yang status 'open', dan muat data prokernya
        $positions = CommitteePosition::with('proker')
            ->where('status', 'open')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $positions
        ], 200);
    }

    /**
     * BUKA LOWONGAN BARU (Untuk PDO/Pengurus)
     */
    public function storePosition(Request $request)
    {
        $request->validate([
            'proker_id' => 'required|exists:prokers,id',
            'name' => 'required|string',
            'quota' => 'required|integer|min:1',
            'requirements' => 'nullable|string',
        ]);

        $position = CommitteePosition::create([
            'proker_id' => $request->proker_id,
            'name' => $request->name,
            'quota' => $request->quota,
            'requirements' => $request->requirements,
            'status' => 'open',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Lowongan berhasil dibuka',
            'data' => $position->load('proker')
        ], 201);
    }

    /**
     * DAFTAR / APPLY LOWONGAN (Untuk Anggota)
     */
    public function apply(Request $request)
    {
        $request->validate([
            'position_id' => 'required|exists:committee_positions,id',
            'motivation_letter' => 'nullable|string',
        ]);

        // Cek apakah user sudah melamar di posisi ini
        $userId = auth('sanctum')->user()->id ?? Auth::id();
        $existing = CommitteeApplication::where('user_id', $userId)
            ->where('committee_position_id', $request->position_id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'Anda sudah melamar di posisi ini.'
            ], 409);
        }

        $application = CommitteeApplication::create([
            'user_id' => $userId,
            'committee_position_id' => $request->position_id,
            'status' => 'pending',
            'motivation_letter' => $request->motivation_letter,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Lamaran berhasil dikirim',
            'data' => $application->load('position')
        ], 201);
    }

    /**
     * CEK STATUS SAYA (Untuk Anggota)
     */
    public function myApplications()
    {
        $userId = auth('sanctum')->user()->id ?? Auth::id();
        $applications = CommitteeApplication::with(['position.proker'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $applications
        ], 200);
    }

    /**
     * SELEKSI: Terima/Tolak Pelamar (Untuk PDO)
     */
    public function selectApplicant(Request $request, $id)
    {
        $application = CommitteeApplication::find($id);

        if (!$application) {
            return response()->json(['status' => false, 'message' => 'Aplikasi tidak ditemukan'], 404);
        }

        $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $application->update([
            'status' => $request->status
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Status pelamar berhasil diupdate',
            'data' => $application
        ], 200);
    }

    /**
     * LIHAT PELAMAR PER POSISI (Untuk PDO)
     */
    public function applicantsByPosition($positionId)
    {
        $applications = CommitteeApplication::with('user')
            ->where('committee_position_id', $positionId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $applications
        ], 200);
    }

    /**
     * Ambil Data Keanggotaan Panitia (Sudah diterima)
     */
    public function myCommittee()
    {
        // Ambil aplikasi milik user yang statusnya 'accepted'
        // Load relasi: position -> proker
        $userId = auth('sanctum')->user()->id ?? Auth::id();
        $committees = CommitteeApplication::with(['position.proker'])
            ->where('user_id', $userId)
            ->where('status', 'accepted')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $committees
        ], 200);
    }
}
