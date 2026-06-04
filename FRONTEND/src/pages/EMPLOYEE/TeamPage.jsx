import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { getTeams } from "../../services/team";
import { getTasks, updateTaskProgress, updateTaskStatus } from "../../services/task";

const priorityStyle = {
  urgent: "bg-red-100 text-red-600",
  high: "bg-orange-100 text-orange-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};

const fmt = (v = "") => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatDate = (date) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ── Main Page ── */
const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true); setError("");
      const [teamRes, taskRes] = await Promise.all([
        getTeams(),
        getTasks({ limit: 1000, sortBy: "deadline", order: "asc" }),
      ]);
      setTeams(teamRes.data || []);
      setTasks(taskRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="flex items-start justify-between mb-7 flex-shrink-0">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] mb-1">My Teams</h1>
          <p className="text-[13px] text-[#888]">Teams where you are listed as a member.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[13px] mb-4 flex-shrink-0">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[#aaa]">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-2 text-[#aaa]">
            <Users size={32} strokeWidth={1.5} />
            <p className="text-[14px]">You are not assigned to any teams yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {teams.map((team) => {
              const memberIds = new Set((team.members || []).map((m) => m._id));
              const teamTasks = tasks.filter(
                (t) => t.team?._id === team._id || t.team === team._id || memberIds.has(t.assignedTo?._id)
              );
              const completed = teamTasks.filter((t) => t.status === "completed").length;
              const progress = teamTasks.length ? Math.round((completed / teamTasks.length) * 100) : 0;

              return (
                <div key={team._id} className="bg-white rounded-[18px] p-5 border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-[12px] bg-[#eef2ff] flex items-center justify-center flex-shrink-0">
                      <Users size={20} className="text-[#4f46e5]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#4f46e5] bg-[#eef2ff] px-2.5 py-1 rounded-full">
                      {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div>
                    <p className="text-[15px] font-extrabold text-[#111] mb-1">{team.name}</p>
                    <p className="text-[11px] text-[#aaa]">Manager: {team.manager?.name || "Unknown"}</p>
                  </div>

                  {/* Member avatars */}
                  <div className="flex -space-x-2">
                    {(team.members || []).slice(0, 6).map((m, i) => (
                      <div key={m._id} title={m.name}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: m.avatarColor || ["#4f46e5", "#f59e0b", "#3b82f6", "#10b981"][i % 4] }}>
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#aaa] mb-1.5">
                      <span>Team task progress</span>
                      <span className="font-semibold text-[#555]">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#4f46e5] transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-[#bbb] mt-1.5">{completed}/{teamTasks.length} tasks done</p>
                  </div>

                  {/* Team tasks */}
                  <div className="border-t border-[#f5f5f5] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Team Project Work</p>
                      <span className="text-[10px] font-bold text-[#4f46e5] bg-[#eef2ff] px-2 py-0.5 rounded-full">
                        {teamTasks.length}
                      </span>
                    </div>
                    {teamTasks.length === 0 ? (
                      <p className="text-[12px] text-[#aaa] bg-[#f9f9f9] rounded-[10px] px-3 py-3">
                        No project tasks from this team are assigned to you yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {teamTasks.slice(0, 4).map((task) => (
                          <TeamProjectTask key={task._id} task={task} onUpdated={fetchAll} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

/* ── Team Project Task ── */
const TeamProjectTask = ({ task, onUpdated }) => {
  const [status, setStatus] = useState(task.status || "pending");
  const [progress, setProgress] = useState(task.progress || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    try {
      setSaving(true); setError("");
      if (status !== task.status) await updateTaskStatus(task._id, status);
      if (Number(progress) !== Number(task.progress || 0)) await updateTaskProgress(task._id, Number(progress));
      await onUpdated();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update this team task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f9f9fb] rounded-[12px] p-3 border border-[#f0f0f0]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#111] truncate">{task.title}</p>
          <p className="text-[11px] text-[#aaa] mt-0.5">Due: {formatDate(task.deadline)}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityStyle[task.priority] || priorityStyle.medium}`}>
          {fmt(task.priority || "medium")}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_90px] gap-2 items-center">
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="w-full px-2.5 py-2 rounded-[8px] border border-[#e0e0e0] text-[12px] text-[#111] outline-none focus:border-[#4f46e5] bg-white">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Complete</option>
        </select>
        <div className="flex items-center gap-1">
          <input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)}
            className="w-full px-2 py-2 rounded-[8px] border border-[#e0e0e0] text-[12px] text-[#111] outline-none focus:border-[#4f46e5] bg-white" />
          <span className="text-[11px] text-[#aaa]">%</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-[#ededed] rounded-full overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#4f46e5] transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%` }} />
      </div>

      {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}

      <button onClick={save} disabled={saving}
        className="mt-3 w-full py-2 rounded-[8px] bg-[#4f46e5] text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-[#4338ca] transition disabled:opacity-60">
        {saving ? "Updating..." : "Update Team Project Task"}
      </button>
    </div>
  );
};

export default TeamPage;
