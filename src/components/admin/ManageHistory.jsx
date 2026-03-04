
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Trash2, Calendar, Search, Filter, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import BulkHistoryModal from "./BulkHistoryModal";

export default function ManageHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterAarti, setFilterAarti] = useState("all");
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Join history with devotees to get names using Supabase foreign key
            const { data, error } = await supabase
                .from("history")
                .select(`
                    id,
                    sung_date,
                    aarti_name,
                    devotees (
                        name,
                        contact
                    )
                `)
                .order("sung_date", { ascending: false })
                .limit(100); // Limit to last 100 for performance, maybe add pagination later

            if (error) throw error;
            setHistory(data);
        } catch (err) {
            console.error("Error fetching history:", err);
            toast.error("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (id, devoteeName, date, aarti) => {
        if (!window.confirm(`Delete record: ${devoteeName} - ${aarti} on ${date}?`)) return;

        try {
            const { error } = await supabase
                .from("history")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Record deleted.");
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            setHistory(history.filter(h => h.id !== id));
        } catch (err) {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record.");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected history records?`)) return;

        try {
            const { error } = await supabase
                .from("history")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;

            toast.success(`${selectedIds.length} records deleted.`);
            setSelectedIds([]);
            fetchHistory();
        } catch (err) {
            console.error("Error bulk deleting history:", err);
            toast.error("Failed to delete records.");
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedHistory.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedHistory.map(h => h.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.devotees?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterAarti === "all" || item.aarti_name === filterAarti;
        return matchesSearch && matchesFilter;
    });

    // Reset to page 1 and clear selection when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [searchTerm, filterAarti]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

    // Get unique aartis for filter dropdown
    const uniqueAartis = [...new Set(history.map(h => h.aarti_name))];

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: "300px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search devotee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: "100%", paddingLeft: "2.8rem", padding: "0.75rem 1rem 0.75rem 2.8rem", borderRadius: "8px", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none" }}
                        />
                    </div>
                    <div style={{ position: "relative" }}>
                        <Filter size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <select
                            value={filterAarti}
                            onChange={(e) => setFilterAarti(e.target.value)}
                            style={{ paddingLeft: "2.8rem", appearance: "none", paddingRight: "2rem", padding: "0.75rem 2rem 0.75rem 2.8rem", borderRadius: "8px", border: "2px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontSize: "0.95rem", transition: "all 0.3s", outline: "none", cursor: "pointer" }}
                        >
                            <option value="all">All Aartis</option>
                            {uniqueAartis.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "8px",
                            border: "none",
                            background: "var(--color-saffron)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
                        }}
                    >
                        <Plus size={18} /> Add Records
                    </button>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                borderRadius: "8px",
                                border: "1px solid #fee2e2",
                                background: "#fef2f2",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "500"
                            }}
                        >
                            <Trash2 size={18} /> Delete Selected ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={fetchHistory}
                        style={{ background: "white", border: "1px solid var(--border-color)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", color: "var(--text-secondary)" }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading history...</div>
            ) : (
                <>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                                    <th style={{ padding: "1rem", width: "40px" }}>
                                        <input
                                            type="checkbox"
                                            checked={paginatedHistory.length > 0 && selectedIds.length === paginatedHistory.length}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: "pointer", width: "18px", height: "18px" }}
                                        />
                                    </th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Date</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Devotee</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Aarti</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistory.map((h) => (
                                    <tr key={h.id} style={{ borderBottom: "1px solid #f3f4f6" }} className="hover-row">
                                        <td style={{ padding: "1rem" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(h.id)}
                                                onChange={() => toggleSelect(h.id)}
                                                style={{ cursor: "pointer", width: "18px", height: "18px" }}
                                            />
                                        </td>
                                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={14} /> {h.sung_date}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>
                                            {h.devotees?.name || "Unknown"}
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <span style={{
                                                background: "var(--color-saffron-light)",
                                                color: "var(--color-saffron-dark)",
                                                padding: "0.2rem 0.6rem",
                                                borderRadius: "50px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600
                                            }}>
                                                {h.aarti_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleDelete(h.id, h.devotees?.name, h.sung_date, h.aarti_name)}
                                                style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                            No history records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredHistory.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length} records
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <button
                                    onClick={() => {
                                        setCurrentPage(Math.max(1, currentPage - 1));
                                        setSelectedIds([]);
                                    }}
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
                                    onClick={() => {
                                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                                        setSelectedIds([]);
                                    }}
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
            {showBulkModal && (
                <BulkHistoryModal
                    onClose={() => setShowBulkModal(false)}
                    onUploadComplete={fetchHistory}
                />
            )}
        </div>
    );
}
