
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserPlus, Search, ListFilter, Plus } from "lucide-react";
import "./App.css";

// Config & Utils
import { AARTI_TYPES } from "./config";
import { calculatePriority } from "./utils";
import { supabase } from "./lib/supabaseClient";

// Components
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import AartiSelector from "./components/AartiSelector";
import Loader from "./components/Loader";
import ErrorMessage from "./components/ErrorMessage";
import RecommendedCard from "./components/RecommendedCard";
import DevoteeCard from "./components/DevoteeCard";
import HistoryList from "./components/HistoryList";
import BirthdayList from "./components/BirthdayList";
import UpdateModal from "./components/UpdateModal";
import AddDevoteeModal from "./components/AddDevoteeModal";
import BirthdayMarkSungModal from "./components/BirthdayMarkSungModal";
import AdminDashboard from "./components/AdminDashboard";
import LoginGate from "./components/LoginGate";


export default function App() {
  const [data, setData] = useState([]);
  const [selectedAarti, setSelectedAarti] = useState(AARTI_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [showMarkSung, setShowMarkSung] = useState(false);
  const [showAddDevotee, setShowAddDevotee] = useState(false);
  const [activeTab, setActiveTab] = useState("allocation");
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [allocationSearchQuery, setAllocationSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [birthdaySearchQuery, setBirthdaySearchQuery] = useState("");
  const [historyAartiFilter, setHistoryAartiFilter] = useState("all");
  const [historyMonth, setHistoryMonth] = useState("all");
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear().toString());
  const [showRecommended, setShowRecommended] = useState(true);
  const [showBirthdayMarkSung, setShowBirthdayMarkSung] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState(new Date().getMonth().toString());
  const [birthdayYear, setBirthdayYear] = useState(new Date().getFullYear().toString());

  const [birthdayDevotee, setBirthdayDevotee] = useState(null);
  const [devoteeTypeFilter, setDevoteeTypeFilter] = useState("all");
  const [showGuestMarkSung, setShowGuestMarkSung] = useState(false);
  const [guestName, setGuestName] = useState("");


  // Reset recommended view when aarti changes
  useEffect(() => {
    setShowRecommended(true);
  }, [selectedAarti]);

  useEffect(() => {
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
      const { data: history, error: historyError } = await supabase
        .from("history")
        .select("*")
        .order("sung_date", { ascending: false });

      if (historyError) {
        console.error('❌ History error:', historyError);
        throw historyError;
      }

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
          history: devoteeHistory
        };
      });

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
      setData([...processedData, ...guestHistory]);
      console.log('✅ Data loaded successfully!');
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
      const aartiName = selectedAarti.name.replace(" Singing", "");

      // Skills open for all
      if (aartiName === "Balaji Mangal Aarti" || aartiName === "SP Worship") {
        return true;
      }

      const hasSkill = d.skills && d.skills.some(s => s.toLowerCase().includes(aartiName.toLowerCase()));
      if (!hasSkill) return false;
      return true;
    })
    .sort((a, b) => a["Devotee Name"].localeCompare(b["Devotee Name"]));

  const filteredBySearch = filtered.filter((d) => {
    // Search Filter
    if (allocationSearchQuery && allocationSearchQuery.trim()) {
      if (!d["Devotee Name"].toLowerCase().includes(allocationSearchQuery.toLowerCase().trim())) {
        return false;
      }
    }

    // Devotee Type Filter
    if (devoteeTypeFilter !== "all") {
      const type = d.devotee_type || "Congregation Devotee"; // Handle null as default if needed
      if (type !== devoteeTypeFilter) return false;
    }

    return true;
  });

  const topCandidate = filteredBySearch[0] || filtered[0];

  const recentHistory = data
    .flatMap(d => d.history.map(h => ({
      ...d,
      "Devotee Name": d.isGuest ? d["Devotee Name"] : d["Devotee Name"], // Keep original guest name logic
      "Last Sung Date": h.sung_date,
      "Sung Aarti": h.aarti_name
    })))
    .sort((a, b) => new Date(b["Last Sung Date"]) - new Date(a["Last Sung Date"]));

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

        {activeTab === 'allocation' && (
          <div className="top-controls" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="icon-button primary"
                onClick={() => setShowAddDevotee(true)}
                style={{
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.95rem',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)',
                  background: 'var(--color-saffron)',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  whiteSpace: 'nowrap',
                  width: 'auto'
                }}
              >
                <UserPlus size={20} /> Add New Devotee
              </button>
              <button
                className="icon-button"
                onClick={() => {
                  setSelectedDevotee({ name: "", isGuestEntry: true });
                  setShowMarkSung(true);
                }}
                style={{
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.95rem',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  background: 'white',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  border: '2px solid var(--border-color)',
                  whiteSpace: 'nowrap',
                  width: 'auto'
                }}
              >
                <Plus size={20} color="var(--color-saffron)" /> Guest Entry
              </button>
            </div>
          </div>
        )}

        {activeTab === "allocation" && (
          <>
            <AartiSelector
              selectedAarti={selectedAarti}
              onSelect={setSelectedAarti}
            />

            {filtered.length > 0 ? (
              <div className="allocation-content">
                {showRecommended && topCandidate && !allocationSearchQuery ? (
                  <RecommendedCard
                    devotee={topCandidate}
                    aartiName={selectedAarti.name}
                    onMarkSung={handleMarkSung}
                    onClose={() => setShowRecommended(false)}
                  />
                ) : (
                  <div style={{ minWidth: '380px' }}></div>
                )}

                <div className="eligible-section glass-panel">
                  <div className="section-header-row">
                    <div className="section-title">
                      <div style={{ background: '#fff7ed', padding: '0.6rem', borderRadius: '14px', color: 'var(--color-saffron)' }}>
                        <ListFilter size={24} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Eligible Devotees</h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{filteredBySearch.length} available</span>
                      </div>
                    </div>

                    <div style={{ position: 'relative', minWidth: '280px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          className="list-search"
                          placeholder="Search name..."
                          value={allocationSearchQuery}
                          onChange={(e) => setAllocationSearchQuery(e.target.value)}
                          style={{
                            paddingLeft: '2.8rem',
                            height: '46px',
                            width: '100%',
                            boxSizing: 'border-box',
                            borderRadius: '14px',
                            border: '1px solid #e5e7eb',
                            background: '#f8fafc'
                          }}
                        />
                      </div>

                      <select
                        value={devoteeTypeFilter}
                        onChange={(e) => setDevoteeTypeFilter(e.target.value)}
                        style={{
                          height: '46px',
                          padding: '0 1rem',
                          borderRadius: '14px',
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <option value="all">All Types</option>
                        <option value="Congregation Devotee">Congregation</option>
                        <option value="Brahmachari">Brahmachari</option>
                        <option value="VOICE Devotee">VOICE</option>
                      </select>

                      {(allocationSearchQuery || devoteeTypeFilter !== "all") && (
                        <button
                          onClick={clearAllFilters}
                          style={{
                            height: '46px',
                            padding: '0 1rem',
                            borderRadius: '14px',
                            border: '1px solid var(--color-saffron)',
                            background: 'white',
                            color: 'var(--color-saffron)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="devotees-list">
                    {filteredBySearch.map((d, index) => (
                      <DevoteeCard
                        key={d.id}
                        devotee={d}
                        index={index}
                        onMarkSung={handleMarkSung}
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

        {activeTab === "allocation" && !showRecommended && filtered.length > 0 && topCandidate && !allocationSearchQuery && (
          <button
            onClick={() => setShowRecommended(true)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: 'linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 100,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              hover: {
                transform: 'scale(1.1)',
                boxShadow: '0 12px 32px rgba(37, 99, 235, 0.5)'
              }
            }}
            title="Show recommended singer"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
            }}
          >
            ⭐
          </button>
        )}

        {activeTab === "history" && (
          <HistoryList
            history={recentSingersFiltered}
            filter={historyAartiFilter}
            onFilterChange={setHistoryAartiFilter}
            searchQuery={historySearchQuery}
            onSearchChange={setHistorySearchQuery}
            selectedMonth={historyMonth}
            onMonthChange={setHistoryMonth}
            selectedYear={historyYear}
            onYearChange={setHistoryYear}
            onClearFilters={clearAllFilters}
            detectAarti={(d) => d["Sung Aarti"]}
          />
        )}

        {activeTab === "birthdays" && (
          <BirthdayList
            birthdays={upcomingBirthdays}
            onMarkSung={handleMarkSungFromBirthday}
            searchQuery={birthdaySearchQuery}
            onSearchChange={setBirthdaySearchQuery}
            selectedMonth={birthdayMonth}
            onMonthChange={setBirthdayMonth}
            selectedYear={birthdayYear}
            onYearChange={setBirthdayYear}
            onClearFilters={clearAllFilters}
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

        {activeTab === "admin" && (
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
      </div>
    </LoginGate>
  );
}
