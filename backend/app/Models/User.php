<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Hidden attributes for serialization
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /* ============================================================
     |  Wishlist Relationships
     |============================================================
     */

    /**
     * Wishlist items (pivot-style model)
     */
    public function wishlistItems()
    {
        return $this->hasMany(\App\Models\WishlistItem::class);
    }

    /**
     * Wishlist products (direct access)
     */
    public function wishlistProducts()
    {
        return $this->belongsToMany(
            \App\Models\Product::class,
            'wishlist_items'
        )->withTimestamps();
    }

    /* ============================================================
     |  Optional: Role helpers (nice for admin features later)
     |============================================================
     */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }
}
