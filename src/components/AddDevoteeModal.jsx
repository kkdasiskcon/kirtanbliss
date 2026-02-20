import { useState, useEffect } from "react";
import Portal from "./Portal";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Save, AlertCircle } from "lucide-react";
import { AARTI_TYPES } from "../config";
import { toast } from "react-hot-toast";

export default function AddDevoteeModal({ onClose, onDevoteeAdded }) {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [dob, setDob] = useState("");
    const [devoteeType, setDevoteeType] = useState("Congregation Devotee");
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Scroll to top when modal opens
    // REMOVED for Portals
    useEffect(() => {
        // No-op
    }, []);


    const toggleSkill = (skill) => {
        if (skills.includes(skill)) {
            setSkills(skills.filter((s) => s !== skill));
        } else {
            setSkills([...skills, skill]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from("devotees")
                .insert([
                    {
                        name: name.trim(),
                        contact: contact.trim() || null,
                        dob: dob || null,
                        devotee_type: devoteeType,
                        skills: skills,
                    },
                ])
                .select();

            if (insertError) throw insertError;

            toast.success("Devotee added successfully!");
            onDevoteeAdded();
            onClose();
        } catch (err) {
            console.error("Error adding devotee:", err);
            setError(err.message || "Failed to add devotee");
            toast.error("Failed to add devotee");
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
                        style={{ display: "flex", flexDirection: "column" }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", flexShrink: 0 }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                <UserPlus size={20} color="var(--color-saffron)" /> Add New Devotee
                            </h3>
                            <button onClick={onClose} disabled={loading} style={{ background: "transparent", border: "none", padding: "0.25rem", cursor: loading ? "not-allowed" : "pointer" }}>
                                <X size={20} color={loading ? "#cbd5e1" : "var(--text-secondary)"} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
                            {error && (
                                <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Devotee Name <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex. Krishna Das"
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = "var(--color-saffron)"; e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Contact Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = "var(--color-saffron)"; e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Devotee Type
                                </label>
                                <select
                                    value={devoteeType}
                                    onChange={(e) => setDevoteeType(e.target.value)}
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        padding: "0.75rem",
                                        border: "2px solid var(--border-color)",
                                        background: "white",
                                        color: "var(--text-primary)",
                                        fontSize: "0.95rem",
                                        transition: "all 0.3s",
                                        outline: "none",
                                        cursor: "pointer"
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = "var(--color-saffron)"; e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                                >
                                    <option value="Congregation Devotee">Congregation Devotee</option>
                                    <option value="Brahmachari">Brahmachari</option>
                                    <option value="VOICE Devotee">VOICE Devotee</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = "var(--color-saffron)"; e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Skills (Select all that apply)
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {AARTI_TYPES.map((aarti) => {
                                        const skillName = aarti.name.replace(" Singing", "");
                                        const isSelected = skills.includes(skillName);
                                        return (
                                            <button
                                                key={skillName}
                                                type="button"
                                                onClick={() => toggleSkill(skillName)}
                                                style={{
                                                    padding: "0.5rem 0.75rem",
                                                    fontSize: "0.85rem",
                                                    borderRadius: "50px",
                                                    border: isSelected ? "2px solid var(--color-saffron)" : "2px solid var(--border-color)",
                                                    background: isSelected ? "var(--color-saffron-light)" : "white",
                                                    color: isSelected ? "var(--color-saffron-dark)" : "var(--text-secondary)",
                                                    fontWeight: isSelected ? 600 : 500,
                                                    cursor: "pointer",
                                                    transition: "all 0.3s"
                                                }}
                                            >
                                                {skillName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="modal-actions" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
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
                                    type="submit"
                                    className="modal-button primary"
                                    disabled={loading}
                                    style={{ background: "var(--color-saffron)", color: "white", borderColor: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                >
                                    {loading ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Save size={18} /> Save Devotee
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
