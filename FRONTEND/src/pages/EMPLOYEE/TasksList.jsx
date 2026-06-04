import { useEffect, useState } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { getTasks } from "../../services/task";

const formatDate = (date) => {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const taskColors = ["#6366f1", "#f59e0b", "#3b82f6", "#f97316", "#8b5cf6"];

const TasksList = ({ onOpenTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTasks({ limit: 5, sortBy: "deadline", order: "asc" });
        setTasks((res.data || []).filter((t) => t.status !== "completed").slice(0, 5));
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#f0f0f0] flex-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-[#111]">My Work Queue</h3>
        <button
          onClick={onOpenTasks}
          className="flex items-center gap-1 text-[12px] font-semibold text-[#4f46e5] bg-transparent border-none cursor-pointer"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-[#aaa]">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading...
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#aaa]">
          <FileText size={28} strokeWidth={1.5} />
          <p className="text-[13px]">No open tasks.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task, i) => (
            <div key={task._id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${taskColors[i % taskColors.length]}20` }}>
                <FileText size={14} style={{ color: taskColors[i % taskColors.length] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111] truncate">{task.title}</p>
                <p className="text-[11px] text-[#aaa]">Due date: {formatDate(task.deadline)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksList;
