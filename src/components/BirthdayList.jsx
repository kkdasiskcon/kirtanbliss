
import { motion } from "framer-motion";
import { Gift, Phone, MessageCircle, CheckCircle, Search, Calendar } from "lucide-react";

export default function BirthdayList({
    birthdays,
    onMarkSung,
    searchQuery,
    onSearchChange,
    selectedMonth,
    onMonthChange,
    selectedYear,
    onYearChange,
    onClearFilters
}) {
    const months = [
        { value: "0", label: "January" },
        { value: "1", label: "February" },
        { value: "2", label: "March" },
        { value: "3", label: "April" },
        { value: "4", label: "May" },
        { value: "5", label: "June" },
        { value: "6", label: "July" },
        { value: "7", label: "August" },
        { value: "8", label: "September" },
        { value: "9", label: "October" },
        { value: "10", label: "November" },
        { value: "11", label: "December" }
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear.toString(), (currentYear + 1).toString(), (currentYear - 1).toString()];

    return (
        <motion.div
            className="birthdays-section glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="section-header" style={{ flexDirection: "column", alignItems: "stretch", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>Birthdays</h2>
                    <span className="count-badge">{birthdays.length}</span>
                </div>

                <div className="birthday-controls" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', flex: "1 1 200px" }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search names..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                                borderRadius: "8px",
                                border: "2px solid var(--border-color)",
                                outline: "none",
                                fontSize: "0.9rem"
                            }}
                        />
                    </div>

                    {/* Month Filter */}
                    <div style={{ position: 'relative', flex: "0 0 auto" }}>
                        <select
                            value={selectedMonth}
                            onChange={(e) => onMonthChange(e.target.value)}
                            style={{
                                background: "white",
                                border: "2px solid var(--border-color)",
                                color: "var(--text-primary)",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "8px",
                                outline: "none",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(e.target.value)}
                        style={{
                            background: "white",
                            border: "2px solid var(--border-color)",
                            color: "var(--text-primary)",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            outline: "none",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.9rem"
                        }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {(searchQuery || selectedMonth !== new Date().getMonth().toString()) && (
                        <button
                            onClick={onClearFilters}
                            style={{
                                padding: "0.5rem 1rem",
                                borderRadius: "8px",
                                border: "2px solid var(--color-saffron)",
                                background: "white",
                                color: "var(--color-saffron)",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {birthdays.length > 0 ? (
                <div className="birthdays-list">
                    {birthdays.filter(d => !searchQuery || d["Devotee Name"].toLowerCase().includes(searchQuery.toLowerCase())).map((d, index) => (
                        <motion.div
                            key={index}
                            className="birthday-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                                border: "2px solid rgba(37, 99, 235, 0.3)",
                                borderRadius: "12px",
                                padding: "1.25rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.1)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                        >
                            <div
                                className="birthday-icon"
                                style={{
                                    background: "var(--color-saffron)",
                                    color: "white",
                                    padding: "0.75rem",
                                    borderRadius: "50%",
                                    display: "flex",
                                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                                }}
                            >
                                <Gift size={20} />
                            </div>

                            <div className="birthday-info" style={{ flex: 1 }}>
                                <div className="birthday-name" style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                                    {d["Devotee Name"]}
                                </div>
                                <div className="birthday-date" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                    {d.birthdayDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                    {d.daysUntil === 0 && <strong style={{ color: "var(--color-saffron)", marginLeft: "0.5rem" }}>🎉 Today!</strong>}
                                    {d.daysUntil > 0 && <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>in {d.daysUntil} days</span>}
                                    {d.daysUntil < 0 && <span style={{ opacity: 0.5, marginLeft: "0.5rem" }}>{Math.abs(d.daysUntil)} days ago</span>}
                                </div>
                            </div>

                            {d["Contact"] && (
                                <div className="birthday-actions" style={{ display: "flex", gap: "0.4rem" }}>
                                    <a
                                        href={`tel:${d["Contact"].replace(/[^\d+]/g, '')}`}
                                        className="icon-button"
                                        title="Call"
                                    >
                                        <Phone size={16} />
                                    </a>
                                    <a
                                        href={`https://wa.me/${d["Contact"].replace(/[^\d+]/g, '')}?text=${encodeURIComponent(`Hare Krishna! Happy Birthday ${d["Devotee Name"]}! 🎉`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="icon-button"
                                        title="WhatsApp"
                                        style={{
                                            background: '#e8f5e9',
                                            color: '#2e7d32',
                                            border: '1px solid #c8e6c9'
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </a>
                                    <a
                                        href={`sms:${d["Contact"].replace(/[^\d+]/g, '')}`}
                                        className="icon-button"
                                        title="Message"
                                    >
                                        <MessageCircle size={16} />
                                    </a>
                                </div>
                            )}

                            <button
                                className="mark-sung-btn-small"
                                onClick={() => onMarkSung(d)}
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
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="no-results" style={{ padding: "3rem", textAlign: "center", opacity: 0.6 }}>
                    <p style={{ fontSize: "1.1rem" }}>{selectedMonth === "all" ? "No upcoming birthdays in the next 30 days" : `No birthdays found in ${months.find(m => m.value === selectedMonth)?.label}`}</p>
                    {(searchQuery || selectedMonth !== "all") && (
                        <button
                            onClick={onClearFilters}
                            style={{
                                marginTop: "1rem",
                                color: "var(--color-saffron)",
                                background: "none",
                                border: "1px solid var(--color-saffron)",
                                padding: "0.5rem 1rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600
                            }}
                        >
                            Reset to Upcoming
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
