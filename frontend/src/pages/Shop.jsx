import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Shop() {
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);

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
            alert("Added to cart!");
        } catch (err) {
            if (err?.response?.status === 401) {
                alert("Please login first.");
                nav("/login");
                return;
            }
            alert(err?.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                }}
            >
                <h1 style={{ fontSize: 28, margin: 0 }}>Shop</h1>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => nav("/cart")}
                        style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            background: "white",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Go to Cart
                    </button>

                    <button
                        onClick={() => nav("/login")}
                        style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: 0,
                            background: "#111827",
                            color: "white",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p style={{ marginBottom: 16 }}>
                        Page {meta?.current} of {meta?.last}
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 16,
                        }}
                    >
                        {products.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 14,
                                    padding: 12,
                                    background: "white",
                                }}
                            >
                                <img
                                    src={p.primary_image?.url || "https://picsum.photos/seed/fallback/600/600"}
                                    alt={p.name}
                                    style={{
                                        width: "100%",
                                        borderRadius: 12,
                                        aspectRatio: "1 / 1",
                                        objectFit: "cover",
                                    }}
                                />

                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ opacity: 0.7, fontSize: 14 }}>
                                        {p.category?.name}
                                    </div>
                                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                                        €{(p.price / 100).toFixed(2)}
                                    </div>

                                    <button
                                        onClick={() => addToCart(p.id)}
                                        disabled={addingId === p.id}
                                        style={{
                                            marginTop: 10,
                                            width: "100%",
                                            padding: 10,
                                            borderRadius: 10,
                                            border: 0,
                                            background: addingId === p.id ? "#93c5fd" : "#2563eb",
                                            color: "white",
                                            fontWeight: 700,
                                            cursor: addingId === p.id ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {addingId === p.id ? "Adding..." : "Add to cart"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

