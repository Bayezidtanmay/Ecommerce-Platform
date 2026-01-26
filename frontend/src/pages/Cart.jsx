import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Cart() {
    const nav = useNavigate();

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

    if (loading) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>
                    Loading cart…
                </div>
            </div>
        );
    }

    return (
        <div className="container page">
            <div className="surface" style={{ padding: 18 }}>
                <h1 className="h1">Cart</h1>

                {cart?.items?.length ? (
                    <>
                        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                            {cart.items.map((it) => (
                                <div
                                    key={it.id}
                                    className="surface"
                                    style={{
                                        padding: 14,
                                        borderRadius: 16,
                                        display: "flex",
                                        gap: 12,
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        src={
                                            it.product?.primary_image?.url ||
                                            "https://picsum.photos/seed/fallback/200/200"
                                        }
                                        alt={it.product?.name}
                                        style={{
                                            width: 84,
                                            height: 84,
                                            borderRadius: 14,
                                            objectFit: "cover",
                                        }}
                                    />

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900 }}>
                                            {it.product?.name}
                                        </div>
                                        <div className="subtle">
                                            Qty: {it.qty} • €
                                            {(it.unit_price / 100).toFixed(2)} each
                                        </div>
                                    </div>

                                    <div style={{ fontWeight: 900 }}>
                                        €{((it.qty * it.unit_price) / 100).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: 20,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div style={{ fontSize: 18, fontWeight: 900 }}>
                                Subtotal: €{(subtotal / 100).toFixed(2)}
                            </div>

                            <button
                                className="btn btnPrimary"
                                onClick={() => nav("/checkout")}
                                style={{ padding: "12px 18px", fontWeight: 900 }}
                            >
                                Checkout
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ marginTop: 14 }}>
                        <p>Your cart is empty.</p>
                        <button className="btn" onClick={() => nav("/shop")}>
                            Continue shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

