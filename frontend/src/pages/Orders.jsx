import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Orders() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/orders");
                setOrders(res.data.data || []);
            } catch (err) {
                if (err?.response?.status === 401) nav("/login");
            } finally {
                setLoading(false);
            }
        })();
    }, [nav]);

    return (
        <div className="container page">
            <div className="surface" style={{ padding: 18 }}>
                <h1 className="h1">Your Orders</h1>
                <div className="subtle" style={{ marginTop: 6 }}>Order history for your account.</div>

                {loading ? (
                    <div style={{ marginTop: 14 }}>Loading...</div>
                ) : orders.length ? (
                    <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                        {orders.map((o) => (
                            <Link key={o.id} to={`/orders/${o.id}`} className="surface" style={{ padding: 14, borderRadius: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <div style={{ fontWeight: 900 }}>Order #{o.id}</div>
                                    <div className="pill">{o.status}</div>
                                </div>
                                <div className="subtle" style={{ marginTop: 6 }}>
                                    Items: {o.items_count} • Total: €{(o.total / 100).toFixed(2)}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginTop: 14 }}>No orders yet.</div>
                )}
            </div>
        </div>
    );
}
