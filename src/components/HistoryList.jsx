
import { AARTI_TYPES } from "../config";
import { formatDate, getDaysAgo } from "../utils";
import { motion } from "framer-motion";
import { Filter, Phone, MessageCircle, Search } from "lucide-react";

export default function HistoryList({
    history,
    filter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    selectedMonth,
    onMonthChange,
    selectedYear,
    onYearChange,
    onClearFilters,
    detectAarti,
}) {
    const months = [
        { value: "all", label: "All Months" },
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
    const years = ["all", ...Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())];

    return (
        <motion.div
            className="history-section glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="section-header" style={{ flexDirection: "column", alignItems: "stretch", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>History</h2>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>{history.length} records</span>
                </div>

                <div className="history-controls" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
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

                    {/* Aarti Filter */}
                    <select
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
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
                        <option value="all">All Aartis</option>
                        {AARTI_TYPES.map((a) => (
                            <option key={a.name} value={a.name.replace(" Singing", "")}>
                                {a.name.replace(" Singing", "")}
                            </option>
                        ))}
                    </select>

                    {/* Month Filter */}
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
                        {years.filter(y => y !== "all").map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {(searchQuery || filter !== "all" || selectedMonth !== "all" || selectedYear !== (new Date().getFullYear().toString())) && (
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
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {history.length > 0 ? (
                <div className="history-list">
                    {history.map((d, index) => (
                        <motion.div
                            key={index}
                            className="history-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto",
                                gap: "1rem",
                                padding: "1rem",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            }}
                        >
                            <div className="history-info">
                                <div className="history-name" style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem" }}>
                                    {d["Devotee Name"]}
                                </div>
                                <div className="history-details" style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                    <span>{formatDate(d["Last Sung Date"])}</span>
                                    <span>&bull;</span>
                                    <span style={{ fontWeight: 500, color: "var(--color-saffron)" }}>{detectAarti(d) || "Unknown"}</span>
                                </div>
                            </div>

                            <div className="history-actions" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                {d["Contact"] && (
                                    <>
                                        <a href={`tel:${d["Contact"]}`} className="icon-button" style={{ padding: "0.4rem" }}>
                                            <Phone size={14} />
                                        </a>
                                        <a
                                            href={`sms:${d["Contact"]}?body=${encodeURIComponent(`Hello ${d["Devotee Name"]}, Namaste.`)}`}
                                            className="icon-button"
                                            style={{ padding: "0.4rem" }}
                                        >
                                            <MessageCircle size={14} />
                                        </a>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="no-results" style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                    <p>No recent singing history found</p>
                </div>
            )}
        </motion.div>
    );
}
