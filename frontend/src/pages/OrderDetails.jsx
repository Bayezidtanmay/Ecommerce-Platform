import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function OrderDetails() {
    const { id } = useParams();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (err) {
                if (err?.response?.status === 401) nav("/login");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, nav]);

    if (loading) return <div className="container page">Loading...</div>;
    if (!order) return <div className="container page">Not found</div>;

    return (
        <div className="container page">
            <div className="surface" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <h1 className="h1" style={{ margin: 0 }}>Order #{order.id}</h1>
                    <div className="pill">{order.status}</div>
                </div>

                <div className="subtle" style={{ marginTop: 8 }}>
                    Total: €{(order.total / 100).toFixed(2)}
                </div>

                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    {order.items.map((it) => (
                        <div key={it.id} className="surface" style={{ padding: 14, borderRadius: 16, display: "flex", gap: 12 }}>
                            <img
                                src={it.product?.primary_image?.url || "https://picsum.photos/seed/fallback/200/200"}
                                alt={it.product?.name}
                                style={{ width: 84, height: 84, borderRadius: 14, objectFit: "cover" }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 900 }}>{it.product?.name}</div>
                                <div className="subtle">Qty: {it.qty} • €{(it.unit_price / 100).toFixed(2)} each</div>
                            </div>
                            <div style={{ fontWeight: 900 }}>
                                €{((it.qty * it.unit_price) / 100).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                    <button className="btn" onClick={() => nav("/orders")}>Back to orders</button>
                    <button className="btn btnPrimary" onClick={() => nav("/shop")}>Continue shopping</button>
                </div>
            </div>
        </div>
    );
}
