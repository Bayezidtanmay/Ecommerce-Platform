<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();

        $sampleProducts = [
            ['name' => 'Wireless Headphones', 'price' => 5999, 'stock' => 25],
            ['name' => 'Smart Watch', 'price' => 12999, 'stock' => 12],
            ['name' => 'Minimal Backpack', 'price' => 4499, 'stock' => 40],
            ['name' => 'Running Shoes', 'price' => 8999, 'stock' => 20],
            ['name' => 'Coffee Grinder', 'price' => 3999, 'stock' => 18],
            ['name' => 'Skincare Serum', 'price' => 2499, 'stock' => 60],
            ['name' => 'Cookbook: Quick Meals', 'price' => 1999, 'stock' => 50],
            ['name' => 'Kids Building Blocks', 'price' => 2999, 'stock' => 30],
        ];

        foreach ($sampleProducts as $p) {
            $category = $categories->random();

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($p['name'])],
                [
                    'category_id' => $category->id,
                    'name' => $p['name'],
                    'description' => 'High-quality product with modern design and reliable performance.',
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'is_active' => true,
                ]
            );

            // attach 1-3 images (placeholder URLs)
            $urls = [
                "https://picsum.photos/seed/{$product->slug}-1/800/800",
                "https://picsum.photos/seed/{$product->slug}-2/800/800",
                "https://picsum.photos/seed/{$product->slug}-3/800/800",
            ];

            foreach ($urls as $i => $url) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'url' => $url],
                    ['is_primary' => $i === 0]
                );
            }
        }
    }
}
