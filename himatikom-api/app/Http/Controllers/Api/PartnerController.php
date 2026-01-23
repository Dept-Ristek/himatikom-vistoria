<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerController extends Controller
{
    /**
     * LIST ALL PARTNERS
     */
    public function index()
    {
        $partners = Partner::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $partners
        ], 200);
    }

    /**
     * GET SINGLE PARTNER
     */
    public function show($partnerId)
    {
        $partner = Partner::with('user')->findOrFail($partnerId);

        return response()->json([
            'status' => true,
            'data' => $partner
        ], 200);
    }

    /**
     * CREATE PARTNER
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        $partner = Partner::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'category' => $request->category,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Partnership berhasil dibuat',
            'data' => $partner
        ], 201);
    }

    /**
     * UPDATE PARTNER
     */
    public function update(Request $request, $partnerId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        $partner = Partner::findOrFail($partnerId);
        $partner->update([
            'name' => $request->name,
            'description' => $request->description,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'category' => $request->category,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Partnership berhasil diupdate',
            'data' => $partner
        ], 200);
    }

    /**
     * DELETE PARTNER
     */
    public function destroy($partnerId)
    {
        $partner = Partner::findOrFail($partnerId);
        $partner->delete();

        return response()->json([
            'status' => true,
            'message' => 'Partnership berhasil dihapus'
        ], 200);
    }
}
