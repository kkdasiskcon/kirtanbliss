
import { useState } from "react";
import { History, Activity } from "lucide-react";

import ManageHistory from "./admin/ManageHistory";
import Analytics from "./admin/Analytics";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("history");

    return (
        <div className="glass-panel" style={{ background: "white", minHeight: "60vh", overflow: "hidden", marginTop: "1rem" }}>
            <div style={{
                background: "var(--color-saffron-light)",
                padding: "1rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto"
            }}>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`tab-button ${activeTab === "history" ? "active" : ""}`}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                    <History size={16} style={{ marginRight: '0.5rem' }} /> History Logs
                </button>
                <button
                    onClick={() => setActiveTab("analytics")}
                    className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                    <Activity size={16} style={{ marginRight: '0.5rem' }} /> Analytics & Statistics
                </button>
            </div>

            <div className="admin-content">
                {activeTab === "history" && <ManageHistory />}
                {activeTab === "analytics" && <Analytics />}
            </div>
        </div>
    );
}
