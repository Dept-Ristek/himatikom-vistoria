<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class RistekController extends Controller
{
    /**
     * Ambil semua tiket (Untuk Ristek)
     */
    public function index()
    {
        // Ristek melihat semua tiket user
        $tickets = Ticket::with('user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $tickets
        ], 200);
    }

    // ... method index ...

    /**
     * Ambil Detail Satu Tiket (Untuk Route Resource)
     */
    public function show($id)
    {
        $ticket = \App\Models\Ticket::with('user')->find($id);

        if (!$ticket) {
            return response()->json([
                'status' => false,
                'message' => 'Tiket tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $ticket
        ], 200);
    }

// ... method lain ...

    /**
     * User buat tiket baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'description' => 'required|string',
        ]);

        $ticket = Ticket::create([
            'user_id' => auth()->id(),
            'category' => $request->category,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Laporan berhasil dikirim ke Ristek',
            'data' => $ticket->load('user')
        ], 201);
    }

    /**
     * Update Tiket (Ristek proses/selesai)
     */
    public function update(Request $request, $id)
    {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return response()->json(['status' => false, 'message' => 'Tiket tidak ditemukan'], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,process,done',
            'solution' => 'nullable|string', // Solusi wajib jika status Done
        ]);

        // Jika status 'done', wajib ada solusi
        if ($request->status === 'done' && empty($request->solution)) {
            return response()->json(['status' => false, 'message' => 'Solusi wajib diisi jika tiket selesai'], 422);
        }

        $ticket->update([
            'status' => $request->status,
            'solution' => $request->solution,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Tiket berhasil diupdate',
            'data' => $ticket->load('user')
        ], 200);
    }

    // ... method lain (index, store, update)

    /**
     * Ambil tiket milik sendiri (Untuk User)
     */
    public function myTickets()
    {
        // Ambil tiket dimana user_id = user yang login
        $tickets = \App\Models\Ticket::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $tickets
        ], 200);
    }
}
