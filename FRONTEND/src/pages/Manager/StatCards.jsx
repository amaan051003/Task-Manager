import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTasks } from "../../services/task";

const StatCard = ({ label, value, sub, highlight, loading }) => (
  <div style={{
    background: highlight ? "#4f46e5" : "#fff",
    borderRadius: 16, padding: "22px 24px",
    border: highlight ? "none" : "1px solid #f0f0f0",
    display: "flex", flexDirection: "column", gap: 8, flex: 1,
    boxShadow: highlight
      ? "0 8px 32px rgba(79,70,229,0.25)"
      : "0 2px 12px rgba(0,0,0,0.04)"
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{
        fontSize: 13, fontWeight: 500,
        color: highlight ? "rgba(255,255,255,0.75)" : "#888"
      }}>{label}</p>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `1.5px solid ${highlight ? "rgba(255,255,255,0.4)" : "#e0e0e0"}`,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
      }}>
        <ArrowUpRight size={13} color={highlight ? "#fff" : "#888"} />
      </div>
    </div>
    <p style={{
      fontSize: 36, fontWeight: 800,
      color: highlight ? "#fff" : "#111", lineHeight: 1
    }}>
      {loading ? "—" : value}
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: highlight ? "rgba(255,255,255,0.2)" : "#eef2ff",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <ArrowUpRight size={10} color={highlight ? "#fff" : "#4f46e5"} />
      </div>
      <p style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.65)" : "#888" }}>
        {sub}
      </p>
    </div>
  </div>
);

const StatCards = () => {
  const [counts, setCounts] = useState({ total: 0, completed: 0, in_progress: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getTasks({ limit: 1000 });
        const tasks = res.data || [];

        setCounts({
          total: tasks.length,
          completed: tasks.filter((t) => t.status === "completed").length,
          in_progress: tasks.filter((t) => t.status === "in_progress" || t.status === "review").length,
          pending: tasks.filter((t) => t.status === "pending").length,
        });
      } catch {
        // Keep zeros if the API is unavailable.
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "Total Tasks", value: counts.total, sub: "All tasks in workspace", highlight: true },
    { label: "Completed", value: counts.completed, sub: "Tasks fully done" },
    { label: "In Progress", value: counts.in_progress, sub: "Active & under review" },
    { label: "Pending", value: counts.pending, sub: "Not started yet" },
  ];

  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      {stats.map((s) => (
        <StatCard key={s.label} {...s} loading={loading} />
      ))}
    </div>
  );
};

export default StatCards;
