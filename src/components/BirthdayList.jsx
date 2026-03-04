
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
                                <div className="birthday-actions" style={{ display: "flex", gap: "0.5rem" }}>
                                    <a href={`tel:${d["Contact"]}`} className="icon-button">
                                        <Phone size={18} />
                                    </a>
                                    <a
                                        href={`sms:${d["Contact"]}?body=${encodeURIComponent(`Hello ${d["Devotee Name"]}, Happy Birthday!`)}`}
                                        className="icon-button"
                                    >
                                        <MessageCircle size={18} />
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
