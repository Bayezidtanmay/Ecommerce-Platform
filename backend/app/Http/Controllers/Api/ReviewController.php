<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(string $slug, Request $request)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $q = ProductReview::query()
            ->where('product_id', $product->id)
            ->with(['user:id,name'])
            ->latest();

        $reviews = $q->paginate(10);

        $avg = (float) ProductReview::where('product_id', $product->id)->avg('rating');
        $count = (int) ProductReview::where('product_id', $product->id)->count();

        $myReview = null;
        if ($request->user()) {
            $myReview = ProductReview::where('product_id', $product->id)
                ->where('user_id', $request->user()->id)
                ->first();
        }

        return response()->json([
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
            ],
            'summary' => [
                'avg_rating' => round($avg, 2),
                'reviews_count' => $count,
            ],
            'my_review' => $myReview,
            'reviews' => $reviews,
        ]);
    }

    public function store(string $slug, Request $request)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title'  => ['nullable', 'string', 'max:120'],
            'body'   => ['nullable', 'string', 'max:2000'],
        ]);

        $review = ProductReview::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
            ],
            [
                'rating' => $data['rating'],
                'title' => $data['title'] ?? null,
                'body' => $data['body'] ?? null,
            ]
        );

        $avg = (float) ProductReview::where('product_id', $product->id)->avg('rating');
        $count = (int) ProductReview::where('product_id', $product->id)->count();

        return response()->json([
            'message' => 'Review saved',
            'review' => $review->load(['user:id,name']),
            'summary' => [
                'avg_rating' => round($avg, 2),
                'reviews_count' => $count,
            ],
        ]);
    }

    public function destroy(string $slug, Request $request)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        ProductReview::where('product_id', $product->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        $avg = (float) ProductReview::where('product_id', $product->id)->avg('rating');
        $count = (int) ProductReview::where('product_id', $product->id)->count();

        return response()->json([
            'message' => 'Review deleted',
            'summary' => [
                'avg_rating' => round($avg, 2),
                'reviews_count' => $count,
            ],
        ]);
    }
}
