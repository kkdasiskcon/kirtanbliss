
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
