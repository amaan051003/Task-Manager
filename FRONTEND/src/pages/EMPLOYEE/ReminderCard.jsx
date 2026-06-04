import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { getTasks } from "../../services/task";

const formatDate = (date) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ReminderCard = ({ onOpenCalendar }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const res = await getTasks({ limit: 1000, sortBy: "deadline", order: "asc" });
        const upcoming = (res.data || [])
          .filter((t) => t.status !== "completed" && t.deadline)
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
    <div className="bg-white rounded-[16px] p-6 border border-[#f0f0f0] w-[220px] flex-shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <h3 className="text-[15px] font-bold text-[#111] mb-4">Reminders</h3>

      {loading ? (
        <div className="flex items-center justify-center min-h-[104px] text-[#aaa]">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <>
          <p className="text-[16px] font-extrabold text-[#111] mb-1 leading-snug">
            {task?.title || "No upcoming deadlines"}
          </p>
          <p className="text-[12px] text-[#888] mb-5">
            {task ? `Due: ${formatDate(task.deadline)}` : "Create a task with a deadline to see it here."}
          </p>
          <button
            onClick={onOpenCalendar}
            className="w-full py-[11px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#4338ca] transition font-[DM_Sans,sans-serif]"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
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
