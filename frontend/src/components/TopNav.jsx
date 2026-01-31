import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function getUserName() {
    // Try common storage patterns (safe fallbacks)
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
        try {
            const u = JSON.parse(rawUser);
            if (u?.name) return u.name;
        } catch { }
    }
    const name = localStorage.getItem("user_name");
    if (name) return name;
    return null;
}

export default function TopNav() {
    const nav = useNavigate();
    const { pathname } = useLocation();

    const hasToken = useMemo(() => !!localStorage.getItem("token"), []);
    const userName = useMemo(() => getUserName(), []);

    const go = (path) => () => nav(path);

    const isActive = (path) => pathname === path;

    return (
        <div className="nav">
            <div className="container navRow">
                <div className="brand" onClick={go("/home")} style={{ cursor: "pointer" }}>
                    <div className="brandBadge" />
                    Modern Commerce
                </div>

                <div className="navActions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Left side links */}
                    <button className="btn" onClick={go("/home")} aria-current={isActive("/home") ? "page" : undefined}>
                        Home
                    </button>

                    <button className="btn" onClick={go("/shop")} aria-current={isActive("/shop") ? "page" : undefined}>
                        Shop
                    </button>

                    <button className="btn" onClick={go("/cart")} aria-current={isActive("/cart") ? "page" : undefined}>
                        Cart
                    </button>

                    <button className="btn" onClick={go("/orders")} aria-current={isActive("/orders") ? "page" : undefined}>
                        Orders
                    </button>

                    {/* Right side account */}
                    <button className="btn btnPrimary" onClick={go(hasToken ? "/home" : "/login")}>
                        {hasToken ? (userName ? userName : "Account") : "Login"}
                    </button>
                    <button className="btn" onClick={() => nav("/wishlist")}>Wishlist</button>
                </div>
            </div>
        </div>
    );
}
