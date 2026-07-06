import { useState, useEffect } from "react";
import Portal from "../Portal";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle, Edit2, Sparkles } from "lucide-react";
import { AARTI_TYPES } from "../../config";
import { toast } from "react-hot-toast";

export default function EditDevoteeModal({ devotee, onClose, onUpdate }) {
    const [name, setName] = useState(devotee.name || devotee["Devotee Name"] || "");
    const [contact, setContact] = useState(devotee.contact || devotee["Contact"] || "");
    const [dob, setDob] = useState(devotee.dob || devotee["DOB"] || "");
    const [devoteeType, setDevoteeType] = useState(devotee.devotee_type || "Congregation Devotee");
    const [skills, setSkills] = useState(devotee.skills || []);
    const [isEveryday, setIsEveryday] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Duplicate check and DB compatibility states
    const [otherDevotees, setOtherDevotees] = useState([]);
    const [isEverydaySupported, setIsEverydaySupported] = useState(true);
    const [exactDuplicate, setExactDuplicate] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    // Scroll to top when modal opens
    // REMOVED: window.scrollTo call as it causes displacement in Portals.
    useEffect(() => {
        if (devotee.skills) {
            setSkills(devotee.skills);
        }
        if (devotee.devotee_type) {
            setDevoteeType(devotee.devotee_type);
        }
        
        // Handle everyday status initial value
        const localListStr = localStorage.getItem("kirtan_local_everyday") || "[]";
        const localList = JSON.parse(localListStr);
        const hasLocalEveryday = localList.includes(devotee.id);
        setIsEveryday(devotee.is_everyday || hasLocalEveryday);

        // Fetch other devotees for validation
        const fetchOthers = async () => {
            try {
                const { data, error } = await supabase
                    .from("devotees")
                    .select("id, name, contact, is_everyday")
                    .neq("id", devotee.id)
                    .limit(1000);
                if (error) throw error;
                if (data) {
                    setOtherDevotees(data);
                    // Check if 'is_everyday' exists in DB
                    const { data: colCheck } = await supabase.from("devotees").select("is_everyday").limit(1);
                    if (colCheck && colCheck.length > 0 && !('is_everyday' in colCheck[0])) {
                        setIsEverydaySupported(false);
                    }
                }
            } catch (err) {
                console.error("Error checking columns:", err);
                setIsEverydaySupported(false);
            }
        };
        fetchOthers();
    }, [devotee]);

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
            exactPhoneMatch = otherDevotees.find(dev => {
                const devContact = dev.contact || "";
                return devContact.replace(/[^\d]/g, "") === cleanContact;
            });
        }

        if (cleanName) {
            fuzzyNameMatch = otherDevotees.find(dev => {
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
            const updatePayload = {
                name: name.trim(),
                contact: contact.trim() || null,
                dob: dob || null,
                devotee_type: devoteeType,
                skills: skills,
            };

            if (isEverydaySupported) {
                updatePayload.is_everyday = isEveryday;
            }

            const { error: updateError } = await supabase
                .from("devotees")
                .update(updatePayload)
                .eq("id", devotee.id);

            if (updateError) throw updateError;

            // Sync with local list fallback
            const localStr = localStorage.getItem("kirtan_local_everyday") || "[]";
            let localList = JSON.parse(localStr);
            if (isEveryday) {
                if (!localList.includes(devotee.id)) {
                    localList.push(devotee.id);
                }
            } else {
                localList = localList.filter(id => id !== devotee.id);
            }
            localStorage.setItem("kirtan_local_everyday", JSON.stringify(localList));

            toast.success("Devotee updated successfully!");
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Error updating devotee:", err);
            setError(err.message || "Failed to update devotee");
            toast.error("Failed to update devotee");
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
                        style={{ background: "white", width: "95%", maxWidth: "500px", padding: "0", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", flexShrink: 0 }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)" }}>
                                <Edit2 size={20} color="var(--color-saffron)" /> Edit Devotee
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
                                    <span>Another devotee named <strong>{exactDuplicate.name}</strong> is already registered with the contact number <strong>{exactDuplicate.contact}</strong>. Duplicate mobile numbers are not allowed.</span>
                                </div>
                            )}

                            {duplicateWarning && (
                                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", padding: "0.85rem", borderRadius: "10px", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.88rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold" }}>
                                        <Sparkles size={16} /> Similar Name Found
                                    </div>
                                    <span>Another profile for <strong>{duplicateWarning.name}</strong> is registered. Please check if this is the same devotee before saving (similar name warning).</span>
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
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: exactDuplicate ? "2px solid #ef4444" : "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
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
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    value={contact}
                                    onChange={(e) => handleContactChange(e.target.value)}
                                    style={{ width: "100%", borderRadius: "8px", padding: "0.75rem", border: exactDuplicate ? "2px solid #ef4444" : "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--color-saffron)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = exactDuplicate ? "#ef4444" : "var(--border-color)"; }}
                                />
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
                                    Skills
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
                                    style={{ background: exactDuplicate ? "#cbd5e1" : "var(--color-saffron)", color: "white", borderColor: exactDuplicate ? "#cbd5e1" : "var(--color-saffron)", cursor: exactDuplicate ? "not-allowed" : "pointer" }}
                                >
                                    {loading ? "Saving..." : <><Save size={18} /> Update Devotee</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
