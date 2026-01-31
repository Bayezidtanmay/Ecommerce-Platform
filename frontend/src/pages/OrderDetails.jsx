import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Toast from "../components/Toast";

const money = (cents) => `€${(cents / 100).toFixed(2)}`;

function buildTimeline(order) {
    const status = (order?.status || "placed").toLowerCase();

    const steps = [
        { key: "placed", label: "Order placed" },
        { key: "processing", label: "Processing" },
        { key: "shipped", label: "Shipped" },
        { key: "delivered", label: "Delivered" },
    ];

    // basic status -> progress mapping
    const idx =
        status === "delivered" ? 3 :
            status === "shipped" ? 2 :
                status === "processing" ? 1 :
                    0;

    return steps.map((s, i) => ({ ...s, done: i <= idx, active: i === idx }));
}

export default function OrderDetails() {
    const { id } = useParams();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    const [toasts, setToasts] = useState([]);
    const pushToast = (title, text) => {
        const tid = Date.now() + Math.random();
        setToasts((p) => [...p, { id: tid, title, text }]);
    };
    const removeToast = (tid) => setToasts((p) => p.filter((t) => t.id !== tid));

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const res = await api.get(`/orders/${id}`);
                if (!mounted) return;
                setOrder(res.data);
            } catch (err) {
                if (err?.response?.status === 401) {
                    nav("/login");
                    return;
                }
                pushToast("Error", err?.response?.data?.message || "Order not found");
                setOrder(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const timeline = buildTimeline(order);

    if (loading) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>Loading order...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>
                    Order not found.
                    <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn" onClick={() => nav("/orders")}>Back to orders</button>
                        <button className="btn btnPrimary" onClick={() => nav("/shop")}>Shop</button>
                    </div>
                </div>
                <Toast toasts={toasts} removeToast={removeToast} />
            </div>
        );
    }

    return (
        <>
            <div className="container page">
                <div className="surface" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div className="subtle" style={{ cursor: "pointer" }} onClick={() => nav("/orders")}>
                                ← Back to orders
                            </div>
                            <h1 className="h1" style={{ marginTop: 8, marginBottom: 6 }}>Order #{order.id}</h1>
                            <div className="subtle">
                                Status: <span style={{ fontWeight: 900, opacity: 0.95 }}>{(order.status || "placed").toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="pill" style={{ textTransform: "none" }}>
                            Total: {money(order.total_cents ?? order.total ?? 0)}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="surface" style={{ marginTop: 16, padding: 16, borderRadius: 18 }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>Order timeline</div>
                        <div className="subtle" style={{ marginTop: 4 }}>Track your order progress.</div>

                        <div className="timeline" style={{ marginTop: 14 }}>
                            {timeline.map((s) => (
                                <div key={s.key} className={`tStep ${s.done ? "tDone" : ""} ${s.active ? "tActive" : ""}`}>
                                    <div className="tDot" />
                                    <div>
                                        <div style={{ fontWeight: 900 }}>{s.label}</div>
                                        <div className="subtle" style={{ marginTop: 2 }}>
                                            {s.done ? "Completed" : s.active ? "In progress" : "Pending"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="surface" style={{ marginTop: 16, padding: 16, borderRadius: 18 }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>Items</div>

                        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                            {(order.items || []).map((it) => (
                                <div key={it.id} className="surface" style={{ padding: 14, borderRadius: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                        <div style={{ fontWeight: 900 }}>{it.product?.name || "Product"}</div>
                                        <div style={{ fontWeight: 900 }}>{money(it.price_cents ?? it.price ?? 0)}</div>
                                    </div>
                                    <div className="subtle" style={{ marginTop: 4 }}>
                                        Qty: {it.qty}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!order.items?.length ? (
                            <div className="subtle" style={{ marginTop: 10 }}>No items found for this order.</div>
                        ) : null}
                    </div>
                </div>
            </div>

            <Toast toasts={toasts} removeToast={removeToast} />

            <style>{`
        .timeline{
          display:grid;
          gap:12px;
        }
        .tStep{
          display:flex;
          gap:12px;
          align-items:flex-start;
          padding:12px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.04);
        }
        .tDot{
          width:14px;
          height:14px;
          border-radius:999px;
          margin-top:4px;
          border: 2px solid rgba(255,255,255,.30);
          background: transparent;
          flex: 0 0 auto;
        }
        .tDone .tDot{
          border-color: rgba(79,140,255,.65);
          background: rgba(79,140,255,.40);
        }
        .tActive{
          border-color: rgba(79,140,255,.35);
          box-shadow: 0 0 0 4px rgba(79,140,255,.06);
        }
      `}</style>
        </>
    );
}


