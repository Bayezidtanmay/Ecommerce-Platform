import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Toast from "../components/Toast";
import TopNav from "../components/TopNav";

const money = (cents) => `€${(cents / 100).toFixed(2)}`;

export default function Wishlist() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const [toasts, setToasts] = useState([]);
    const pushToast = (title, text) => {
        const id = Date.now() + Math.random();
        setToasts((p) => [...p, { id, title, text }]);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const hasToken = useMemo(() => !!localStorage.getItem("token"), []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/wishlist");
            setItems(res.data?.items || []);
        } catch (err) {
            if (err?.response?.status === 401) return nav("/login");
            pushToast("Error", err?.response?.data?.message || "Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasToken) nav("/login");
        else load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = async (productId) => {
        try {
            await api.delete(`/wishlist/items/${productId}`);
            setItems((prev) => prev.filter((x) => x.product_id !== productId));
            pushToast("Removed", "Item removed from wishlist.");
        } catch (err) {
            pushToast("Error", err?.response?.data?.message || "Failed to remove");
        }
    };

    return (
        <>
            <TopNav />

            <div className="container page">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <h1 className="h1">Wishlist</h1>
                        <div className="subtle">Your saved products.</div>
                    </div>
                    {!loading && <div className="pill">{items.length} item(s)</div>}
                </div>

                {loading ? (
                    <div className="surface" style={{ marginTop: 16, padding: 16 }}>Loading wishlist...</div>
                ) : !items.length ? (
                    <div className="surface" style={{ marginTop: 16, padding: 16 }}>
                        Your wishlist is empty.
                        <div style={{ marginTop: 10 }}>
                            <button className="btn btnPrimary" onClick={() => nav("/shop")}>Browse Shop</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        {items.map((it) => {
                            const p = it.product;
                            const img = p?.primary_image?.url || "https://picsum.photos/seed/fallback/800/800";
                            const sale = p?.compare_at_price && p.compare_at_price > p.price;
                            const pct = sale ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;

                            return (
                                <div key={it.id} className="surface" style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)" }}>
                                    <div style={{ position: "relative", height: 180 }}>
                                        {sale && (
                                            <div className="saleBadge" style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
                                                SALE -{pct}%
                                            </div>
                                        )}
                                        <img
                                            src={img}
                                            alt={p?.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            onClick={() => nav(`/products/${p.slug}`)}
                                        />
                                    </div>

                                    <div style={{ padding: 14 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                            <div>
                                                <div style={{ fontWeight: 900 }}>{p?.name}</div>
                                                <div className="subtle" style={{ marginTop: 2 }}>{p?.category?.name}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontWeight: 900 }}>{money(p?.price || 0)}</div>
                                                {sale && (
                                                    <div style={{ marginTop: 2, fontSize: 12, opacity: 0.65, textDecoration: "line-through" }}>
                                                        {money(p.compare_at_price)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                                            <button className="btn" style={{ flex: 1 }} onClick={() => nav(`/products/${p.slug}`)}>
                                                View
                                            </button>
                                            <button className="btn" style={{ flex: 1 }} onClick={() => remove(it.product_id)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Toast toasts={toasts} removeToast={removeToast} />
        </>
    );
}
