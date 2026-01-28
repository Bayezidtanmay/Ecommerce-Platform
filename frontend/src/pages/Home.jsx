import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";

function getUserName() {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
        try {
            const u = JSON.parse(rawUser);
            if (u?.name) return u.name;
        } catch { }
    }
    return localStorage.getItem("user_name") || "there";
}

export default function Home() {
    const nav = useNavigate();
    const name = useMemo(() => getUserName(), []);

    return (
        <>
            <TopNav />

            <div className="container page">
                <div className="surface" style={{ padding: 18 }}>
                    <div className="pill" style={{ textTransform: "none", marginBottom: 14 }}>
                        👋 Welcome, {name}
                    </div>

                    <h1 className="h1" style={{ marginBottom: 10 }}>
                        Modern Commerce Platform
                    </h1>

                    <div className="subtle" style={{ fontSize: 16, marginBottom: 14 }}>
                        A thoughtfully designed shopping experience built with modern technologies and elegant UI principles.
                    </div>

                    <p style={{ color: "rgba(255,255,255,.75)", lineHeight: 1.6, maxWidth: 880 }}>
                        Discover curated products across electronics, home, lifestyle, plants, music, and more.
                        This project demonstrates a full-stack e-commerce flow including authentication, cart management,
                        checkout, order tracking, and an admin-controlled order workflow — all wrapped in a clean and modern interface.
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                        <button className="btn btnPrimary" onClick={() => nav("/shop")}>🛍️ Browse Shop</button>
                        <button className="btn" onClick={() => nav("/cart")}>🛒 View Cart</button>
                        <button className="btn" onClick={() => nav("/orders")}>📦 My Orders</button>
                    </div>
                </div>
            </div>
        </>
    );
}

