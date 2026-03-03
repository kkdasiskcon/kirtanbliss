
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, WifiOff, Settings } from "lucide-react";
import { useState } from "react";

export default function ErrorMessage({ error, diagnostics, onRetry }) {
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    return (
        <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "1rem" }}>
            <div className="error-container glass-panel" style={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                maxWidth: "600px",
                width: "100%",
                padding: "2rem"
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ position: "relative" }}>
                        <AlertCircle size={64} color="#ff6b6b" />
                        {!navigator.onLine && (
                            <WifiOff size={24} color="#ff6b6b" style={{ position: "absolute", bottom: -5, right: -5, background: "#0f172a", borderRadius: "50%", padding: "2px" }} />
                        )}
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ color: "#ff6b6b", margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>Unable to Load Data</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", whiteSpace: "pre-line" }}>{error}</p>
                    </div>

                    <div className="troubleshooting-tips" style={{
                        width: "100%",
                        background: "rgba(234, 88, 12, 0.1)",
                        borderRadius: "12px",
                        padding: "1rem",
                        border: "1px border rgba(234, 88, 12, 0.2)"
                    }}>
                        <h4 style={{ color: "var(--color-saffron)", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Settings size={18} /> Mobile Data Tips:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            <li>Try switching to <strong>WiFi</strong> if available.</li>
                            <li>Toggle <strong>Airplane Mode</strong> ON and OFF.</li>
                            <li>Check if <strong>Data Saver</strong> or <strong>Battery Saver</strong> is blocking background data.</li>
                            <li>If on mobile data, try using <strong>Google DNS (8.8.8.8)</strong> in your phone settings.</li>
                        </ul>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                        <button
                            onClick={onRetry}
                            className="retry-button"
                            style={{
                                flex: 2,
                                background: "var(--color-saffron)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                padding: "0.8rem",
                                borderRadius: "10px",
                                fontWeight: "bold"
                            }}
                        >
                            <RefreshCw size={20} /> Retry Now
                        </button>

                        <button
                            onClick={() => setShowDiagnostics(!showDiagnostics)}
                            style={{
                                flex: 1,
                                background: "rgba(148, 163, 184, 0.1)",
                                color: "var(--text-secondary)",
                                border: "1px solid rgba(148, 163, 184, 0.2)",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.3rem"
                            }}
                        >
                            Log {showDiagnostics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {showDiagnostics && diagnostics && (
                        <div style={{
                            width: "100%",
                            background: "#000",
                            padding: "1rem",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            overflow: "auto",
                            maxHeight: "200px",
                            color: "#4ade80",
                            border: "1px solid #334155"
                        }}>
                            <pre style={{ margin: 0 }}>{JSON.stringify(diagnostics, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
