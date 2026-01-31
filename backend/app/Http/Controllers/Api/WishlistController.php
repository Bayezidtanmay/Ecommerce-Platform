<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    // GET /api/wishlist
    public function index(Request $request)
    {
        $user = $request->user();

        $items = WishlistItem::query()
            ->where('user_id', $user->id)
            ->with([
                'product' => function ($q) {
                    $q->with([
                        'category:id,name,slug',
                        'primaryImage:id,product_id,url,is_primary',
                    ])->select('id', 'category_id', 'name', 'slug', 'description', 'price', 'compare_at_price', 'stock', 'is_active');
                }
            ])
            ->latest()
            ->get();

        // Useful for Shop page: a list of product IDs
        $productIds = $items->pluck('product_id')->values();

        return response()->json([
            'items' => $items,
            'product_ids' => $productIds,
        ]);
    }

    // POST /api/wishlist/toggle  { product_id }
    public function toggle(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $userId = $request->user()->id;

        // (Optional) Ensure only active products can be wishlisted
        $product = Product::where('id', $data['product_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $existing = WishlistItem::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'in_wishlist' => false,
                'message' => 'Removed from wishlist',
            ]);
        }

        WishlistItem::create([
            'user_id' => $userId,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'in_wishlist' => true,
            'message' => 'Added to wishlist',
        ]);
    }

    // DELETE /api/wishlist/items/{productId}
    public function destroy(Request $request, int $productId)
    {
        $userId = $request->user()->id;

        WishlistItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'message' => 'Removed from wishlist',
        ]);
    }
}
