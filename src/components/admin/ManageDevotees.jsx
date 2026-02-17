
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Search, Edit, Trash2, UserPlus, Phone, Calendar, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import EditDevoteeModal from "./EditDevoteeModal";
import AddDevoteeModal from "../AddDevoteeModal";
import CsvUploadModal from "./CsvUploadModal";


export default function ManageDevotees() {
    const [devotees, setDevotees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingDevotee, setEditingDevotee] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [showCsvModal, setShowCsvModal] = useState(false);

    const fetchDevotees = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("devotees")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setDevotees(data);
        } catch (err) {
            console.error("Error fetching devotees:", err);
            toast.error("Failed to load devotees.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevotees();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            // First delete history to satisfy foreign key constraints (if cascade is not set up)
            // But usually we set ON DELETE CASCADE in SQL. Assuming it might not be there, best to try delete.
            // Actually, for safety, let's try delete directly.
            const { error } = await supabase
                .from("devotees")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success(`${name} deleted successfully.`);
            fetchDevotees();
        } catch (err) {
            console.error("Error deleting devotee:", err);
            toast.error("Failed to delete. They might have history records.");
        }
    };

    const filteredDevotees = devotees.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.contact && d.contact.includes(searchQuery))
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredDevotees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDevotees = filteredDevotees.slice(startIndex, endIndex);

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: "relative", flex: 1, minWidth: "250px", maxWidth: "400px" }}>
                    <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: "100%", paddingLeft: "2.8rem", padding: "0.75rem 1rem 0.75rem 2.8rem", borderRadius: "8px", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                    />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        className="modal-button"
                        onClick={() => setShowCsvModal(true)}
                        style={{ background: "white", color: "var(--text-secondary)", border: "1px solid #e2e8f0" }}
                    >
                        <FileText size={18} /> Import CSV
                    </button>
                    <button
                        className="modal-button primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <UserPlus size={18} /> Add Devotee
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</div>
            ) : (
                <>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Name</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Contact</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>DOB</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Skills</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDevotees.map((devotee) => (
                                    <tr key={devotee.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }} className="hover-row">
                                        <td style={{ padding: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>
                                            {devotee.name}
                                            {devotee.devotee_type && (
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 400 }}>
                                                    <span style={{
                                                        background: devotee.devotee_type === "Brahmachari" ? "#ffedd5" : devotee.devotee_type === "VOICE Devotee" ? "#dbeafe" : "#f1f5f9",
                                                        color: devotee.devotee_type === "Brahmachari" ? "#c2410c" : devotee.devotee_type === "VOICE Devotee" ? "#1e40af" : "#475569",
                                                        padding: "0.1rem 0.4rem",
                                                        borderRadius: "4px",
                                                        display: "inline-block"
                                                    }}>
                                                        {devotee.devotee_type}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                                            {devotee.contact ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Phone size={14} /> {devotee.contact}
                                                </div>
                                            ) : "-"}
                                        </td>
                                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                                            {devotee.dob ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Calendar size={14} /> {devotee.dob}
                                                </div>
                                            ) : "-"}
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                {devotee.skills && devotee.skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} style={{
                                                        background: "var(--color-saffron-light)",
                                                        color: "var(--color-saffron-dark)",
                                                        padding: "0.2rem 0.6rem",
                                                        borderRadius: "50px",
                                                        fontSize: "0.8rem",
                                                        border: "1px solid rgba(37, 99, 235, 0.2)"
                                                    }}>
                                                        {skill}
                                                    </span>
                                                ))}
                                                {devotee.skills && devotee.skills.length > 3 && (
                                                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", padding: "0.2rem" }}>+{devotee.skills.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => setEditingDevotee(devotee)}
                                                    style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #e5e7eb", background: "white", color: "#64748b", cursor: "pointer" }}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(devotee.id, devotee.name)}
                                                    style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDevotees.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                            No devotees found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredDevotees.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredDevotees.length)} of {filteredDevotees.length} devotees
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        border: "1px solid var(--border-color)",
                                        background: currentPage === 1 ? "#f3f4f6" : "white",
                                        color: currentPage === 1 ? "var(--text-secondary)" : "var(--text-primary)",
                                        borderRadius: "6px",
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    ← Previous
                                </button>
                                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", minWidth: "60px", textAlign: "center" }}>
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        border: "1px solid var(--border-color)",
                                        background: currentPage === totalPages || totalPages === 0 ? "#f3f4f6" : "white",
                                        color: currentPage === totalPages || totalPages === 0 ? "var(--text-secondary)" : "var(--text-primary)",
                                        borderRadius: "6px",
                                        cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {editingDevotee && (
                <EditDevoteeModal
                    devotee={editingDevotee}
                    onClose={() => setEditingDevotee(null)}
                    onUpdate={fetchDevotees}
                />
            )}

            {showAddModal && (
                <AddDevoteeModal
                    onClose={() => setShowAddModal(false)}
                    onDevoteeAdded={fetchDevotees}
                />
            )}
        </div>
    );
}
