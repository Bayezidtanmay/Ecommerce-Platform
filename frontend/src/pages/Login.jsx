import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("bayzid2@test.com");
    const [password, setPassword] = useState("12345678");
    const [error, setError] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            nav("/shop");
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="container page">
            <div className="surface authCard">
                <h1 className="h1" style={{ marginBottom: 6 }}>Welcome back</h1>
                <div className="subtle" style={{ marginBottom: 14 }}>Sign in to manage your cart.</div>

                {error && (
                    <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,92,122,.35)", background: "rgba(255,92,122,.12)", marginBottom: 12 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                    <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
                    <button className="btn btnPrimary" style={{ padding: 12, borderRadius: 14, fontWeight: 900 }}>
                        Sign in
                    </button>
                    <button type="button" className="btn" onClick={() => nav("/shop")}>
                        Back to shop
                    </button>
                </form>
            </div>
        </div>
    );
}

