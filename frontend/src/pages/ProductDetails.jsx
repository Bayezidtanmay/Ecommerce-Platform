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

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
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

    // Reviews state
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);

    const [myRating, setMyRating] = useState(0);
    const [myTitle, setMyTitle] = useState("");
    const [myBody, setMyBody] = useState("");
    const [savingReview, setSavingReview] = useState(false);

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
            } catch {
                pushToast("Not found", "Product not found.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    // Load reviews (slug-based!)
    const loadReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await api.get(`/products/${slug}/reviews`);
            setAvgRating(res.data?.avg_rating || 0);
            setReviewsCount(res.data?.reviews_count || 0);
            setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
            setMyReview(res.data?.my_review || null);

            if (res.data?.my_review) {
                setMyRating(res.data.my_review.rating || 0);
                setMyTitle(res.data.my_review.title || "");
                setMyBody(res.data.my_review.body || "");
            } else {
                setMyRating(0);
                setMyTitle("");
                setMyBody("");
            }
        } catch (err) {
            pushToast("Error", err?.response?.data?.message || "Failed to load reviews");
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const images = useMemo(() => {
        if (!p) return [];
        const list = Array.isArray(p.images) ? [...p.images] : [];
        list.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        if (!list.length && p.primary_image?.url) return [{ url: p.primary_image.url, is_primary: true }];
        return list;
    }, [p]);

    const activeImage = images[activeIdx]?.url || p?.primary_image?.url || "https://picsum.photos/seed/fallback/1200/1200";

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

    const saveReview = async () => {
        if (!myRating) return pushToast("Rating required", "Please select a star rating (1–5).");
        setSavingReview(true);
        try {
            await api.post(`/products/${slug}/reviews`, {
                rating: clamp(myRating, 1, 5),
                title: myTitle || null,
                body: myBody || null,
            });
            pushToast("Saved", "Thanks for your review!");
            await loadReviews();
        } catch (err) {
            if (err?.response?.status === 401) {
                pushToast("Login required", "Please login to leave a review.");
                nav("/login");
                return;
            }
            pushToast("Error", err?.response?.data?.message || "Could not save review");
        } finally {
            setSavingReview(false);
        }
    };

    const deleteMyReview = async () => {
        setSavingReview(true);
        try {
            await api.delete(`/products/${slug}/reviews`);
            pushToast("Deleted", "Your review was removed.");
            await loadReviews();
        } catch (err) {
            if (err?.response?.status === 401) {
                nav("/login");
                return;
            }
            pushToast("Error", err?.response?.data?.message || "Could not delete review");
        } finally {
            setSavingReview(false);
        }
    };

    const decQty = () => setQty((q) => Math.max(1, q - 1));
    const incQty = () => setQty((q) => Math.min(stock || 99, q + 1));

    if (loading) {
        return (
            <div className="container page">
                <div className="surface" style={{ padding: 16 }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!p) {
        return (
            <div className="container page">
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
            <div className="container page">
                <div className="surface" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div className="subtle" style={{ marginBottom: 6, cursor: "pointer" }} onClick={() => nav("/shop")}>
                                ← Back to shop
                            </div>

                            <h1 className="h1" style={{ marginBottom: 6 }}>
                                {p.name}
                            </h1>
                            <div className="subtle">{p.category?.name}</div>

                            {/* rating summary */}
                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, opacity: 0.9 }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} style={{ opacity: i < Math.round(avgRating) ? 1 : 0.35 }}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div className="subtle">
                                    {avgRating.toFixed(1)} / 5 • {reviewsCount} reviews
                                </div>
                            </div>
                        </div>

                        {/* ✅ FIXED stock badge (no circle) */}
                        <div className={`stockPill stockTone-${stockInfo.tone}`} title={stockInfo.text}>
                            {stockInfo.text}
                        </div>
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
                                style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "zoom-in" }}
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

                                <div className="zoomHint">Click to zoom</div>
                            </div>

                            {/* Thumbnails */}
                            <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className="pdThumbBtn"
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={() => setActiveIdx(idx)}
                                        style={{
                                            borderRadius: 14,
                                            padding: 0,
                                            border: idx === activeIdx ? "1px solid rgba(79,140,255,.55)" : "1px solid rgba(255,255,255,.10)",
                                            overflow: "hidden",
                                            width: 74,
                                            height: 74,
                                            flex: "0 0 auto",
                                            cursor: "pointer",
                                            background: "transparent",
                                        }}
                                        aria-label={`Image ${idx + 1}`}
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
                                            <div className="pill" style={{ display: "inline-flex", marginTop: 6 }}>
                                                Save {pct}%
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
                                    {p.description || "No description yet."}
                                </div>

                                {/* ✅ FIXED Quantity stepper */}
                                <div className="qtyRow">
                                    <div className="subtle" style={{ minWidth: 74 }}>
                                        Quantity
                                    </div>

                                    <div className="qtyStepper">
                                        <button className="qtyBtn" onClick={decQty} disabled={qty <= 1} type="button">
                                            −
                                        </button>

                                        <div className="qtyVal" aria-label="Quantity">
                                            {qty}
                                        </div>

                                        <button
                                            className="qtyBtn"
                                            onClick={incQty}
                                            disabled={stock > 0 ? qty >= stock : true}
                                            type="button"
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

                    {/* Reviews */}
                    <div className="surface" style={{ marginTop: 16, padding: 16, borderRadius: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 18 }}>Reviews</div>
                                <div className="subtle">Share your experience — it helps others.</div>
                            </div>

                            {/* Keep this as a pill, but make sure it never turns circular */}
                            <div className="pill" style={{ textTransform: "none", whiteSpace: "nowrap" }}>
                                {avgRating.toFixed(1)} ★ • {reviewsCount} reviews
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div className="subtle" style={{ marginBottom: 8 }}>
                                Your rating
                            </div>

                            {/* ✅ FIXED review star buttons */}
                            <div className="reviewStarsRow">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const val = i + 1;
                                    const active = val <= myRating;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            className={`reviewStarBtn ${active ? "reviewStarBtnActive" : ""}`}
                                            onClick={() => setMyRating(val)}
                                            aria-label={`${val} star`}
                                            title={`${val} star`}
                                        >
                                            ★
                                        </button>
                                    );
                                })}
                            </div>

                            <input
                                value={myTitle}
                                onChange={(e) => setMyTitle(e.target.value)}
                                placeholder="Title (optional)"
                                className="input"
                                style={{ marginTop: 12, width: "100%" }}
                            />

                            <textarea
                                value={myBody}
                                onChange={(e) => setMyBody(e.target.value)}
                                placeholder="Write a short review (optional)"
                                className="input"
                                rows={4}
                                style={{ marginTop: 10, width: "100%", resize: "vertical" }}
                            />

                            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button className="btn btnPrimary" onClick={saveReview} disabled={savingReview}>
                                    {savingReview ? "Saving..." : "Save review"}
                                </button>

                                <button
                                    className="btn"
                                    onClick={deleteMyReview}
                                    disabled={savingReview || (!myReview && !myRating && !myTitle && !myBody)}
                                >
                                    Delete my review
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: 14 }}>
                            {reviewsLoading ? (
                                <div className="subtle">Loading reviews…</div>
                            ) : reviews.length ? (
                                <div style={{ display: "grid", gap: 10 }}>
                                    {reviews.map((r) => (
                                        <div key={r.id} className="surface" style={{ padding: 14, borderRadius: 16 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                                <div style={{ fontWeight: 900 }}>{r.user?.name || "Anonymous"}</div>
                                                <div style={{ opacity: 0.9 }}>
                                                    {"★".repeat(r.rating)}
                                                    {"☆".repeat(5 - r.rating)}
                                                </div>
                                            </div>
                                            {r.title ? <div style={{ marginTop: 6, fontWeight: 900 }}>{r.title}</div> : null}
                                            {r.body ? <div style={{ marginTop: 6, color: "rgba(255,255,255,.75)" }}>{r.body}</div> : null}
                                            <div className="subtle" style={{ marginTop: 8, fontSize: 12 }}>
                                                {new Date(r.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
                                    No reviews yet. Be the first ⭐
                                </div>
                            )}
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
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn" onClick={() => setZoomScale((s) => Math.max(1, +(s - 0.2).toFixed(2)))}>
                                    -
                                </button>
                                <div className="pill">{Math.round(zoomScale * 100)}%</div>
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

            <style>{`
        @media (max-width: 920px) {
          .pdGrid { grid-template-columns: 1fr !important; }
          .pdHero img { height: 360px !important; }
        }

        /* ✅ STOCK PILL FIX: never becomes a circle */
        .stockPill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.92);
          font-weight: 900;
          font-size: 13px;
          line-height: 1;
          white-space: nowrap;
          min-height: 38px;
        }
        .stockTone-danger { border-color: rgba(255,92,122,.40); }
        .stockTone-warn   { border-color: rgba(255,200,87,.40); }
        .stockTone-ok     { border-color: rgba(79,140,255,.40); }

        /* zoom hint */
        .zoomHint {
          position: absolute;
          right: 12px;
          bottom: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          background: rgba(0,0,0,.35);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(10px);
        }

        /* ✅ QUANTITY STEPPER FIX */
        .qtyRow {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .qtyStepper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .qtyBtn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.92);
          font-weight: 900;
          font-size: 18px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
          user-select: none;
        }
        .qtyBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(79,140,255,.35);
          background: rgba(79,140,255,.10);
        }
        .qtyBtn:disabled {
          opacity: .45;
          cursor: not-allowed;
          transform: none;
        }
        .qtyVal {
          min-width: 56px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          display: grid;
          place-items: center;
          font-weight: 900;
          color: rgba(255,255,255,.92);
        }

        /* ✅ REVIEW STAR BUTTONS FIX */
        .reviewStarsRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .reviewStarBtn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.70);
          font-weight: 900;
          font-size: 18px;
          line-height: 1;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform .12s ease, border-color .12s ease, background .12s ease, color .12s ease;
          user-select: none;
        }
        .reviewStarBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(79,140,255,.35);
          background: rgba(79,140,255,.10);
          color: rgba(255,255,255,.92);
        }
        .reviewStarBtnActive {
          border-color: rgba(79,140,255,.55);
          background: rgba(79,140,255,.16);
          color: rgba(255,255,255,.95);
          box-shadow: 0 10px 25px rgba(0,0,0,.18);
        }

        /* keep your existing tone helpers (safe if other pages still use them) */
        .pill[data-tone="danger"] { border-color: rgba(255,92,122,.35); }
        .pill[data-tone="warn"] { border-color: rgba(255,200,87,.35); }
        .pill[data-tone="ok"] { border-color: rgba(79,140,255,.35); }
      `}</style>
        </>
    );
}





