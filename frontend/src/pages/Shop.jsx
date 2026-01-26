import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Toast from "../components/Toast";

export default function Shop() {
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);

    const [toasts, setToasts] = useState([]);
    const pushToast = (title, text) => {
        const id = Date.now() + Math.random();
        setToasts((p) => [...p, { id, title, text }]);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const hasToken = useMemo(() => !!localStorage.getItem("token"), []);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/products");
                if (!mounted) return;
                setProducts(res.data.data);
                setMeta({ current: res.data.current_page, last: res.data.last_page });
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const addToCart = async (productId) => {
        setAddingId(productId);
        try {
            await api.post("/cart/items", { product_id: productId, qty: 1 });
            pushToast("Added to cart", "Item added successfully. Click to dismiss.");
        } catch (err) {
            if (err?.response?.status === 401) {
                pushToast("Login required", "Please login to add items to your cart.");
                nav("/login");
                return;
            }
            pushToast("Error", err?.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingId(null);
        }
    };

    return (
        <>
            {/* Sticky nav */}
            <div className="nav">
                <div className="container navRow">
                    <div className="brand" onClick={() => nav("/shop")} style={{ cursor: "pointer" }}>
                        <div className="brandBadge" />
                        Modern Commerce
                    </div>

                    <div className="navActions">
                        <button className="btn" onClick={() => nav("/cart")}>Cart</button>
                        <button className="btn btnPrimary" onClick={() => nav("/login")}>
                            {hasToken ? "Account" : "Login"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container page">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
                    <div>
                        <h1 className="h1">Shop</h1>
                        <div className="subtle">Browse products and add them to your cart.</div>
                    </div>

                    {!loading && (
                        <div className="pill">
                            Page {meta?.current} / {meta?.last}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="surface" style={{ marginTop: 16, padding: 16 }}>
                        Loading products...
                    </div>
                ) : (
                    <div className="grid">
                        {products.map((p) => (
                            <div key={p.id} className="card">
                                <img
                                    className="thumb"
                                    src={p.primary_image?.url || "https://picsum.photos/seed/fallback/600/600"}
                                    alt={p.name}
                                    loading="lazy"
                                />

                                <div className="cardBody">
                                    <h3 className="cardTitle">{p.name}</h3>
                                    <div className="cardMeta">{p.category?.name}</div>
                                    <div className="cardPrice">€{(p.price / 100).toFixed(2)}</div>

                                    <div className="cardFooter">
                                        <button
                                            className={`btn btnPrimary`}
                                            onClick={() => addToCart(p.id)}
                                            disabled={addingId === p.id}
                                            style={{
                                                width: "100%",
                                                opacity: addingId === p.id ? 0.75 : 1,
                                                cursor: addingId === p.id ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {addingId === p.id ? "Adding..." : "Add to cart"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Toast toasts={toasts} removeToast={removeToast} />
        </>
    );
}


