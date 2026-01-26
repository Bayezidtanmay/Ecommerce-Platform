<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->load(['items.product.primaryImage']);

        $subtotal = $cart->items->sum(fn($i) => $i->qty * $i->unit_price);

        return response()->json([
            'cart' => $cart,
            'subtotal' => $subtotal,
        ]);
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['required', 'integer', 'min:1'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $product = Product::where('id', $data['product_id'])->where('is_active', true)->firstOrFail();

        if ($product->stock < $data['qty']) {
            return response()->json(['message' => 'Not enough stock'], 422);
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $newQty = $item->qty + $data['qty'];
            if ($product->stock < $newQty) {
                return response()->json(['message' => 'Not enough stock'], 422);
            }
            $item->update([
                'qty' => $newQty,
                'unit_price' => $product->price,
            ]);
        } else {
            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'qty' => $data['qty'],
                'unit_price' => $product->price,
            ]);
        }

        return $this->show($request);
    }

    public function updateItem(Request $request, int $id)
    {
        $data = $request->validate([
            'qty' => ['required', 'integer', 'min:1'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $item = CartItem::where('id', $id)->where('cart_id', $cart->id)->firstOrFail();
        $product = Product::where('id', $item->product_id)->where('is_active', true)->firstOrFail();

        if ($product->stock < $data['qty']) {
            return response()->json(['message' => 'Not enough stock'], 422);
        }

        $item->update([
            'qty' => $data['qty'],
            'unit_price' => $product->price,
        ]);

        return $this->show($request);
    }

    public function removeItem(Request $request, int $id)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        CartItem::where('id', $id)->where('cart_id', $cart->id)->delete();

        return $this->show($request);
    }
}
