
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, RefreshCw, CheckCircle, Save } from "lucide-react";

export default function UpdateModal({
    devotee,
    updateStatus,
    updating,
    onClose,
    onRefresh, // This is now 'confirmMarkSung'
}) {

    return (
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
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)" }}>
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

                    <p className="modal-devotee-name" style={{ fontSize: "1.5rem", color: "var(--color-saffron)", textAlign: "center", margin: "0 0 1.5rem 0", fontWeight: 700 }}>
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
                        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem" }}>
                            Mark as sung today? This will update the history log.
                        </p>
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
                                onClick={() => {
                                    console.log("Confirm button clicked for:", devotee["Devotee Name"]);
                                    onRefresh();
                                }}
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
