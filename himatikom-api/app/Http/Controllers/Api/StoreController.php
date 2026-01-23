<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    // Ambil semua produk (Katalog)
    public function index()
    {
        $products = Product::with('images')->orderBy('created_at', 'desc')->get();

        // Transform: set product.image dari images[0].image_url
        $products = $products->map(function ($product) {
            // Set image ke gambar pertama jika ada
            if ($product->images && $product->images->count() > 0) {
                $firstImage = $product->images->first();
                $product->image = $firstImage->image_url;
            }
            return $product;
        });

        return response()->json([
            'status' => true,
            'data' => $products
        ], 200);
    }

    // ... kode sebelumnya (index) ...

    /**
     * Tambah Produk Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'nullable|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => 'https://placehold.co/400x400/f3f4f6/999999?text=No+Image',
        ]);

        // Simpan images jika ada
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $imageFile) {
                if ($imageFile && $imageFile->isValid()) {
                    // Store file in storage/app/products/
                    $path = $imageFile->store('products', 'public');
                    // Create full URL pointing to Laravel backend
                    $imageUrl = url('/storage/' . $path);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imageUrl,
                        'order' => $index,
                    ]);
                }
            }
        }

        // Load images relation
        $product->load('images');

        return response()->json([
            'status' => true,
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product
        ], 201);
    }

    /**
     * Update Produk
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        // Validation rules - only validate images if files are present
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ];

        // Only validate images if files are actually being sent
        if ($request->hasFile('images')) {
            $rules['images'] = 'nullable|array|max:5';
            $rules['images.*'] = 'nullable|image|mimes:jpeg,png,gif,webp|max:5120';
        }

        $validated = $request->validate($rules);

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
        ]);

        // Handle deleted images
        if ($request->has('deleted_images')) {
            $deletedUrls = $request->input('deleted_images', []);
            if (!is_array($deletedUrls)) {
                $deletedUrls = [$deletedUrls];
            }
            
            foreach ($deletedUrls as $deletedUrl) {
                if ($deletedUrl) {
                    // Find image by URL - try exact match first, then fallback to pattern matching
                    $image = ProductImage::where('image_url', $deletedUrl)->first();
                    
                    // If not exact match, try matching by filename
                    if (!$image) {
                        $filename = basename(parse_url($deletedUrl, PHP_URL_PATH));
                        $image = ProductImage::where('product_id', $product->id)
                            ->where('image_url', 'like', '%' . $filename)
                            ->first();
                    }
                    
                    if ($image) {
                        // Extract path from URL and delete file
                        $urlPath = parse_url($image->image_url, PHP_URL_PATH);
                        $storagePath = str_replace('/storage/', '', $urlPath);
                        if (Storage::disk('public')->exists($storagePath)) {
                            Storage::disk('public')->delete($storagePath);
                        }
                        $image->delete();
                    }
                }
            }
        }
        
        // Update images jika ada file baru
        if ($request->hasFile('images')) {
            // Simpan images baru
            foreach ($request->file('images') as $index => $imageFile) {
                if ($imageFile && $imageFile->isValid()) {
                    $path = $imageFile->store('products', 'public');
                    // Create full URL pointing to Laravel backend
                    $imageUrl = url('/storage/' . $path);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imageUrl,
                        'order' => $index,
                    ]);
                }
            }
        }

        // Load images relation
        $product->load('images');

        return response()->json([
            'status' => true,
            'message' => 'Produk berhasil diupdate',
            'data' => $product
        ], 200);
    }

    /**
     * Hapus Produk
     */
    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        // Delete image files
        foreach ($product->images as $image) {
            // Handle both full URLs dan relative paths
            $urlPath = parse_url($image->image_url, PHP_URL_PATH);
            $storagePath = str_replace('/storage/', '', $urlPath);
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }

        $product->delete();

        return response()->json([
            'status' => true,
            'message' => 'Produk berhasil dihapus'
        ], 200);
    }
}
