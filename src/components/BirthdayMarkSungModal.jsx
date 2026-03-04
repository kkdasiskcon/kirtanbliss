import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Calendar } from "lucide-react";
import { AARTI_TYPES } from "../config";
import { useState, useEffect } from "react";
import Portal from "./Portal";

export default function BirthdayMarkSungModal({
    devotee,
    updating,
    onClose,
    onConfirm,
}) {
    const [selectedAarti, setSelectedAarti] = useState(AARTI_TYPES[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Scroll logic removed for Portals
    useEffect(() => {
        // No-op
    }, [devotee]);

    const handleConfirm = () => {
        if (!selectedDate) return;
        if (new Date(selectedDate) < new Date("2026-01-01")) {
            alert("Please select a date from 1 January 2026 onwards.");
            return;
        }
        onConfirm(selectedAarti.name.replace(" Singing", ""), selectedDate);
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
                            <h3 style={{ margin: 0, color: "var(--text-primary)", fontWeight: 700 }}>
                                Mark as Sung
                            </h3>
                            <button
                                onClick={onClose}
                                disabled={updating}
                                style={{ background: "transparent", padding: "0.25rem", color: "var(--text-secondary)", border: "none", cursor: "pointer" }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: "0 1.5rem 1.5rem", flex: 1, overflowY: "auto" }}>
                            <p style={{ fontSize: "1.5rem", color: "var(--color-saffron)", textAlign: "center", margin: "0 0 1.5rem 0", fontWeight: 700 }}>
                                {devotee["Devotee Name"]}
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                        <Calendar size={14} /> Select Date:
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min="2026-01-01"
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            borderRadius: "8px",
                                            border: "2px solid var(--border-color)",
                                            outline: "none",
                                            fontSize: "1rem",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                        Select Aarti:
                                    </label>
                                    <select
                                        value={selectedAarti.name}
                                        onChange={(e) => {
                                            const aarti = AARTI_TYPES.find(a => a.name === e.target.value);
                                            setSelectedAarti(aarti);
                                        }}
                                        disabled={updating}
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            borderRadius: "8px",
                                            border: "2px solid var(--border-color)",
                                            background: "white",
                                            color: "var(--text-primary)",
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            cursor: updating ? "not-allowed" : "pointer",
                                            transition: "all 0.3s",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        {AARTI_TYPES.map((aarti) => (
                                            <option key={aarti.name} value={aarti.name}>
                                                {aarti.name.replace(" Singing", "")}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                <button
                                    className="modal-button"
                                    onClick={onClose}
                                    disabled={updating}
                                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "var(--text-secondary)" }}
                                    type="button"
                                >
                                    Cancel
                                </button>

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
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
