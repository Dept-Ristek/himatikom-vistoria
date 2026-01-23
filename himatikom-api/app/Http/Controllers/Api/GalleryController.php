<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryMedia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Check if user is authorized to manage galleries
     */
    private function canManageGallery($userId)
    {
        /** @var User $user */
        $user = auth()->user();
        
        // Check if user is the creator OR part of Biro Kominfo
        if ($user->id === $userId) {
            return true;
        }
        
        // Allow all Biro Kominfo roles to manage
        $allowedPositions = [
            'Biro Kominfo',
            'Kepala Biro Kominfo',
            'Anggota Biro Kominfo Divisi Multimedia',
            'Anggota Biro Kominfo Divisi Jurnalistik'
        ];
        
        return in_array($user->position, $allowedPositions);
    }

    /**
     * Display a listing of galleries
     */
    public function index()
    {
        try {
            $galleries = Gallery::with('media')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($gallery) {
                    return [
                        'id' => $gallery->id,
                        'title' => $gallery->title,
                        'description' => $gallery->description,
                        'thumbnail_url' => $gallery->getFirstMediaUrl(),
                        'media_type' => $gallery->getFirstMediaType(),
                        'media_count' => $gallery->media()->count(),
                        'media' => $gallery->media,
                        'order' => $gallery->order,
                        'featured' => $gallery->featured,
                        'user_id' => $gallery->user_id,
                        'created_at' => $gallery->created_at,
                        'updated_at' => $gallery->updated_at,
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => $galleries,
                'message' => 'Galleries retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve galleries: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new gallery with media
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'media' => 'required|array|min:1',
                'media.*' => 'required|mimes:jpeg,png,jpg,gif,webp,mp4,webm,mov,avi,mkv|max:102400',
            ]);

            $gallery = Gallery::create([
                'title' => $request->title,
                'description' => $request->description,
                'order' => Gallery::max('order') + 1 ?? 1,
                'user_id' => auth()->user()?->id ?? 0
            ]);

            $mediaOrder = 0;
            $files = $request->file('media');
            $mediaCount = 0;

            foreach ($files as $file) {
                $mimeType = $file->getMimeType();
                $isVideo = strpos($mimeType, 'video/') === 0;
                $mediaType = $isVideo ? 'video' : 'image';

                $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('gallery', $filename, 'public');
                $mediaUrl = '/storage/' . $path;

                GalleryMedia::create([
                    'gallery_id' => $gallery->id,
                    'media_url' => $mediaUrl,
                    'media_path' => $path,
                    'media_type' => $mediaType,
                    'order' => $mediaOrder++
                ]);

                $mediaCount++;
            }

            // Set thumbnail from first media
            $firstMedia = $gallery->media()->first();
            if ($firstMedia) {
                $gallery->update(['thumbnail_url' => $firstMedia->media_url]);
            }

            $gallery->load('media');

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'thumbnail_url' => $gallery->getFirstMediaUrl(),
                    'media_type' => $gallery->getFirstMediaType(),
                    'media_count' => $mediaCount,
                    'media' => $gallery->media,
                    'order' => $gallery->order,
                    'featured' => $gallery->featured,
                    'user_id' => $gallery->user_id,
                    'created_at' => $gallery->created_at,
                    'updated_at' => $gallery->updated_at,
                ],
                'message' => 'Gallery created with ' . $mediaCount . ' media'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Create failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific gallery with all media
     */
    public function show(Gallery $gallery)
    {
        try {
            if (!$this->canManageGallery($gallery->user_id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $gallery->load('media');

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'thumbnail_url' => $gallery->getFirstMediaUrl(),
                    'media_type' => $gallery->getFirstMediaType(),
                    'media_count' => $gallery->media()->count(),
                    'media' => $gallery->media,
                    'order' => $gallery->order,
                    'featured' => $gallery->featured,
                    'user_id' => $gallery->user_id,
                    'created_at' => $gallery->created_at,
                    'updated_at' => $gallery->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve gallery: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update gallery metadata
     */
    public function update(Request $request, Gallery $gallery)
    {
        try {
            if (!$this->canManageGallery($gallery->user_id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'featured' => 'sometimes|boolean',
                'order' => 'sometimes|integer'
            ]);

            $data = $request->only(['title', 'description', 'featured', 'order']);
            $gallery->update($data);
            $gallery->load('media');

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'thumbnail_url' => $gallery->getFirstMediaUrl(),
                    'media_type' => $gallery->getFirstMediaType(),
                    'media_count' => $gallery->media()->count(),
                    'media' => $gallery->media,
                    'order' => $gallery->order,
                    'featured' => $gallery->featured,
                    'user_id' => $gallery->user_id,
                    'created_at' => $gallery->created_at,
                    'updated_at' => $gallery->updated_at,
                ],
                'message' => 'Gallery updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete gallery and all its media
     */
    public function destroy(Gallery $gallery)
    {
        try {
            if (!$this->canManageGallery($gallery->user_id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Delete all media files
            $gallery->media()->each(function ($media) {
                if ($media->media_path) {
                    Storage::disk('public')->delete($media->media_path);
                }
                $media->delete();
            });

            $gallery->delete();

            return response()->json([
                'status' => true,
                'message' => 'Gallery deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add media to existing gallery
     */
    public function addMedia(Request $request, Gallery $gallery)
    {
        try {
            if (!$this->canManageGallery($gallery->user_id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $request->validate([
                'media' => 'required|array|min:1',
                'media.*' => 'required|mimes:jpeg,png,jpg,gif,webp,mp4,webm,mov,avi,mkv|max:102400',
            ]);

            $mediaOrder = $gallery->media()->max('order') + 1 ?? 0;
            $files = $request->file('media');
            $addedMedia = [];

            foreach ($files as $file) {
                $mimeType = $file->getMimeType();
                $isVideo = strpos($mimeType, 'video/') === 0;
                $mediaType = $isVideo ? 'video' : 'image';

                $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('gallery', $filename, 'public');
                $mediaUrl = '/storage/' . $path;

                $media = GalleryMedia::create([
                    'gallery_id' => $gallery->id,
                    'media_url' => $mediaUrl,
                    'media_path' => $path,
                    'media_type' => $mediaType,
                    'order' => $mediaOrder++
                ]);

                $addedMedia[] = $media;
            }

            $gallery->load('media');

            return response()->json([
                'status' => true,
                'data' => $addedMedia,
                'message' => count($addedMedia) . ' media added to gallery'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Add media failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete specific media from gallery
     */
    public function deleteMedia(GalleryMedia $media)
    {
        try {
            $gallery = $media->gallery;
            
            if (!$this->canManageGallery($gallery->user_id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            if ($media->media_path) {
                Storage::disk('public')->delete($media->media_path);
            }

            $media->delete();

            // If no media left, delete gallery too
            if ($gallery->media()->count() === 0) {
                $gallery->delete();
                return response()->json([
                    'status' => true,
                    'message' => 'Media deleted and gallery removed (no media left)'
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Media deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Delete media failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured galleries for landing page
     */
    public function featured()
    {
        try {
            $galleries = Gallery::where('featured', true)
                ->with('media')
                ->orderBy('order', 'asc')
                ->limit(6)
                ->get()
                ->map(function ($gallery) {
                    return [
                        'id' => $gallery->id,
                        'title' => $gallery->title,
                        'description' => $gallery->description,
                        'thumbnail_url' => $gallery->getFirstMediaUrl(),
                        'media_type' => $gallery->getFirstMediaType(),
                        'media_count' => $gallery->media()->count(),
                        'media' => $gallery->media,
                        'featured' => $gallery->featured,
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => $galleries,
                'message' => 'Featured galleries retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve featured galleries: ' . $e->getMessage()
            ], 500);
        }
    }
}
