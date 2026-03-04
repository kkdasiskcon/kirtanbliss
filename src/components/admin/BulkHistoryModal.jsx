import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Portal from "../Portal";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download, CheckCircle, AlertTriangle, Plus, Search, Calendar, User, UserPlus } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { AARTI_TYPES } from "../../config";

export default function BulkHistoryModal({ onClose, onUploadComplete }) {
    const [activeTab, setActiveTab] = useState("quick"); // "quick" or "csv"
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);

    // Quick Entry State
    const [devotees, setDevotees] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [selectedDevotee, setSelectedDevotee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedAarti, setSelectedAarti] = useState(AARTI_TYPES[0].name);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchDevotees = async () => {
            const { data, error } = await supabase.from("devotees").select("id, name").order("name");
            if (!error) setDevotees(data);
        };
        fetchDevotees();
    }, []);

    const filteredDevotees = devotees.filter(d =>
        d.name.toLowerCase().includes(searchName.toLowerCase())
    ).slice(0, 10);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!selectedDevotee) {
            toast.error("Please select a devotee");
            return;
        }

        setUploading(true);
        try {
            const { error } = await supabase
                .from("history")
                .insert([{
                    devotee_id: selectedDevotee.id,
                    sung_date: selectedDate,
                    aarti_name: selectedAarti
                }]);

            if (error) throw error;

            toast.success(`Added ${selectedDevotee.name}`);
            setSearchName("");
            setSelectedDevotee(null);
            onUploadComplete(); // Refresh list in background
        } catch (err) {
            console.error("Error adding history:", err);
            toast.error("Failed to add record");
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ["Devotee Name", "Date", "Aarti"];
        const exampleRow = ["Krishna Das", "2026-03-01", "Mangala Aarti Singing"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + exampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "history_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setLogs([]);
        setStats(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                await processRecords(results.data);
            },
            error: (err) => {
                console.error("CSV Error:", err);
                toast.error("Failed to parse CSV file.");
                setUploading(false);
            }
        });
    };

    const processRecords = async (records) => {
        let added = 0;
        let errors = 0;
        let newLogs = [];

        // Pre-fetch all devotees for name matching
        const { data: allDevotees } = await supabase.from("devotees").select("id, name");
        const devoteeMap = new Map(allDevotees.map(d => [d.name.toLowerCase().trim(), d.id]));

        for (const record of records) {
            const name = record["Devotee Name"]?.trim();
            const date = record["Date"]?.trim();
            const aarti = record["Aarti"]?.trim();

            if (!name || !date || !aarti) {
                errors++;
                newLogs.push(`⚠️ Skipping row: Missing data for ${name || 'Unknown'}`);
                continue;
            }

            const devoteeId = devoteeMap.get(name.toLowerCase());

            if (!devoteeId) {
                errors++;
                newLogs.push(`❌ Error: Devotee "${name}" not found in database`);
                continue;
            }

            try {
                const { error } = await supabase
                    .from("history")
                    .insert([{
                        devotee_id: devoteeId,
                        sung_date: date,
                        aarti_name: aarti
                    }]);

                if (error) throw error;
                added++;
                newLogs.push(`✅ Added: ${name} (${aarti} on ${date})`);
            } catch (err) {
                console.error("Insert Error:", err);
                errors++;
                newLogs.push(`❌ Error (${name}): ${err.message}`);
            }
        }

        setStats({ total: records.length, added, errors });
        setLogs(newLogs);
        setUploading(false);

        if (added > 0) {
            toast.success(`Successfully added ${added} records!`);
            onUploadComplete();
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
                    onClick={onClose}
                    style={{ zIndex: 1100 }}
                >
                    <motion.div
                        className="modal-content glass-panel"
                        style={{ background: "white", width: "95%", maxWidth: "600px", padding: "0", display: "flex", flexDirection: "column", minHeight: "500px" }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                <Calendar size={20} color="var(--color-saffron)" /> Add Past Records
                            </h3>
                            <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "0.25rem", cursor: "pointer" }}>
                                <X size={20} color="var(--text-secondary)" />
                            </button>
                        </div>

                        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
                            <button
                                onClick={() => setActiveTab("quick")}
                                style={{ flex: 1, padding: "1rem", border: "none", background: activeTab === "quick" ? "white" : "#f8fafc", color: activeTab === "quick" ? "var(--color-saffron)" : "#64748b", fontWeight: 600, borderBottom: activeTab === "quick" ? "2px solid var(--color-saffron)" : "none", cursor: "pointer" }}
                            >
                                <Plus size={16} style={{ marginRight: "0.5rem" }} /> Quick Entry
                            </button>
                            <button
                                onClick={() => { setActiveTab("csv"); setStats(null); }}
                                style={{ flex: 1, padding: "1rem", border: "none", background: activeTab === "csv" ? "white" : "#f8fafc", color: activeTab === "csv" ? "var(--color-saffron)" : "#64748b", fontWeight: 600, borderBottom: activeTab === "csv" ? "2px solid var(--color-saffron)" : "none", cursor: "pointer" }}
                            >
                                <Upload size={16} style={{ marginRight: "0.5rem" }} /> CSV Upload
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
                            {activeTab === "quick" ? (
                                <form onSubmit={handleQuickAdd} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <div style={{ position: "relative" }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>Devotee Name</label>
                                        <div style={{ position: "relative" }}>
                                            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                            <input
                                                type="text"
                                                placeholder="Search name..."
                                                value={selectedDevotee ? selectedDevotee.name : searchName}
                                                onChange={(e) => {
                                                    setSearchName(e.target.value);
                                                    setSelectedDevotee(null);
                                                    setShowDropdown(true);
                                                }}
                                                onFocus={() => setShowDropdown(true)}
                                                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.8rem", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none", fontSize: "1rem" }}
                                            />
                                            {selectedDevotee && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDevotee(null)}
                                                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {showDropdown && searchName && !selectedDevotee && (
                                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", borderRadius: "10px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", marginTop: "0.25rem", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                                                {filteredDevotees.length > 0 ? (
                                                    filteredDevotees.map(d => (
                                                        <div
                                                            key={d.id}
                                                            onClick={() => { setSelectedDevotee(d); setShowDropdown(false); setSearchName(""); }}
                                                            style={{ padding: "0.75rem 1rem", cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                            className="dropdown-item"
                                                        >
                                                            <User size={14} color="#94a3b8" /> {d.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", textAlign: "center" }}>No results found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>Aarti Type</label>
                                            <select
                                                value={selectedAarti}
                                                onChange={(e) => setSelectedAarti(e.target.value)}
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none", background: "white" }}
                                            >
                                                {AARTI_TYPES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading || !selectedDevotee}
                                        style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, var(--color-saffron), #f59e0b)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: (uploading || !selectedDevotee) ? "not-allowed" : "pointer", opacity: (uploading || !selectedDevotee) ? 0.7 : 1, transition: "all 0.3s" }}
                                    >
                                        {uploading ? "Adding..." : <><UserPlus size={20} /> Add & Next</>}
                                    </button>
                                    <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#94a3b8", marginTop: "-0.5rem" }}>Date and Aarti will stick for the next addition</p>
                                </form>
                            ) : (
                                <>
                                    {!stats ? (
                                        <>
                                            <div style={{ marginBottom: "1.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "var(--text-primary)" }}>CSV Bulk Instructions:</h4>
                                                <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                                                    <li>Download the template CSV.</li>
                                                    <li>Fill in <strong>Devotee Name</strong> (must match exactly), <strong>Date</strong> (YYYY-MM-DD), and <strong>Aarti</strong> name.</li>
                                                    <li>Upload the file below.</li>
                                                </ol>
                                                <button
                                                    onClick={downloadTemplate}
                                                    style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--color-saffron)", background: "transparent", border: "1px solid var(--color-saffron)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" }}
                                                >
                                                    <Download size={16} /> Download Template
                                                </button>
                                            </div>

                                            <div className="upload-area" style={{
                                                border: "2px dashed #cbd5e1",
                                                borderRadius: "12px",
                                                padding: "2.5rem",
                                                textAlign: "center",
                                                background: uploading ? "#f1f5f9" : "white",
                                                cursor: "pointer",
                                                position: "relative"
                                            }}>
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                                />
                                                <div style={{ pointerEvents: "none" }}>
                                                    {uploading ? (
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                                            <div className="spinner-small" style={{ width: "24px", height: "24px", borderTopColor: "var(--color-saffron)", borderRightColor: "var(--color-saffron)" }}></div>
                                                            <span style={{ color: "var(--text-secondary)" }}>Processing records...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FileText size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                                                            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Click to upload CSV</p>
                                                            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Format: Devotee Name, Date, Aarti</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="results-area">
                                            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                                                <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                                                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>{stats.added}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#15803d" }}>Records Added</div>
                                                </div>
                                                <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                                                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }}>{stats.errors}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#b91c1c" }}>Errors</div>
                                                </div>
                                            </div>

                                            <div style={{ maxHeight: "200px", overflowY: "auto", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem", fontFamily: "monospace" }}>
                                                {logs.map((log, i) => (
                                                    <div key={i} style={{ marginBottom: "0.25rem", color: log.startsWith("✅") ? "#15803d" : "#b91c1c" }}>
                                                        {log}
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                                                <button
                                                    className="modal-button primary"
                                                    onClick={() => setStats(null)}
                                                    style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600, marginRight: "0.75rem" }}
                                                >
                                                    Upload Again
                                                </button>
                                                <button
                                                    className="modal-button primary"
                                                    onClick={onClose}
                                                    style={{ background: "var(--color-saffron)", border: "none", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
