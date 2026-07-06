import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal";
import { X, Phone, Calendar, Music, MessageCircle, Star, Send, Trash2, Award, Edit } from "lucide-react";
import { AARTI_TYPES } from "../config";
import { toast } from "react-hot-toast";
import { getDaysAgo } from "../utils";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import EditDevoteeModal from "./admin/EditDevoteeModal";

export default function DevoteeDetailModal({
    devotee,
    onClose,
    onRefresh,
    selectedAarti,
    isEverydaySupported = true,
    isCoordinationSupported = true,
    localEverydayList = [],
    setLocalEverydayList = () => {},
    localCoordination = {},
    setLocalCoordination = () => {}
}) {
    const [updating, setUpdating] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [inviteDate, setInviteDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });

    const isEveryday = isEverydaySupported
        ? devotee.is_everyday
        : localEverydayList.includes(devotee.id);

    const coordination = isCoordinationSupported
        ? (devotee.coordination_status || {})
        : (localCoordination[devotee.id] || {});

    const sanitizePhone = (phone) => phone?.replace(/[^\d+]/g, '') || '';

    // Toggle Everyday status
    const handleToggleEveryday = async () => {
        setUpdating(true);
        const nextVal = !isEveryday;
        try {
            if (isEverydaySupported) {
                const { error } = await supabase
                    .from("devotees")
                    .update({ is_everyday: nextVal })
                    .eq("id", devotee.id);
                if (error) throw error;
            } else {
                // Fallback to local state
                let updatedList;
                if (nextVal) {
                    updatedList = [...localEverydayList, devotee.id];
                } else {
                    updatedList = localEverydayList.filter(id => id !== devotee.id);
                }
                setLocalEverydayList(updatedList);
                localStorage.setItem("kirtan_local_everyday", JSON.stringify(updatedList));
            }
            toast.success(nextVal ? "Marked as everyday singer!" : "Removed from everyday list.");
            onRefresh();
        } catch (err) {
            console.error("Error setting everyday status:", err);
            toast.error("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    // Update coordination status
    const handleUpdateCoordination = async (statusVal) => {
        setUpdating(true);
        const aartiName = selectedAarti?.name?.replace(" Singing", "") || "Kirtan";
        const dateObj = new Date(inviteDate);
        const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

        const newStatus = {
            status: statusVal,
            aarti: aartiName,
            date: inviteDate,
            dateFormatted: dateStr,
            updatedAt: new Date().toISOString()
        };

        try {
            if (isCoordinationSupported) {
                const { error } = await supabase
                    .from("devotees")
                    .update({ coordination_status: newStatus })
                    .eq("id", devotee.id);
                if (error) throw error;
            } else {
                // Fallback to local state
                const updatedCoord = { ...localCoordination, [devotee.id]: newStatus };
                setLocalCoordination(updatedCoord);
                localStorage.setItem("kirtan_local_coord", JSON.stringify(updatedCoord));
            }
            toast.success(`Status updated to: ${statusVal}`);
            onRefresh();
        } catch (err) {
            console.error("Error updating coordination status:", err);
            toast.error("Failed to save status.");
        } finally {
            setUpdating(false);
        }
    };

    // Send WhatsApp invite
    const handleSendWhatsApp = () => {
        if (!devotee.Contact) {
            toast.error("No contact number for this devotee.");
            return;
        }

        const aartiName = selectedAarti?.name?.replace(" Singing", "") || "Kirtan";
        const dateObj = new Date(inviteDate);
        const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });

        const message = `Hare Krishna ${devotee["Devotee Name"]} Ji, could you please lead the ${aartiName} on ${dateStr}? Please let us know if you are available. Thank you!`;
        const phone = sanitizePhone(devotee.Contact);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

        // Mark as Invited
        handleUpdateCoordination("Invited");
    };

    // Delete single history record from history list
    const handleDeleteHistory = async (historyId) => {
        if (!window.confirm("Are you sure you want to delete this specific kirtan entry?")) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from("history")
                .delete()
                .eq("id", historyId);

            if (error) throw error;
            toast.success("Entry deleted successfully.");
            onRefresh();
        } catch (err) {
            console.error("Error deleting history:", err);
            toast.error("Failed to delete history record.");
        } finally {
            setUpdating(false);
        }
    };

    // Calculate aarti breakdown
    const aartiBreakdown = {};
    devotee.history?.forEach((h) => {
        const name = h.aarti_name || "Kirtan";
        aartiBreakdown[name] = (aartiBreakdown[name] || 0) + 1;
    });

    const totalSevas = devotee.history?.length || 0;

    return (
        <Portal>
            <AnimatePresence>
                <motion.div
                    className="modal-overlay"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ zIndex: 1000 }}
                >
                    <motion.div
                        className="modal-content glass-panel"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ x: "100%", opacity: 0.9 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0.9 }}
                        style={{
                            position: "fixed",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: "90%",
                            maxWidth: "500px",
                            height: "100vh",
                            maxHeight: "100vh",
                            borderRadius: "20px 0 0 20px",
                            background: "white",
                            boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            padding: 0
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: "1.5rem",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "linear-gradient(135deg, var(--color-saffron-light), white)"
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                    Devotee Profile
                                </h3>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    Manage details, history and coordination
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    style={{
                                        background: "#f1f5f9",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "var(--text-secondary)"
                                    }}
                                    title="Edit profile"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: "#f1f5f9",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "var(--text-secondary)"
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            
                            {/* Devotee Info Section */}
                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "16px",
                                    background: devotee.devotee_type === "Brahmachari" ? "linear-gradient(135deg, #ffedd5, #fdba74)" : "linear-gradient(135deg, #e0f2fe, #7dd3fc)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    color: devotee.devotee_type === "Brahmachari" ? "#ea580c" : "#0284c7"
                                }}>
                                    {devotee["Devotee Name"]?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                        {devotee["Devotee Name"]}
                                    </h4>
                                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                                        {devotee.devotee_type && (
                                            <span style={{
                                                fontSize: "0.75rem",
                                                background: devotee.devotee_type === "Brahmachari" ? "#fff7ed" : "#eff6ff",
                                                color: devotee.devotee_type === "Brahmachari" ? "#c2410c" : "#1e40af",
                                                padding: "0.1rem 0.5rem",
                                                borderRadius: "50px",
                                                border: `1px solid ${devotee.devotee_type === "Brahmachari" ? "#fdba74" : "#bfdbfe"}`,
                                                fontWeight: 600
                                            }}>
                                                {devotee.devotee_type}
                                            </span>
                                        )}
                                        {isEveryday && (
                                            <span style={{
                                                fontSize: "0.75rem",
                                                background: "#fef08a",
                                                color: "#854d0e",
                                                padding: "0.1rem 0.5rem",
                                                borderRadius: "50px",
                                                border: "1px solid #facc15",
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.2rem"
                                            }}>
                                                <Star size={10} fill="#854d0e" /> Everyday
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Actions Quick Row */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "0.5rem",
                                padding: "1rem",
                                background: "#f8fafc",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Contact</span>
                                    <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{devotee.Contact || "No contact"}</strong>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {devotee.Contact && (
                                        <>
                                            <a href={`tel:${sanitizePhone(devotee.Contact)}`} className="icon-button" style={{ width: "36px", height: "36px" }}>
                                                <Phone size={16} />
                                            </a>
                                            <a href={`https://wa.me/${sanitizePhone(devotee.Contact)}`} target="_blank" rel="noopener noreferrer" className="icon-button" style={{ width: "36px", height: "36px", background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Everyday Toggle */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.2rem 0" }}>
                                <div>
                                    <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Everyday Singer / Pujari</h5>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Pins them to the top quick-select list</span>
                                </div>
                                <button
                                    onClick={handleToggleEveryday}
                                    disabled={updating}
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

                            <hr style={{ border: 0, borderBottom: "1px solid #f1f5f9", margin: 0 }} />

                            {/* Invitation System (Req 5) */}
                            <div>
                                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <Send size={18} color="var(--color-saffron)" /> Send Invitation
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Target Date</label>
                                            <input
                                                type="date"
                                                value={inviteDate}
                                                onChange={(e) => setInviteDate(e.target.value)}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.6rem",
                                                    borderRadius: "8px",
                                                    border: "1px solid #cbd5e1",
                                                    fontSize: "0.85rem",
                                                    outline: "none"
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: 1.2, display: "flex", alignItems: "flex-end" }}>
                                            <button
                                                onClick={handleSendWhatsApp}
                                                disabled={!devotee.Contact}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.6rem",
                                                    background: devotee.Contact ? "linear-gradient(135deg, #4caf50, #2e7d32)" : "#cbd5e1",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontWeight: "bold",
                                                    fontSize: "0.85rem",
                                                    cursor: devotee.Contact ? "pointer" : "not-allowed",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "0.4rem",
                                                    boxShadow: devotee.Contact ? "0 4px 10px rgba(76, 175, 80, 0.3)" : "none"
                                                }}
                                            >
                                                <MessageCircle size={16} /> Open WhatsApp Invite
                                            </button>
                                        </div>
                                    </div>

                                    {/* Coordination Status Badges */}
                                    <div>
                                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>
                                            Response Status {coordination.status && `(${coordination.dateFormatted})`}
                                        </label>
                                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                            {["Pending", "Invited", "Confirmed", "Declined"].map((statusOption) => {
                                                const isActive = coordination.status === statusOption;
                                                let activeColor = "#64748b";
                                                let activeBg = "#f1f5f9";
                                                let activeBorder = "#cbd5e1";
                                                
                                                if (statusOption === "Invited") {
                                                    activeBg = "#eff6ff"; activeColor = "#2563eb"; activeBorder = "#93c5fd";
                                                } else if (statusOption === "Confirmed") {
                                                    activeBg = "#f0fdf4"; activeColor = "#16a34a"; activeBorder = "#86efac";
                                                } else if (statusOption === "Declined") {
                                                    activeBg = "#fef2f2"; activeColor = "#dc2626"; activeBorder = "#fca5a5";
                                                }

                                                return (
                                                    <button
                                                        key={statusOption}
                                                        onClick={() => handleUpdateCoordination(statusOption)}
                                                        disabled={updating}
                                                        style={{
                                                            padding: "0.4rem 0.75rem",
                                                            borderRadius: "8px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            transition: "all 0.2s",
                                                            border: isActive ? `2px solid ${activeColor}` : "1px solid #e2e8f0",
                                                            background: isActive ? activeBg : "white",
                                                            color: isActive ? activeColor : "#475569"
                                                        }}
                                                    >
                                                        {statusOption}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: 0, borderBottom: "1px solid #f1f5f9", margin: 0 }} />

                            {/* Aarti Stats / Counters (Req 4) */}
                            <div>
                                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <Award size={18} color="var(--color-saffron)" /> Aarti Breakdown
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    {AARTI_TYPES.map((a) => {
                                        const name = a.name.replace(" Singing", "");
                                        const count = aartiBreakdown[name] || 0;
                                        return (
                                            <div
                                                key={name}
                                                style={{
                                                    padding: "0.75rem",
                                                    borderRadius: "12px",
                                                    border: "1px solid #e2e8f0",
                                                    background: count > 0 ? "linear-gradient(135deg, #f8fafc, white)" : "#f8fafc",
                                                    opacity: count > 0 ? 1 : 0.6,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>{name}</span>
                                                <span style={{
                                                    fontSize: "0.85rem",
                                                    fontWeight: "bold",
                                                    color: count > 0 ? "var(--color-saffron)" : "#64748b",
                                                    background: count > 0 ? "var(--color-saffron-light)" : "#e2e8f0",
                                                    padding: "0.15rem 0.5rem",
                                                    borderRadius: "6px"
                                                }}>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
                                    Total services recorded: <strong>{totalSevas}</strong>
                                </div>
                            </div>

                            <hr style={{ border: 0, borderBottom: "1px solid #f1f5f9", margin: 0 }} />

                            {/* Timeline Log */}
                            <div>
                                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <Calendar size={18} color="var(--color-saffron)" /> Recent Service Timeline
                                </h4>
                                {devotee.history && devotee.history.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {devotee.history.slice(0, 10).map((h) => {
                                            const date = new Date(h.sung_date);
                                            const formattedDate = date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                                            return (
                                                <div
                                                    key={h.id}
                                                    style={{
                                                        padding: "0.6rem 0.75rem",
                                                        borderRadius: "8px",
                                                        border: "1px solid #f1f5f9",
                                                        background: "#fafafa",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <div>
                                                        <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block" }}>{h.aarti_name}</strong>
                                                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{formattedDate}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteHistory(h.id)}
                                                        disabled={updating}
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: "#94a3b8",
                                                            padding: "0.25rem",
                                                            borderRadius: "4px"
                                                        }}
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 size={14} className="hover-red" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                        No kirtans logged yet.
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {showEditModal && (
                <EditDevoteeModal
                    devotee={devotee}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={() => {
                        setShowEditModal(false);
                        onRefresh();
                    }}
                />
            )}
        </Portal>
    );
}
