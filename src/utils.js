
export const calculatePriority = (devotee) => {
    const lastSung = devotee["Last Sung Date"];
    const timesSung = parseInt(devotee["Times Sung"] || 0);

    let daysSince = 999;

    if (lastSung && lastSung.trim()) {
        try {
            const dateStr = lastSung.trim();
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
                daysSince = Math.floor(diff);
                if (daysSince < 0) daysSince = 0;
            }
        } catch {
            console.warn("Invalid date format:", lastSung);
        }
    }

    return daysSince * 10 + (50 - timesSung);
};

export const getDaysAgo = (dateString) => {
    if (!dateString || !dateString.trim()) return "Never";
    try {
        const date = new Date(dateString.trim());
        if (isNaN(date.getTime())) return "Never";
        const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diff < 0) return "Never";
        if (diff === 0) return "Today";
        if (diff === 1) return "1 day ago";
        if (diff < 30) return `${diff} days ago`;
        if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
        return `${Math.floor(diff / 365)} years ago`;
    } catch {
        return "Never";
    }
};

export const formatDate = (dateString) => {
    if (!dateString || !dateString.trim()) return "Never";
    try {
        const date = new Date(dateString.trim());
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
};

export const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
};

export const getBirthdayProximity = (dobString) => {
    if (!dobString || !dobString.trim()) return null;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Expect format "YYYY-MM-DD" or similar
        const parts = dobString.split("-");
        let month, day;
        if (parts.length === 3) {
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
        } else {
            // Try parsing as normal date
            const dateObj = new Date(dobString);
            if (isNaN(dateObj.getTime())) return null;
            month = dateObj.getMonth();
            day = dateObj.getDate();
        }

        const currentYear = today.getFullYear();
        let bday = new Date(currentYear, month, day);
        bday.setHours(0, 0, 0, 0);

        // If birthday already passed this year by more than 2 days, check next year
        if (bday - today < -2 * 24 * 60 * 60 * 1000) {
            bday.setFullYear(currentYear + 1);
        }

        const diffTime = bday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Proximity range: within next 7 days, today, or in the last 2 days
        if (diffDays >= -2 && diffDays <= 7) {
            const monthName = bday.toLocaleString("default", { month: "short" });
            return {
                daysUntil: diffDays,
                dateLabel: `${monthName} ${day}`,
                isToday: diffDays === 0
            };
        }
    } catch (e) {
        console.error("Error parsing DOB:", e);
    }
    return null;
};

export const getBirthdayPriorityDays = (dobString) => {
    if (!dobString || !dobString.trim()) return null;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = dobString.split("-");
        let month, day;
        if (parts.length === 3) {
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
        } else {
            const dateObj = new Date(dobString);
            if (isNaN(dateObj.getTime())) return null;
            month = dateObj.getMonth();
            day = dateObj.getDate();
        }

        const currentYear = today.getFullYear();
        const diffs = [-1, 0, 1].map(offset => {
            const bday = new Date(currentYear + offset, month, day);
            bday.setHours(0, 0, 0, 0);
            const diffTime = bday - today;
            return Math.round(diffTime / (1000 * 60 * 60 * 24));
        });

        const minDiff = diffs.reduce((prev, curr) => Math.abs(curr) < Math.abs(prev) ? curr : prev, 999);

        if (minDiff >= -7 && minDiff <= 7) {
            return minDiff;
        }
    } catch (e) {
        console.error("Error parsing DOB:", e);
    }
    return null;
};

export const sortDevotees = (a, b) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const aAllottedToday = a["Last Sung Date"] === todayStr;
    const bAllottedToday = b["Last Sung Date"] === todayStr;

    // 1. Allotted today goes to the bottom
    if (aAllottedToday && !bAllottedToday) return 1;
    if (!aAllottedToday && bAllottedToday) return -1;

    // 2. Birthday Priority: within [-7, 7] days and not allotted today
    const aBdayPriority = getBirthdayPriorityDays(a["DOB"]) !== null;
    const bBdayPriority = getBirthdayPriorityDays(b["DOB"]) !== null;

    if (aBdayPriority && !bBdayPriority) return -1;
    if (!aBdayPriority && bBdayPriority) return 1;

    // 3. Never sung goes first
    if (!a["Last Sung Date"] && b["Last Sung Date"]) return -1;
    if (a["Last Sung Date"] && !b["Last Sung Date"]) return 1;
    if (!a["Last Sung Date"] && !b["Last Sung Date"]) {
        return a["Devotee Name"].localeCompare(b["Devotee Name"]);
    }

    // 4. Older Last Sung Date first (didn't sing since long first)
    const dateA = new Date(a["Last Sung Date"]);
    const dateB = new Date(b["Last Sung Date"]);
    return dateA - dateB;
};

export const normalizeAartiName = (name) => {
    if (!name) return "Kirtan";
    const lower = name.toLowerCase().trim();
    if (lower.includes("mangal") || lower.includes("mangala")) {
        if (lower.includes("balaji")) return "Balaji Mangal Aarti";
        return "Mangal Arati";
    }
    if (lower.includes("narasimha") || lower.includes("narasingh") || lower.includes("narismha")) {
        return "Narasimha Arati";
    }
    if (lower.includes("tulsi") || lower.includes("tulasi")) {
        if (lower.includes("worship") || lower.includes("seva") || lower.includes("puja")) return "Tulsi Worship";
        return "Tulsi Arati";
    }
    if (lower.includes("guru puja") || lower.includes("gurupuja") || lower.includes("guru pooja")) {
        return "Guru Puja";
    }
    if (lower.includes("sp worship") || lower.includes("prabhupada")) {
        return "SP Worship";
    }
    // Capitalize first letter of whatever is there
    return name.charAt(0).toUpperCase() + name.slice(1);
};
