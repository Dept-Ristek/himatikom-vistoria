<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Kaos HIMATIKOM Biru',
                'description' => 'Bahan Cotton Combed 30s, sablon plastisol. Wajib angkatan baru!',
                'price' => 85000,
                'stock' => 50,
                'image' => 'https://placehold.co/400x400/2563eb/ffffff?text=Kaos+HIMATIKOM',
            ],
            [
                'name' => 'Tumbler Premium',
                'description' => 'Tumbler stainless steel, bisa menahan air panas dingin 12 jam. Stiker Logo laser.',
                'price' => 45000,
                'stock' => 30,
                'image' => 'https://placehold.co/400x400/1d4ed8/ffffff?text=Tumbler',
            ],
            [
                'name' => 'Notebook JTIK',
                'description' => 'Buku tulis berbahan kertas HVS 80gr, 100 lembar.',
                'price' => 15000,
                'stock' => 100,
                'image' => 'https://placehold.co/400x400/60a5fa/ffffff?text=Notebook',
            ],
            [
                'name' => 'ID Card Holder',
                'description' => 'Kartu tanda pengenal anggota. Warna hitam doff.',
                'price' => 5000,
                'stock' => 200,
                'image' => 'https://placehold.co/400x400/0f172a/ffffff?text=ID+Holder',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}