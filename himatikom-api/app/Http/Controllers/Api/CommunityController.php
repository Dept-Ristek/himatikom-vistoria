<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunityController extends Controller
{
    /**
     * LIST ALL COMMUNITIES
     */
    public function index()
    {
        $user = Auth::user();
        
        $communities = Community::with('members')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $communities->map(function($community) use ($user) {
                return [
                    'id' => $community->id,
                    'user_id' => $community->user_id,
                    'name' => $community->name,
                    'description' => $community->description,
                    'category' => $community->category,
                    'members_count' => $community->members()->count(),
                    'is_member' => $user ? $community->members()->where('user_id', $user->id)->exists() : false,
                ];
            })->toArray()
        ], 200);
    }

    /**
     * GET SINGLE COMMUNITY
     */
    public function show($communityId)
    {
        $user = Auth::user();
        $community = Community::with('user', 'members')->findOrFail($communityId);

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $community->id,
                'user_id' => $community->user_id,
                'name' => $community->name,
                'description' => $community->description,
                'category' => $community->category,
                'member_count' => $community->member_count,
                'user' => $community->user,
                'members' => $community->members->map(function($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'nim' => $member->nim,
                        'avatar' => $member->avatar,
                    ];
                }),
                'is_member' => $user ? $community->members()->where('user_id', $user->id)->exists() : false,
            ]
        ], 200);
    }

    /**
     * CREATE COMMUNITY
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        $community = Community::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'member_count' => 0,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Komunitas berhasil dibuat',
            'data' => $community
        ], 201);
    }

    /**
     * UPDATE COMMUNITY
     */
    public function update(Request $request, $communityId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        $community = Community::findOrFail($communityId);
        $community->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Komunitas berhasil diupdate',
            'data' => $community
        ], 200);
    }

    /**
     * DELETE COMMUNITY
     */
    public function destroy($communityId)
    {
        $community = Community::findOrFail($communityId);
        $community->delete();

        return response()->json([
            'status' => true,
            'message' => 'Komunitas berhasil dihapus'
        ], 200);
    }

    /**
     * JOIN COMMUNITY
     */
    public function join($communityId)
    {
        $user = Auth::user();
        $community = Community::findOrFail($communityId);

        // Check if already member
        if ($community->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Anda sudah bergabung dengan komunitas ini'
            ], 400);
        }

        // Add user to community
        $community->members()->attach($user->id);
        
        // Update member count
        $community->increment('member_count');

        return response()->json([
            'status' => true,
            'message' => 'Berhasil bergabung dengan komunitas',
            'data' => $community
        ], 200);
    }

    /**
     * LEAVE COMMUNITY
     */
    public function leave($communityId)
    {
        $user = Auth::user();
        $community = Community::findOrFail($communityId);

        // Check if user is member
        if (!$community->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak bergabung dengan komunitas ini'
            ], 400);
        }

        // Remove user from community
        $community->members()->detach($user->id);
        
        // Update member count
        $community->decrement('member_count');

        return response()->json([
            'status' => true,
            'message' => 'Berhasil keluar dari komunitas',
            'data' => $community
        ], 200);
    }
}
