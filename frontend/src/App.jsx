import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Main */}
      <Route path="/home" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:slug" element={<ProductDetails />} />

      {/* Cart + auth */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />

      {/* Wishlist */}
      <Route path="/wishlist" element={<Wishlist />} />

      {/* Orders */}
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />

      {/* Fallback */}
      <Route path="*" element={<div className="container page"><div className="surface" style={{ padding: 16 }}>Not found</div></div>} />
    </Routes>
  );
}



