<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    /**
     * Ambil riwayat transaksi
     */
    public function index()
    {
        // Urutkan dari yang terbaru
        $transactions = Transaction::with('user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $transactions
        ], 200);
    }

    /**
     * Input Transaksi Baru (Masuk/Keluar)
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = Transaction::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'transaction_date' => $request->transaction_date,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Transaksi berhasil dicatat',
            'data' => $transaction->load('user')
        ], 201);
    }

    /**
     * Hapus Transaksi
     */
    public function destroy($id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['status' => false, 'message' => 'Transaksi tidak ditemukan'], 404);
        }

        $transaction->delete();
        
        return response()->json([
            'status' => true,
            'message' => 'Transaksi berhasil dihapus'
        ], 200);
    }
}