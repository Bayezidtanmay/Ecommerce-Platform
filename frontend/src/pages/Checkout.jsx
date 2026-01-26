import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Checkout() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        full_name: "Bayzid",
        phone: "+358000000",
        address_line1: "Street 10",
        address_line2: "",
        city: "Helsinki",
        postal_code: "00100",
    });

    const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const placeOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                full_name: form.full_name,
                phone: form.phone,
                address_line1: form.address_line1,
                address_line2: form.address_line2 || null,
                city: form.city,
                postal_code: form.postal_code,
            };

            const res = await api.post("/checkout", payload);
            nav(`/orders/${res.data.order.id}`);
        } catch (err) {
            if (err?.response?.status === 401) return nav("/login");

            // Laravel validation errors look like: { message, errors: { field: ["..."] } }
            const msg =
                err?.response?.data?.message ||
                (err?.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(" ")
                    : null) ||
                "Checkout failed";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container page">
            <div className="surface" style={{ padding: 18 }}>
                <h1 className="h1">Checkout</h1>
                <div className="subtle" style={{ marginTop: 6 }}>
                    Enter delivery details to place your order.
                </div>

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

                <form onSubmit={placeOrder} style={{ display: "grid", gap: 10, marginTop: 14 }}>
                    <input
                        className="input"
                        value={form.full_name}
                        onChange={(e) => onChange("full_name", e.target.value)}
                        placeholder="Full name"
                    />

                    <input
                        className="input"
                        value={form.phone}
                        onChange={(e) => onChange("phone", e.target.value)}
                        placeholder="Phone"
                    />

                    <input
                        className="input"
                        value={form.address_line1}
                        onChange={(e) => onChange("address_line1", e.target.value)}
                        placeholder="Address line 1"
                    />

                    <input
                        className="input"
                        value={form.address_line2}
                        onChange={(e) => onChange("address_line2", e.target.value)}
                        placeholder="Address line 2 (optional)"
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input
                            className="input"
                            value={form.city}
                            onChange={(e) => onChange("city", e.target.value)}
                            placeholder="City"
                        />
                        <input
                            className="input"
                            value={form.postal_code}
                            onChange={(e) => onChange("postal_code", e.target.value)}
                            placeholder="Postal code"
                        />
                    </div>

                    <button
                        className="btn btnPrimary"
                        disabled={loading}
                        style={{ padding: 12, borderRadius: 14, fontWeight: 900 }}
                    >
                        {loading ? "Placing order..." : "Place order"}
                    </button>

                    <button type="button" className="btn" onClick={() => nav("/cart")}>
                        Back to cart
                    </button>
                </form>
            </div>
        </div>
    );
}

