import { useState, useEffect } from "react";
import {
  Plus, CheckCircle2, Circle, Clock, Trash2, AlertCircle,
  Loader2, X, ChevronDown, Users, User, FileText,
  Calendar, ArrowRight, Paperclip, BarChart2, Download,
} from "lucide-react";
// import { getTasks, deleteTask, createTask } from "../../services/task";
import {
  getTasks,
  deleteTask,
  createTask,
  downloadTaskFile,
  uploadTaskFile,
} from "../../services/task";
import { getTeams } from "../../services/team";
import API from "../../services/api";

/* ─── helpers ─────────────────────────────────────────── */
const priorityStyle = {
  urgent: "bg-red-100 text-red-600",
  high: "bg-orange-100 text-orange-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};
const priorityDot = {
  urgent: "bg-red-500", high: "bg-orange-400",
  medium: "bg-yellow-400", low: "bg-green-400",
};
const statusColor = {
  pending: "bg-gray-100 text-gray-500",
  in_progress: "bg-blue-100 text-blue-600",
  review: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-600",
};
const fmt = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const getUser = () => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } };

/* ─── Main Page ───────────────────────────────────────── */
const TasksPage = () => {
  const currentUser = getUser();
  const isManager = currentUser.role === "manager";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true); setError(null);
      const params = filter !== "all" ? { status: filter } : {};
      const res = await getTasks(params);
      setTasks(res.data || []);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchTasks, 0);
    return () => clearTimeout(timeout);
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (selectedTask?._id === id) setSelectedTask(null);
    } catch { setError("Failed to delete task."); }
  };

  const done = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const FILTERS = ["all", "pending", "in_progress", "review", "completed"];

  return (
    <div className="flex h-full gap-5">
      {/* ── Left panel ── */}
      <div className={`flex flex-col transition-all duration-300 ${selectedTask ? "w-[58%]" : "w-full"}`}>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#111] mb-1">Tasks</h1>
            <p className="text-[13px] text-[#888]">
              {loading ? "Loading..." : `${done} of ${total} tasks completed`}
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-[11px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(79,70,229,0.3)] font-[DM_Sans,sans-serif]"
            >
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>

        {/* Progress bar */}
        {!loading && total > 0 && (
          <div className="flex-shrink-0 mb-5">
            <div className="flex justify-between text-[12px] text-[#888] mb-2">
              <span>Overall Progress</span><span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full bg-[#4f46e5] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-shrink-0 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition cursor-pointer font-[DM_Sans,sans-serif]
                ${filter === f
                  ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                  : "bg-white text-[#555] border-[#e0e0e0] hover:border-[#4f46e5] hover:text-[#4f46e5]"}`}
            >
              {fmt(f)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[13px] mb-4 flex-shrink-0">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-2.5">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-[#aaa]">
              <Loader2 size={24} className="animate-spin mr-2" /> Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#aaa]">
              <FileText size={32} strokeWidth={1.5} />
              <p className="text-[14px]">No tasks found.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                isManager={isManager}
                isSelected={selectedTask?._id === task._id}
                onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
                onDelete={() => handleDelete(task._id)}
                compact={!!selectedTask}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: Task Detail (read-only for manager) ── */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isManager={isManager}
          onClose={() => setSelectedTask(null)}
          onDelete={() => handleDelete(selectedTask._id)}
        />
      )}

      {/* Add Task Modal */}
      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
};

/* ─── Task Row ────────────────────────────────────────── */
const TaskRow = ({ task, isManager, isSelected, onClick, onDelete, compact }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 bg-white rounded-[14px] px-4 py-3.5 border transition-all duration-200 cursor-pointer
      ${isSelected
        ? "border-[#4f46e5] shadow-[0_0_0_1px_#4f46e5]"
        : "border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#d0cffe] hover:shadow-[0_4px_16px_rgba(79,70,229,0.08)]"}`}
  >
    {/* Status icon — visual only, no toggle for manager */}
    <span className="flex-shrink-0">
      {task.status === "completed"
        ? <CheckCircle2 size={20} className="text-[#4f46e5]" />
        : <Circle size={20} className="text-[#ccc]" />}
    </span>

    {/* Priority dot */}
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || "bg-gray-300"}`} />

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-semibold truncate ${task.status === "completed" ? "line-through text-[#aaa]" : "text-[#111]"}`}>
        {task.title}
      </p>
      {!compact && (
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              style={{ background: task.assignedTo?.avatarColor || "#4f46e5" }}>
              {task.assignedTo?.name?.charAt(0)}
            </div>
            <span className="text-[11px] text-[#aaa]">{task.assignedTo?.name}</span>
          </div>
          {task.deadline && (
            <span className="flex items-center gap-1 text-[11px] text-[#aaa]">
              <Clock size={10} />
              {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          {task.team?.name && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500">
              {task.team.name}
            </span>
          )}
        </div>
      )}
    </div>

    {/* Status badge */}
    {!compact && (
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[task.status]}`}>
        {fmt(task.status)}
      </span>
    )}

    {/* Progress mini */}
    <div className="w-12 flex-shrink-0">
      <div className="text-[9px] text-[#aaa] mb-1 text-right">{task.progress}%</div>
      <div className="w-full h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${task.progress}%` }} />
      </div>
    </div>

    {/* Delete */}
    {isManager && (
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="flex-shrink-0 cursor-pointer bg-transparent border-none p-0 text-[#ddd] hover:text-red-400 transition">
        <Trash2 size={14} />
      </button>
    )}

    <ArrowRight size={14} className="text-[#ddd] flex-shrink-0" />
  </div>
);

/* ─── Task Detail Panel (read-only for manager) ───────── */
const TaskDetail = ({ task, isManager, onClose, onDelete }) => {
  const deadlineStr = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
    : "No deadline";

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";
  const [error, setError] = useState("");

  const downloadFile = async (file) => {
    try {
      setError("");
      await downloadTaskFile(task._id, file);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to download file.");
    }
  };

  return (
    <div className="w-[42%] flex-shrink-0 bg-white rounded-[16px] border border-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-[#f5f5f5]">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyle[task.priority]}`}>
              {fmt(task.priority)}
            </span>
            {task.team?.name && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500">
                {task.team.name}
              </span>
            )}
          </div>
          <h2 className="text-[16px] font-bold text-[#111] leading-snug">{task.title}</h2>
        </div>
        <button onClick={onClose} className="p-1 text-[#ccc] hover:text-[#555] transition cursor-pointer bg-transparent border-none">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-5 flex flex-col gap-5">
        {error && (
          <div className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">{error}</div>
        )}

        {/* Status — read-only badge */}
        <div>
          <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Status</p>
          <span className={`inline-flex items-center text-[12px] font-bold px-3 py-1.5 rounded-[8px] ${statusColor[task.status]}`}>
            {fmt(task.status)}
          </span>
          <p className="text-[11px] text-[#bbb] mt-1.5">Updated by the assigned employee.</p>
        </div>

        {/* Progress — read-only bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">Progress</p>
            <span className="text-[13px] font-bold text-[#4f46e5]">{task.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4f46e5] rounded-full transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#bbb] mt-1.5">Progress is reported by the assigned employee.</p>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3">
          {/* Assigned to */}
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Assigned To</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: task.assignedTo?.avatarColor || "#4f46e5" }}>
                {task.team?.name.charAt(0) || task.assignedTo?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#111]">{task.team?.name || task.assignedTo?.name || "No one"}</p>
                {/* <p className="text-[10px] text-[#aaa]">{task.assignedTo?.email}</p> */}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className={`rounded-[10px] p-3 ${isOverdue ? "bg-red-50" : "bg-[#f9f9f9]"}`}>
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Deadline</p>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className={isOverdue ? "text-red-400" : "text-[#aaa]"} />
              <p className={`text-[12px] font-semibold ${isOverdue ? "text-red-500" : "text-[#111]"}`}>
                {deadlineStr}
              </p>
            </div>
            {isOverdue && <p className="text-[10px] text-red-400 mt-1">Overdue</p>}
          </div>

          {/* Assigned by */}
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Assigned By</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: task.assignedBy?.avatarColor || "#818cf8" }}>
                {task.assignedBy?.name?.charAt(0)}
              </div>
              <p className="text-[12px] font-semibold text-[#111]">{task.assignedBy?.name}</p>
            </div>
          </div>

          {/* Team */}
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Team</p>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-[#aaa]" />
              <p className="text-[12px] font-semibold text-[#111]">
                {task.team?.name || "No team"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Description</p>
            <p className="text-[13px] text-[#444] leading-relaxed bg-[#f9f9f9] rounded-[10px] p-3">
              {task.description}
            </p>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Notes</p>
            <p className="text-[13px] text-[#444] leading-relaxed bg-[#fffbeb] rounded-[10px] p-3 border border-yellow-100">
              {task.notes}
            </p>
          </div>
        )}

        {/* Attachments */}
        {task.attachments?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">
              Attachments ({task.attachments.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {task.attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#f9f9f9] rounded-[8px] px-3 py-2">
                  <Paperclip size={12} className="text-[#aaa]" />
                  <span className="text-[12px] text-[#555] truncate flex-1">{f.originalName}</span>
                  <span className="text-[10px] text-[#aaa]">{(f.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={() => downloadFile(f)}
                    className="w-7 h-7 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center text-[#4f46e5] hover:bg-[#eef2ff] transition cursor-pointer flex-shrink-0"
                    title="Download file"
                  >
                    <Download size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions (employee-uploaded files) */}
        {task.submissions?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">
              Submissions ({task.submissions.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {task.submissions.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-indigo-50 rounded-[8px] px-3 py-2">
                  <Paperclip size={12} className="text-indigo-400" />
                  <span className="text-[12px] text-[#555] truncate flex-1">{f.originalName}</span>
                  <span className="text-[10px] text-[#aaa]">{(f.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={() => downloadFile(f)}
                    className="w-7 h-7 rounded-full border border-indigo-100 bg-white flex items-center justify-center text-[#4f46e5] hover:bg-[#eef2ff] transition cursor-pointer flex-shrink-0"
                    title="Download file"
                  >
                    <Download size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        {isManager && (
          <button onClick={onDelete}
            className="w-full py-2.5 rounded-[10px] border border-red-200 text-red-400 text-[13px] font-semibold hover:bg-red-50 transition cursor-pointer bg-transparent">
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Add Task Modal ──────────────────────────────────── */
const AddTaskModal = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium",
    deadline: "", notes: "", assignedTo: "", team: "",
  });
  const [assignMode, setAssignMode] = useState("employee");
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (step !== 2) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const [empRes, teamRes] = await Promise.all([
          API.get("/auth/employees"),
          getTeams(),
        ]);
        setEmployees(empRes.data?.users || []);
        setTeams(teamRes.data || []);
      } catch {
        try {
          const teamRes = await getTeams();
          const t = teamRes.data || [];
          setTeams(t);
          const seen = new Set();
          const emps = [];
          t.forEach(team => (team.members || []).forEach(m => {
            if (!seen.has(m._id)) { seen.add(m._id); emps.push(m); }
          }));
          setEmployees(emps);
        } catch {
          setTeams([]);
          setEmployees([]);
        }
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [step]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const selectEmployee = (emp) => setForm((f) => ({ ...f, assignedTo: emp._id, team: "" }));
  const selectTeam = (team) => {
    const firstMember = team.members?.[0];
    setForm((f) => ({ ...f, team: team._id, assignedTo: firstMember?._id || f.assignedTo }));
  };

  // const submit = async () => {
  //   if (!form.assignedTo) { setError("Please select an employee or team."); return; }
  //   setSubmitting(true); setError(null);
  //   try {
  //     await createTask({
  //       title: form.title,
  //       description: form.description,
  //       priority: form.priority,
  //       deadline: form.deadline || undefined,
  //       notes: form.notes || undefined,
  //       assignedTo: form.assignedTo,
  //       team: form.team || undefined,
  //     });
  //     onCreated();
  //     onClose();
  //   } catch (err) {
  //     setError(err?.response?.data?.message || "Failed to create task.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const submit = async () => {
    if (!form.assignedTo) {
      setError("Please select an employee or team.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await createTask({
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || undefined,
        notes: form.notes || undefined,
        assignedTo: form.assignedTo,
        team: form.team || undefined,
      });

      const taskId =
        created?.data?._id ||
        created?.task?._id ||
        created?._id;

      if (files.length > 0 && taskId) {
        await uploadTaskFile(taskId, files);
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };
  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTeams = teams.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const isStep1Valid = form.title.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-[#111]">New Task</h2>
            <p className="text-[12px] text-[#aaa] mt-0.5">Step {step} of 2 — {step === 1 ? "Task details" : "Assign to"}</p>
          </div>
          <button onClick={onClose} className="text-[#ccc] hover:text-[#555] transition cursor-pointer bg-transparent border-none">
            <X size={18} />
          </button>
        </div>

        <div className="flex px-6 mb-5 flex-shrink-0 gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300
              ${s <= step ? "bg-[#4f46e5]" : "bg-[#f0f0f0]"}`} />
          ))}
        </div>

        {error && (
          <div className="mx-6 mb-4 flex items-center gap-2 text-red-500 text-[12px] bg-red-50 px-3 py-2 rounded-[8px] flex-shrink-0">
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">Title *</label>
              <input name="title" value={form.title} onChange={handle}
                placeholder="e.g. Design homepage mockup"
                className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition font-[DM_Sans,sans-serif]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">Description</label>
              <textarea name="description" value={form.description} onChange={handle}
                placeholder="What needs to be done?" rows={3}
                className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition resize-none font-[DM_Sans,sans-serif]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">Priority</label>
                <div className="relative">
                  <select name="priority" value={form.priority} onChange={handle}
                    className="w-full appearance-none px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition cursor-pointer font-[DM_Sans,sans-serif]">
                    {["low", "medium", "high", "urgent"].map((p) => (
                      <option key={p} value={p}>{fmt(p)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">Deadline</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handle}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition font-[DM_Sans,sans-serif]"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">Notes</label>
              <input name="notes" value={form.notes} onChange={handle}
                placeholder="Any extra notes..."
                className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition font-[DM_Sans,sans-serif]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">
                Attach Files
              </label>

              <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#dcdcdc] rounded-[12px] p-5 cursor-pointer hover:border-[#4f46e5] hover:bg-[#fafaff] transition">
                <Paperclip size={18} className="text-[#888]" />

                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#555]">
                    Upload task files
                  </p>

                  <p className="text-[11px] text-[#aaa] mt-1">
                    PDF, DOCX, Images, ZIP, etc.
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    setFiles(selected);
                  }}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-[#f9f9f9] border border-[#f0f0f0] rounded-[10px] px-3 py-2"
                    >
                      <Paperclip size={12} className="text-[#888]" />

                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#333] truncate">
                          {file.name}
                        </p>

                        <p className="text-[10px] text-[#aaa]">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4 min-h-0">
            <div className="flex gap-2 p-1 bg-[#f5f5f5] rounded-[10px]">
              {[
                { key: "employee", icon: <User size={13} />, label: "Employee" },
                { key: "team", icon: <Users size={13} />, label: "Team" },
              ].map(({ key, icon, label }) => (
                <button key={key} onClick={() => { setAssignMode(key); setSearch(""); setForm(f => ({ ...f, assignedTo: "", team: "" })); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[12px] font-semibold transition cursor-pointer border-none
                    ${assignMode === key ? "bg-white text-[#4f46e5] shadow-sm" : "bg-transparent text-[#888]"}`}>
                  {icon} {label}
                </button>
              ))}
            </div>

            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={assignMode === "employee" ? "Search employees..." : "Search teams..."}
              className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] transition font-[DM_Sans,sans-serif]"
            />

            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pb-2">
              {loadingData ? (
                <div className="flex items-center justify-center h-24 text-[#aaa]">
                  <Loader2 size={20} className="animate-spin mr-2" /> Loading...
                </div>
              ) : assignMode === "employee" ? (
                filteredEmployees.length === 0 ? (
                  <p className="text-center text-[13px] text-[#aaa] py-6">No employees found.</p>
                ) : filteredEmployees.map((emp) => {
                  const selected = form.assignedTo === emp._id && !form.team;
                  return (
                    <button key={emp._id} onClick={() => selectEmployee(emp)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border transition text-left cursor-pointer w-full
                        ${selected ? "border-[#4f46e5] bg-indigo-50" : "border-[#f0f0f0] bg-white hover:border-[#d0cffe]"}`}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                        style={{ background: emp.avatarColor || "#4f46e5" }}>
                        {emp.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111] truncate">{emp.name}</p>
                        <p className="text-[11px] text-[#aaa] truncate">{emp.email}</p>
                      </div>
                      {emp.employeeId && (
                        <span className="text-[10px] text-[#aaa] font-mono flex-shrink-0">#{emp.employeeId}</span>
                      )}
                      {selected && <CheckCircle2 size={16} className="text-[#4f46e5] flex-shrink-0" />}
                    </button>
                  );
                })
              ) : (
                filteredTeams.length === 0 ? (
                  <p className="text-center text-[13px] text-[#aaa] py-6">No teams found.</p>
                ) : filteredTeams.map((team) => {
                  const selected = form.team === team._id;
                  return (
                    <button key={team._id} onClick={() => selectTeam(team)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border transition text-left cursor-pointer w-full
                        ${selected ? "border-[#4f46e5] bg-indigo-50" : "border-[#f0f0f0] bg-white hover:border-[#d0cffe]"}`}>
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Users size={16} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111] truncate">{team.name}</p>
                        <p className="text-[11px] text-[#aaa]">
                          {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                          {team.manager?.name ? ` · Manager: ${team.manager.name}` : ""}
                        </p>
                      </div>
                      {selected && <CheckCircle2 size={16} className="text-[#4f46e5] flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {(form.assignedTo || form.team) && (
              <div className="bg-indigo-50 rounded-[10px] px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 size={14} className="text-[#4f46e5]" />
                <p className="text-[12px] text-[#4f46e5] font-semibold">
                  {form.team
                    ? `Team: ${teams.find(t => t._id === form.team)?.name}`
                    : `Employee: ${employees.find(e => e._id === form.assignedTo)?.name}`}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-[#f5f5f5] flex-shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] font-semibold text-[#555] cursor-pointer font-[DM_Sans,sans-serif] bg-white hover:bg-[#f9f9f9] transition">
                Cancel
              </button>
              <button onClick={() => { if (!isStep1Valid) { setError("Title is required."); return; } setError(null); setStep(2); }}
                className="flex-1 py-2.5 rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer font-[DM_Sans,sans-serif] flex items-center justify-center gap-2 hover:bg-[#4338ca] transition">
                Next <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setStep(1); setError(null); }}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] font-semibold text-[#555] cursor-pointer font-[DM_Sans,sans-serif] bg-white hover:bg-[#f9f9f9] transition">
                Back
              </button>
              <button onClick={submit} disabled={submitting || !form.assignedTo}
                className="flex-1 py-2.5 rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer font-[DM_Sans,sans-serif] disabled:opacity-50 hover:bg-[#4338ca] transition">
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
