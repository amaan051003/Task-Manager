import { useEffect, useState } from "react";
import {
  AlertCircle, Calendar, CheckCircle2, Circle, Clock,
  Download, FileText, Loader2, Paperclip, Plus, Upload, X,
} from "lucide-react";
import { downloadTaskFile, getTasks, updateTaskProgress, updateTaskStatus, uploadTaskFile } from "../../services/task";

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
const fmt = (v = "") => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatDate = (date) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ── Main Page ── */
const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
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
    const t = setTimeout(fetchTasks, 0);
    return () => clearTimeout(t);
  }, [filter]);

  const done = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex h-full gap-5">
      {/* Left panel */}
      <div className={`flex flex-col transition-all duration-300 ${selectedTask ? "w-[58%]" : "w-full"}`}>
        <div className="flex items-start justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#111] mb-1">My Tasks</h1>
            <p className="text-[13px] text-[#888]">
              {loading ? "Loading..." : `${done} of ${total} tasks completed`}
            </p>
          </div>
        </div>

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

        <div className="flex gap-2 mb-5 flex-shrink-0 flex-wrap">
          {["all", "pending", "in_progress", "review", "completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition cursor-pointer
                ${filter === f ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "bg-white text-[#555] border-[#e0e0e0] hover:border-[#4f46e5] hover:text-[#4f46e5]"}`}>
              {fmt(f)}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[13px] mb-4 flex-shrink-0">
            <AlertCircle size={15} /> {error}
          </div>
        )}

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
                isSelected={selectedTask?._id === task._id}
                compact={!!selectedTask}
                onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      {selectedTask && (
        <TaskDetail
          key={selectedTask._id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => { setSelectedTask(updated); fetchTasks(); }}
        />
      )}
    </div>
  );
};

/* ── Task Row ── */
const TaskRow = ({ task, isSelected, compact, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 bg-white rounded-[14px] px-4 py-3.5 border transition-all duration-200 cursor-pointer text-left w-full
      ${isSelected ? "border-[#4f46e5] shadow-[0_0_0_1px_#4f46e5]" : "border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#d0cffe] hover:shadow-[0_4px_16px_rgba(79,70,229,0.08)]"}`}
  >
    <span className="flex-shrink-0">
      {task.status === "completed"
        ? <CheckCircle2 size={20} className="text-[#4f46e5]" />
        : <Circle size={20} className="text-[#ccc]" />}
    </span>
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || "bg-gray-300"}`} />
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-semibold truncate ${task.status === "completed" ? "line-through text-[#aaa]" : "text-[#111]"}`}>
        {task.title}
      </p>
      {!compact && (
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.deadline && (
            <span className="flex items-center gap-1 text-[11px] text-[#aaa]">
              <Clock size={10} /> {formatDate(task.deadline)}
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
    {!compact && (
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[task.status] || statusColor.pending}`}>
        {fmt(task.status)}
      </span>
    )}
    <div className="w-12 flex-shrink-0">
      <div className="text-[9px] text-[#aaa] mb-1 text-right">{task.progress || 0}%</div>
      <div className="w-full h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${task.progress || 0}%` }} />
      </div>
    </div>
  </button>
);

/* ── Task Detail ── */
const TaskDetail = ({ task, onClose, onUpdated }) => {
  const [status, setStatus] = useState(task.status || "pending");
  const [progress, setProgress] = useState(task.progress || 0);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";

  const saveUpdates = async () => {
    try {
      setSaving(true); setError("");
      let updated = task;
      if (status !== task.status) {
        const r = await updateTaskStatus(task._id, status);
        updated = r.task || updated;
      }
      if (Number(progress) !== Number(task.progress || 0)) {
        const r = await updateTaskProgress(task._id, Number(progress));
        updated = r.task || { ...updated, progress: Number(progress) };
      }
      onUpdated({ ...task, ...updated, status, progress: Number(progress) });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save task updates.");
    } finally {
      setSaving(false);
    }
  };

  const submitFiles = async () => {
    if (!files.length) return;
    try {
      setUploading(true); setError("");
      await uploadTaskFile(task._id, files);
      setFiles([]);
      onUpdated(task);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload files.");
    } finally {
      setUploading(false);
    }
  };

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
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyle[task.priority] || priorityStyle.medium}`}>
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

        {/* Status */}
        <div>
          <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Status</p>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] bg-white">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Complete</option>
          </select>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">Progress</p>
            <span className="text-[13px] font-bold text-[#4f46e5]">{progress}%</span>
          </div>
          <input type="range" min="0" max="100" value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full accent-[#4f46e5]" />
        </div>

        <button onClick={saveUpdates} disabled={saving}
          className="w-full py-2.5 rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#4338ca] transition disabled:opacity-60">
          {saving ? "Saving..." : "Save Updates"}
        </button>

        {/* Meta tiles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Assigned By</p>
            <p className="text-[12px] font-semibold text-[#111] truncate">{task.assignedBy?.name || "Manager"}</p>
          </div>
          <div className={`rounded-[10px] p-3 ${isOverdue ? "bg-red-50" : "bg-[#f9f9f9]"}`}>
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Deadline</p>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className={isOverdue ? "text-red-400" : "text-[#aaa]"} />
              <p className={`text-[12px] font-semibold ${isOverdue ? "text-red-500" : "text-[#111]"}`}>
                {formatDate(task.deadline)}
              </p>
            </div>
            {isOverdue && <p className="text-[10px] text-red-400 mt-1">Overdue</p>}
          </div>
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Team</p>
            <p className="text-[12px] font-semibold text-[#111] truncate">{task.team?.name || "No team"}</p>
          </div>
          <div className="bg-[#f9f9f9] rounded-[10px] p-3">
            <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Priority</p>
            <p className="text-[12px] font-semibold text-[#111] truncate">{fmt(task.priority || "medium")}</p>
          </div>
        </div>

        {task.description && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Description</p>
            <p className="text-[13px] text-[#444] leading-relaxed bg-[#f9f9f9] rounded-[10px] p-3">{task.description}</p>
          </div>
        )}

        {/* File upload */}
        <div>
          <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Submit Files</p>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#dcdcdc] rounded-[12px] p-5 cursor-pointer hover:border-[#4f46e5] hover:bg-[#fafaff] transition">
            <Upload size={18} className="text-[#888]" />
            <span className="text-[13px] font-semibold text-[#555]">Upload submission files</span>
            <span className="text-[11px] text-[#aaa]">PDF, DOCX, images, ZIP, and more</span>
            <input type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-2 bg-[#f9f9f9] border border-[#f0f0f0] rounded-[10px] px-3 py-2">
                  <Paperclip size={12} className="text-[#888]" />
                  <p className="text-[12px] font-medium text-[#333] truncate flex-1">{file.name}</p>
                  <span className="text-[10px] text-[#aaa]">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
              <button onClick={submitFiles} disabled={uploading}
                className="w-full py-2.5 rounded-[10px] border border-[#4f46e5] text-[#4f46e5] text-[13px] font-semibold bg-white cursor-pointer hover:bg-[#eef2ff] transition disabled:opacity-60">
                {uploading ? "Uploading..." : "Submit Files"}
              </button>
            </div>
          )}
        </div>

        {task.attachments?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">Manager Attachments ({task.attachments.length})</p>
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

        {task.submissions?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider mb-2">My Submissions ({task.submissions.length})</p>
            <div className="flex flex-col gap-1.5">
              {task.submissions.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-indigo-50 rounded-[8px] px-3 py-2">
                  <Paperclip size={12} className="text-indigo-400" />
                  <span className="text-[12px] text-[#555] truncate flex-1">{f.originalName}</span>
                  <span className="text-[10px] text-[#aaa]">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
