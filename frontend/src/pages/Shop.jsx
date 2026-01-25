import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Shop() {
    const [loading, setLoading] = useState(true);
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
        return () => { mounted = false; };
    }, []);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Shop</h1>

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
                                    style={{ width: "100%", borderRadius: 12, aspectRatio: "1/1", objectFit: "cover" }}
                                />
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ opacity: 0.7, fontSize: 14 }}>{p.category?.name}</div>
                                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                                        €{(p.price / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
