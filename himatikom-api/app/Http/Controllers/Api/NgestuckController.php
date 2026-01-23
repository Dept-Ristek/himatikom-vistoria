<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Reply;

class NgestuckController extends Controller
{
    // Ambil semua postingan (terbaru di atas)
    public function index()
    {
        // Load user yang membuat post juga (with)
        $posts = Post::with(['user', 'media'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $posts
        ], 200);
    }

    // Buat postingan baru
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'media.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,avi,mov,webm|max:50000',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category ?? 'Umum',
        ]);

        // Handle media uploads
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $mime = $file->getMimeType();
                $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                $file->storeAs('ngestuck', $filename, 'public');

                PostMedia::create([
                    'post_id' => $post->id,
                    'filename' => $filename,
                    'type' => $type,
                    'mime_type' => $mime,
                    'size' => $file->getSize(),
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Topik berhasil dibuat',
            'data' => $post->load(['user', 'media'])
        ], 201);
    }

    /**
     * Ambil Detail Post + Komentar
     */
    public function show($id)
    {
        // Load post, user pembuat, dan replies (termasuk user yang reply)
        $post = Post::with(['user', 'replies.user', 'media'])->find($id);

        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Post tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $post
        ], 200);
    }

    /**
     * Serve Media File (Foto/Video)
     */
    public function getMedia($mediaId, $filename)
    {
        $media = PostMedia::find($mediaId);

        if (!$media || $media->filename !== $filename) {
            return response()->json(['status' => false, 'message' => 'Media tidak ditemukan'], 404);
        }

        $path = 'public/ngestuck/' . $filename;

        if (!Storage::exists($path)) {
            return response()->json(['status' => false, 'message' => 'File tidak ditemukan'], 404);
        }

        return response()->file(storage_path('app/' . $path), [
            'Content-Type' => $media->mime_type,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    /**
     * Ambil postingan milik user sendiri
     */
    public function myPosts()
    {
        $posts = Post::where('user_id', Auth::id())
            ->with(['user', 'media', 'replies'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $posts
        ], 200);
    }

    /**
     * Update postingan
     */
    public function update(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Post tidak ditemukan'], 404);
        }

        // Cek apakah user adalah pemilik post
        if ($post->user_id !== Auth::id()) {
            return response()->json(['status' => false, 'message' => 'Anda tidak memiliki izin untuk mengubah post ini'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'media.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,avi,mov,webm|max:50000',
            'delete_media.*' => 'nullable|numeric',
        ]);

        $post->update([
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category ?? $post->category,
        ]);

        // Handle media deletion
        if ($request->has('delete_media')) {
            $mediaIdsToDelete = $request->input('delete_media', []);
            foreach ($mediaIdsToDelete as $mediaId) {
                $media = PostMedia::find((int)$mediaId);
                if ($media && $media->post_id === $post->id) {
                    Storage::delete('public/ngestuck/' . $media->filename);
                    $media->delete();
                }
            }
        }

        // Handle new media uploads (add to existing, don't delete old ones)
        if ($request->hasFile('media')) {
            $currentMediaCount = $post->media->count();
            
            // Upload new media files (max 5 total)
            foreach ($request->file('media') as $file) {
                if ($currentMediaCount >= 5) {
                    break; // Stop if we reach 5 files
                }
                
                $mime = $file->getMimeType();
                $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                $file->storeAs('ngestuck', $filename, 'public');

                PostMedia::create([
                    'post_id' => $post->id,
                    'filename' => $filename,
                    'type' => $type,
                    'mime_type' => $mime,
                    'size' => $file->getSize(),
                ]);
                
                $currentMediaCount++;
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Post berhasil diperbarui',
            'data' => $post->load(['user', 'media'])
        ], 200);
    }

    /**
     * Hapus postingan
     */
    public function destroy($id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Post tidak ditemukan'], 404);
        }

        // Cek apakah user adalah pemilik post
        if ($post->user_id !== Auth::id()) {
            return response()->json(['status' => false, 'message' => 'Anda tidak memiliki izin untuk menghapus post ini'], 403);
        }

        // Delete media files from storage
        foreach ($post->media as $media) {
            Storage::delete('public/ngestuck/' . $media->filename);
        }

        // Delete post dan relasi (cascade akan handle media dan replies)
        $post->delete();

        return response()->json([
            'status' => true,
            'message' => 'Post berhasil dihapus'
        ], 200);
    }

    /**
     * Balas Post (Reply)
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        // Cek apakah post ada
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Post tidak ditemukan'], 404);
        }

        $reply = Reply::create([
            'post_id' => $post->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Berhasil membalas',
            'data' => $reply->load('user')
        ], 201);
    }
}
