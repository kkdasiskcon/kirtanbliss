
import { motion } from "framer-motion";
import { Gift, Phone, MessageCircle, CheckCircle } from "lucide-react";

export default function BirthdayList({ birthdays, onMarkSung }) {
    return (
        <motion.div
            className="birthdays-section glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="section-header">
                <h2>Upcoming Birthdays</h2>
                <span className="count-badge">{birthdays.length}</span>
            </div>

            {birthdays.length > 0 ? (
                <div className="birthdays-list">
                    {birthdays.map((d, index) => (
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
                                    })}
                                    {d.daysUntil === 0 && <strong style={{ color: "var(--color-saffron)", marginLeft: "0.5rem" }}>🎉 Today!</strong>}
                                    {d.daysUntil > 0 && <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>in {d.daysUntil} days</span>}
                                </div>
                            </div>

                            {d["Contact"] && (
                                <div className="birthday-actions" style={{ display: "flex", gap: "0.5rem" }}>
                                    <a href={`tel:${d["Contact"]}`} className="icon-button">
                                        <Phone size={18} />
                                    </a>
                                    <a
                                        href={`sms:${d["Contact"]}?body=${encodeURIComponent(`Hello ${d["Devotee Name"]}, Happy Birthday in advance!`)}`}
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
                <div className="no-results" style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                    <p>No upcoming birthdays in the next 30 days</p>
                </div>
            )}
        </motion.div>
    );
}
