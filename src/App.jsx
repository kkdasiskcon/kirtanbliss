
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserPlus, Search, ListFilter, Plus, GitMerge, FileText } from "lucide-react";
import "./App.css";

// Config & Utils
import { AARTI_TYPES } from "./config";
import { calculatePriority, sortDevotees, normalizeAartiName } from "./utils";
import { supabase } from "./lib/supabaseClient";

// Components
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Loader from "./components/Loader";
import ErrorMessage from "./components/ErrorMessage";
import DevoteeCard from "./components/DevoteeCard";
import UpdateModal from "./components/UpdateModal";
import AddDevoteeModal from "./components/AddDevoteeModal";
import BirthdayMarkSungModal from "./components/BirthdayMarkSungModal";
import AdminDashboard from "./components/AdminDashboard";
import LoginGate from "./components/LoginGate";
import DevoteeDetailModal from "./components/DevoteeDetailModal";
import MergeDevoteesModal from "./components/admin/MergeDevoteesModal";
import CsvUploadModal from "./components/admin/CsvUploadModal";
import BirthdayCalendar from "./components/BirthdayCalendar";


export default function App() {
  const [data, setData] = useState([]);
  const [selectedAarti, setSelectedAarti] = useState(AARTI_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [showMarkSung, setShowMarkSung] = useState(false);
  const [showAddDevotee, setShowAddDevotee] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [activeTab, setActiveTab] = useState("allocation");
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [allocationSearchQuery, setAllocationSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [birthdaySearchQuery, setBirthdaySearchQuery] = useState("");
  const [historyAartiFilter, setHistoryAartiFilter] = useState("all");
  const [historyMonth, setHistoryMonth] = useState("all");
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear().toString());
  const [showBirthdayMarkSung, setShowBirthdayMarkSung] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState(new Date().getMonth().toString());
  const [birthdayYear, setBirthdayYear] = useState(new Date().getFullYear().toString());

  const [birthdayDevotee, setBirthdayDevotee] = useState(null);
  const [devoteeTypeFilter, setDevoteeTypeFilter] = useState("all");
  const [showGuestMarkSung, setShowGuestMarkSung] = useState(false);
  const [guestName, setGuestName] = useState("");

  // Devotee details drawer & local storage fallbacks
  const [selectedDetailsDevotee, setSelectedDetailsDevotee] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [isEverydaySupported, setIsEverydaySupported] = useState(true);
  const [isCoordinationSupported, setIsCoordinationSupported] = useState(true);
  const [localEverydayList, setLocalEverydayList] = useState([]);
  const [localCoordination, setLocalCoordination] = useState({});
  const [rawHistory, setRawHistory] = useState([]);



  useEffect(() => {
    // Load local storage fallbacks on mount
    const localEveryday = localStorage.getItem("kirtan_local_everyday") || "[]";
    setLocalEverydayList(JSON.parse(localEveryday));

    const localCoord = localStorage.getItem("kirtan_local_coord") || "{}";
    setLocalCoordination(JSON.parse(localCoord));

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting data fetch...');

      // Check if Supabase is properly initialized
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY;

      console.log('📋 Environment check:');
      console.log('  Supabase URL:', supabaseUrl ? `✅ ${supabaseUrl.substring(0, 40)}...` : '❌ Missing');
      console.log('  Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

      if (!supabaseUrl || !supabaseKey) {
        const errorMsg = 'Supabase configuration is missing. Please check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('📡 Fetching devotees...');

      // Fetch with proper timeout handling
      let devotees, devoteesError;
      try {
        const devoteesPromise = supabase
          .from("devotees")
          .select("*");

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout - Supabase server took too long to respond')), 20000)
        );

        const result = await Promise.race([
          devoteesPromise,
          timeoutPromise
        ]);

        devotees = result.data;
        devoteesError = result.error;
      } catch (timeoutError) {
        console.error('❌ Request timeout:', timeoutError);
        throw new Error('Connection timeout. Please check:\n1. Your internet connection\n2. Firewall/VPN is not blocking Supabase\n3. Supabase project is active');
      }

      if (devoteesError) {
        console.error('❌ Devotees error:', devoteesError);
        // Check for specific error types
        if (devoteesError.message?.includes('timeout') || devoteesError.message?.includes('network')) {
          throw new Error('Network error connecting to Supabase. Please check your internet connection and firewall settings.');
        }
        throw devoteesError;
      }

      console.log('✅ Devotees loaded:', devotees?.length || 0);

      console.log('📡 Fetching history...');
      const { data: rawHistoryData, error: historyError } = await supabase
        .from("history")
        .select("*")
        .order("sung_date", { ascending: false });

      if (historyError) {
        console.error('❌ History error:', historyError);
        throw historyError;
      }

      const history = (rawHistoryData || []).map(h => ({
        ...h,
        aarti_name: normalizeAartiName(h.aarti_name)
      }));

      console.log('✅ History loaded:', history?.length || 0);

      const processedData = devotees.map((devotee) => {
        const devoteeHistory = history.filter((h) => h.devotee_id === devotee.id);
        devoteeHistory.sort((a, b) => new Date(b.sung_date) - new Date(a.sung_date));
        const lastSungEntry = devoteeHistory[0];

        return {
          id: devotee.id,
          "Devotee Name": devotee.name,
          "Contact": devotee.contact,
          "DOB": devotee.dob,
          "Last Sung Date": lastSungEntry ? lastSungEntry.sung_date : null,
          "Times Sung": devoteeHistory.length,
          devotee_type: devotee.devotee_type,
          skills: devotee.skills || [],
          is_everyday: devotee.is_everyday || false,
          coordination_status: devotee.coordination_status || {},
          history: devoteeHistory
        };
      });

      // Check for columns support dynamically
      if (devotees && devotees.length > 0) {
        const first = devotees[0];
        const hasEveryday = 'is_everyday' in first;
        const hasCoordination = 'coordination_status' in first;
        setIsEverydaySupported(hasEveryday);
        setIsCoordinationSupported(hasCoordination);
        console.log("Database features support check - is_everyday:", hasEveryday, ", coordination_status:", hasCoordination);
      }

      // Also get history entries that HAVE NO devotee_id (Guest Entries)
      const guestHistory = history
        .filter(h => !h.devotee_id && h.guest_name)
        .map(h => ({
          id: `guest-${h.id}`,
          "Devotee Name": `${h.guest_name} (Guest)`,
          "Contact": null,
          "DOB": null,
          "Last Sung Date": h.sung_date,
          "Times Sung": 1,
          devotee_type: "Guest",
          skills: [],
          isGuest: true,
          history: [h]
        }));

      console.log('✅ Processing data and guests...');
      const allData = [...processedData, ...guestHistory];
      setRawHistory(history || []);
      setData(allData);
      console.log('✅ Data loaded successfully!');
      return allData;
    } catch (err) {
      console.error("❌ Error fetching data:", err);

      // Capture detailed diagnostic info
      const diagnosticInfo = {
        message: err.message || "Unknown error",
        name: err.name,
        code: err.code,
        status: err.status,
        details: err.details,
        hint: err.hint,
        timestamp: new Date().toISOString(),
        url: import.meta.env.VITE_SUPABASE_URL,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          saveData: navigator.connection.saveData,
          downlink: navigator.connection.downlink
        } : 'unknown'
      };

      console.error("Diagnostic Details:", diagnosticInfo);

      // More specific error messages
      let errorMessage = "Failed to load data";

      if (err.message && err.message.includes("Supabase configuration")) {
        errorMessage = "Configuration error: Please check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.";
      } else if (err.message && (err.message.includes("timeout") || err.message.includes("ERR_CONNECTION_TIMED_OUT") || err.name === 'AbortError')) {
        errorMessage = "Connection timeout!\n\nPossible causes:\n1. Internet connection is slow or unstable\n2. Mobile Data/ISP is blocking Supabase\n3. Supabase project might be paused\n4. Network proxy settings\n\nTry:\n- Switch to WiFi if possible\n- Check if you have an active data plan\n- Verify Supabase project is active";
      } else if (err.message && (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("ERR_") || err.name === 'TypeError')) {
        errorMessage = "Connection error!\n\nThis often happens on mobile data when:\n1. Your ISP blocks certain cloud services\n2. DNS resolution fails\n3. Signal is weak\n\nTry:\n- Toggle Airplane Mode\n- Use a different DNS (e.g. 8.8.8.8)\n- Check mobile usage limits";
      } else if (err.code === "PGRST116" || err.code === "PGRST301") {
        errorMessage = "Database connection failed. Please check your Supabase configuration and ensure your project is active.";
      } else if (err.code === "42501" || err.message?.includes("permission")) {
        errorMessage = "Permission denied. Please check your Supabase API key has the correct permissions.";
      } else if (err.message && err.message.includes("Network")) {
        errorMessage = "Network error. Please check your internet connection or try again later.";
      } else {
        errorMessage = `Failed to load data: ${err.message || "Unknown error"}`;
      }

      setError({
        displayMessage: errorMessage,
        diagnostics: diagnosticInfo
      });
    } finally {
      setLoading(false);
      console.log('🏁 Data fetch completed');
    }
  };

  const filtered = data
    .filter((d) => {
      if (selectedAarti.name === "All Devotees") {
        return true;
      }

      const aartiName = selectedAarti.name.replace(" Singing", "");

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
    })
    .sort(sortDevotees);

  const filteredBySearch = filtered.filter((d) => {
    // Search Filter
    if (allocationSearchQuery && allocationSearchQuery.trim()) {
      if (!d["Devotee Name"].toLowerCase().includes(allocationSearchQuery.toLowerCase().trim())) {
        return false;
      }
    }

    // Devotee Type Filter
    if (devoteeTypeFilter !== "all") {
      if (devoteeTypeFilter === "everyday") {
        if (!d.is_everyday) return false;
      } else {
        const type = d.devotee_type || "Congregation Devotee"; // Handle null as default if needed
        if (type !== devoteeTypeFilter) return false;
      }
    }

    return true;
  });

  const topCandidate = filteredBySearch[0] || filtered[0];

  const recentHistory = rawHistory.map(h => {
    // Find the devotee from the data array
    const devotee = data.find(d => !d.isGuest && d.id === h.devotee_id);
    return {
      id: h.id,
      "Devotee Name": devotee ? devotee["Devotee Name"] : (h.guest_name ? `${h.guest_name} (Guest)` : "Unknown"),
      "Contact": devotee ? devotee["Contact"] : null,
      "Last Sung Date": h.sung_date,
      "Sung Aarti": h.aarti_name,
      isGuest: !h.devotee_id
    };
  }).sort((a, b) => new Date(b["Last Sung Date"]) - new Date(a["Last Sung Date"]));

  const recentSingersFiltered = recentHistory.filter((d) => {
    const date = new Date(d["Last Sung Date"]);

    // Search Filter
    if (historySearchQuery && historySearchQuery.trim()) {
      if (!d["Devotee Name"].toLowerCase().includes(historySearchQuery.toLowerCase().trim())) {
        return false;
      }
    }

    // Aarti Filter
    if (historyAartiFilter && historyAartiFilter !== "all") {
      if (d["Sung Aarti"] !== historyAartiFilter) return false;
    }

    // Month Filter
    if (historyMonth !== "all") {
      if (!d["Last Sung Date"] || date.getMonth().toString() !== historyMonth) return false;
    }

    // Year Filter
    if (historyYear !== "all") {
      if (!d["Last Sung Date"] || date.getFullYear().toString() !== historyYear) return false;
    }

    return true;
  });

  const getUpcomingBirthdays = () => {
    const today = new Date();

    // Specific Month/Year view
    const targetMonth = parseInt(birthdayMonth);
    const targetYear = parseInt(birthdayYear);

    return data
      .filter((d) => {
        if (!d["DOB"]) return false;
        try {
          const [dobYear, dobMonth, dobDay] = d["DOB"].split('-').map(Number);
          return (dobMonth - 1) === targetMonth;
        } catch {
          return false;
        }
      })
      .map((d) => {
        const [dobYear, dobMonth, dobDay] = d["DOB"].split('-').map(Number);
        const birthday = new Date(targetYear, dobMonth - 1, dobDay);
        const diffTime = birthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...d,
          birthdayDate: birthday,
          daysUntil: diffDays,
        };
      })
      .sort((a, b) => a.birthdayDate - b.birthdayDate);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const handleMarkSung = async (devotee) => {
    console.log("handleMarkSung called with:", devotee);
    setSelectedDevotee(devotee);
    setShowMarkSung(true);
    setUpdateStatus(null);
  };

  const handleCustomLog = (devotee) => {
    setSelectedDevotee(devotee);
    setShowMarkSung(true);
    setUpdateStatus(null);
  };

  const handleQuickMarkSung = async (devotee, customAartiName = null, customDate = null) => {
    const aartiName = customAartiName || selectedAarti.name.replace(" Singing", "");
    const devoteeName = devotee["Devotee Name"] || devotee.name;

    // If date was already chosen via a modal, skip confirmation toast
    if (!customDate) {
      // Show a toast-based confirmation (no window.confirm needed)
      const confirmed = await new Promise((resolve) => {
        toast(
          (t) => (
            <div style={{ minWidth: "260px" }}>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.95rem" }}>
                Log <strong style={{ color: "var(--color-saffron-dark)" }}>{devoteeName}</strong>
              </p>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#64748b" }}>
                for <strong>{aartiName}</strong> — today?
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => { toast.dismiss(t.id); resolve(true); }}
                  style={{ flex: 1, padding: "0.4rem 0.75rem", background: "var(--color-saffron)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
                >✓ Confirm</button>
                <button
                  onClick={() => { toast.dismiss(t.id); resolve(false); }}
                  style={{ flex: 1, padding: "0.4rem 0.75rem", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                >✕ Cancel</button>
              </div>
            </div>
          ),
          { duration: 12000, position: "top-center" }
        );
      });
      if (!confirmed) return;
    }

    const sungDate = customDate || new Date().toISOString().split('T')[0];
    const toastId = toast.loading(`Logging ${devoteeName} for ${aartiName}...`);

    try {
      const insertData = {
        aarti_name: aartiName,
        sung_date: sungDate,
        devotee_id: devotee.id
      };

      const { data: insertedData, error } = await supabase
        .from("history")
        .insert([insertData])
        .select();

      if (error) throw error;

      const insertedRow = insertedData?.[0];
      
      toast.success(
        (t) => (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span>Logged <strong>{devoteeName}</strong> for {aartiName}!</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
                const undoToastId = toast.loading("Undoing...");
                try {
                  const { error: deleteError } = await supabase
                    .from("history")
                    .delete()
                    .eq("id", insertedRow.id);
                  if (deleteError) throw deleteError;
                  toast.success("Logging undone!", { id: undoToastId });
                  fetchData();
                } catch (err) {
                  toast.error("Failed to undo.", { id: undoToastId });
                }
              }}
              style={{
                background: "var(--color-saffron)",
                color: "white",
                border: "none",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "bold"
              }}
            >
              Undo
            </button>
          </div>
        ),
        { id: toastId, duration: 6000 }
      );
      fetchData();
    } catch (err) {
      console.error("Error quick logging:", err);
      toast.error(`Failed to log: ${err.message || "Unknown error"}`, { id: toastId });
    }
  };

  const confirmMarkSung = async (customDate, customAarti, guestName = null) => {
    setUpdating(true);
    const toastId = toast.loading("Updating...");

    try {
      const aartiName = customAarti || selectedAarti.name.replace(" Singing", "");
      const sungDate = customDate || new Date().toISOString().split('T')[0];

      const insertData = {
        aarti_name: aartiName,
        sung_date: sungDate
      };

      if (selectedDevotee?.isGuestEntry) {
        insertData.guest_name = guestName || selectedDevotee.name;
        insertData.devotee_id = null;
      } else {
        insertData.devotee_id = selectedDevotee.id;
      }

      const { error } = await supabase
        .from("history")
        .insert([insertData]);

      if (error) throw error;

      setUpdateStatus({ type: "success", message: "✅ Updated successfully!" });
      toast.success("Updated successfully!", { id: toastId });
      fetchData();

      setTimeout(() => {
        setShowMarkSung(false);
        setUpdateStatus(null);
        setUpdating(false);
      }, 1500);

    } catch (err) {
      console.error("Error updating:", err);
      const msg = err.message || "Failed to update history.";
      setUpdateStatus({ type: "error", message: `❌ ${msg}` });
      toast.error(msg, { id: toastId });
      setUpdating(false);
    }
  };

  const handleMarkSungFromBirthday = (devotee) => {
    setBirthdayDevotee(devotee);
    setShowBirthdayMarkSung(true);
  };

  const confirmBirthdayMarkSung = async (aartiName, customDate) => {
    setUpdating(true);
    const toastId = toast.loading("Updating...");

    try {
      const sungDate = customDate || new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from("history")
        .insert([
          {
            devotee_id: birthdayDevotee.id,
            aarti_name: aartiName,
            sung_date: sungDate
          }
        ]);

      if (error) throw error;

      toast.success("Updated successfully!", { id: toastId });
      fetchData();

      setTimeout(() => {
        setShowBirthdayMarkSung(false);
        setUpdating(false);
        setBirthdayDevotee(null);
      }, 1500);

    } catch (err) {
      console.error("Error updating:", err);
      const msg = "Failed to update history.";
      toast.error(msg, { id: toastId });
      setUpdating(false);
    }
  };

  const clearAllFilters = () => {
    setAllocationSearchQuery("");
    setHistorySearchQuery("");
    setBirthdaySearchQuery("");
    setHistoryAartiFilter("all");
    setHistoryMonth("all");
    setHistoryYear(new Date().getFullYear().toString());
    setBirthdayMonth(new Date().getMonth().toString());
    setBirthdayYear(new Date().getFullYear().toString());
    setDevoteeTypeFilter("all");
    toast.success("Filters cleared");
  };

  // Show error first if it exists
  if (error && data.length === 0) return <ErrorMessage error={error.displayMessage || error} diagnostics={error.diagnostics} onRetry={fetchData} />;
  // Then show loading
  if (loading && data.length === 0) return <Loader message="Loading devotee data..." />;

  return (
    <LoginGate>
      <div className="app-container">
        <Toaster position="top-right" />
        <Header />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />


        {activeTab === "allocation" && (
          <>

            {filtered.length > 0 ? (
              <div className="allocation-content">
                <div className="eligible-section glass-panel">
                  {/* Row 1: Title + action icons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#fff7ed', padding: '0.6rem', borderRadius: '14px', color: 'var(--color-saffron)' }}>
                        <ListFilter size={22} />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Eligible Devotees</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{filteredBySearch.length} available</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button className="icon-button" onClick={() => setShowAddDevotee(true)} title="Add New Devotee"
                        style={{ width: 36, height: 36, background: 'var(--color-saffron)', color: 'white', border: 'none', borderRadius: '10px', flexShrink: 0 }}>
                        <UserPlus size={16} />
                      </button>
                      <button className="icon-button" onClick={() => { setSelectedDevotee({ name: '', isGuestEntry: true }); setShowMarkSung(true); }} title="Guest Entry"
                        style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: '10px', color: 'var(--color-saffron)', background: 'white', flexShrink: 0 }}>
                        <Plus size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setShowMergeModal(true)} title="Merge Profiles"
                        style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: '10px', color: 'var(--text-secondary)', background: 'white', flexShrink: 0 }}>
                        <GitMerge size={16} />
                      </button>
                      <button className="icon-button" onClick={() => setShowCsvModal(true)} title="Import CSV"
                        style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: '10px', color: 'var(--text-secondary)', background: 'white', flexShrink: 0 }}>
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Filter bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.25rem' }}>
                    {/* Aarti Dropdown */}
                    <select
                      value={selectedAarti.name}
                      onChange={(e) => {
                        if (e.target.value === "All Devotees") {
                          setSelectedAarti({ name: "All Devotees", keywords: [] });
                        } else {
                          const m = AARTI_TYPES.find(a => a.name === e.target.value);
                          if (m) setSelectedAarti(m);
                        }
                      }}
                      style={{ height: '42px', padding: '0 0.75rem', borderRadius: '12px', border: '2px solid var(--color-saffron)', background: 'white', color: 'var(--color-saffron-dark)', cursor: 'pointer', fontWeight: 600, outline: 'none', fontSize: '0.9rem', flexShrink: 0 }}
                    >
                      <option value="All Devotees">All Devotees (No Aarti Filter)</option>
                      {AARTI_TYPES.map((a) => (
                        <option key={a.name} value={a.name}>{a.name.replace(' Singing', '').replace(' Worship', ' (Worship)')}</option>
                      ))}
                    </select>

                    {/* Search */}
                    <div style={{ flex: '1 1 160px', position: 'relative', minWidth: '140px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={allocationSearchQuery}
                        onChange={(e) => setAllocationSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: '42px', width: '100%', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f8fafc', outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>

                    {/* Type filter */}
                    <select
                      value={devoteeTypeFilter}
                      onChange={(e) => setDevoteeTypeFilter(e.target.value)}
                      style={{ height: '42px', padding: '0 0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f8fafc', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', flexShrink: 0 }}
                    >
                      <option value="all">All Types</option>
                      <option value="everyday">⭐ Everyday Only</option>
                      <option value="Congregation Devotee">Congregation</option>
                      <option value="Brahmachari">Brahmachari</option>
                      <option value="VOICE Devotee">VOICE</option>
                    </select>

                    {(allocationSearchQuery || devoteeTypeFilter !== 'all') && (
                      <button
                        onClick={clearAllFilters}
                        style={{ height: '42px', padding: '0 0.75rem', borderRadius: '12px', border: '1px solid var(--color-saffron)', background: 'white', color: 'var(--color-saffron)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="devotees-list">
                    {filteredBySearch.map((d, index) => (
                      <DevoteeCard
                        key={d.id}
                        devotee={d}
                        index={index}
                        onOpenDetails={(dev) => {
                          setSelectedDetailsDevotee(dev);
                          setShowDetailsDrawer(true);
                        }}
                        onQuickLog={(dev) => {
                          if (selectedAarti.name === "All Devotees") {
                            handleCustomLog(dev);
                          } else {
                            handleQuickMarkSung(dev);
                          }
                        }}
                        onCustomLog={handleCustomLog}
                        localCoordination={localCoordination}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-results glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'white' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                  No qualified devotees found for <strong style={{ color: 'var(--color-saffron)' }}>{selectedAarti.name.replace(' Singing', '')}</strong>
                </p>
                <button
                  className="mark-sung-button"
                  onClick={() => setShowAddDevotee(true)}
                  style={{ marginTop: '1.5rem', background: 'var(--color-saffron)', color: 'white' }}
                >
                  <UserPlus size={18} /> Add New Devotee
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "birthdays" && (
          <BirthdayCalendar
            devotees={data.filter(d => !d.isGuest && d["DOB"])}
            onMarkSung={(devotee, aartiName, customDate) => handleQuickMarkSung(devotee, aartiName, customDate)}
            onOpenDetails={(dev) => {
              setSelectedDetailsDevotee(dev);
              setShowDetailsDrawer(true);
            }}
          />
        )}

        {activeTab === "history" && (
          <AdminDashboard />
        )}

        {showAddDevotee && (
          <AddDevoteeModal
            onClose={() => setShowAddDevotee(false)}
            onDevoteeAdded={fetchData}
          />
        )}

        {showBirthdayMarkSung && birthdayDevotee && (
          <BirthdayMarkSungModal
            devotee={birthdayDevotee}
            updating={updating}
            onClose={() => !updating && setShowBirthdayMarkSung(false)}
            onConfirm={confirmBirthdayMarkSung}
          />
        )}

        {showDetailsDrawer && selectedDetailsDevotee && (
          <DevoteeDetailModal
            devotee={selectedDetailsDevotee}
            onClose={() => setShowDetailsDrawer(false)}
            onRefresh={async () => {
              const freshData = await fetchData();
              if (freshData && selectedDetailsDevotee) {
                const updatedDevotee = freshData.find(d => d.id === selectedDetailsDevotee.id);
                if (updatedDevotee) {
                  setSelectedDetailsDevotee(updatedDevotee);
                }
              }
            }}
            selectedAarti={selectedAarti}
            isEverydaySupported={isEverydaySupported}
            isCoordinationSupported={isCoordinationSupported}
            localEverydayList={localEverydayList}
            setLocalEverydayList={setLocalEverydayList}
            localCoordination={localCoordination}
            setLocalCoordination={setLocalCoordination}
          />
        )}

        {showMergeModal && (
          <MergeDevoteesModal
            devotees={data.filter(d => !d.isGuest)}
            onClose={() => setShowMergeModal(false)}
            onMerged={fetchData}
          />
        )}

        {showCsvModal && (
          <CsvUploadModal
            onClose={() => setShowCsvModal(false)}
            onUploadSuccess={fetchData}
          />
        )}

        {showMarkSung && selectedDevotee && (
          <UpdateModal
            devotee={selectedDevotee}
            updateStatus={updateStatus}
            updating={updating}
            onClose={() => !updating && setShowMarkSung(false)}
            onRefresh={confirmMarkSung}
            initialAarti={selectedAarti.name.replace(" Singing", "")}
            isSupabase={true}
          />
        )}
      </div>
    </LoginGate>
  );
}
