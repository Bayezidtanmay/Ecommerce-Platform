<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);

/** Reviews (public read, auth write) */
Route::get('/products/{slug}/reviews', [ReviewController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products/{slug}/reviews', [ReviewController::class, 'store']);
    Route::delete('/products/{slug}/reviews', [ReviewController::class, 'destroy']);
});

/** Cart / Orders / Wishlist (example — keep yours as-is) */
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::get('/cart', [CartController::class, 'show']);
    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);

    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
});
