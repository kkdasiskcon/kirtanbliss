
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download, CheckCircle, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

export default function CsvUploadModal({ onClose, onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);

    const downloadTemplate = () => {
        const headers = ["Devotee Name", "Contact", "DOB", "Devotee Type", "Skills"];
        const exampleRow = ["Krishna Das", "9876543210", "1995-12-25", "Brahmachari", "Mangala Aarti, Narsimha Aarti"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + exampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "devotee_template.csv");
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

        // Pre-fetch existing names to avoid duplicates if unique constraint works, 
        // but explicit check is safer for user feedback.
        // Actually, let's just rely on upsert or try-catch for simplicity.

        for (const record of records) {
            // Map CSV columns to DB columns
            // Expecting: "Devotee Name", "Contact", "DOB", "Devotee Type", "Skills"
            const name = record["Devotee Name"]?.trim();
            if (!name) {
                errors++;
                continue;
            }

            const contact = record["Contact"]?.trim() || null;
            const dob = record["DOB"]?.trim() || null;
            const type = record["Devotee Type"]?.trim() || "Congregation Devotee";

            // Skills: split by comma if string
            let skills = [];
            if (record["Skills"]) {
                skills = record["Skills"].split(",").map(s => s.trim()).filter(s => s);
            }

            try {
                const { error } = await supabase
                    .from("devotees")
                    .upsert([
                        {
                            name: name,
                            contact: contact,
                            dob: dob,
                            devotee_type: type,
                            skills: skills
                        }
                    ], { onConflict: 'name' }); // Assuming name is unique constraint

                if (error) throw error;
                added++;
                newLogs.push(`✅ Added/Updated: ${name}`);
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
            toast.success(`Successfully processed ${added} devotees!`);
            onUploadComplete();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass-panel"
                    style={{ background: "white", width: "95%", maxWidth: "600px", padding: "0" }}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)" }}>
                            <Upload size={20} color="var(--color-saffron)" /> Bulk Upload Devotees
                        </h3>
                        <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "0.25rem" }}>
                            <X size={20} color="var(--text-secondary)" />
                        </button>
                    </div>

                    <div style={{ padding: "1.5rem" }}>
                        {!stats ? (
                            <>
                                <div style={{ marginBottom: "1.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "var(--text-primary)" }}>Instructions:</h4>
                                    <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                                        <li>Download the CSV template below.</li>
                                        <li>Fill in the devotee details (Name is mandatory).</li>
                                        <li>Skills should be comma-separated (e.g., "Mangala Aarti, Narsimha Aarti").</li>
                                        <li>Devotee Type options: <strong>Congregation Devotee, Brahmachari, VOICE Devotee</strong>.</li>
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
                                    padding: "2rem",
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
                                                <span style={{ color: "var(--text-secondary)" }}>Processing CSV...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FileText size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Click to upload CSV</p>
                                                <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>or drag and drop file here</p>
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
                                        <div style={{ fontSize: "0.85rem", color: "#15803d" }}>Successfully Added</div>
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
                                        onClick={onClose}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
