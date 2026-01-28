<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::query()
            ->where('is_active', true)
            ->with([
                'category:id,name,slug',
                'primaryImage:id,product_id,url,is_primary',
                // IMPORTANT: include images so frontend can hover-swap
                'images:id,product_id,url,is_primary',
            ]);

        // search by name
        if ($search = $request->query('search')) {
            $q->where('name', 'like', '%' . $search . '%');
        }

        // filter by category slug
        if ($cat = $request->query('category')) {
            $q->whereHas('category', fn($cq) => $cq->where('slug', $cat));
        }

        // price filters (in cents)
        if (($min = $request->query('minPrice')) !== null && $min !== '') {
            $q->where('price', '>=', (int) $min);
        }
        if (($max = $request->query('maxPrice')) !== null && $max !== '') {
            $q->where('price', '<=', (int) $max);
        }

        // sort
        $sort = $request->query('sort', 'newest');
        if ($sort === 'price_asc') $q->orderBy('price', 'asc');
        elseif ($sort === 'price_desc') $q->orderBy('price', 'desc');
        // Optional: sort by best discount (needs compare_at_price)
        elseif ($sort === 'discount') {
            $q->whereNotNull('compare_at_price')
                ->whereColumn('compare_at_price', '>', 'price')
                ->orderByRaw('(compare_at_price - price) DESC');
        } else $q->latest();

        // Ensure images have primary first (works for both shop + details)
        $products = $q->paginate(12);
        $products->getCollection()->transform(function ($p) {
            if ($p->relationLoaded('images') && $p->images) {
                $p->setRelation('images', $p->images->sortByDesc('is_primary')->values());
            }
            return $p;
        });

        return $products;
    }

    public function show(string $slug)
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'category:id,name,slug',
                'primaryImage:id,product_id,url,is_primary',
                'images:id,product_id,url,is_primary',
            ])
            ->firstOrFail();

        // Order images: primary first
        if ($product->relationLoaded('images') && $product->images) {
            $product->setRelation('images', $product->images->sortByDesc('is_primary')->values());
        }

        return response()->json($product);
    }
}
