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
            'Fashion',
            'Home & Kitchen',
            'Sports',
            'Beauty',
            'Books',
            'Toys',
            'Groceries',
        ];

        foreach ($names as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
