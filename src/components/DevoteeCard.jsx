import { calculatePriority, getDaysAgo, getBirthdayProximity } from "../utils";
import { Phone, CheckCircle, Calendar, Sparkles, MessageCircle, Info } from "lucide-react";

export default function DevoteeCard({
    devotee,
    index,
    onOpenDetails,
    onQuickLog,
    onCustomLog,
    localCoordination = {}
}) {
    // Safe extraction of values
    const lastSungDisplay = devotee["Last Sung Date"] ? getDaysAgo(devotee["Last Sung Date"]) : "Never";
    const timesSung = devotee["Times Sung"] || 0;
    const priority = calculatePriority(devotee);
    const bdayProx = getBirthdayProximity(devotee["DOB"]);

    const sanitizePhone = (phone) => phone?.replace(/[^\d+]/g, '') || '';

    // Retrieve coordination status
    const coordination = devotee.coordination_status || localCoordination[devotee.id] || {};
    const hasCoordination = !!coordination.status;

    let coordColor = "#64748b";
    let coordBg = "#f1f5f9";
    let coordBorder = "#cbd5e1";
    if (coordination.status === "Invited") {
        coordBg = "#eff6ff"; coordColor = "#2563eb"; coordBorder = "#bfdbfe";
    } else if (coordination.status === "Confirmed") {
        coordBg = "#f0fdf4"; coordColor = "#16a34a"; coordBorder = "#bbf7d0";
    } else if (coordination.status === "Declined") {
        coordBg = "#fef2f2"; coordColor = "#dc2626"; coordBorder = "#fecaca";
    }

    return (
        <div
            className="devotee-card"
            style={{
                cursor: "pointer",
                position: "relative"
            }}
        >
            <div className="devotee-rank" onClick={() => onOpenDetails(devotee)}>#{index + 1}</div>

            {/* Clickable info section */}
            <div
                className="devotee-info"
                onClick={() => onOpenDetails(devotee)}
                style={{ minWidth: 0, flex: 1, paddingRight: '0.5rem' }}
                title="Click to view history and invite"
            >
                <h3 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                    {devotee["Devotee Name"]}
                    
                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", alignItems: "center" }}>
                        {devotee.is_everyday && (
                            <span style={{
                                fontSize: "0.65rem",
                                background: "#fffbeb",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "50px",
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.15rem"
                            }}>
                                ⭐ Everyday
                            </span>
                        )}
                        {devotee.devotee_type && (
                            <span style={{
                                fontSize: "0.65rem",
                                background: devotee.devotee_type === "Brahmachari" ? "#fff7ed" : devotee.devotee_type === "VOICE Devotee" ? "#eff6ff" : "#f1f5f9",
                                color: devotee.devotee_type === "Brahmachari" ? "#c2410c" : devotee.devotee_type === "VOICE Devotee" ? "#1e40af" : "#64748b",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "50px",
                                border: `1px solid ${devotee.devotee_type === "Brahmachari" ? "#fdba74" : devotee.devotee_type === "VOICE Devotee" ? "#bfdbfe" : "#cbd5e1"}`,
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}>
                                {devotee.devotee_type}
                            </span>
                        )}

                        {bdayProx && (
                            <span style={{
                                fontSize: "0.65rem",
                                background: bdayProx.isToday ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "#fffbeb",
                                color: bdayProx.isToday ? "#dc2626" : "#d97706",
                                border: `1px solid ${bdayProx.isToday ? "#fca5a5" : "#fcd34d"}`,
                                padding: "0.1rem 0.4rem",
                                borderRadius: "50px",
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.15rem"
                            }}>
                                🎂 {bdayProx.isToday ? "Birthday Today!" : `Birthday: ${bdayProx.dateLabel}`}
                            </span>
                        )}
                        
                        {/* Coordination Status Badge */}
                        {hasCoordination && (
                            <span style={{
                                fontSize: "0.65rem",
                                background: coordBg,
                                color: coordColor,
                                border: `1px solid ${coordBorder}`,
                                padding: "0.1rem 0.4rem",
                                borderRadius: "50px",
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                            }} title={`For ${coordination.aarti} on ${coordination.dateFormatted}`}>
                                {coordination.status}
                            </span>
                        )}
                    </div>
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                        Last: <strong style={{ color: 'var(--text-primary)' }}>{lastSungDisplay}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                        Sung: <strong style={{ color: 'var(--text-primary)' }}>{timesSung}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                        Prio: {priority}
                    </span>
                </div>
            </div>

            {/* Action buttons (click propagation stopped to prevent opening drawer) */}
            <div
                className="actions"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            >
                {devotee["Contact"] && (
                    <>
                        <a
                            href={`https://wa.me/${sanitizePhone(devotee["Contact"])}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-button"
                            title="WhatsApp Invite"
                            style={{
                                textDecoration: 'none',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #c8e6c9',
                                width: '38px',
                                height: '38px'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                    </>
                )}

                {/* Devotee Info & History Button */}
                <button
                    className="icon-button"
                    onClick={() => onOpenDetails(devotee)}
                    title="View history and details"
                    type="button"
                    style={{
                        width: '38px',
                        height: '38px',
                        background: 'white',
                        color: 'var(--color-saffron)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Info size={18} />
                </button>

                {/* Custom Details Log Button */}
                <button
                    className="icon-button"
                    onClick={() => onCustomLog(devotee)}
                    title="Log with custom date/aarti"
                    type="button"
                    style={{
                        width: '38px',
                        height: '38px',
                        background: 'white',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <Calendar size={18} />
                </button>

                {/* Quick Log Check Button */}
                <button
                    className="mark-sung-btn-small"
                    onClick={() => onQuickLog(devotee)}
                    title="Log sung TODAY (1-click)"
                    type="button"
                    style={{
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        background: 'linear-gradient(135deg, var(--color-tulsi-light), var(--color-tulsi))',
                        color: 'var(--color-tulsi-dark)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)'
                    }}
                >
                    <CheckCircle size={18} />
                </button>
            </div>
        </div>
    );
}
