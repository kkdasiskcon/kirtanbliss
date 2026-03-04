import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Portal from "./Portal";
import { X, RefreshCw, CheckCircle, Save, Calendar, Music } from "lucide-react";
import { AARTI_TYPES } from "../config";

export default function UpdateModal({
    devotee,
    updateStatus,
    updating,
    onClose,
    onRefresh, // This is now 'confirmMarkSung'
    initialAarti = AARTI_TYPES[0].name.replace(" Singing", "")
}) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedAarti, setSelectedAarti] = useState(initialAarti);

    // No-op for Portals
    useEffect(() => {
        // Removed scroll to top
    }, [devotee]);

    const handleConfirm = () => {
        if (!selectedDate) return;
        if (new Date(selectedDate) < new Date("2026-01-01")) {
            alert("Please select a date from 1 January 2026 onwards.");
            return;
        }
        onRefresh(selectedDate, selectedAarti);
    };

    return (
        <Portal>
            <AnimatePresence>
                <motion.div
                    className="modal-overlay"
                    onClick={!updating ? onClose : undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="modal-content glass-panel"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            maxWidth: "500px",
                            width: "90%",
                            background: "white",
                            border: "1px solid rgba(0,0,0,0.1)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", padding: "1.5rem 1.5rem 0", flexShrink: 0 }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                <CheckCircle color="var(--color-tulsi)" /> Confirm Action
                            </h3>
                            <button
                                onClick={onClose}
                                disabled={updating}
                                style={{ background: "transparent", padding: "0.25rem", color: "var(--text-secondary)", border: "none" }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: "0 1.5rem 1.5rem", flex: 1, overflowY: "auto" }}>
                            <p className="modal-devotee-name" style={{ fontSize: "1.5rem", color: "var(--color-saffron)", textAlign: "center", margin: "1rem 0 1.5rem 0", fontWeight: 700 }}>
                                {devotee["Devotee Name"]}
                            </p>

                            {updateStatus && (
                                <motion.div
                                    className={`update-status ${updateStatus.type}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: updateStatus.type === "success" ? "rgba(220, 252, 231, 0.5)" : "rgba(254, 226, 226, 0.5)",
                                        border: updateStatus.type === "success" ? "1px solid var(--color-tulsi)" : "1px solid #ef4444",
                                        color: updateStatus.type === "success" ? "var(--color-tulsi)" : "#b91c1c",
                                        padding: "1rem",
                                        borderRadius: "8px",
                                        marginBottom: "1rem",
                                        textAlign: "center"
                                    }}
                                >
                                    {updateStatus.type === "success" ? "✅" : "❌"}{" "}
                                    {updateStatus.message}
                                </motion.div>
                            )}

                            {!updateStatus && (
                                <div style={{ marginBottom: "2rem" }}>
                                    <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                                        Confirm details for this record:
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                <Calendar size={14} /> Date
                                            </label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min="2026-01-01"
                                                style={{
                                                    padding: "0.75rem",
                                                    borderRadius: "8px",
                                                    border: "2px solid var(--border-color)",
                                                    outline: "none",
                                                    fontSize: "1rem"
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                <Music size={14} /> Aarti Type
                                            </label>
                                            <select
                                                value={selectedAarti}
                                                onChange={(e) => setSelectedAarti(e.target.value)}
                                                style={{
                                                    padding: "0.75rem",
                                                    borderRadius: "8px",
                                                    border: "2px solid var(--border-color)",
                                                    outline: "none",
                                                    fontSize: "1rem",
                                                    background: "white"
                                                }}
                                            >
                                                {AARTI_TYPES.map(a => (
                                                    <option key={a.name} value={a.name.replace(" Singing", "")}>
                                                        {a.name.replace(" Singing", "")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                <button
                                    className="modal-button"
                                    onClick={onClose}
                                    disabled={updating}
                                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "var(--text-secondary)" }}
                                >
                                    Cancel
                                </button>

                                {!updateStatus && (
                                    <button
                                        className="modal-button primary"
                                        onClick={handleConfirm}
                                        disabled={updating}
                                        style={{ background: "var(--color-saffron)", color: "white", borderColor: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                        type="button"
                                    >
                                        {updating ? (
                                            <>
                                                <div className="spinner-small" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white", width: "16px", height: "16px" }}></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} /> Confirm
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
