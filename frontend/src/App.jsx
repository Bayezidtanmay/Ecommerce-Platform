import { Routes, Route, Navigate } from "react-router-dom";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" replace />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
}


