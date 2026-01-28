import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Toast from "../components/Toast";

const money = (cents) => `€${(cents / 100).toFixed(2)}`;

function getSecondaryImage(p) {
    const fromImages =
        Array.isArray(p.images) && p.images.length
            ? p.images.find((img) => !img.is_primary)?.url || p.images[1]?.url
            : null;

    const fromSecondary = p.secondary_image?.url || p.secondary_image;
    return fromImages || fromSecondary || null;
}

// Simple debounce hook (no extra deps)
function useDebouncedValue(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function Shop() {
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);

    // Search
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 450);

    const [toasts, setToasts] = useState([]);
    const pushToast = (title, text) => {
        const id = Date.now() + Math.random();
        setToasts((p) => [...p, { id, title, text }]);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const hasToken = useMemo(() => !!localStorage.getItem("token"), []);
    const abortRef = useRef(null);

    const loadProducts = async ({ searchTerm } = {}) => {
        setLoading(true);

        // Abort previous request (prevents race conditions)
        try {
            abortRef.current?.abort?.();
        } catch { }
        abortRef.current = new AbortController();

        try {
            const params = {};
            const q = (searchTerm ?? "").trim();
            if (q) params.search = q;

            const res = await api.get("/products", {
                params,
                signal: abortRef.current.signal,
            });

            setProducts(res.data?.data || []);
            setMeta({ current: res.data?.current_page, last: res.data?.last_page });
        } catch (err) {
            // Ignore abort errors
            if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
            pushToast("Error", err?.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts({ searchTerm: debouncedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const addToCart = async (productId) => {
        setAddingId(productId);
        try {
            await api.post("/cart/items", { product_id: productId, qty: 1 });
            pushToast("Added to cart", "Item added successfully. Click to dismiss.");
        } catch (err) {
            if (err?.response?.status === 401) {
                pushToast("Login required", "Please login to add items to your cart.");
                nav("/login");
                return;
            }
            pushToast("Error", err?.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingId(null);
        }
    };

    const clearSearch = () => setSearch("");

    return (
        <>
            {/* Sticky nav */}
            <div className="nav">
                <div className="container navRow">
                    <div className="brand" onClick={() => nav("/shop")} style={{ cursor: "pointer" }}>
                        <div className="brandBadge" />
                        Modern Commerce
                    </div>

                    <div className="navActions">
                        <button className="btn" onClick={() => nav("/cart")}>
                            Cart
                        </button>
                        <button className="btn btnPrimary" onClick={() => nav("/login")}>
                            {hasToken ? "Account" : "Login"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container page">
                {/* Header + Search */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 14,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 className="h1">Shop</h1>
                        <div className="subtle">Browse products and add them to your cart.</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        {!loading && (
                            <div className="pill">
                                Page {meta?.current} / {meta?.last}
                            </div>
                        )}

                        {/* Clean Search box (no inner border on typing) */}
                        <div className="searchWrap surface">
                            <span className="searchIcon" aria-hidden="true">
                                🔎
                            </span>

                            <input
                                className="searchInput"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products (e.g. guitar, hoodie, vacuum)…"
                                aria-label="Search products"
                            />

                            {search.trim().length > 0 && (
                                <button className="searchClear" onClick={clearSearch} title="Clear" type="button">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="surface" style={{ marginTop: 16, padding: 16 }}>
                        Loading products...
                    </div>
                ) : (
                    <>
                        {/* Result hint */}
                        <div className="subtle" style={{ marginTop: 12 }}>
                            {debouncedSearch.trim()
                                ? `Showing results for “${debouncedSearch.trim()}” (${products.length})`
                                : `Showing all products (${products.length})`}
                        </div>

                        <div
                            style={{
                                marginTop: 16,
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                gap: 16,
                            }}
                        >
                            {products.map((p) => {
                                const primary = p.primary_image?.url || "https://picsum.photos/seed/fallback-primary/800/800";
                                const secondary = getSecondaryImage(p) || primary;

                                const sale = p.compare_at_price && p.compare_at_price > p.price;
                                const pct = sale ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;

                                const desc = (p.description || "").trim();

                                return (
                                    <div
                                        key={p.id}
                                        className="productCard surface"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => nav(`/products/${p.slug}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") nav(`/products/${p.slug}`);
                                        }}
                                        style={{
                                            borderRadius: 18,
                                            overflow: "hidden",
                                            border: "1px solid rgba(255,255,255,.10)",
                                            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
                                            transform: "translateY(0)",
                                            transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-4px)";
                                            e.currentTarget.style.boxShadow = "0 18px 45px rgba(0,0,0,.35)";
                                            e.currentTarget.style.borderColor = "rgba(79,140,255,.35)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,.10)";
                                        }}
                                    >
                                        {/* Media */}
                                        <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                                            {sale && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 12,
                                                        left: 12,
                                                        zIndex: 2,
                                                        padding: "6px 10px",
                                                        borderRadius: 999,
                                                        fontWeight: 900,
                                                        fontSize: 12,
                                                        letterSpacing: ".3px",
                                                        color: "#fff",
                                                        background: "linear-gradient(135deg, rgba(255,77,110,.95), rgba(255,153,102,.9))",
                                                        boxShadow: "0 10px 25px rgba(255,77,110,.25)",
                                                        border: "1px solid rgba(255,255,255,.18)",
                                                    }}
                                                >
                                                    SALE {pct ? `-${pct}%` : ""}
                                                </div>
                                            )}

                                            <div style={{ position: "absolute", inset: 0 }}>
                                                <img
                                                    src={primary}
                                                    alt={p.name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://picsum.photos/seed/fallback-primary/800/800";
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block",
                                                        transform: "scale(1.02)",
                                                        transition: "opacity .25s ease, transform .25s ease",
                                                    }}
                                                    className="shopImgPrimary"
                                                />
                                                <img
                                                    src={secondary}
                                                    alt={p.name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://picsum.photos/seed/fallback-secondary/800/800";
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block",
                                                        position: "absolute",
                                                        inset: 0,
                                                        opacity: 0,
                                                        transform: "scale(1.02)",
                                                        transition: "opacity .25s ease, transform .25s ease",
                                                    }}
                                                    className="shopImgSecondary"
                                                />
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div style={{ padding: 14 }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: 16 }}>{p.name}</div>
                                                    <div className="subtle" style={{ marginTop: 2 }}>
                                                        {p.category?.name}
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontWeight: 900 }}>{money(p.price)}</div>
                                                    {sale && (
                                                        <div
                                                            style={{
                                                                marginTop: 2,
                                                                fontSize: 12,
                                                                opacity: 0.65,
                                                                textDecoration: "line-through",
                                                            }}
                                                        >
                                                            {money(p.compare_at_price)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {desc && (
                                                <div
                                                    style={{
                                                        marginTop: 8,
                                                        color: "rgba(255,255,255,.72)",
                                                        fontSize: 13,
                                                        lineHeight: 1.35,
                                                        minHeight: 36,
                                                    }}
                                                >
                                                    {desc.slice(0, 78)}
                                                    {desc.length > 78 ? "…" : ""}
                                                </div>
                                            )}

                                            <button
                                                className="btn btnPrimary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(p.id);
                                                }}
                                                disabled={addingId === p.id}
                                                style={{
                                                    width: "100%",
                                                    marginTop: 10,
                                                    opacity: addingId === p.id ? 0.75 : 1,
                                                    cursor: addingId === p.id ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                {addingId === p.id ? "Adding..." : "Add to cart"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty state */}
                        {!products.length && (
                            <div className="surface" style={{ marginTop: 16, padding: 16 }}>
                                No products found.
                                {debouncedSearch.trim() ? (
                                    <div style={{ marginTop: 10 }}>
                                        <button className="btn" onClick={clearSearch}>
                                            Clear search
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Toast toasts={toasts} removeToast={removeToast} />

            <style>{`
        /* Hover image swap scoped to cards only */
        .productCard:hover .shopImgPrimary { opacity: 0; transform: scale(1.06); }
        .productCard:hover .shopImgSecondary { opacity: 1; transform: scale(1.06); }

        /* CLEAN SEARCH */
        .searchWrap{
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 12px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.10);
          min-width:280px;
          transition:border-color .18s ease, box-shadow .18s ease;
        }
        .searchWrap:focus-within{
          border-color: rgba(79,140,255,.35);
          box-shadow: 0 0 0 4px rgba(79,140,255,.10);
        }
        .searchIcon{ opacity:.7; font-weight:800; }
        .searchInput{
          flex:1;
          width:100%;
          background:transparent;
          border:0 !important;
          outline:0 !important;
          box-shadow:none !important;
          padding:0;
          color:inherit;
          font:inherit;
        }
        .searchInput:focus{
          outline:0 !important;
          box-shadow:none !important;
        }
        /* Kill browser "search" decorations if it ever becomes type=search */
        .searchInput::-webkit-search-decoration,
        .searchInput::-webkit-search-cancel-button,
        .searchInput::-webkit-search-results-button,
        .searchInput::-webkit-search-results-decoration { display:none; }

        .searchClear{
          border:1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.06);
          color: inherit;
          padding: 8px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .searchClear:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,.10);
          border-color: rgba(255,255,255,.16);
        }
      `}</style>
        </>
    );
}







