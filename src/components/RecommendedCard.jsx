
import { calculatePriority, getDaysAgo } from "../utils";
import { motion } from "framer-motion";
import { Star, Phone, MessageCircle, CheckCircle, X } from "lucide-react";

export default function RecommendedCard({ devotee, aartiName, onMarkSung, onClose }) {
    if (!devotee) return null;

    const lastSung = devotee["Last Sung Date"] ? getDaysAgo(devotee["Last Sung Date"]) : "Never";

    return (
        <motion.div
            className="recommended-card glass-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                border: "2px solid var(--color-saffron)",
                background: "#fff7ed",
                position: "relative"
            }}
        >
            <button
                className="close-recommendation"
                onClick={onClose}
                title="Hide"
            >
                <X size={20} />
            </button>

            <div className="recommended-header" style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "white", padding: "0.5rem", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <Star color="var(--color-saffron)" fill="var(--color-saffron)" size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#7c2d12", fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>Top Recommendation</h2>
                        <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-saffron-dark)", margin: "0.25rem 0 0 0", lineHeight: 1.2 }}>
                            {aartiName}
                        </p>
                    </div>
                </div>
            </div>

            <div className="recommended-content">
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    {devotee["Devotee Name"] || "N/A"}
                </div>

                {devotee["Contact"] && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                        <a
                            href={`tel:${devotee["Contact"]}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'white', border: '1px solid #fed7aa', borderRadius: '8px',
                                padding: '0.4rem 0.8rem', textDecoration: 'none', color: '#9a3412', fontWeight: 600, fontSize: '0.85rem',
                                flex: '1', minWidth: '120px', justifyContent: 'center'
                            }}
                        >
                            <Phone size={14} /> {devotee["Contact"]}
                        </a>
                        <a
                            href={`sms:${devotee["Contact"]}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'white', border: '1px solid #fed7aa', borderRadius: '8px',
                                padding: '0.4rem 0.8rem', textDecoration: 'none', color: '#9a3412', fontWeight: 600, fontSize: '0.85rem',
                                flex: '1', minWidth: '80px', justifyContent: 'center'
                            }}
                        >
                            <MessageCircle size={14} /> SMS
                        </a>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.6)', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#78350f', fontWeight: 700 }}>Last Sung</span>
                        <span style={{ fontSize: '1rem', color: '#431407', fontWeight: 600 }}>{lastSung}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#78350f', fontWeight: 700 }}>Times Sung</span>
                        <span style={{ fontSize: '1rem', color: '#431407', fontWeight: 600 }}>{devotee["Times Sung"] || 0}</span>
                    </div>
                </div>

                <button
                    onClick={() => onMarkSung(devotee)}
                    style={{
                        width: "100%",
                        background: "var(--color-tulsi)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        padding: "1rem",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 6px -1px rgba(21, 128, 61, 0.3)"
                    }}
                >
                    <CheckCircle size={20} /> Mark as Sung Today
                </button>
            </div>
        </motion.div>
    );
}
