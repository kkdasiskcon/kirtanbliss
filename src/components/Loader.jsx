
export default function Loader({ message = "Loading..." }) {
    return (
        <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div className="loading-container glass-panel" style={{ background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 153, 51, 0.2)" }}>
                <div className="spinner" style={{ borderColor: "rgba(255, 255, 255, 0.1)", borderTopColor: "var(--color-saffron)" }}></div>
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>{message}</p>
            </div>
        </div>
    );
}
