
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Phone, AlertCircle, BarChart2 } from "lucide-react";

export default function Analytics() {
    const [forgottenSouls, setForgottenSouls] = useState([]);
    const [stats, setStats] = useState({ totalDevotees: 0, totalServices: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Get all devotees
            const { data: devotees, error: devError } = await supabase.from("devotees").select("*");
            if (devError) throw devError;

            // 2. Get history
            const { data: history, error: histError } = await supabase.from("history").select("*");
            if (histError) throw histError;

            // 3. Calculate "Forgotten Souls" (No service in last 60 days)
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            const activeDevoteeIds = new Set(
                history
                    .filter(h => new Date(h.sung_date) > sixtyDaysAgo)
                    .map(h => h.devotee_id)
            );

            const forgotten = devotees.filter(d => !activeDevoteeIds.has(d.id));

            setForgottenSouls(forgotten);
            setStats({
                totalDevotees: devotees.length,
                totalServices: history.length
            });

        } catch (err) {
            console.error("Error fetching analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
                    <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Devotees</h3>
                    <p style={{ margin: "0.5rem 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#1d4ed8" }}>{stats.totalDevotees}</p>
                </div>
                <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", background: "linear-gradient(135deg, #ecf4f5, #cffafe)" }}>
                    <h3 style={{ margin: 0, color: "#0e7490", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Services</h3>
                    <p style={{ margin: "0.5rem 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#0891b2" }}>{stats.totalServices}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem", background: "white" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
                    <AlertCircle size={20} color="#f59e0b" /> Forgotten Souls (No service in 60+ days)
                </h3>

                {loading ? (
                    <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
                ) : forgottenSouls.length > 0 ? (
                    <div className="devotees-list">
                        {forgottenSouls.map(d => (
                            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid #f3f4f6" }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                        Skills: {d.skills ? d.skills.join(", ") : "None"}
                                    </div>
                                </div>
                                {d.contact && (
                                    <a href={`tel:${d.contact}`} className="icon-button" style={{ width: "36px", height: "36px" }}>
                                        <Phone size={16} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "var(--text-secondary)" }}>Everyone has sung recently! Hari Bol! 🙌</p>
                )}
            </div>
        </div>
    );
}
