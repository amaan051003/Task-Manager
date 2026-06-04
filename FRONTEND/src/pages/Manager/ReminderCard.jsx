import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { getTasks } from "../../services/task";

const formatDate = (date) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ReminderCard = ({ onOpenCalendar }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const res = await getTasks({ limit: 1000, sortBy: "deadline", order: "asc" });
        const upcoming = (res.data || [])
          .filter((item) => item.status !== "completed" && item.deadline)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTask(upcoming[0] || null);
      } catch {
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, []);

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px",
      border: "1px solid #f0f0f0", width: 220, flexShrink: 0,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>
        Reminders
      </h3>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 104, color: "#aaa" }}>
          <Loader2 size={18} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> Loading...
        </div>
      ) : (
        <>
          <p style={{
            fontSize: 16, fontWeight: 800, color: "#111",
            marginBottom: 4, lineHeight: 1.3
          }}>
            {task?.title || "No upcoming deadlines"}
          </p>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>
            {task ? `Due: ${formatDate(task.deadline)}` : "Create a task with a deadline to see it here."}
          </p>
          <button
            onClick={onOpenCalendar}
            style={{
            width: "100%", padding: "11px 0",
            background: "#4f46e5", border: "none", borderRadius: 10,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'DM Sans', sans-serif"
          }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <CalendarClock size={11} />
            </div>
            {task ? "Open Calendar" : "View Calendar"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReminderCard;
