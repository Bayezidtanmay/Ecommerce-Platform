import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

const STEPS = ["pending", "paid", "shipped", "completed"];
const ALL_STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function OrderDetails() {
    const { id } = useParams();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    const [me, setMe] = useState(null);
    const isAdmin = me?.role === "admin";

    const [statusDraft, setStatusDraft] = useState("pending");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [meRes, orderRes] = await Promise.all([
                api.get("/me"),
                api.get(`/orders/${id}`),
            ]);
            setMe(meRes.data);
            setOrder(orderRes.data);
            setStatusDraft(orderRes.data.status);
        } catch (err) {
            if (err?.response?.status === 401) return nav("/login");
            setError(err?.response?.data?.message || "Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const progressIndex = useMemo(() => {
        if (!order) return -1;
        if (order.status === "cancelled") return -1;
        return STEPS.indexOf(order.status);
    }, [order]);

    const updateStatus = async () => {
        if (!order) return;
        setSaving(true);
        setError("");
        try {
            const res = await api.patch(`/orders/${order.id}/status`, {
                status: statusDraft,
            });
            // res might return {order} or just message. We'll reload to be safe.
            await load();
        } catch (err) {
            if (err?.response?.status === 401) return nav("/login");
            if (err?.response?.status === 403) {
                setError("Forbidden: Admin access required.");
                return;
            }
            setError(err?.response?.data?.message || "Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>
                    Not found
                </div>
            </div>
        );
    }

    return (
        <div className="container page">
            <div className="surface" style={{ padding: 18 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 className="h1" style={{ margin: 0 }}>
                            Order #{order.id}
                        </h1>
                        <div className="subtle" style={{ marginTop: 6 }}>
                            Total: €{(order.total / 100).toFixed(2)}
                        </div>
                    </div>

                    <div className="pill" style={{ textTransform: "capitalize" }}>
                        {order.status}
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(255,92,122,.35)",
                            background: "rgba(255,92,122,.12)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Status progress */}
                <div style={{ marginTop: 16 }}>
                    <div className="subtle" style={{ marginBottom: 10 }}>
                        Order progress
                    </div>

                    {order.status === "cancelled" ? (
                        <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
                            <div style={{ fontWeight: 900 }}>Cancelled</div>
                            <div className="subtle">
                                This order has been cancelled.
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
                                gap: 10,
                            }}
                        >
                            {STEPS.map((s, idx) => {
                                const active = idx <= progressIndex;
                                return (
                                    <div
                                        key={s}
                                        className="surface"
                                        style={{
                                            padding: 12,
                                            borderRadius: 16,
                                            textAlign: "center",
                                            opacity: active ? 1 : 0.55,
                                            border: active
                                                ? "1px solid rgba(79,140,255,.35)"
                                                : undefined,
                                            transform: active ? "translateY(-1px)" : "none",
                                            transition: "transform .2s ease, opacity .2s ease",
                                        }}
                                    >
                                        <div style={{ fontWeight: 900 }}>{label(s)}</div>
                                        <div className="subtle">{active ? "Done" : "Pending"}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Admin controls */}
                {isAdmin && (
                    <div style={{ marginTop: 16 }}>
                        <div className="subtle" style={{ marginBottom: 10 }}>
                            Admin controls
                        </div>

                        <div
                            className="surface"
                            style={{
                                padding: 14,
                                borderRadius: 16,
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <select
                                value={statusDraft}
                                onChange={(e) => setStatusDraft(e.target.value)}
                                className="input"
                                style={{ width: 220, cursor: "pointer" }}
                            >
                                {ALL_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {label(s)}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="btn btnPrimary"
                                onClick={updateStatus}
                                disabled={saving || statusDraft === order.status}
                                style={{ padding: "12px 16px", fontWeight: 900 }}
                            >
                                {saving ? "Updating..." : "Update status"}
                            </button>

                            <div className="subtle">
                                Current: <span style={{ fontWeight: 900, textTransform: "capitalize" }}>{order.status}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items */}
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    {order.items.map((it) => (
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
                                <div style={{ fontWeight: 900 }}>{it.product?.name}</div>
                                <div className="subtle">
                                    Qty: {it.qty} • €{(it.unit_price / 100).toFixed(2)} each
                                </div>
                            </div>

                            <div style={{ fontWeight: 900 }}>
                                €{((it.qty * it.unit_price) / 100).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer buttons */}
                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => nav("/orders")}>
                        Back to orders
                    </button>
                    <button className="btn btnPrimary" onClick={() => nav("/shop")}>
                        Continue shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

