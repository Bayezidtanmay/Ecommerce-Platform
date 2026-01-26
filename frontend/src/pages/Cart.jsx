import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Cart() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(null);
    const [subtotal, setSubtotal] = useState(0);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/cart");
            setCart(res.data.cart);
            setSubtotal(res.data.subtotal);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) return <div style={{ padding: 16 }}>Loading cart...</div>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Cart</h1>

            {cart?.items?.length ? (
                <>
                    <div style={{ display: "grid", gap: 12 }}>
                        {cart.items.map((it) => (
                            <div
                                key={it.id}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    padding: 12,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 12,
                                }}
                            >
                                <img
                                    src={it.product?.primary_image?.url || "https://picsum.photos/seed/fallback/200/200"}
                                    alt={it.product?.name}
                                    style={{ width: 90, height: 90, borderRadius: 10, objectFit: "cover" }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800 }}>{it.product?.name}</div>
                                    <div style={{ opacity: 0.7, fontSize: 14 }}>
                                        Qty: {it.qty} • €{(it.unit_price / 100).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 900 }}>
                                    €{((it.qty * it.unit_price) / 100).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 16, textAlign: "right", fontSize: 18, fontWeight: 900 }}>
                        Subtotal: €{(subtotal / 100).toFixed(2)}
                    </div>
                </>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
}
