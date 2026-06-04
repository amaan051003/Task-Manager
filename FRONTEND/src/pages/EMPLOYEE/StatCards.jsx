import { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileText, TrendingUp } from "lucide-react";
import { getTasks } from "../../services/task";

const StatCard = ({ label, value, sub, icon: Icon, highlight, loading }) => (
  <div
    className={`rounded-[16px] p-[22px_24px] flex flex-col gap-2 flex-1 ${highlight
        ? "bg-[#4f46e5] shadow-[0_8px_32px_rgba(79,70,229,0.25)]"
        : "bg-white border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      }`}
  >
    <div className="flex items-center justify-between">
      <p className={`text-[13px] font-medium ${highlight ? "text-white/75" : "text-[#888]"}`}>{label}</p>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${highlight ? "border border-white/40" : "border border-[#e0e0e0]"}`}>
        <Icon size={13} color={highlight ? "#fff" : "#888"} />
      </div>
    </div>
    <p className={`text-[36px] font-extrabold leading-none ${highlight ? "text-white" : "text-[#111]"}`}>
      {loading ? "—" : value}
    </p>
    <p className={`text-[11px] ${highlight ? "text-white/65" : "text-[#888]"}`}>{sub}</p>
  </div>
);

const StatCards = () => {
  const [counts, setCounts] = useState({ total: 0, completed: 0, active: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTasks({ limit: 1000 });
        const tasks = res.data || [];
        setCounts({
          total: tasks.length,
          completed: tasks.filter((t) => t.status === "completed").length,
          active: tasks.filter((t) => t.status === "in_progress" || t.status === "review").length,
          pending: tasks.filter((t) => t.status === "pending").length,
        });
      } catch {
        // keep zeros
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex gap-4">
      <StatCard label="Total Tasks" value={counts.total} sub="Assigned to you" icon={FileText} highlight loading={loading} />
      <StatCard label="Completed" value={counts.completed} sub="Finished tasks" icon={CheckCircle2} loading={loading} />
      <StatCard label="In Progress" value={counts.active} sub="Active and review" icon={TrendingUp} loading={loading} />
      <StatCard label="Pending" value={counts.pending} sub="Not started yet" icon={Clock} loading={loading} />
    </div>
  );
};

export default StatCards;
