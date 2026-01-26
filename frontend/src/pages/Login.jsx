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
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Login</h1>

            {error && (
                <div style={{ background: "#fee2e2", padding: 10, borderRadius: 10, marginBottom: 12 }}>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
                <button
                    style={{
                        padding: 12,
                        borderRadius: 10,
                        border: 0,
                        background: "#111827",
                        color: "white",
                        fontWeight: 700,
                    }}
                >
                    Sign in
                </button>
            </form>
        </div>
    );
}
