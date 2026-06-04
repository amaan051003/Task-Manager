import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Loader2, RotateCcw } from "lucide-react";
import { getTasks } from "../../services/task";

const ProjectProgress = () => {
  const [counts, setCounts] = useState({ total: 0, completed: 0, active: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getTasks({ limit: 1000 });
        const tasks = res.data || [];
        setCounts({
          total: tasks.length,
          completed: tasks.filter((task) => task.status === "completed").length,
          active: tasks.filter((task) => task.status === "in_progress" || task.status === "review").length,
          pending: tasks.filter((task) => task.status === "pending").length,
        });
      } catch {
        setCounts({ total: 0, completed: 0, active: 0, pending: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const completePct = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0;

  const rows = [
    {
      label: "Completed",
      value: counts.completed,
      pct: counts.total ? Math.round((counts.completed / counts.total) * 100) : 0,
      color: "#4f46e5",
      bg: "#eef2ff",
      icon: CheckCircle2,
    },
    {
      label: "In Progress",
      value: counts.active,
      pct: counts.total ? Math.round((counts.active / counts.total) * 100) : 0,
      color: "#0284c7",
      bg: "#e0f2fe",
      icon: RotateCcw,
    },
    {
      label: "Pending",
      value: counts.pending,
      pct: counts.total ? Math.round((counts.pending / counts.total) * 100) : 0,
      color: "#f59e0b",
      bg: "#fef3c7",
      icon: Clock3,
    },
  ];

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "22px",
      border: "1px solid #f0f0f0", width: 280, flexShrink: 0,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>
            Task Progress
          </h3>
          <p style={{ fontSize: 11, color: "#999", margin: "4px 0 0" }}>
            Status across assigned work
          </p>
        </div>
        <span style={{
          borderRadius: 999, padding: "5px 9px", background: "#f7f7f7",
          color: "#555", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
        }}>
          {counts.total} total
        </span>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "#aaa" }}>
          <Loader2 size={18} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> Loading...
        </div>
      ) : (
        <>
          <div style={{
            borderRadius: 14, background: "#f8fafc", padding: 16,
            border: "1px solid #f1f5f9", marginBottom: 16
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "#111", lineHeight: 1 }}>
                {completePct}%
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#777" }}>
                Complete
              </span>
            </div>
            <div style={{
              height: 10, borderRadius: 999, background: "#e5e7eb",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${completePct}%`, height: "100%", borderRadius: 999,
                background: "#4f46e5", transition: "width 300ms ease"
              }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map(({ label, value, pct, color, bg, icon: Icon }) => (
              <div key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8, background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color, flexShrink: 0
                  }}>
                    <Icon size={13} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#333", flex: 1 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#777" }}>
                    {value}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "#f0f0f0", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 999,
                    background: color, transition: "width 300ms ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectProgress;
