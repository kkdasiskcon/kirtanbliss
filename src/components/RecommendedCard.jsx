
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
                            href={`tel:${devotee["Contact"].replace(/[^\d+]/g, '')}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: 'white', border: '1px solid #fed7aa', borderRadius: '8px',
                                padding: '0.4rem 0.6rem', textDecoration: 'none', color: '#9a3412', fontWeight: 600, fontSize: '0.8rem',
                                flex: '1', minWidth: '100px', justifyContent: 'center'
                            }}
                        >
                            <Phone size={14} /> Call
                        </a>
                        <a
                            href={`https://wa.me/${devotee["Contact"].replace(/[^\d+]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px',
                                padding: '0.4rem 0.6rem', textDecoration: 'none', color: '#2e7d32', fontWeight: 600, fontSize: '0.8rem',
                                flex: '1', minWidth: '100px', justifyContent: 'center'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg> WhatsApp
                        </a>
                        <a
                            href={`sms:${devotee["Contact"].replace(/[^\d+]/g, '')}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: 'white', border: '1px solid #fed7aa', borderRadius: '8px',
                                padding: '0.4rem 0.6rem', textDecoration: 'none', color: '#9a3412', fontWeight: 600, fontSize: '0.8rem',
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
