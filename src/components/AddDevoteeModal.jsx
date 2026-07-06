import { useState, useEffect } from "react";
import Portal from "./Portal";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Save, AlertCircle, Sparkles, Check } from "lucide-react";
import { AARTI_TYPES } from "../config";
import { toast } from "react-hot-toast";

export default function AddDevoteeModal({ onClose, onDevoteeAdded }) {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [dob, setDob] = useState("");
    const [devoteeType, setDevoteeType] = useState("Congregation Devotee");
    const [skills, setSkills] = useState([]);
    const [isEveryday, setIsEveryday] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Duplicate checks
    const [existingDevotees, setExistingDevotees] = useState([]);
    const [isEverydaySupported, setIsEverydaySupported] = useState(true);
    const [exactDuplicate, setExactDuplicate] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    // Load existing devotees for duplicate checks
    useEffect(() => {
        const fetchDevotees = async () => {
            try {
                const { data, error } = await supabase
                    .from("devotees")
                    .select("id, name, contact, is_everyday")
                    .limit(1000);
                if (error) throw error;
                if (data) {
                    setExistingDevotees(data);
                    // Check if 'is_everyday' column exists
                    if (data.length > 0 && !('is_everyday' in data[0])) {
                        setIsEverydaySupported(false);
                    }
                }
            } catch (err) {
                console.error("Error checking columns:", err);
                setIsEverydaySupported(false);
            }
        };
        fetchDevotees();
    }, []);

    // Levenshtein distance helper
    const getLevenshteinDistance = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const checkDuplicates = (currentName, currentContact) => {
        const cleanName = currentName.toLowerCase().trim().replace(/\s+/g, ' ');
        const cleanContact = currentContact.replace(/[^\d]/g, "");

        let exactPhoneMatch = null;
        let fuzzyNameMatch = null;

        if (cleanContact) {
            exactPhoneMatch = existingDevotees.find(dev => {
                const devContact = dev.contact || "";
                return devContact.replace(/[^\d]/g, "") === cleanContact;
            });
        }

        if (cleanName) {
            fuzzyNameMatch = existingDevotees.find(dev => {
                if (exactPhoneMatch && dev.id === exactPhoneMatch.id) return false;
                const devName = dev.name.toLowerCase().trim().replace(/\s+/g, ' ');
                if (devName === cleanName) return true;

                const distance = getLevenshteinDistance(cleanName, devName);
                const isSubstring = (cleanName.length > 3 && devName.includes(cleanName)) ||
                                    (devName.length > 3 && cleanName.includes(devName));
                return distance <= 2 || isSubstring;
            });
        }

        setExactDuplicate(exactPhoneMatch || null);
        setDuplicateWarning(fuzzyNameMatch || null);
    };

    const handleNameChange = (val) => {
        setName(val);
        checkDuplicates(val, contact);
    };

    const handleContactChange = (val) => {
        setContact(val);
        checkDuplicates(name, val);
    };

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
        if (exactDuplicate) {
            toast.error("A devotee with this contact number is already registered.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const insertPayload = {
                name: name.trim(),
                contact: contact.trim() || null,
                dob: dob || null,
                devotee_type: devoteeType,
                skills: skills,
            };

            if (isEverydaySupported) {
                insertPayload.is_everyday = isEveryday;
            }

            const { data, error: insertError } = await supabase
                .from("devotees")
                .insert([insertPayload])
                .select();

            if (insertError) throw insertError;

            // Fallback for everyday singer
            if (!isEverydaySupported && isEveryday && data?.[0]) {
                const newId = data[0].id;
                const localStr = localStorage.getItem("kirtan_local_everyday") || "[]";
                const localList = JSON.parse(localStr);
                if (!localList.includes(newId)) {
                    localList.push(newId);
                    localStorage.setItem("kirtan_local_everyday", JSON.stringify(localList));
                }
            }

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
                        style={{ display: "flex", flexDirection: "column", maxWidth: "500px", width: "95%" }}
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

                            {/* Duplicate Banners */}
                            {exactDuplicate && (
                                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "0.85rem", borderRadius: "10px", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.88rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold" }}>
                                        <AlertCircle size={16} /> Contact Number Already Registered
                                    </div>
                                    <span>A devotee named <strong>{exactDuplicate.name}</strong> is already registered with the contact number <strong>{exactDuplicate.contact}</strong>. Duplicate mobile numbers are not allowed.</span>
                                </div>
                            )}

                            {duplicateWarning && (
                                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", padding: "0.85rem", borderRadius: "10px", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.88rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold" }}>
                                        <Sparkles size={16} /> Similar Name Found
                                    </div>
                                    <span>A profile for <strong>{duplicateWarning.name}</strong> is already registered. Please check if this is the same devotee before saving (similar name warning).</span>
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Devotee Name <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Ex. Krishna Das"
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: exactDuplicate ? "2px solid #ef4444" : "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--color-saffron)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--border-color)"; }}
                                    required
                                />
                            </div>

                            {/* Everyday Singer Switch */}
                            <div className="form-group" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                        Everyday Singer / Pujari
                                    </label>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Show at the top for quick, 1-click access</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsEveryday(!isEveryday)}
                                    style={{
                                        background: isEveryday ? "var(--color-saffron)" : "#cbd5e1",
                                        border: "none",
                                        borderRadius: "50px",
                                        width: "48px",
                                        height: "24px",
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "all 0.3s"
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        left: isEveryday ? "26px" : "3px",
                                        top: "3px",
                                        width: "18px",
                                        height: "18px",
                                        borderRadius: "50%",
                                        background: "white",
                                        transition: "all 0.3s"
                                    }}></span>
                                </button>
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                                    Contact Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={contact}
                                    onChange={(e) => handleContactChange(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: exactDuplicate ? "2px solid #ef4444" : "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--color-saffron)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--border-color)"; }}
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
                                        outline: "none",
                                        cursor: "pointer"
                                    }}
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
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none" }}
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
                                    disabled={loading || !!exactDuplicate}
                                    style={{ background: exactDuplicate ? "#cbd5e1" : "var(--color-saffron)", color: "white", borderColor: exactDuplicate ? "#cbd5e1" : "var(--color-saffron)", display: "flex", alignItems: "center", gap: "0.5rem", cursor: exactDuplicate ? "not-allowed" : "pointer" }}
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
