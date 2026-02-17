
import { AARTI_TYPES } from "../config";
import { formatDate, getDaysAgo } from "../utils";
import { motion } from "framer-motion";
import { Filter, Phone, MessageCircle } from "lucide-react";

export default function HistoryList({
    history,
    filter,
    onFilterChange,
    detectAarti,
}) {
    return (
        <motion.div
            className="history-section glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="section-header">
                <h2>History</h2>
                <div className="history-controls">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Filter size={16} color="var(--text-secondary)" />
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
                                transition: "all 0.3s"
                            }}
                        >
                            <option value="all">All Aartis</option>
                            {AARTI_TYPES.map((a) => (
                                <option key={a.name} value={a.name.replace(" Singing", "")}>
                                    {a.name.replace(" Singing", "")}
                                </option>
                            ))}
                        </select>
                    </label>
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
