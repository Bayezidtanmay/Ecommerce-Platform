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
            ->with(['category:id,name,slug', 'primaryImage:id,product_id,url,is_primary']);

        // search by name
        if ($search = $request->query('search')) {
            $q->where('name', 'like', '%' . $search . '%');
        }

        // filter by category slug
        if ($cat = $request->query('category')) {
            $q->whereHas('category', fn($cq) => $cq->where('slug', $cat));
        }

        // price filters (in cents)
        if ($min = $request->query('minPrice')) {
            $q->where('price', '>=', (int)$min);
        }
        if ($max = $request->query('maxPrice')) {
            $q->where('price', '<=', (int)$max);
        }

        // sort
        $sort = $request->query('sort', 'newest');
        if ($sort === 'price_asc') $q->orderBy('price', 'asc');
        elseif ($sort === 'price_desc') $q->orderBy('price', 'desc');
        else $q->latest();

        return $q->paginate(12);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category:id,name,slug', 'images:id,product_id,url,is_primary'])
            ->firstOrFail();

        return response()->json($product);
    }
}
