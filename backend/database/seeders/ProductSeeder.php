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
        $cat = fn(string $name) => Category::where('name', $name)->firstOrFail();

        /**
         * Stable Unsplash image helper (direct images.unsplash.com)
         * Use photo IDs from Unsplash (the part after "photo-")
         * Example: https://images.unsplash.com/photo-1518441902112-f0a9d2f6b8a4?...
         */
        $img = fn(string $id) => "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=1200&q=80";

        $items = [
            // ===================== Electronics =====================
            [
                'category' => 'Electronics',
                'name' => 'Noise Cancelling Headphones',
                'price' => 12999,
                'compare_at_price' => 15999,
                'stock' => 25,
                'description' => 'Premium ANC headphones with deep bass and all-day comfort.',
                'images' => [
                    $img('1518441902112-f0a9d2f6b8a4'),
                    $img('1526170375885-4d8ecf77b99f'),
                ],
            ],
            [
                'category' => 'Electronics',
                'name' => '4K Action Camera',
                'price' => 8999,
                'compare_at_price' => null,
                'stock' => 18,
                'description' => 'Compact 4K action cam with stabilization and waterproof case.',
                'images' => [
                    $img('1526170375885-4d8ecf77b99f'),
                    $img('1519183071298-a2962be90b8e'),
                ],
            ],
            [
                'category' => 'Electronics',
                'name' => 'Mechanical Keyboard',
                'price' => 7999,
                'compare_at_price' => 9999,
                'stock' => 30,
                'description' => 'Tactile switches, clean sound, and a solid aluminum frame.',
                'images' => [
                    $img('1517336714731-489689fd1ca8'),
                    $img('1541140134513-85aa6b7a3f1b'),
                ],
            ],

            // ===================== Home Appliances =====================
            [
                'category' => 'Home Appliances',
                'name' => 'Air Fryer XL',
                'price' => 11999,
                'compare_at_price' => 14999,
                'stock' => 20,
                'description' => 'Crispy results with less oil. Large basket for family meals.',
                'images' => [
                    $img('1625944230944-6eae31b819f4'),
                    $img('1604908554007-92ba0f9e8e1c'),
                ],
            ],
            [
                'category' => 'Home Appliances',
                'name' => 'Robot Vacuum Cleaner',
                'price' => 22999,
                'compare_at_price' => 27999,
                'stock' => 12,
                'description' => 'Smart mapping robot vacuum with auto-recharge and scheduling.',
                'images' => [
                    $img('1581579185169-3649f4b0aa6b'),
                    $img('1616628182504-1f0d5e17739f'),
                ],
            ],
            [
                'category' => 'Home Appliances',
                'name' => 'Espresso Machine',
                'price' => 19999,
                'compare_at_price' => null,
                'stock' => 10,
                'description' => 'Cafe-style espresso at home with a compact stainless build.',
                'images' => [
                    $img('1511920170033-f8396924c348'),
                    $img('1517701604595-3b3fd02b0a5a'),
                ],
            ],

            // ===================== Plants & Garden =====================
            [
                'category' => 'Plants & Garden',
                'name' => 'Monstera Deliciosa Plant',
                'price' => 2999,
                'compare_at_price' => null,
                'stock' => 40,
                'description' => 'Popular indoor plant with iconic split leaves. Easy care.',
                'images' => [
                    $img('1501004318641-b39e6451bec6'),
                    $img('1524594150408-6a7d35f9d88a'),
                ],
            ],
            [
                'category' => 'Plants & Garden',
                'name' => 'Minimal Ceramic Planter',
                'price' => 1999,
                'compare_at_price' => 2499,
                'stock' => 60,
                'description' => 'Matte ceramic planter that fits modern interiors.',
                'images' => [
                    $img('1501004318641-b39e6451bec6'),
                    $img('1485955900006-10f4d324d411'),
                ],
            ],
            [
                'category' => 'Plants & Garden',
                'name' => 'Indoor Plant Starter Kit',
                'price' => 3499,
                'compare_at_price' => 4499,
                'stock' => 50,
                'description' => 'Everything you need to start your indoor plant collection.',
                'images' => [
                    $img('1459411552884-841db9b3cc2a'),
                    $img('1501004318641-b39e6451bec6'),
                ],
            ],

            // ===================== Musical Instruments =====================
            [
                'category' => 'Musical Instruments',
                'name' => 'Acoustic Guitar',
                'price' => 15999,
                'compare_at_price' => 18999,
                'stock' => 10,
                'description' => 'Warm tone acoustic guitar for beginners to intermediate players.',
                'images' => [
                    $img('1511379938547-c1f69419868d'),
                    $img('1519681393784-d120267933ba'),
                ],
            ],
            [
                'category' => 'Musical Instruments',
                'name' => 'Digital Piano Keyboard',
                'price' => 24999,
                'compare_at_price' => null,
                'stock' => 8,
                'description' => 'Full-size keys with realistic feel and built-in learning modes.',
                'images' => [
                    $img('1513883049090-d0b7439799bf'),
                    $img('1519681393784-d120267933ba'),
                ],
            ],
            [
                'category' => 'Musical Instruments',
                'name' => 'Studio Microphone',
                'price' => 8999,
                'compare_at_price' => 10999,
                'stock' => 14,
                'description' => 'Crisp vocal recording for streaming, podcasts, and music.',
                'images' => [
                    $img('1516280440614-37939bbacd81'),
                    $img('1511379938547-c1f69419868d'),
                ],
            ],

            // ===================== Clothing =====================
            [
                'category' => 'Clothing',
                'name' => 'Essential Hoodie',
                'price' => 4999,
                'compare_at_price' => 6999,
                'stock' => 35,
                'description' => 'Soft fleece hoodie with a clean minimal fit.',
                'images' => [
                    $img('1520975958221-2b1d7f90d7fa'),
                    $img('1520975958221-2b1d7f90d7fa'),
                ],
            ],
            [
                'category' => 'Clothing',
                'name' => 'Everyday Denim Jacket',
                'price' => 7999,
                'compare_at_price' => null,
                'stock' => 15,
                'description' => 'Classic denim jacket that pairs with anything.',
                'images' => [
                    $img('1520975958221-2b1d7f90d7fa'),
                    $img('1520975958221-2b1d7f90d7fa'),
                ],
            ],

            // ===================== Smart Devices =====================
            [
                'category' => 'Smart Devices',
                'name' => 'Smart Watch',
                'price' => 12999,
                'compare_at_price' => 14999,
                'stock' => 22,
                'description' => 'Fitness tracking, notifications, and a bright always-on display.',
                'images' => [
                    $img('1523275335684-37898b6c90d2'),
                    $img('1511707171634-5f897ff02aa9'),
                ],
            ],
            [
                'category' => 'Smart Devices',
                'name' => 'Smart Home Speaker',
                'price' => 6999,
                'compare_at_price' => null,
                'stock' => 30,
                'description' => 'Voice assistant speaker with rich audio and smart home control.',
                'images' => [
                    $img('1512446733611-9099a758e0e4'),
                    $img('1545454675-3531b543be5d'),
                ],
            ],

            // ===================== Sports & Outdoor =====================
            [
                'category' => 'Sports & Outdoor',
                'name' => 'Running Shoes',
                'price' => 8999,
                'compare_at_price' => 10999,
                'stock' => 25,
                'description' => 'Lightweight running shoes with responsive cushioning.',
                'images' => [
                    $img('1528701800489-20be3c12d0a0'),
                    $img('1528701800489-20be3c12d0a0'),
                ],
            ],
            [
                'category' => 'Sports & Outdoor',
                'name' => 'Hiking Backpack 30L',
                'price' => 6499,
                'compare_at_price' => null,
                'stock' => 18,
                'description' => 'Comfortable daypack with breathable back panel and pockets.',
                'images' => [
                    $img('1500530855697-b586d89ba3ee'),
                    $img('1519681393784-d120267933ba'),
                ],
            ],
        ];

        foreach ($items as $i) {
            $category = $cat($i['category']);
            $slug = Str::slug($i['name']);

            $p = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $i['name'],
                    'description' => $i['description'],
                    'price' => $i['price'],
                    'compare_at_price' => $i['compare_at_price'],
                    'stock' => $i['stock'],
                    'is_active' => true,
                ]
            );

            // Reset images for idempotent seeding
            ProductImage::where('product_id', $p->id)->delete();

            foreach ($i['images'] as $idx => $url) {
                ProductImage::create([
                    'product_id' => $p->id,
                    'url' => $url,
                    'is_primary' => $idx === 0,
                ]);
            }
        }
    }
}
