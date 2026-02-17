
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorMessage({ error, onRetry }) {
    return (
        <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div className="error-container glass-panel" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(220, 53, 69, 0.3)", maxWidth: "500px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <AlertCircle size={48} color="#ff6b6b" />
                    <h2 style={{ color: "#ff6b6b", margin: 0 }}>Error Loading Data</h2>
                    <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>{error}</p>
                    <button
                        onClick={onRetry}
                        className="retry-button"
                        style={{
                            background: "var(--color-slate-700)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginTop: "1rem"
                        }}
                    >
                        <RefreshCw size={18} /> Retry
                    </button>
                </div>
            </div>
        </div>
    );
}
