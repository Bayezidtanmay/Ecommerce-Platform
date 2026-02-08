# Modern E-Commerce Platform 🛍️

A full-stack e-commerce web application built with **Laravel (API)** and **React (Vite)**.  
It includes a modern shopping experience with product discovery, wishlist/favorites, reviews & ratings, cart, checkout, and order tracking.

---

## ✨ Highlights

- **Modern UI** (glassmorphism look, responsive layout, smooth interactions)
- **Laravel REST API** with authentication (Sanctum)
- **React SPA** with clean routing and reusable components
- Built as a portfolio-grade full-stack project

---

## ✅ Features

### Storefront
- Browse products (paginated)
- Search products by name
- Filter by **category chips**
- Product details page:
  - Image gallery + zoom
  - Description, pricing, sale badge
  - Stock status + quantity selector
  - Add to cart

### Wishlist / Favorites ❤️
- Toggle favorites (heart icon) directly from product list
- Dedicated Wishlist page (only logged-in users)

### Reviews & Ratings ⭐
- Product ratings summary (average + review count)
- Logged-in users can:
  - Submit/update a review (rating 1–5 + optional title/body)
  - Delete their review
- Reviews list shown on product details page

### Cart & Checkout
- Add/remove items
- Quantity updates
- Checkout creates an order

### Orders
- Order details page with timeline / status tracking
- View past orders (if implemented in your UI)

---

## 🧱 Tech Stack

**Frontend**
- React + Vite
- React Router
- Axios API client
- Custom UI components (Toast, TopNav)

**Backend**
- Laravel (REST API)
- Laravel Sanctum (auth)
- Eloquent ORM + migrations + seeders

**Database**
- MySQL (recommended) or compatible SQL DB

---

## 📸 Screenshots

![Home page](<Screenshots/Home page.png>)
![Shop page](<Screenshots/Shop page.png>)
![Single product page](<Screenshots/Single-product page.png>)
![Cart page](<Screenshots/Cart page.png>)
![Order-tracking page](<Screenshots/Order-tracking page.png>)
![Wishlist items](<Screenshots/Wishlist items.png>)

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+ (recommended)
- Composer
- Node.js 18+ (recommended)
- MySQL (or another SQL DB)
- Laravel CLI (optional)

---

## 🔧 Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
