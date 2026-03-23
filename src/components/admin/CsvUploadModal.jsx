import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Portal from "../Portal";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download, CheckCircle, AlertTriangle, Clipboard, Table } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { AARTI_TYPES } from "../../config";

export default function CsvUploadModal({ onClose, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [mode, setMode] = useState("paste"); // 'csv' or 'paste'
    const [pasteContent, setPasteContent] = useState("");
    const [previewData, setPreviewData] = useState(null);

    const normalizeDate = (rawDate) => {
        if (!rawDate) return null;
        const s = rawDate.trim();
        if (!s) return null;

        // Try YYYY-MM-DD (preferred)
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        // Try DD-MM-YYYY or DD/MM/YYYY
        const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (dmyMatch) {
            const [_, d, m, y] = dmyMatch;
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }

        // Try MM-DD-YYYY or MM/DD/YYYY (less likely but possible)
        // If year is 4 digits and first part is <= 12 and second is <= 31...
        // But D-M-Y is more common in India. We'll stick to D-M-Y for now.

        return s; // Fallback to raw and let Postgres decide
    };

    const normalizeSkills = (rawSkillsStr) => {
        if (!rawSkillsStr) return [];
        // Split by comma, semicolon, or pipeline
        const items = rawSkillsStr.split(/[,|;]/).map(s => s.trim()).filter(s => s);

        const normalized = new Set();
        items.forEach(item => {
            const lowerItem = item.toLowerCase();
            let matched = false;
            for (const aarti of AARTI_TYPES) {
                if (aarti.keywords.some(k => lowerItem.includes(k.toLowerCase()))) {
                    normalized.add(aarti.name);
                    matched = true;
                    break;
                }
            }
            if (!matched && item.length > 2) {
                // Keep raw skill if it doesn't match but seems valid (Title Case)
                normalized.add(item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
            }
        });
        return Array.from(normalized);
    };

    const downloadTemplate = () => {
        const headers = ["Devotee Name", "Contact", "DOB", "Devotee Type", "Seva1", "Seva2", "Seva3"];
        const exampleRow = ["Krishna Das", "9876543210", "1995-12-25", "Brahmachari", "Mangala", "Tulsi Aarti", "Mridanga"];
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

    const handlePasteChange = (e) => {
        const content = e.target.value;
        setPasteContent(content);

        if (!content.trim()) {
            setPreviewData(null);
            return;
        }

        const lines = content.trim().split(/\r?\n/);
        if (lines.length === 0) return;

        const firstLine = lines[0];
        const hasTab = firstLine.includes("\t");
        const separator = hasTab ? "\t" : ",";

        const headers = firstLine.split(separator).map(h => h.trim());
        const rows = lines.slice(1).map(line => {
            const values = line.split(separator).map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = values[i] || "";
            });
            return obj;
        });

        setPreviewData({ headers, rows });
    };

    const handleProcessPaste = async () => {
        if (!previewData || previewData.rows.length === 0) {
            toast.error("No data to upload. Please paste your data first.");
            return;
        }
        await processRecords(previewData.rows);
    };

    const processRecords = async (records) => {
        setUploading(true);
        let added = 0;
        let updated = 0;
        let errors = 0;
        let newLogs = [];

        try {
            newLogs.push("📡 Connecting to database...");
            setLogs([...newLogs]);
            
            // 1. Fetch current names to handle duplicates manually
            const { data: existing, error: fetchError } = await supabase
                .from("devotees")
                .select("id, name");

            if (fetchError) throw fetchError;

            const nameMap = new Map();
            existing.forEach(d => nameMap.set(d.name.toLowerCase().trim(), d.id));

            for (const record of records) {
                const getVal = (keys) => {
                    for (const k of keys) {
                        if (record[k] !== undefined) return record[k];
                        const actualKey = Object.keys(record).find(rk => 
                            rk.toLowerCase().trim() === k.toLowerCase().replace(/\s/g, '') ||
                            rk.toLowerCase().trim() === k.toLowerCase().trim()
                        );
                        if (actualKey) return record[actualKey];
                    }
                    return null;
                };

                const name = getVal(["Devotee Name", "Name", "devotee_name"])?.trim();
                if (!name) {
                    newLogs.push(`⚠️ Skipping row: Missing name`);
                    errors++;
                    continue;
                }

                const contact = getVal(["Contact", "Phone", "Mobile"])?.trim() || null;
                const rawDob = getVal(["DOB", "Birthday", "Date of Birth"])?.trim();
                const dob = normalizeDate(rawDob);
                const type = getVal(["Devotee Type", "Type"])?.trim() || "Congregation Devotee";

                // Skills: Combine Seva1-7 and Skills
                let skillsParts = [];
                const mainSkills = getVal(["Skills", "Seva", "Services"]);
                if (mainSkills) skillsParts.push(mainSkills);
                
                for (let i = 1; i <= 7; i++) {
                    const sVal = getVal([`Seva${i}`, `Seva ${i}`, `Skill${i}`, `Skill ${i}`]);
                    if (sVal) skillsParts.push(sVal);
                }

                const finalSkills = normalizeSkills(skillsParts.join(", "));
                const cleanName = name.trim();
                const existingId = nameMap.get(cleanName.toLowerCase());

                const payload = {
                    name: cleanName,
                    contact,
                    dob,
                    devotee_type: type,
                    skills: finalSkills
                };

                if (existingId) {
                    const { error } = await supabase.from("devotees").update(payload).eq("id", existingId);
                    if (error) {
                        newLogs.push(`❌ Update Failed (${cleanName}): ${error.message}`);
                        errors++;
                    } else {
                        newLogs.push(`🔄 Updated: ${cleanName}`);
                        updated++;
                    }
                } else {
                    const { error } = await supabase.from("devotees").insert([payload]);
                    if (error) {
                        newLogs.push(`❌ Insert Failed (${cleanName}): ${error.message}`);
                        errors++;
                    } else {
                        newLogs.push(`✅ Added: ${cleanName}`);
                        added++;
                    }
                }
                setLogs([...newLogs]);
            }

            setStats({ total: records.length, added: added + updated, errors });
            toast.success("Processing complete!");
            onUploadSuccess();
        } catch (err) {
            console.error("Error:", err);
            toast.error(`Error: ${err.message}`);
            newLogs.push(`❌ System Error: ${err.message}`);
            setLogs([...newLogs]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Portal>
            <AnimatePresence>
                <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                    <motion.div
                        className="modal-content glass-panel"
                        style={{ background: "white", width: "95%", maxWidth: "800px", maxH: "90vh", padding: "0", display: "flex", flexDirection: "column" }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                <Upload size={20} color="var(--color-saffron)" /> Bulk Add Devotees
                            </h3>
                            <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "0.25rem", cursor: "pointer" }}>
                                <X size={20} color="var(--text-secondary)" />
                            </button>
                        </div>

                        {!stats && (
                            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                                <button onClick={() => setMode("paste")} style={{
                                    flex: 1, padding: "0.75rem", border: "none", background: mode === "paste" ? "white" : "transparent",
                                    color: mode === "paste" ? "var(--color-saffron)" : "#64748b", fontWeight: mode === "paste" ? 700 : 500,
                                    borderBottom: mode === "paste" ? "3px solid var(--color-saffron)" : "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                }}><Clipboard size={18} /> Paste from Excel/Sheets</button>
                                <button onClick={() => setMode("csv")} style={{
                                    flex: 1, padding: "0.75rem", border: "none", background: mode === "csv" ? "white" : "transparent",
                                    color: mode === "csv" ? "var(--color-saffron)" : "#64748b", fontWeight: mode === "csv" ? 700 : 500,
                                    borderBottom: mode === "csv" ? "3px solid var(--color-saffron)" : "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                }}><FileText size={18} /> Upload CSV File</button>
                            </div>
                        )}

                        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
                            {!stats ? (
                                <>
                                    {mode === "csv" ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "var(--text-primary)" }}>Instructions:</h4>
                                                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                                                    Upload a CSV with headers: <strong>Name, Contact, DOB, Type, Skills</strong> (or Seva1, Seva2...).
                                                </p>
                                                <button onClick={downloadTemplate} style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-saffron)", background: "transparent", border: "1px solid var(--color-saffron)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" }}>
                                                    <Download size={14} /> Download Template
                                                </button>
                                            </div>
                                            <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "2.5rem", textAlign: "center", background: uploading ? "#f1f5f9" : "white", cursor: "pointer", position: "relative" }}>
                                                <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploading} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                                                <FileText size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Click to select CSV</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem", color: "#1e40af" }}>
                                                <p style={{ margin: "0 0 0.5rem 0" }}><strong>Excel/Sheets Instructions:</strong></p>
                                                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                                                    <li>Copy your table including the header row.</li>
                                                    <li>Skills can be in <strong>one column</strong> (comma-separated) or <strong>multiple columns</strong> (Seva 1, Seva 2...).</li>
                                                    <li>Spelling mistakes in skills (e.g. "Mangala") are auto-corrected!</li>
                                                </ul>
                                            </div>
                                            <textarea
                                                value={pasteContent} onChange={handlePasteChange}
                                                placeholder="Paste your data here... Name, Contact, DOB, Skills..."
                                                style={{ width: "100%", height: "150px", padding: "1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontFamily: "monospace", resize: "none" }}
                                            />
                                            {previewData && (
                                                <div style={{ marginTop: "0.5rem" }}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "var(--text-primary)" }}>Preview ({previewData.rows.length} rows)</h4>
                                                    <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", maxHeight: "200px" }}>
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                                                            <thead style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                                                                <tr>{previewData.headers.map((h, i) => <th key={i} style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>{h}</th>)}</tr>
                                                            </thead>
                                                            <tbody>
                                                                {previewData.rows.slice(0, 10).map((row, i) => (
                                                                    <tr key={i}>{previewData.headers.map((h, j) => <td key={j} style={{ padding: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>{row[h]}</td>)}</tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {previewData.rows.length > 10 && <div style={{ padding: "0.5rem", fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>...and {previewData.rows.length - 10} more rows</div>}
                                                    </div>
                                                    <button onClick={handleProcessPaste} disabled={uploading} className="modal-button primary" style={{ width: "100%", marginTop: "1rem" }}>
                                                        {uploading ? "Uploading..." : `Process ${previewData.rows.length} Devotees`}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="results-area">
                                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                                        <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>{stats.added}</div>
                                            <div style={{ fontSize: "0.85rem", color: "#15803d" }}>Processed</div>
                                        </div>
                                        <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }}>{stats.errors}</div>
                                            <div style={{ fontSize: "0.85rem", color: "#b91c1c" }}>Issues</div>
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: "250px", overflowY: "auto", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem", fontFamily: "monospace" }}>
                                        {logs.map((log, i) => <div key={i} style={{ marginBottom: "0.25rem", color: log.startsWith("✅") || log.startsWith("🔄") ? "#15803d" : log.startsWith("⚠️") ? "#d97706" : "#b91c1c" }}>{log}</div>)}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                                        <button className="modal-button primary" onClick={onClose}>Finish</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}
