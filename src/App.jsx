
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserPlus, Search, ListFilter } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [historyAartiFilter, setHistoryAartiFilter] = useState("all");
  const [showRecommended, setShowRecommended] = useState(true);
  const [showBirthdayMarkSung, setShowBirthdayMarkSung] = useState(false);

  const [birthdayDevotee, setBirthdayDevotee] = useState(null);
  const [devoteeTypeFilter, setDevoteeTypeFilter] = useState("all");


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

      // Add timeout for mobile networks
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const devoteesPromise = supabase
        .from("devotees")
        .select("*");

      const historyPromise = supabase
        .from("history")
        .select("*")
        .order("sung_date", { ascending: false });

      const [{ data: devotees, error: devoteesError }, { data: history, error: historyError }] = 
        await Promise.race([
          Promise.all([devoteesPromise, historyPromise]),
          timeoutPromise
        ]);

      if (devoteesError) {
        console.error('Devotees error:', devoteesError);
        throw devoteesError;
      }

      if (historyError) {
        console.error('History error:', historyError);
        throw historyError;
      }

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

      setData(processedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });

      // More specific error messages
      if (err.message && err.message.includes("fetch")) {
        setError("Connection error. Please check your internet connection and try again.");
      } else if (err.message && err.message.includes("timeout")) {
        setError("Request timeout. Please check your internet connection.");
      } else if (err.code === "PGRST116") {
        setError("Database connection failed. Please check your Supabase configuration.");
      } else if (err.message && err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection or try again later.");
      } else {
        setError(`Failed to load data: ${err.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
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
    if (searchQuery && searchQuery.trim()) {
      if (!d["Devotee Name"].toLowerCase().includes(searchQuery.toLowerCase().trim())) {
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
      "Last Sung Date": h.sung_date,
      "Sung Aarti": h.aarti_name
    })))
    .sort((a, b) => new Date(b["Last Sung Date"]) - new Date(a["Last Sung Date"]))
    .slice(0, 50);

  const recentSingersFiltered = recentHistory.filter((d) => {
    if (searchQuery && searchQuery.trim()) {
      if (!d["Devotee Name"].toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
    }
    if (historyAartiFilter && historyAartiFilter !== "all") {
      if (d["Sung Aarti"] !== historyAartiFilter) return false;
    }
    return true;
  });

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    return data
      .filter((d) => {
        if (!d["DOB"]) return false;
        try {
          const [year, month, day] = d["DOB"].split('-').map(Number);
          const thisYear = today.getFullYear();
          const birthday = new Date(thisYear, month - 1, day);
          if (birthday < today) birthday.setFullYear(thisYear + 1);
          return birthday >= today && birthday <= nextMonth;
        } catch {
          return false;
        }
      })
      .map((d) => {
        const [year, month, day] = d["DOB"].split('-').map(Number);
        const thisYear = today.getFullYear();
        let birthday = new Date(thisYear, month - 1, day);
        if (birthday < today) birthday.setFullYear(thisYear + 1);
        return {
          ...d,
          birthdayDate: birthday,
          daysUntil: Math.ceil((birthday - today) / (1000 * 60 * 60 * 24)),
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 15);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const handleMarkSung = async (devotee) => {
    console.log("handleMarkSung called with:", devotee);
    setSelectedDevotee(devotee);
    setShowMarkSung(true);
    setUpdateStatus(null);
  };

  const confirmMarkSung = async () => {
    setUpdating(true);
    const toastId = toast.loading("Updating...");

    try {
      const aartiName = selectedAarti.name.replace(" Singing", "");
      const { error } = await supabase
        .from("history")
        .insert([
          {
            devotee_id: selectedDevotee.id,
            aarti_name: aartiName,
            sung_date: new Date().toISOString().split('T')[0]
          }
        ]);

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
      const msg = "Failed to update history.";
      setUpdateStatus({ type: "error", message: msg });
      toast.error(msg, { id: toastId });
      setUpdating(false);
    }
  };

  const handleMarkSungFromBirthday = (devotee) => {
    setBirthdayDevotee(devotee);
    setShowBirthdayMarkSung(true);
  };

  const confirmBirthdayMarkSung = async (aartiName) => {
    setUpdating(true);
    const toastId = toast.loading("Updating...");

    try {
      const { error } = await supabase
        .from("history")
        .insert([
          {
            devotee_id: birthdayDevotee.id,
            aarti_name: aartiName,
            sung_date: new Date().toISOString().split('T')[0]
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

  if (loading && data.length === 0) return <Loader message="Loading devotee data..." />;
  if (error && data.length === 0) return <ErrorMessage error={error} onRetry={fetchData} />;

  return (
    <LoginGate>
      <div className="app-container">
        <Toaster position="top-right" />
        <Header />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'allocation' && (
          <div className="top-controls">
            <button
              className="icon-button primary"
              onClick={() => setShowAddDevotee(true)}
              style={{
                padding: '0.8rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)',
                background: 'var(--color-saffron)',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid white'
              }}
            >
              <UserPlus size={20} /> Add New Devotee
            </button>
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
                {showRecommended && topCandidate && !searchQuery ? (
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

                    <div style={{ position: 'relative', minWidth: '280px', display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          className="list-search"
                          placeholder="Search name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
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

        {activeTab === "allocation" && !showRecommended && filtered.length > 0 && topCandidate && !searchQuery && (
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
            detectAarti={(d) => d["Sung Aarti"]}
          />
        )}

        {activeTab === "birthdays" && (
          <BirthdayList birthdays={upcomingBirthdays} onMarkSung={handleMarkSungFromBirthday} />
        )}

        {showMarkSung && selectedDevotee && (
          <UpdateModal
            devotee={selectedDevotee}
            updateStatus={updateStatus}
            updating={updating}
            onClose={() => !updating && setShowMarkSung(false)}
            onRefresh={confirmMarkSung}
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
