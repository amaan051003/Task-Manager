import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { getTasks } from "../../services/task";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const COLORS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Slate", value: "#818cf8" },
  { label: "Orange", value: "#f97316" },
  { label: "Green", value: "#10b981" },
  { label: "Pink", value: "#db2777" },
];

const CalendarPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // events shape: { "2026-5-14": [{ title, color }], ... }
  const [events, setEvents] = useState({});
  const [taskEvents, setTaskEvents] = useState({});
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evColor, setEvColor] = useState(COLORS[0].value);

  useEffect(() => {
    const fetchTaskDeadlines = async () => {
      try {
        setLoadingTasks(true);
        setTaskError("");
        const res = await getTasks({ limit: 1000, sortBy: "deadline", order: "asc" });
        const grouped = {};

        (res.data || []).forEach((task) => {
          if (!task.deadline) return;
          const date = new Date(task.deadline);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          const color = task.status === "completed" ? "#10b981" : task.priority === "urgent" || task.priority === "high" ? "#f97316" : "#4f46e5";

          grouped[key] = [
            ...(grouped[key] || []),
            {
              title: task.title,
              color,
              source: "task",
            },
          ];
        });

        setTaskEvents(grouped);
      } catch (err) {
        setTaskError(err?.response?.data?.message || "Failed to load task deadlines.");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTaskDeadlines();
  }, []);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const openModal = (day = null) => {
    // Pre-fill date if clicking a specific day
    if (day) {
      const m = String(month + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      setEvDate(`${year}-${m}-${d}`);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEvTitle("");
    setEvDate("");
    setEvColor(COLORS[0].value);
  };

  const handleSave = () => {
    if (!evTitle.trim() || !evDate) return;
    const [y, m, d] = evDate.split("-").map(Number);
    const key = `${y}-${m}-${d}`;
    setEvents(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { title: evTitle.trim(), color: evColor }],
    }));
    closeModal();
  };

  return (
    <>
      {/* Header — exactly as original */}
      <div className="flex items-start justify-between mb-7 flex-shrink-0">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] mb-1">Calendar</h1>
          <p className="text-[13px] text-[#888]">Schedule events and track task deadlines.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-[11px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(79,70,229,0.3)] font-[DM_Sans,sans-serif]"
        >
          <Plus size={15} /> Add Event
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="bg-white rounded-[16px] p-6 border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {(loadingTasks || taskError) && (
            <div className={`mb-4 flex items-center gap-2 text-[12px] ${taskError ? "text-red-500" : "text-[#888]"}`}>
              {taskError ? <AlertCircle size={14} /> : <Loader2 size={14} className="animate-spin" />}
              {taskError || "Loading task deadlines..."}
            </div>
          )}

          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center cursor-pointer hover:bg-[#eef2ff] transition">
              <ChevronLeft size={16} color="#555" />
            </button>
            <h2 className="text-[16px] font-bold text-[#111]">{MONTHS[month]} {year}</h2>
            <button onClick={next} className="w-9 h-9 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center cursor-pointer hover:bg-[#eef2ff] transition">
              <ChevronRight size={16} color="#555" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-[#aaa] py-2">{d}</div>
            ))}
          </div>

          {/* Grid — exactly as original, day click opens modal */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const key = `${year}-${month + 1}-${day}`;
              const dayEvents = day ? [...(taskEvents[key] || []), ...(events[key] || [])] : [];

              return (
                <div
                  key={i}
                  onClick={() => day && openModal(day)}
                  className={`min-h-[80px] rounded-[10px] p-2 transition-all cursor-pointer bg-[#ebebeb] bg-opacity-5
                    ${!day ? "" : "hover:bg-[#eef2ff]"}
                    ${isToday ? "bg-[#eef2ff] border border-[#4f46e5]" : ""}`}
                >
                  {day && (
                    <>
                      <span className={`text-[13px] font-semibold inline-flex w-7 h-7 items-center justify-center rounded-full
                        ${isToday ? "bg-[#4f46e5] text-white" : "text-[#111]"}`}>
                        {day}
                      </span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayEvents.map((ev, j) => (
                          <div
                            key={j}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] text-white truncate"
                            style={{ background: ev.color }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-[16px] p-6 w-[340px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-[#111]">Add Event</h3>
              <button onClick={closeModal} className="text-[#aaa] hover:text-[#555] transition">
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#555] mb-1.5">Event Title</label>
              <input
                type="text"
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. Team Standup"
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[8px] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition"
              />
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#555] mb-1.5">Date</label>
              <input
                type="date"
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[8px] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition"
              />
            </div>

            {/* Color picker */}
            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-[#555] mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setEvColor(c.value)}
                    className="w-6 h-6 rounded-full transition-transform"
                    style={{
                      background: c.value,
                      outline: evColor === c.value ? `2px solid ${c.value}` : "none",
                      outlineOffset: "2px",
                      transform: evColor === c.value ? "scale(1.2)" : "scale(1)",
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-[8px] bg-[#f5f5f5] text-[#555] text-[13px] font-semibold border-none cursor-pointer hover:bg-[#eee] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-[8px] bg-[#4f46e5] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#4338ca] transition"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarPage;
