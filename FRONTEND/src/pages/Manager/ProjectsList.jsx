import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { getTasks } from "../../services/task";

const projectColors = ["#6366f1", "#f59e0b", "#3b82f6", "#f97316", "#8b5cf6"];

const formatDate = (date) => {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ProjectsList = ({ onNewTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTasks({ limit: 5, sortBy: "deadline", order: "asc" });
        setTasks((res.data || []).filter((task) => task.status !== "completed").slice(0, 5));
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px",
      border: "1px solid #f0f0f0", flex: 1,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Upcoming Tasks</h3>
        <button
          onClick={onNewTask}
          style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 12px", borderRadius: 8,
          border: "1px solid #e0e0e0", background: "#fff",
          fontSize: 12, fontWeight: 600, color: "#555",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
        }}
        >
          <Plus size={12} /> New
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", color: "#aaa" }}>
          <Loader2 size={18} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> Loading...
        </div>
      ) : tasks.length === 0 ? (
        <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "24px 0" }}>
          No open tasks yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tasks.map((task, i) => (
            <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${projectColors[i % projectColors.length]}20`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: projectColors[i % projectColors.length]
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {task.title}
                </p>
                <p style={{ fontSize: 11, color: "#aaa" }}>
                  Due date: {formatDate(task.deadline)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
