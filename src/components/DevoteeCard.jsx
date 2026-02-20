
import { calculatePriority, getDaysAgo } from "../utils";
import { Phone, MessageCircle, CheckCircle } from "lucide-react";

export default function DevoteeCard({ devotee, index, onMarkSung }) {
    // Safe extraction of values
    const lastSung = devotee["Last Sung Date"] ? getDaysAgo(devotee["Last Sung Date"]) : "Never";
    const timesSung = devotee["Times Sung"] || 0;
    const priority = calculatePriority(devotee);

    return (
        <div className="devotee-card">
            <div className="devotee-rank">#{index + 1}</div>

            <div className="devotee-info" style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                    {devotee["Devotee Name"]}
                    {devotee.devotee_type && (
                        <span style={{
                            fontSize: "0.65rem",
                            background: devotee.devotee_type === "Brahmachari" ? "#fff7ed" : devotee.devotee_type === "VOICE Devotee" ? "#eff6ff" : "#f1f5f9",
                            color: devotee.devotee_type === "Brahmachari" ? "#c2410c" : devotee.devotee_type === "VOICE Devotee" ? "#1e40af" : "#64748b",
                            padding: "0.1rem 0.5rem",
                            borderRadius: "50px",
                            border: `1px solid ${devotee.devotee_type === "Brahmachari" ? "#fdba74" : devotee.devotee_type === "VOICE Devotee" ? "#bfdbfe" : "#cbd5e1"}`,
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}>
                            {devotee.devotee_type}
                        </span>
                    )}
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                        Last: <strong style={{ color: 'var(--text-primary)' }}>{lastSung}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                        Sung: <strong style={{ color: 'var(--text-primary)' }}>{timesSung}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                        Prio: {priority}
                    </span>
                </div>
            </div>

            <div className="actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {devotee["Contact"] && (
                    <>
                        <a
                            href={`tel:${devotee["Contact"]}`}
                            className="icon-button"
                            title="Call"
                            style={{ textDecoration: 'none' }}
                        >
                            <Phone size={18} />
                        </a>
                        <a
                            href={`sms:${devotee["Contact"]}`}
                            className="icon-button"
                            title="Message"
                            style={{ textDecoration: 'none' }}
                        >
                            <MessageCircle size={18} />
                        </a>
                    </>
                )}

                <button
                    className="mark-sung-btn-small"
                    onClick={() => {
                        console.log("Mark as sung clicked for:", devotee["Devotee Name"]);
                        console.log("Devotee object:", devotee);
                        onMarkSung(devotee);
                    }}
                    title="Mark as sung today"
                    type="button"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, var(--color-tulsi-light), var(--color-tulsi))',
                        color: 'var(--color-tulsi-dark)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 6px 20px rgba(8, 145, 178, 0.3)',
                        pointerEvents: 'auto',
                        zIndex: 10
                    }}
                >
                    <CheckCircle size={18} />
                </button>
            </div>
        </div>
    );
}
