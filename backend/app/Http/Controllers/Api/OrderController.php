<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        // IMPORTANT: match your orders table columns
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ]);

        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)
            ->with(['items.product'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        try {
            $order = DB::transaction(function () use ($user, $cart, $data) {

                $productIds = $cart->items->pluck('product_id')->unique()->values()->all();

                $products = Product::whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $subtotal = 0;

                foreach ($cart->items as $item) {
                    $p = $products[$item->product_id] ?? null;

                    if (!$p || !$p->is_active) {
                        throw new \Exception("Product not available");
                    }

                    if ($p->stock < $item->qty) {
                        throw new \Exception("Not enough stock for: {$p->name}");
                    }

                    $subtotal += ($item->qty * $p->price);
                }

                // keep it simple for now
                $shippingFee = 0;
                $total = $subtotal + $shippingFee;

                // ✅ FIX: include subtotal + shipping_fee + total
                $order = Order::create([
                    'user_id' => $user->id,
                    'subtotal' => $subtotal,
                    'shipping_fee' => $shippingFee,
                    'total' => $total,
                    'status' => 'pending',

                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'address_line1' => $data['address_line1'],
                    'address_line2' => $data['address_line2'] ?? null,
                    'city' => $data['city'],
                    'postal_code' => $data['postal_code'],
                ]);

                foreach ($cart->items as $item) {
                    $p = $products[$item->product_id];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $p->id,
                        'qty' => $item->qty,
                        'unit_price' => $p->price,
                    ]);

                    $p->update(['stock' => $p->stock - $item->qty]);
                }

                // Clear cart
                CartItem::where('cart_id', $cart->id)->delete();

                return $order;
            });

            $order->load(['items.product.primaryImage']);

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'Checkout failed',
            ], 422);
        }
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->latest()
            ->withCount('items')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, int $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['items.product.primaryImage'])
            ->firstOrFail();

        return response()->json($order);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,shipped,completed,cancelled'],
        ]);

        $order = \App\Models\Order::findOrFail($id);
        $order->status = $data['status'];
        $order->save();

        return response()->json([
            'message' => 'Order status updated',
            'order' => $order,
        ]);
    }
}
