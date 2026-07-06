
import { motion } from "framer-motion";
import { ClipboardList, BarChart2, Cake } from "lucide-react";


export default function Tabs({ activeTab, setActiveTab }) {
    const tabs = [
        { id: "allocation", label: "Allocation & Devotees", icon: ClipboardList },
        { id: "birthdays", label: "Birthdays 🎂", icon: Cake },
        { id: "history", label: "History & Analytics", icon: BarChart2 },
    ];


    return (
        <div className="tabs">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ position: "relative" }}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab"
                                className="active-tab-bg"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "var(--color-saffron)",
                                    borderRadius: "50px",
                                    zIndex: -1,
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            <Icon size={18} /> {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
