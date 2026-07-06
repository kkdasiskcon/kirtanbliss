import { Star, CheckCircle, Info } from "lucide-react";
import { getDaysAgo, getBirthdayProximity, sortDevotees } from "../utils";

export default function EverydaySingers({
    devotees,
    selectedAarti,
    onQuickLog,
    onOpenDetails,
    localEverydayList = []
}) {
    const aartiName = selectedAarti.name.replace(" Singing", "");

    // Filter devotees who are everyday singers
    const everydayList = devotees.filter((d) => {
        // DB field or fallback to local list or type is Brahmachari
        const isEveryday = d.is_everyday || localEverydayList.includes(d.id) || d.devotee_type === "Brahmachari";
        
        // Also ensure they have the skill for the selected aarti
        if (!isEveryday) return false;
        
        // Balaji Mangal Aarti and Tulsi Worship are open for all
        if (aartiName === "Balaji Mangal Aarti" || aartiName === "Tulsi Worship") {
            return true;
        }

        // For Guru Puja and SP Worship, all Brahmacharis are automatically eligible
        if ((aartiName === "Guru Puja" || aartiName === "SP Worship") && d.devotee_type === "Brahmachari") {
            return true;
        }

        const hasSkill = d.skills && d.skills.some(s => s.toLowerCase().includes(aartiName.toLowerCase()));
        return hasSkill;
    }).sort(sortDevotees);

    if (everydayList.length === 0) return null;

    return (
        <div className="glass-panel" style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, rgba(254, 243, 199, 0.4), rgba(255, 255, 255, 0.8))",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "16px"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Star size={18} fill="var(--color-saffron)" color="var(--color-saffron)" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Everyday Singers & Pujaris <span style={{ fontSize: "0.8rem", color: "var(--color-saffron-dark)", fontWeight: 600 }}>({selectedAarti.name.replace(" Singing", "").replace(" Worship", "")})</span>
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Quick Select
                </span>
            </div>

            <div style={{
                display: "flex",
                gap: "1rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
                scrollbarWidth: "thin"
            }} className="no-scrollbar">
                {everydayList.map((d) => {
                    const lastSung = d["Last Sung Date"] ? getDaysAgo(d["Last Sung Date"]) : "Never";
                    const isNever = lastSung === "Never";
                    const daysAgoNum = d["Last Sung Date"] ? Math.floor((new Date() - new Date(d["Last Sung Date"])) / (1000 * 60 * 60 * 24)) : 999;
                    const bdayProx = getBirthdayProximity(d["DOB"]);
                    
                    // Highlighting color based on how long ago they sang
                    let borderCol = "#e2e8f0";
                    if (daysAgoNum > 7) {
                        borderCol = "#22c55e"; // Green: Available!
                    } else if (daysAgoNum <= 2) {
                        borderCol = "#ef4444"; // Red: Sang very recently!
                    } else {
                        borderCol = "#eab308"; // Yellow: Moderate
                    }

                    return (
                        <div
                            key={d.id}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                minWidth: "110px",
                                position: "relative",
                                padding: "0.5rem",
                                borderRadius: "12px",
                                background: "white",
                                border: "1px solid #f1f5f9",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                                transition: "all 0.2s"
                            }}
                            className="quick-card"
                        >
                            {/* Avatar and indicators */}
                            <div
                                onClick={() => onOpenDetails(d)}
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    border: `3px solid ${borderCol}`,
                                    background: "var(--color-saffron-light)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.1rem",
                                    fontWeight: "bold",
                                    color: "var(--color-saffron-dark)",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "transform 0.2s"
                                }}
                                className="quick-avatar"
                                title="Click to view history"
                            >
                                {d["Devotee Name"]?.charAt(0).toUpperCase()}
                                <div style={{
                                    position: "absolute",
                                    right: "-4px",
                                    bottom: "-4px",
                                    background: "white",
                                    borderRadius: "50%",
                                    padding: "2px"
                                }}>
                                    <Info size={12} color="#64748b" />
                                </div>
                            </div>

                            {/* Name & Last sung */}
                            <div style={{ marginTop: "0.4rem", width: "100%" }}>
                                <div style={{
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    color: "var(--text-primary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.2rem"
                                }} title={d["Devotee Name"]}>
                                    {bdayProx && (
                                        <span title={bdayProx.isToday ? "Birthday Today!" : `Birthday: ${bdayProx.dateLabel}`} style={{ cursor: "help" }}>
                                            🎂
                                        </span>
                                    )}
                                    {d["Devotee Name"]}
                                </div>
                                <div style={{
                                    fontSize: "0.68rem",
                                    color: isNever ? "#64748b" : daysAgoNum <= 2 ? "#ef4444" : "#22c55e",
                                    fontWeight: 600,
                                    marginTop: "0.05rem"
                                }}>
                                    {lastSung}
                                </div>
                            </div>

                            {/* Quick Check Action */}
                            <button
                                onClick={() => onQuickLog(d)}
                                style={{
                                    marginTop: "0.4rem",
                                    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                                    border: "1px solid #a7f3d0",
                                    borderRadius: "8px",
                                    padding: "0.2rem 0.6rem",
                                    cursor: "pointer",
                                    color: "#065f46",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.2rem",
                                    width: "90%",
                                    justifyContent: "center",
                                    transition: "all 0.2s"
                                }}
                                className="quick-action-btn"
                                title={`Quick mark ${d["Devotee Name"]} as sung today`}
                            >
                                <CheckCircle size={10} /> Log
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
