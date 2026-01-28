import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Toast from "../components/Toast";

const money = (cents) => `€${(cents / 100).toFixed(2)}`;

function stockLabel(stock) {
    if (stock <= 0) return { text: "Out of stock", tone: "danger" };
    if (stock <= 5) return { text: `Low stock (${stock})`, tone: "warn" };
    return { text: `In stock (${stock})`, tone: "ok" };
}

export default function ProductDetails() {
    const { slug } = useParams();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [p, setP] = useState(null);

    const [activeIdx, setActiveIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);

    const [toasts, setToasts] = useState([]);
    const pushToast = (title, text) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, title, text }]);
    };
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const res = await api.get(`/products/${slug}`);
                if (!mounted) return;
                setP(res.data);
                setActiveIdx(0);
                setQty(1);
            } catch (err) {
                pushToast("Not found", "Product not found.");
                setP(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const images = useMemo(() => {
        if (!p) return [];
        const list = Array.isArray(p.images) ? [...p.images] : [];

        // Ensure primary image is first
        list.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

        if (!list.length && p.primary_image?.url) {
            return [{ url: p.primary_image.url, is_primary: true }];
        }
        return list;
    }, [p]);

    const activeImage =
        images[activeIdx]?.url ||
        p?.primary_image?.url ||
        "https://picsum.photos/seed/fallback/1200/1200";

    const sale = p?.compare_at_price && p.compare_at_price > p.price;
    const pct = sale ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;

    const stock = p?.stock ?? 0;
    const stockInfo = stockLabel(stock);

    const addToCart = async () => {
        if (!p) return;
        if (stock <= 0) {
            pushToast("Unavailable", "This product is out of stock.");
            return;
        }

        setAdding(true);
        try {
            await api.post("/cart/items", { product_id: p.id, qty });
            pushToast("Added to cart", `Added ${qty} item(s).`);
        } catch (err) {
            if (err?.response?.status === 401) {
                pushToast("Login required", "Please login to add items to your cart.");
                nav("/login");
                return;
            }
            pushToast("Error", err?.response?.data?.message || "Failed to add to cart");
        } finally {
            setAdding(false);
        }
    };

    const openZoom = () => {
        setZoomScale(1);
        setZoomOpen(true);
    };

    const onWheelZoom = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        setZoomScale((s) => Math.min(2.6, Math.max(1, +(s + delta).toFixed(2))));
    };

    if (loading) {
        return (
            <div className="container page productDetails">
                <div className="surface" style={{ padding: 16 }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!p) {
        return (
            <div className="container page productDetails">
                <div className="surface" style={{ padding: 16 }}>
                    Product not found.
                    <div style={{ marginTop: 12 }}>
                        <button className="btn" onClick={() => nav("/shop")}>
                            Back to shop
                        </button>
                    </div>
                </div>
                <Toast toasts={toasts} removeToast={removeToast} />
            </div>
        );
    }

    return (
        <>
            <div className="container page productDetails">
                <div className="surface" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div
                                className="subtle"
                                style={{ marginBottom: 6, cursor: "pointer" }}
                                onClick={() => nav("/shop")}
                            >
                                ← Back to shop
                            </div>
                            <h1 className="h1" style={{ marginBottom: 6 }}>
                                {p.name}
                            </h1>
                            <div className="subtle">{p.category?.name}</div>
                        </div>

                        {/* FIXED STOCK BADGE (no pill) */}
                        <div className={`pdBadge pdBadge--${stockInfo.tone}`}>{stockInfo.text}</div>
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                            display: "grid",
                            gridTemplateColumns: "1.1fr .9fr",
                            gap: 16,
                        }}
                        className="pdGrid"
                    >
                        {/* Gallery */}
                        <div>
                            <div
                                className="pdHero"
                                style={{
                                    position: "relative",
                                    borderRadius: 18,
                                    overflow: "hidden",
                                    cursor: "zoom-in",
                                }}
                                onClick={openZoom}
                            >
                                {sale && (
                                    <div className="saleBadge" style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
                                        SALE {pct ? `-${pct}%` : ""}
                                    </div>
                                )}

                                <img
                                    src={activeImage}
                                    alt={p.name}
                                    onError={(e) => {
                                        e.currentTarget.src = "https://picsum.photos/seed/fallback/1200/1200";
                                    }}
                                    style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
                                />

                                <div className="pdHint">Click to zoom</div>
                            </div>

                            {/* Thumbnails */}
                            <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className="pdThumbBtn"
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={() => setActiveIdx(idx)}
                                        aria-label={`Image ${idx + 1}`}
                                        style={{
                                            borderRadius: 14,
                                            padding: 0,
                                            border:
                                                idx === activeIdx
                                                    ? "1px solid rgba(79,140,255,.55)"
                                                    : "1px solid rgba(255,255,255,.10)",
                                            overflow: "hidden",
                                            width: 74,
                                            height: 74,
                                            flex: "0 0 auto",
                                            cursor: "pointer",
                                            background: "transparent",
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            onError={(e) => {
                                                e.currentTarget.src = "https://picsum.photos/seed/fallback-thumb/200/200";
                                            }}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <div className="surface" style={{ padding: 16, borderRadius: 18 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                                    <div style={{ fontWeight: 900, fontSize: 22 }}>{money(p.price)}</div>

                                    {sale && (
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 13, opacity: 0.7, textDecoration: "line-through" }}>
                                                {money(p.compare_at_price)}
                                            </div>

                                            {/* FIXED SAVE BADGE (no pill) */}
                                            <div className="pdBadge pdBadge--muted" style={{ marginTop: 8 }}>
                                                Save {pct}%
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
                                    {p.description || "No description yet."}
                                </div>

                                {/* Quantity */}
                                <div style={{ marginTop: 14 }} className="pdQtyRow">
                                    <div className="subtle" style={{ minWidth: 72 }}>
                                        Quantity
                                    </div>

                                    <div className="pdQtyControls">
                                        <button
                                            type="button"
                                            className="pdQtyBtn"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            disabled={qty <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>

                                        {/* FIXED QTY VALUE (no pill) */}
                                        <div className="pdQtyValue" aria-label="Selected quantity">
                                            {qty}
                                        </div>

                                        <button
                                            type="button"
                                            className="pdQtyBtn"
                                            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
                                            disabled={stock > 0 ? qty >= stock : true}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="btn btnPrimary"
                                    onClick={addToCart}
                                    disabled={adding || stock <= 0}
                                    style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 16, fontWeight: 900 }}
                                >
                                    {stock <= 0 ? "Out of stock" : adding ? "Adding..." : "Add to cart"}
                                </button>

                                <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => nav("/cart")}>
                                    Go to cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zoom modal */}
            {zoomOpen && (
                <div
                    onClick={() => setZoomOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.65)",
                        display: "grid",
                        placeItems: "center",
                        padding: 16,
                        zIndex: 50,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="surface"
                        style={{
                            width: "min(980px, 96vw)",
                            borderRadius: 18,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,.12)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
                            <div style={{ fontWeight: 900 }}>{p.name}</div>

                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <button className="btn" onClick={() => setZoomScale((s) => Math.max(1, +(s - 0.2).toFixed(2)))}>
                                    -
                                </button>

                                {/* FIXED zoom percent chip */}
                                <div className="pdBadge pdBadge--muted">{Math.round(zoomScale * 100)}%</div>

                                <button className="btn" onClick={() => setZoomScale((s) => Math.min(2.6, +(s + 0.2).toFixed(2)))}>
                                    +
                                </button>

                                <button className="btn btnPrimary" onClick={() => setZoomOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>

                        <div
                            onWheel={onWheelZoom}
                            style={{
                                background: "rgba(0,0,0,.25)",
                                height: "min(72vh, 720px)",
                                overflow: "hidden",
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            <img
                                src={activeImage}
                                alt={p.name}
                                style={{
                                    transform: `scale(${zoomScale})`,
                                    transition: "transform .12s ease",
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    cursor: "zoom-out",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Scoped fixes so your global .pill doesn't mess up badges */}
            <style>{`
        @media (max-width: 920px) {
          .pdGrid { grid-template-columns: 1fr !important; }
          .pdHero img { height: 360px !important; }
        }

        .productDetails .pdHint{
          position:absolute;
          right:12px;
          bottom:12px;
          padding:6px 10px;
          border-radius:999px;
          font-weight:900;
          font-size:12px;
          background: rgba(0,0,0,.35);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        /* BADGES (replace pill) */
        .productDetails .pdBadge{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: 7px 12px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: .2px;
          line-height: 1;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,.16);
          background: rgba(0,0,0,.24);
          backdrop-filter: blur(10px);
        }

        .productDetails .pdBadge--ok{
          border-color: rgba(79,140,255,.35);
          background: rgba(79,140,255,.12);
        }
        .productDetails .pdBadge--warn{
          border-color: rgba(255,200,87,.35);
          background: rgba(255,200,87,.12);
        }
        .productDetails .pdBadge--danger{
          border-color: rgba(255,92,122,.35);
          background: rgba(255,92,122,.12);
        }
        .productDetails .pdBadge--muted{
          opacity: .9;
          background: rgba(255,255,255,.06);
          border-color: rgba(255,255,255,.14);
        }

        /* Quantity UI (no pill) */
        .productDetails .pdQtyRow{
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .productDetails .pdQtyControls{
          display:flex;
          align-items:center;
          gap: 10px;
        }

        .productDetails .pdQtyBtn{
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.92);
          font-weight: 900;
          cursor: pointer;
          transition: transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
        }

        .productDetails .pdQtyBtn:hover{
          transform: translateY(-1px);
          border-color: rgba(79,140,255,.35);
          background: rgba(79,140,255,.12);
        }

        .productDetails .pdQtyBtn:disabled{
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .productDetails .pdQtyValue{
          min-width: 56px;
          height: 40px;
          border-radius: 14px;
          display:grid;
          place-items:center;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(0,0,0,.22);
          font-weight: 900;
          white-space: nowrap;
        }
      `}</style>
        </>
    );
}

