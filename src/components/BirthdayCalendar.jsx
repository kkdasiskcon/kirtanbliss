
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Gift, Info, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AARTI_TYPES } from "../config";
import Portal from "./Portal";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Inline Custom Log Modal — date + aarti chooser
function CustomLogModal({ devotee, onClose, onConfirm }) {
  const [selectedAarti, setSelectedAarti] = useState(AARTI_TYPES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            style={{ maxWidth: 440, width: "92%", borderRadius: 24, overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #fff7ed, #fffbeb)",
              borderBottom: "1px solid #fde68a",
              padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: "var(--color-saffron)", borderRadius: "10px", padding: "0.5rem", display: "flex" }}>
                  <CalendarIcon size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                    Log Attendance
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-saffron-dark)", fontWeight: 600 }}>
                    🎂 {devotee["Devotee Name"]}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "0.25rem" }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Date picker */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <CalendarIcon size={14} /> Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2026-01-01"
                  style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "12px",
                    border: "2px solid #e5e7eb", outline: "none", fontSize: "0.95rem",
                    boxSizing: "border-box", background: "#f8fafc", fontWeight: 600
                  }}
                />
              </div>

              {/* Aarti picker */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
                  Aarti / Service
                </label>
                <select
                  value={selectedAarti.name}
                  onChange={(e) => {
                    const a = AARTI_TYPES.find(x => x.name === e.target.value);
                    if (a) setSelectedAarti(a);
                  }}
                  style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "12px",
                    border: "2px solid var(--color-saffron)", outline: "none",
                    fontSize: "0.95rem", boxSizing: "border-box",
                    background: "white", color: "var(--color-saffron-dark)", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {AARTI_TYPES.map((a) => (
                    <option key={a.name} value={a.name}>{a.name.replace(" Singing", "")}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "2px solid #e5e7eb", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(selectedAarti.name, selectedDate)}
                  style={{
                    flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))",
                    color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(234,88,12,0.3)"
                  }}
                >
                  ✓ Confirm Log
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}

export default function BirthdayCalendar({ devotees = [], onMarkSung, onOpenDetails }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [customLogDevotee, setCustomLogDevotee] = useState(null);

  // Map day → devotees with birthdays in viewMonth
  const birthdaysByDay = useMemo(() => {
    const map = {};
    devotees.forEach((d) => {
      if (!d["DOB"]) return;
      const dob = new Date(d["DOB"]);
      if (isNaN(dob)) return;
      if (dob.getMonth() === viewMonth) {
        const day = dob.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(d);
      }
    });
    return map;
  }, [devotees, viewMonth]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const totalThisMonth = Object.values(birthdaysByDay).flat().length;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      {/* Custom Log Modal */}
      {customLogDevotee && (
        <CustomLogModal
          devotee={customLogDevotee}
          onClose={() => setCustomLogDevotee(null)}
          onConfirm={(aartiName, date) => {
            setCustomLogDevotee(null);
            onMarkSung(customLogDevotee, aartiName, date);
          }}
        />
      )}

      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", padding: "0.75rem", borderRadius: "14px", color: "var(--color-saffron)", boxShadow: "0 4px 12px rgba(234,88,12,0.15)" }}>
              <Gift size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Birthday Calendar
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {totalThisMonth > 0 ? `${totalThisMonth} birthday${totalThisMonth > 1 ? "s" : ""} in ${MONTH_NAMES[viewMonth]}` : `No birthdays in ${MONTH_NAMES[viewMonth]}`}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={prevMonth} className="icon-button" style={{ width: 36, height: 36 }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", minWidth: "120px", textAlign: "center", color: "var(--text-primary)", background: "#f8fafc", padding: "0.4rem 0.75rem", borderRadius: "8px" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="icon-button" style={{ width: 36, height: 36 }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "3px" }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", padding: "0.35rem 0", letterSpacing: "0.05em" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const hasBirthday = !!birthdaysByDay[day];
            const bCount = birthdaysByDay[day]?.length || 0;
            const todayCell = isToday(day);
            const isSelected = selectedDay?.day === day;
            return (
              <button
                key={day}
                onClick={() => hasBirthday && setSelectedDay(isSelected ? null : { day, devotees: birthdaysByDay[day] })}
                style={{
                  padding: "0.35rem 0.15rem",
                  borderRadius: "10px",
                  border: isSelected
                    ? "2px solid var(--color-saffron)"
                    : todayCell
                    ? "2px solid #3b82f6"
                    : hasBirthday
                    ? "1px solid #fde68a"
                    : "1px solid transparent",
                  background: isSelected
                    ? "#fff7ed"
                    : hasBirthday
                    ? "#fffbeb"
                    : todayCell
                    ? "#eff6ff"
                    : "transparent",
                  cursor: hasBirthday ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                  transition: "all 0.18s",
                  minHeight: "46px", justifyContent: "center",
                  boxShadow: isSelected ? "0 2px 8px rgba(234,88,12,0.2)" : "none"
                }}
              >
                <span style={{
                  fontSize: "0.82rem",
                  fontWeight: todayCell ? 800 : hasBirthday ? 700 : 400,
                  color: todayCell ? "#2563eb" : hasBirthday ? "#b45309" : "#64748b"
                }}>
                  {day}
                </span>
                {hasBirthday && (
                  <span style={{
                    fontSize: "0.58rem", background: isSelected ? "var(--color-saffron)" : "#f59e0b",
                    color: "white", borderRadius: "50px", padding: "1px 5px", fontWeight: 700, lineHeight: "1.5"
                  }}>
                    🎂{bCount > 1 ? ` ×${bCount}` : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day expanded panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: "1.25rem",
                background: "linear-gradient(135deg, #fffbeb, #fff7ed)",
                border: "1px solid #fde68a",
                borderRadius: "16px",
                padding: "1.25rem",
                boxShadow: "0 4px 20px rgba(234,88,12,0.1)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.1rem" }}>🎂</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#92400e" }}>
                  {MONTH_NAMES[viewMonth]} {selectedDay.day} — {selectedDay.devotees.length} Birthday{selectedDay.devotees.length > 1 ? "s" : ""}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {selectedDay.devotees.map((d) => (
                  <div
                    key={d.id}
                    className="birthday-devotee-card"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "white", borderRadius: "12px", padding: "0.85rem 1rem",
                      border: "1px solid #fde68a", gap: "0.75rem", flexWrap: "wrap",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                  >
                    {/* Devotee info */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", whiteSpace: "normal", wordBreak: "break-word" }}>
                        {d["Devotee Name"]}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.1rem", lineHeight: "1.4" }}>
                        <span style={{
                          background: d.devotee_type === "Brahmachari" ? "#fff7ed" : "#f1f5f9",
                          color: d.devotee_type === "Brahmachari" ? "#c2410c" : "#64748b",
                          border: `1px solid ${d.devotee_type === "Brahmachari" ? "#fdba74" : "#cbd5e1"}`,
                          padding: "0 0.35rem", borderRadius: "50px", fontSize: "0.68rem", fontWeight: 600, marginRight: "0.4rem"
                        }}>
                          {d.devotee_type || "Devotee"}
                        </span>
                        Last sung: <strong>{d["Last Sung Date"] ? new Date(d["Last Sung Date"]).toLocaleDateString("en-IN") : "Never"}</strong>
                        &nbsp;· Total: <strong>{d["Times Sung"] || 0}</strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="birthday-devotee-actions" style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexShrink: 0 }}>
                      {/* Info button */}
                      {onOpenDetails && (
                        <button
                          onClick={() => onOpenDetails(d)}
                          className="icon-button"
                          title="View history & details"
                          style={{ width: 36, height: 36, color: "var(--color-saffron)", background: "#fff7ed", border: "1px solid #fde68a" }}
                        >
                          <Info size={16} />
                        </button>
                      )}
                      {/* Custom log button */}
                      <button
                        onClick={() => setCustomLogDevotee(d)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.35rem",
                          padding: "0.5rem 0.9rem",
                          background: "linear-gradient(135deg, var(--color-tulsi-light), var(--color-tulsi))",
                          color: "var(--color-tulsi-dark)", border: "none", borderRadius: "10px",
                          fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap",
                          boxShadow: "0 3px 10px rgba(8,145,178,0.25)"
                        }}
                        title="Log with custom date & aarti"
                      >
                        <CalendarIcon size={14} /> Log Entry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
