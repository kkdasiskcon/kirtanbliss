import { useState } from "react";
import Portal from "../Portal";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitMerge, AlertTriangle, ArrowRight, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MergeDevoteesModal({ devotees, onClose, onMerged }) {
    const [sourceId, setSourceId] = useState("");
    const [targetId, setTargetId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sourceDevotee = devotees.find(d => String(d.id) === String(sourceId));
    const targetDevotee = devotees.find(d => String(d.id) === String(targetId));

    const handleMerge = async () => {
        if (!sourceId || !targetId) {
            toast.error("Please select both profiles.");
            return;
        }
        if (sourceId === targetId) {
            toast.error("Duplicate profile and primary profile must be different.");
            return;
        }

        const confirmMsg = `Are you sure you want to merge "${sourceDevotee["Devotee Name"]}" into "${targetDevotee["Devotee Name"]}"?\n\nThis will:\n1. Move all singing history from "${sourceDevotee["Devotee Name"]}" to "${targetDevotee["Devotee Name"]}".\n2. Permanently delete "${sourceDevotee["Devotee Name"]}".\n\nThis action cannot be undone.`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setError(null);

        try {
            // Step 1: Move history
            console.log(`Moving history from devotee ${sourceId} to ${targetId}...`);
            const { data: updatedHistory, error: historyError } = await supabase
                .from("history")
                .update({ devotee_id: targetId })
                .eq("devotee_id", sourceId)
                .select();

            if (historyError) throw historyError;
            const historyCount = updatedHistory?.length || 0;
            console.log(`Successfully moved ${historyCount} history records.`);

            // Step 2: Delete duplicate devotee
            console.log(`Deleting duplicate devotee ${sourceId}...`);
            const { error: deleteError } = await supabase
                .from("devotees")
                .delete()
                .eq("id", sourceId);

            if (deleteError) throw deleteError;

            toast.success(`Successfully merged! ${historyCount} history records transferred.`);
            onMerged();
            onClose();
        } catch (err) {
            console.error("Error during merge:", err);
            setError(err.message || "Failed to merge profiles.");
            toast.error("Merge failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <AnimatePresence>
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!loading ? onClose : undefined}
                >
                    <motion.div
                        className="modal-content glass-panel"
                        style={{ background: "white", width: "95%", maxWidth: "550px", padding: "0", display: "flex", flexDirection: "column" }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", flexShrink: 0 }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                <GitMerge size={20} color="var(--color-saffron)" /> Merge Duplicate Profiles
                            </h3>
                            <button onClick={onClose} disabled={loading} style={{ background: "transparent", border: "none", padding: "0.25rem", cursor: loading ? "not-allowed" : "pointer" }}>
                                <X size={20} color={loading ? "#cbd5e1" : "var(--text-secondary)"} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "1.5rem", overflowY: "auto" }}>
                            {error && (
                                <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", color: "#d48800", padding: "1rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", fontSize: "0.88rem" }}>
                                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                                <div>
                                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Merge Warning</strong>
                                    Use this tool to consolidate duplicate devotee profiles created by mistake (e.g. "Gopal Das" and "Gopala Das"). All history data from the duplicate profile will be transferred to the primary one, and the duplicate profile will be deleted forever.
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                
                                {/* Source Devotee selection */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                        1. Duplicate Profile (Will be DELETED)
                                    </label>
                                    <select
                                        value={sourceId}
                                        onChange={(e) => setSourceId(e.target.value)}
                                        style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "#dc2626", fontWeight: 600, fontSize: "0.95rem", outline: "none", cursor: "pointer" }}
                                    >
                                        <option value="">-- Select Duplicate Profile --</option>
                                        {devotees.map(d => (
                                            <option key={d.id} value={d.id}>{d["Devotee Name"]} {d["Contact"] ? `(${d["Contact"]})` : ""}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "flex", justifyContent: "center", color: "var(--text-secondary)" }}>
                                    <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                                </div>

                                {/* Target Devotee selection */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                        2. Primary Profile (Will be KEPT)
                                    </label>
                                    <select
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "#16a34a", fontWeight: 600, fontSize: "0.95rem", outline: "none", cursor: "pointer" }}
                                    >
                                        <option value="">-- Select Primary Profile --</option>
                                        {devotees.filter(d => String(d.id) !== String(sourceId)).map(d => (
                                            <option key={d.id} value={d.id}>{d["Devotee Name"]} {d["Contact"] ? `(${d["Contact"]})` : ""}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            {/* Summary preview */}
                            {sourceDevotee && targetDevotee && (
                                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}>
                                    <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 700, color: "var(--text-primary)" }}>Summary of Actions:</h4>
                                    <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                        <li>Transfer history of <strong>{sourceDevotee["Devotee Name"]}</strong> to <strong>{targetDevotee["Devotee Name"]}</strong>.</li>
                                        <li>Delete the profile for <strong>{sourceDevotee["Devotee Name"]}</strong> permanently.</li>
                                    </ul>
                                </div>
                            )}


                            {/* Action Buttons */}
                            <div className="modal-actions" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                                <button
                                    type="button"
                                    className="modal-button"
                                    onClick={onClose}
                                    disabled={loading}
                                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "var(--text-secondary)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMerge}
                                    disabled={loading || !sourceId || !targetId}
                                    style={{
                                        background: (!sourceId || !targetId) ? "#cbd5e1" : "linear-gradient(135deg, var(--color-saffron), #ea580c)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "0.75rem 1.25rem",
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        cursor: (!sourceId || !targetId) ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {loading ? "Merging..." : <><GitMerge size={18} /> Merge Profiles</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
