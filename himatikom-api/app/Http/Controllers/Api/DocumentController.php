<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents in a folder
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $parentId = $request->query('parent_id');

        $documents = Document::where('user_id', $userId)
            ->where('parent_id', $parentId === 'null' ? null : $parentId)
            ->orderBy('type', 'desc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($doc) {
                return $this->formatDocument($doc);
            });

        return response()->json([
            'status' => true,
            'message' => 'Dokumen berhasil diambil',
            'data' => $documents
        ]);
    }

    /**
     * Store a newly created resource in storage
     */
    public function store(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $parentId = $request->input('parent_id');

        // Create folder
        if ($request->input('type') === 'folder') {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:folder',
                'parent_id' => 'nullable|exists:documents,id',
            ]);

            $document = Document::create([
                'name' => $validated['name'],
                'type' => 'folder',
                'parent_id' => $parentId,
                'user_id' => $userId,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Folder berhasil dibuat',
                'data' => $this->formatDocument($document)
            ], 201);
        }

        // Upload file
        $validated = $request->validate([
            'file' => 'required|file|max:102400', // 100MB
            'parent_id' => 'nullable|exists:documents,id',
        ]);

        if (!$request->hasFile('file')) {
            return response()->json([
                'status' => false,
                'message' => 'File tidak ditemukan'
            ], 400);
        }

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('documents', $filename, 'public');

        $document = Document::create([
            'name' => $file->getClientOriginalName(),
            'type' => 'file',
            'file_path' => $path,
            'size' => $file->getSize(),
            'parent_id' => $parentId,
            'user_id' => $userId,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'File berhasil diunggah',
            'data' => $this->formatDocument($document)
        ], 201);
    }

    /**
     * Display the specified resource
     */
    public function show(Document $document): JsonResponse
    {
        if ($document->user_id !== auth()->id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => true,
            'data' => $this->formatDocument($document)
        ]);
    }

    /**
     * Update the specified resource in storage
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        if ($document->user_id !== auth()->id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $document->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Dokumen berhasil diperbarui',
            'data' => $this->formatDocument($document)
        ]);
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy(Document $document): JsonResponse
    {
        if ($document->user_id !== auth()->id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete file from storage
        if ($document->type === 'file' && $document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        // Delete folder and all its contents recursively
        if ($document->type === 'folder') {
            $this->deleteFolder($document);
        }

        $document->delete();

        return response()->json([
            'status' => true,
            'message' => 'Dokumen berhasil dihapus'
        ]);
    }

    /**
     * Delete folder recursively
     */
    private function deleteFolder(Document $folder): void
    {
        foreach ($folder->children as $child) {
            if ($child->type === 'file' && $child->file_path) {
                Storage::disk('public')->delete($child->file_path);
            }

            if ($child->type === 'folder') {
                $this->deleteFolder($child);
            }

            $child->delete();
        }
    }

    /**
     * Format document for response
     */
    private function formatDocument(Document $document): array
    {
        $data = [
            'id' => $document->id,
            'name' => $document->name,
            'type' => $document->type,
            'parentId' => $document->parent_id,
            'uploadedAt' => $document->created_at->format('Y-m-d'),
        ];

        if ($document->type === 'file') {
            $data['size'] = $document->size;
            $data['filePath'] = $document->file_path ? asset('storage/' . $document->file_path) : null;
        } else {
            $data['itemCount'] = $document->children()->count();
        }

        return $data;
    }

    /**
     * Get breadcrumbs path
     */
    public function getBreadcrumbs(Request $request): JsonResponse
    {
        $folderId = $request->query('folder_id');
        $breadcrumbs = [];

        if (!$folderId) {
            return response()->json([
                'status' => true,
                'data' => [
                    ['id' => null, 'name' => 'Arsip Surat']
                ]
            ]);
        }

        $folder = Document::find($folderId);
        if (!$folder || $folder->user_id !== auth()->id()) {
            return response()->json([
                'status' => false,
                'message' => 'Folder tidak ditemukan'
            ], 404);
        }

        // Build breadcrumb trail
        while ($folder) {
            array_unshift($breadcrumbs, ['id' => $folder->id, 'name' => $folder->name]);
            $folder = $folder->parent;
        }

        array_unshift($breadcrumbs, ['id' => null, 'name' => 'Arsip Surat']);

        return response()->json([
            'status' => true,
            'data' => $breadcrumbs
        ]);
    }
}
