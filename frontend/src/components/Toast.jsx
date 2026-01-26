import { useEffect } from "react";

export default function Toast({ toasts, removeToast }) {
    useEffect(() => {
        if (!toasts.length) return;
        const id = toasts[toasts.length - 1].id;
        const t = setTimeout(() => removeToast(id), 2200);
        return () => clearTimeout(t);
    }, [toasts, removeToast]);

    return (
        <div className="toastWrap">
            {toasts.map((t) => (
                <div key={t.id} className="toast" onClick={() => removeToast(t.id)} style={{ cursor: "pointer" }}>
                    <p className="toastTitle">{t.title}</p>
                    <p className="toastText">{t.text}</p>
                </div>
            ))}
        </div>
    );
}
