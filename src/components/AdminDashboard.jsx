
import { useState } from "react";
import { Users, History, Activity } from "lucide-react";

import ManageDevotees from "./admin/ManageDevotees";
import ManageHistory from "./admin/ManageHistory";

// Placeholder sub-components

import Analytics from "./admin/Analytics";

export default function AdminDashboard() {

    const [activeTab, setActiveTab] = useState("devotees");

    return (
        <div className="glass-panel" style={{ background: "white", minHeight: "60vh", overflow: "hidden" }}>
            <div style={{
                background: "var(--color-saffron-light)",
                padding: "1rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto"
            }}>
                <button
                    onClick={() => setActiveTab("devotees")}
                    className={`tab-button ${activeTab === "devotees" ? "active" : ""}`}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                    <Users size={16} style={{ marginRight: '0.5rem' }} /> Devotees
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`tab-button ${activeTab === "history" ? "active" : ""}`}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                    <History size={16} style={{ marginRight: '0.5rem' }} /> History
                </button>
                <button
                    onClick={() => setActiveTab("analytics")}
                    className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                    <Activity size={16} style={{ marginRight: '0.5rem' }} /> Analytics
                </button>
            </div>

            <div className="admin-content">
                {activeTab === "devotees" && <ManageDevotees />}
                {activeTab === "history" && <ManageHistory />}
                {activeTab === "analytics" && <Analytics />}
            </div>
        </div>
    );
}
