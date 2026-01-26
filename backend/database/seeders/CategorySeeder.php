<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Electronics',
            'Home Appliances',
            'Plants & Garden',
            'Musical Instruments',
            'Clothing',
            'Smart Devices',
            'Sports & Outdoor',
            'Home & Kitchen',
            'Books',
            'Beauty & Skincare',
        ];

        foreach ($names as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
