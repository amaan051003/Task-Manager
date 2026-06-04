import { useState, useEffect } from "react";
import {
  Plus, Mail, Loader2, AlertCircle, X, Check,
  UserPlus, Users, Trash2, Crown,
  ArrowLeft, Search, CheckSquare, Square,
  ClipboardList, Calendar, ChevronDown, ChevronUp,
  Clock, CheckCircle2, Circle, RotateCcw, Eye
} from "lucide-react";
import { getTeams, createTeam, addMember, removeMember, deleteTeam } from "../../services/team";
import { getTasks } from "../../services/task";
import API from "../../services/api";

const avatarColors = [
  "#f87171", "#34d399", "#60a5fa", "#a78bfa",
  "#fb923c", "#f472b6", "#4f46e5", "#0891b2",
];

const getColor = (member, index) =>
  member?.avatarColor || avatarColors[index % avatarColors.length];

const Avatar = ({ name, color, size = 36 }) => (
  <div
    style={{
      width: size, height: size, background: color,
      borderRadius: "50%", flexShrink: 0, fontSize: size * 0.38,
    }}
    className="flex items-center justify-center text-white font-bold"
  >
    {name?.charAt(0)?.toUpperCase()}
  </div>
);

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Circle, bg: "bg-gray-100", text: "text-gray-500" },
  in_progress: { label: "In Progress", icon: RotateCcw, bg: "bg-blue-100", text: "text-blue-600" },
  review: { label: "Review", icon: Eye, bg: "bg-amber-100", text: "text-amber-600" },
  completed: { label: "Completed", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-600" },
};

const PRIORITY_CONFIG = {
  low: { bg: "bg-slate-100", text: "text-slate-500" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-600" },
  high: { bg: "bg-orange-100", text: "text-orange-600" },
  urgent: { bg: "bg-red-100", text: "text-red-600" },
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [memberTaskMap, setMemberTaskMap] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsRes, tasksRes, empRes] = await Promise.all([
        getTeams(),
        getTasks({ limit: 1000 }),
        API.get("/auth/employees").catch(() => ({ data: null })),
      ]);

      const teamsData = teamsRes.data || [];
      const tasksData = tasksRes.data || [];
      const empData = empRes.data?.users || [];

      setTeams(teamsData);
      setAllEmployees(empData);
      setAllTasks(tasksData);

      // Build task counts per member
      const taskMap = {};
      teamsData.forEach((team) => {
        (team.members || []).forEach((m) => {
          if (!taskMap[m._id]) {
            const userTasks = tasksData.filter(
              (t) => t.assignedTo?._id === m._id || t.assignedTo === m._id
            );
            taskMap[m._id] = {
              total: userTasks.length,
              done: userTasks.filter((t) => t.status === "completed").length,
            };
          }
        });
      });
      setMemberTaskMap(taskMap);

      if (selectedTeam) {
        const refreshed = teamsData.find((t) => t._id === selectedTeam._id);
        setSelectedTeam(refreshed || null);
      }
    } catch {
      setError("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchAll, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (selectedTeam) {
    return (
      <TeamDetailPanel
        team={selectedTeam}
        memberTaskMap={memberTaskMap}
        allEmployees={allEmployees}
        allTasks={allTasks}
        onBack={() => setSelectedTeam(null)}
        onRefresh={fetchAll}
      />
    );
  }

  return (
    <>
      <div className="flex items-start justify-between mb-7 flex-shrink-0">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] mb-1">Teams</h1>
          <p className="text-[13px] text-[#888]">
            {loading ? "Loading..." : `${teams.length} team${teams.length !== 1 ? "s" : ""} in your workspace`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateTeam(true)}
          className="flex items-center gap-2 px-5 py-[11px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(79,70,229,0.3)] font-[DM_Sans,sans-serif] hover:bg-[#4338ca] transition"
        >
          <Plus size={15} /> New Team
        </button>
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
          <div className="flex flex-col items-center justify-center h-60 gap-3">
            <div className="w-16 h-16 rounded-[20px] bg-[#f5f5f5] flex items-center justify-center">
              <Users size={28} className="text-[#ccc]" />
            </div>
            <p className="text-[14px] font-semibold text-[#888]">No teams yet</p>
            <p className="text-[13px] text-[#bbb]">Create your first team to get started</p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] rounded-[10px] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#4338ca] transition border-none font-[DM_Sans,sans-serif]"
            >
              <Plus size={14} /> Create Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                memberTaskMap={memberTaskMap}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateTeam && (
        <CreateTeamModal
          allEmployees={allEmployees}
          onClose={() => setShowCreateTeam(false)}
          onDone={(newTeam) => {
            fetchAll();
            if (newTeam) setSelectedTeam(newTeam);
          }}
        />
      )}
    </>
  );
};

// ─── Team Card ───────────────────────────────────────────────────────────────
const TeamCard = ({ team, memberTaskMap, onClick }) => {
  const members = team.members || [];
  let totalTasks = 0, doneTasks = 0;
  members.forEach((m) => {
    const info = memberTaskMap[m._id] || { total: 0, done: 0 };
    totalTasks += info.total;
    doneTasks += info.done;
  });
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-[18px] p-5 border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-4 text-left cursor-pointer hover:border-[#4f46e5] hover:shadow-[0_4px_20px_rgba(79,70,229,0.1)] transition-all duration-200 w-full"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-[12px] bg-[#eef2ff] flex items-center justify-center flex-shrink-0">
          <Users size={20} className="text-[#4f46e5]" />
        </div>
        <span className="text-[11px] font-bold text-[#4f46e5] bg-[#eef2ff] px-2.5 py-1 rounded-full">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        <p className="text-[15px] font-extrabold text-[#111] mb-1">{team.name}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-[#aaa]">
          <Crown size={10} className="text-[#f59e0b]" />
          {team.manager?.name || "—"}
        </div>
      </div>
      {members.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m, i) => (
              <div
                key={m._id}
                style={{ background: getColor(m, i), zIndex: 5 - i }}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              >
                {m.name?.charAt(0)?.toUpperCase()}
              </div>
            ))}
          </div>
          {members.length > 5 && (
            <span className="ml-2 text-[11px] text-[#aaa]">+{members.length - 5} more</span>
          )}
        </div>
      )}
      <div>
        <div className="flex justify-between text-[11px] text-[#aaa] mb-1.5">
          <span>Team progress</span>
          <span className="font-semibold text-[#555]">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4f46e5] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-[#bbb] mt-1.5">{doneTasks}/{totalTasks} tasks done</p>
      </div>
    </button>
  );
};

// ─── Team Tasks Section ───────────────────────────────────────────────────────
const TeamTasksSection = ({ team, allTasks }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [collapsed, setCollapsed] = useState(false);

  const memberIds = new Set((team.members || []).map((m) => m._id));

  // Tasks that belong to this team (by team field) OR assigned to a team member
  const teamTasks = allTasks.filter((t) => {
    const byTeam = t.team?._id === team._id || t.team === team._id;
    const byMember =
      memberIds.has(t.assignedTo?._id) || memberIds.has(t.assignedTo);
    return byTeam || byMember;
  });

  const filtered =
    statusFilter === "all"
      ? teamTasks
      : teamTasks.filter((t) => t.status === statusFilter);

  const counts = {
    all: teamTasks.length,
    pending: teamTasks.filter((t) => t.status === "pending").length,
    in_progress: teamTasks.filter((t) => t.status === "in_progress").length,
    review: teamTasks.filter((t) => t.status === "review").length,
    completed: teamTasks.filter((t) => t.status === "completed").length,
  };

  const formatDeadline = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (diffDays < 0) return { label, color: "text-red-500", bg: "bg-red-50" };
    if (diffDays <= 2) return { label, color: "text-orange-500", bg: "bg-orange-50" };
    return { label, color: "text-[#888]", bg: "bg-[#f5f5f5]" };
  };

  return (
    <div className="mt-6 flex-shrink-0">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between mb-4 bg-transparent border-none cursor-pointer p-0 group"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#eef2ff] flex items-center justify-center">
            <ClipboardList size={14} className="text-[#4f46e5]" />
          </div>
          <span className="text-[14px] font-extrabold text-[#111]">Team Tasks</span>
          <span className="text-[11px] font-bold text-[#4f46e5] bg-[#eef2ff] px-2 py-0.5 rounded-full">
            {teamTasks.length}
          </span>
        </div>
        <div className="text-[#ccc] group-hover:text-[#4f46e5] transition">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Status filter tabs */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "in_progress", label: "In Progress" },
              { key: "review", label: "Review" },
              { key: "completed", label: "Done" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer font-[DM_Sans,sans-serif] ${statusFilter === key
                    ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                    : "bg-white text-[#888] border-[#e8e8e8] hover:border-[#4f46e5] hover:text-[#4f46e5]"
                  }`}
              >
                {label}
                {counts[key] > 0 && (
                  <span className={`ml-1.5 ${statusFilter === key ? "opacity-70" : "text-[#bbb]"}`}>
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Task list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 bg-[#fafafa] rounded-[14px] border border-dashed border-[#e8e8e8]">
              <ClipboardList size={24} className="text-[#ddd]" />
              <p className="text-[12px] text-[#bbb]">
                {teamTasks.length === 0
                  ? "No tasks assigned to this team yet."
                  : "No tasks match this filter."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const StatusIcon = statusCfg.icon;
                const deadline = formatDeadline(task.deadline);
                const assignee = task.assignedTo;
                const assigneeColor = assignee?.avatarColor || avatarColors[0];

                return (
                  <div
                    key={task._id}
                    className="bg-white rounded-[12px] px-4 py-3.5 border border-[#f0f0f0] flex items-center gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-[#e0e0e0] hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-150"
                  >
                    {/* Status icon */}
                    <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
                      <StatusIcon size={13} className={statusCfg.text} />
                    </div>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${task.status === "completed" ? "line-through text-[#bbb]" : "text-[#111]"}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-[#aaa] truncate mt-0.5">{task.description}</p>
                      )}
                    </div>

                    {/* Priority badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${priorityCfg.bg} ${priorityCfg.text}`}>
                      {task.priority}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>

                    {/* Deadline */}
                    {deadline && (
                      <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${deadline.bg} ${deadline.color}`}>
                        <Calendar size={9} />
                        {deadline.label}
                      </div>
                    )}

                    {/* Progress bar (only if > 0) */}
                    {task.progress > 0 && (
                      <div className="w-16 flex-shrink-0">
                        <div className="flex justify-between text-[9px] text-[#bbb] mb-0.5">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#4f46e5] transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Assignee avatar */}
                    {assignee && (
                      <div title={assignee.name} className="flex-shrink-0">
                        <Avatar name={assignee.name} color={assigneeColor} size={26} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Team Detail Panel ───────────────────────────────────────────────────────
const TeamDetailPanel = ({ team, memberTaskMap, allEmployees, allTasks, onBack, onRefresh }) => {
  const [removingId, setRemovingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);

  const existingIds = new Set((team.members || []).map((m) => m._id));
  const available = allEmployees.filter(
    (e) =>
      !existingIds.has(e._id) &&
      (e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRemoveMember = async (userId) => {
    try {
      setRemovingId(userId);
      setError(null);
      await removeMember(team._id, userId);
      await onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddExisting = async (userId) => {
    try {
      setAddingUserId(userId);
      setError(null);
      await addMember(team._id, userId);
      await onRefresh();
      setShowAddDropdown(false);
      setSearch("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add member.");
    } finally {
      setAddingUserId(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await deleteTeam(team._id);
      onBack();
      onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete team.");
      setDeleting(false);
    }
  };

  const totalTasks = team.members?.reduce((acc, m) => acc + (memberTaskMap[m._id]?.total || 0), 0) || 0;
  const doneTasks = team.members?.reduce((acc, m) => acc + (memberTaskMap[m._id]?.done || 0), 0) || 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-7 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#4f46e5] transition cursor-pointer bg-transparent border-none font-[DM_Sans,sans-serif]"
          >
            <ArrowLeft size={15} /> Teams
          </button>
          <span className="text-[#ddd]">/</span>
          <h1 className="text-[22px] font-extrabold text-[#111]">{team.name}</h1>
          <span className="text-[11px] font-semibold text-[#4f46e5] bg-[#eef2ff] px-2.5 py-1 rounded-full">
            {team.members?.length || 0} members
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddDropdown(!showAddDropdown); setSearch(""); }}
            className="flex items-center gap-2 px-4 py-[10px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(79,70,229,0.25)] hover:bg-[#4338ca] transition font-[DM_Sans,sans-serif]"
          >
            <UserPlus size={14} /> Add Member
          </button>
          <button
            onClick={handleDeleteTeam}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-[10px] bg-white border border-red-200 rounded-[10px] text-red-500 text-[13px] font-semibold cursor-pointer hover:bg-red-50 transition disabled:opacity-50 font-[DM_Sans,sans-serif]"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[13px] mb-4 flex-shrink-0">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Add member dropdown */}
      {showAddDropdown && (
        <div className="mb-5 bg-white border border-[#e0e0e0] rounded-[14px] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex-shrink-0">
          <p className="text-[12px] font-bold text-[#555] mb-3">Add an existing employee to this team</p>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-4 py-2 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] font-[DM_Sans,sans-serif]"
            />
          </div>
          {available.length === 0 ? (
            <p className="text-[12px] text-[#aaa] text-center py-3">
              {allEmployees.length === 0
                ? "No employees in the system yet."
                : "All employees are already in this team."}
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
              {available.map((emp, i) => (
                <button
                  key={emp._id}
                  onClick={() => handleAddExisting(emp._id)}
                  disabled={addingUserId === emp._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-[8px] hover:bg-[#eef2ff] transition cursor-pointer text-left w-full bg-transparent border-none disabled:opacity-50"
                >
                  <Avatar name={emp.name} color={getColor(emp, i)} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#111] truncate">{emp.name}</p>
                    <p className="text-[11px] text-[#aaa] truncate">{emp.email}</p>
                  </div>
                  {addingUserId === emp._id
                    ? <Loader2 size={14} className="animate-spin text-[#4f46e5]" />
                    : <Plus size={14} className="text-[#4f46e5] flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => { setShowAddDropdown(false); setSearch(""); }}
            className="mt-3 text-[12px] text-[#aaa] hover:text-[#555] cursor-pointer bg-transparent border-none font-[DM_Sans,sans-serif]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Team info bar */}
      <div className="bg-[#f9f9fb] rounded-[14px] px-5 py-4 mb-5 flex items-center gap-5 flex-shrink-0">
        <div className="flex items-center gap-2 text-[12px] text-[#888]">
          <Crown size={13} className="text-[#f59e0b]" />
          <span>Manager: <span className="font-semibold text-[#333]">{team.manager?.name || "—"}</span></span>
        </div>
        <div className="w-px h-4 bg-[#e8e8e8]" />
        <div className="text-[12px] text-[#888]">
          <span className="font-semibold text-[#333]">{team.members?.length || 0}</span> members
        </div>
        <div className="w-px h-4 bg-[#e8e8e8]" />
        <div className="text-[12px] text-[#888]">
          <span className="font-semibold text-[#333]">{doneTasks}/{totalTasks}</span> tasks done
        </div>
      </div>

      {/* Scrollable content: members + tasks */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Members list */}
        <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-3">Members</p>
        {!team.members || team.members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#aaa]">
            <Users size={28} className="text-[#ddd]" />
            <p className="text-[13px]">No members yet. Add some!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {team.members.map((m, i) => {
              const taskInfo = memberTaskMap[m._id] || { total: 0, done: 0 };
              const pct = taskInfo.total > 0
                ? Math.round((taskInfo.done / taskInfo.total) * 100) : 0;
              const color = getColor(m, i);

              return (
                <div
                  key={m._id}
                  className="bg-white rounded-[14px] px-5 py-4 border border-[#f0f0f0] flex items-center gap-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]"
                >
                  <Avatar name={m.name} color={color} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#111]">{m.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#aaa] mt-0.5">
                      <Mail size={10} />
                      <span className="truncate">{m.email}</span>
                    </div>
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <div className="flex justify-between text-[10px] text-[#bbb] mb-1">
                      <span>Tasks</span>
                      <span>{taskInfo.done}/{taskInfo.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${m.role === "manager" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}>
                    {m.role}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    disabled={removingId === m._id}
                    className="w-8 h-8 rounded-[8px] border border-[#f0f0f0] flex items-center justify-center text-[#ccc] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition cursor-pointer bg-white disabled:opacity-50 flex-shrink-0"
                    title="Remove from team"
                  >
                    {removingId === m._id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <X size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Team Tasks Section ───────────────────────────────────── */}
        <TeamTasksSection team={team} allTasks={allTasks} />

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </>
  );
};

// ─── Create Team Modal ───────────────────────────────────────────────────────
const CreateTeamModal = ({ allEmployees, onClose, onDone }) => {
  const [name, setName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const filtered = allEmployees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (id) =>
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const submit = async () => {
    if (!name.trim()) { setError("Team name is required."); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await createTeam({ name, members: selectedMemberIds });
      const newTeam = res.data?.team || res.team || res.data;
      setSuccess(true);
      setTimeout(() => { onDone(newTeam); onClose(); }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-[18px] font-bold text-[#111]">Create Team</h2>
          <button onClick={onClose} className="cursor-pointer bg-transparent border-none text-[#aaa] hover:text-[#111]">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-[#eef2ff] rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={26} className="text-[#4f46e5]" />
            </div>
            <p className="text-[15px] font-bold text-[#111]">Team created!</p>
            <p className="text-[12px] text-[#aaa] mt-1">Opening team details...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
              {error && <p className="text-red-500 text-[13px] mb-4">{error}</p>}

              <div className="mb-5">
                <label className="text-[12px] font-semibold text-[#555] mb-1 block">Team Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend Team"
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] font-[DM_Sans,sans-serif]"
                />
              </div>

              <div className="mb-2">
                <label className="text-[12px] font-semibold text-[#555] mb-2 block">
                  Add Members
                  {selectedMemberIds.length > 0 && (
                    <span className="ml-2 text-[#4f46e5] bg-[#eef2ff] px-2 py-0.5 rounded-full text-[11px]">
                      {selectedMemberIds.length} selected
                    </span>
                  )}
                </label>

                {allEmployees.length === 0 ? (
                  <div className="text-[12px] text-[#aaa] text-center py-5 border border-dashed border-[#e0e0e0] rounded-[10px]">
                    No employees found. You can add members after creating the team.
                  </div>
                ) : (
                  <>
                    <div className="relative mb-2">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employees..."
                        className="w-full pl-8 pr-4 py-2 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] font-[DM_Sans,sans-serif]"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto border border-[#f0f0f0] rounded-[10px] divide-y divide-[#f5f5f5]">
                      {filtered.length === 0 ? (
                        <p className="text-[12px] text-[#aaa] text-center py-4">No employees match.</p>
                      ) : (
                        filtered.map((emp, i) => {
                          const selected = selectedMemberIds.includes(emp._id);
                          return (
                            <button
                              key={emp._id}
                              onClick={() => toggleMember(emp._id)}
                              className={`flex items-center gap-3 px-3 py-2.5 w-full text-left cursor-pointer transition bg-transparent border-none ${selected ? "bg-[#eef2ff]" : "hover:bg-[#fafafa]"}`}
                            >
                              <Avatar name={emp.name} color={getColor(emp, i)} size={32} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-[#111] truncate">{emp.name}</p>
                                <p className="text-[11px] text-[#aaa] truncate">{emp.email}</p>
                              </div>
                              {selected
                                ? <CheckSquare size={16} className="text-[#4f46e5] flex-shrink-0" />
                                : <Square size={16} className="text-[#ddd] flex-shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] font-semibold text-[#555] cursor-pointer hover:bg-[#f5f5f5] transition font-[DM_Sans,sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-[#4338ca] transition font-[DM_Sans,sans-serif]"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                  : `Create${selectedMemberIds.length > 0 ? ` (${selectedMemberIds.length} members)` : " Team"}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
