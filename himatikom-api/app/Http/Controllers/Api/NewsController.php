<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use App\Models\NewsImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function index()
    {
        $news = NewsArticle::with('user', 'images')->orderBy('created_at', 'desc')->get();
        
        // Transform image_url to full URL if it's a file path (for backward compatibility)
        $news->each(function ($article) {
            if ($article->image_url && !str_starts_with($article->image_url, 'http')) {
                $article->image_url = url('/api/news/image/' . $article->image_url);
            }
        });
        
        return response()->json(['status' => true, 'data' => $news], 200);
    }

    public function show($id)
    {
        $article = NewsArticle::with('user', 'images')->find($id);

        if (!$article) {
            return response()->json(['status' => false, 'message' => 'Berita tidak ditemukan'], 404);
        }

        // Transform image_url to full URL if it's a file path
        if ($article->image_url && !str_starts_with($article->image_url, 'http')) {
            $article->image_url = url('/api/news/image/' . $article->image_url);
        }

        return response()->json(['status' => true, 'data' => $article], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        try {
            $news = NewsArticle::create([
                'title' => $request->title,
                'content' => $request->content,
                'image_url' => null,
                'category' => $request->category,
                'user_id' => auth('sanctum')->user()->id ?? Auth::id(),
            ]);

            // Handle multiple file uploads
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                foreach ($images as $index => $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Store di storage/app/public/news/ menggunakan 'public' disk
                    $path = $file->storeAs('news', $filename, 'public');
                    
                    if ($path) {
                        // Set image_url untuk yang pertama (untuk thumbnail di list)
                        if ($index === 0) {
                            $news->update(['image_url' => basename($path)]);
                        }
                        
                        // Simpan di tabel news_images
                        NewsImage::create([
                            'news_article_id' => $news->id,
                            'filename' => basename($path),
                            'order' => $index,
                        ]);
                    }
                }
            }

            // Load relationships
            $news->load('user', 'images');
            
            // Transform image_url to full URL
            if ($news->image_url && !str_starts_with($news->image_url, 'http')) {
                $news->image_url = url('/storage/news/' . $news->image_url);
            }

            return response()->json([
                'status' => true,
                'message' => 'Berita berhasil diterbitkan',
                'data' => $news
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $news = NewsArticle::find($id);
        if (!$news) {
            return response()->json(['status' => false, 'message' => 'Berita tidak ditemukan'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        try {
            $news->update([
                'title' => $request->title,
                'content' => $request->content,
                'category' => $request->category,
            ]);

            // Handle multiple file uploads jika ada
            if ($request->hasFile('images')) {
                // Delete old images
                $oldImages = $news->images()->get();
                foreach ($oldImages as $oldImage) {
                    $oldPath = 'news/' . $oldImage->filename;
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                    $oldImage->delete();
                }

                $images = $request->file('images');
                foreach ($images as $index => $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    $path = $file->storeAs('news', $filename, 'public');
                    
                    if ($path) {
                        // Set image_url untuk yang pertama (untuk thumbnail di list)
                        if ($index === 0) {
                            $news->update(['image_url' => basename($path)]);
                        }
                        
                        // Simpan di tabel news_images
                        NewsImage::create([
                            'news_article_id' => $news->id,
                            'filename' => basename($path),
                            'order' => $index,
                        ]);
                    }
                }
            }

            $news->load('user', 'images');
            
            // Transform image_url to full URL
            if ($news->image_url && !str_starts_with($news->image_url, 'http')) {
                $news->image_url = url('/storage/news/' . $news->image_url);
            }

            return response()->json([
                'status' => true,
                'message' => 'Berita berhasil diupdate',
                'data' => $news
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $news = NewsArticle::find($id);
        if (!$news) {
            return response()->json(['status' => false, 'message' => 'Berita tidak ditemukan'], 404);
        }

        try {
            // Delete all image files associated with this news article
            $images = $news->images()->get();
            foreach ($images as $image) {
                $path = 'news/' . $image->filename;
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
                $image->delete();
            }

            $news->delete();

            return response()->json([
                'status' => true,
                'message' => 'Berita berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}