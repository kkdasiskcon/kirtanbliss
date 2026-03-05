
import { calculatePriority, getDaysAgo } from "../utils";
import { Phone, MessageCircle, CheckCircle } from "lucide-react";

export default function DevoteeCard({ devotee, index, onMarkSung }) {
    // Safe extraction of values
    const lastSung = devotee["Last Sung Date"] ? getDaysAgo(devotee["Last Sung Date"]) : "Never";
    const timesSung = devotee["Times Sung"] || 0;
    const priority = calculatePriority(devotee);

    const sanitizePhone = (phone) => phone?.replace(/[^\d+]/g, '') || '';

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

            <div className="actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {devotee["Contact"] && (
                    <>
                        <a
                            href={`tel:${sanitizePhone(devotee["Contact"])}`}
                            className="icon-button"
                            title="Call"
                            style={{ textDecoration: 'none' }}
                        >
                            <Phone size={18} />
                        </a>
                        <a
                            href={`https://wa.me/${sanitizePhone(devotee["Contact"])}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-button"
                            title="WhatsApp"
                            style={{
                                textDecoration: 'none',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #c8e6c9'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                        <a
                            href={`sms:${sanitizePhone(devotee["Contact"])}`}
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
