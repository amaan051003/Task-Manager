import { useState, useEffect, useRef } from "react";
import { UserPlus, Search, Menu, Bell, Check, CheckCheck, Loader2, X } from "lucide-react";
import { getMe, createAccount } from "../../services/auth";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notification";
import { getTasks } from "../../services/task";

const Navbar = ({ collapsed, setCollapsed, setActive }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const isManager = user?.role === "manager";

  // Fetch current user from backend
  useEffect(() => {
    getMe()
      .then((res) => {
        // Backend: { success, message, data: { user } }
        const u = res.data?.user || res.user;
        if (u) {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }
      })
      .catch(() => {
        // Keep the localStorage user if the profile request fails.
      });
  }, []);

  // Fetch notifications
  const fetchNotifs = async () => {
    try {
      setNotifsLoading(true);
      const res = await getNotifications();
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotifsLoading(false);
    }
  };

  useEffect(() => {
    const initialFetch = setTimeout(fetchNotifs, 0);
    const interval = setInterval(fetchNotifs, 30000); // poll every 30s
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchResults([]);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await getTasks({ search: searchQuery, limit: 5 });
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Keep the current notification state if marking read fails.
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Keep unread state if the bulk update fails.
    }
  };

  const typeColor = {
    task_assigned: "bg-indigo-100 text-indigo-600",
    task_updated: "bg-yellow-100 text-yellow-600",
    file_uploaded: "bg-green-100 text-green-600",
  };

  return (
    <>
      <header className="mr-2 mt-2 bg-[#e7e9eb] border-b border-[#f0f0f0] px-7 py-[14px] flex items-center gap-4 font-[DM_Sans,sans-serif] rounded-2xl relative z-30">

        {/* Hamburger */}
        <button
          className="w-[38px] h-[38px] rounded-full border border-[#ebebeb] bg-[#f7f7f7] flex items-center justify-center cursor-pointer hover:bg-[#fff] hover:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] transition"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} color="#888" />
        </button>

        {/* Search */}
        <div
          ref={searchRef}
          className="relative flex items-center gap-2.5 bg-[#f7f7f7] rounded-[20px] px-3.5 py-[5px] flex-1 max-w-[320px] h-12 border border-[#ebebeb] focus-within:border-[#4f46e5] transition"
        >
          <Search size={15} color="#aaa" />
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="border-none bg-transparent outline-none text-[13px] text-[#555] w-full font-[DM_Sans,sans-serif]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="cursor-pointer bg-transparent border-none p-0"
            >
              <X size={13} color="#aaa" />
            </button>
          )}
          <span className="text-[10px] text-[#aaa] bg-[#ebebeb] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
            ⌘ F
          </span>

          {/* Search Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-14 left-0 w-full bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#f0f0f0] overflow-hidden z-50">
              {searching ? (
                <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#aaa]">
                  <Loader2 size={14} className="animate-spin" /> Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-[#aaa]">No tasks found.</div>
              ) : (
                searchResults.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      setActive?.("Tasks");
                      setShowSearch(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="px-4 py-3 hover:bg-[#f7f7f7] cursor-pointer border-b border-[#f9f9f9] last:border-none"
                  >
                    <p className="text-[13px] font-semibold text-[#111]">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#4f46e5]">
                        {task.status?.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-[#aaa]">{task.assignedTo?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="w-[38px] h-[38px] rounded-full border border-[#ebebeb] bg-[#f7f7f7] flex items-center justify-center cursor-pointer hover:bg-[#fff] hover:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] transition relative"
          >
            <Bell size={20} color="#888" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4f46e5] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-12 w-[320px] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-[#f0f0f0] z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f5f5]">
                <p className="text-[14px] font-bold text-[#111]">
                  Notifications{" "}
                  {unreadCount > 0 && (
                    <span className="text-[#4f46e5]">({unreadCount})</span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#4f46e5] cursor-pointer bg-transparent border-none"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {notifsLoading ? (
                  <div className="flex items-center justify-center py-8 text-[#aaa]">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-[13px] text-[#aaa]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#f9f9f9] last:border-none transition
                        ${n.isRead ? "bg-white" : "bg-[#f5f7ff]"}`}
                    >
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${typeColor[n.type] || "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {n.type?.replace("_", " ")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#333] leading-snug">{n.message}</p>
                        <p className="text-[10px] text-[#aaa] mt-1">
                          {new Date(n.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="flex-shrink-0 cursor-pointer bg-transparent border-none text-[#4f46e5] hover:text-indigo-800 transition mt-0.5"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Account (manager only) */}
        {isManager && (
          <button
            onClick={() => setShowEmpModal(true)}
            className="w-[38px] h-[38px] rounded-full border border-[#ebebeb] bg-[#f7f7f7] flex items-center justify-center cursor-pointer hover:bg-[#fff] hover:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] transition"
            title="Create Account"
          >
            <UserPlus size={20} color="#888" />
          </button>
        )}

        {/* User Info */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-bold text-[14px]"
            style={{
              background:
                user?.avatarColor || "linear-gradient(135deg, #f87171, #fb923c)",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#111]">{user?.name || "User"}</p>
            <p className="text-[11px] text-[#aaa]">{user?.email || ""}</p>
          </div>
        </div>
      </header>

      {/* Create Account Modal */}
      {showEmpModal && (
        <CreateAccountModal onClose={() => setShowEmpModal(false)} />
      )}
    </>
  );
};

/* ---- Create Account Modal ---- */
const CreateAccountModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        employeeId: form.role === "employee" ? form.employeeId : "",
      };
      await createAccount(payload);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-[#111]">Create Account</h2>
          <button
            onClick={onClose}
            className="cursor-pointer bg-transparent border-none text-[#aaa] hover:text-[#111] transition"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#eef2ff] rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-[#4f46e5]" />
            </div>
            <p className="text-[14px] font-semibold text-[#111]">
              {form.role === "manager" ? "Manager" : "Employee"} created successfully!
            </p>
          </div>
        ) : (
          <>
            {error && <p className="text-red-500 text-[13px] mb-4">{error}</p>}

            <div className="mb-4">
              <label className="text-[12px] font-semibold text-[#555] mb-1 block">
                Account Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["employee", "manager"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role }))}
                    className={`py-2.5 rounded-[10px] border text-[13px] font-semibold capitalize transition cursor-pointer font-[DM_Sans,sans-serif] ${
                      form.role === role
                        ? "border-[#4f46e5] bg-[#eef2ff] text-[#4f46e5]"
                        : "border-[#e0e0e0] bg-white text-[#555] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: "Full Name *", name: "name", type: "text", placeholder: "John Doe" },
              { label: "Email *", name: "email", type: "email", placeholder: "john@company.com" },
              { label: "Password *", name: "password", type: "password", placeholder: "Min. 6 characters" },
              { label: "Employee ID", name: "employeeId", type: "text", placeholder: "EMP-001 (optional)" },
            ].filter(({ name }) => form.role === "employee" || name !== "employeeId").map(({ label, name, type, placeholder }) => (
              <div key={name} className="mb-4">
                <label className="text-[12px] font-semibold text-[#555] mb-1 block">
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handle}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] text-[#111] outline-none focus:border-[#4f46e5] font-[DM_Sans,sans-serif] transition"
                />
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e0e0e0] text-[13px] font-semibold text-[#555] cursor-pointer font-[DM_Sans,sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer font-[DM_Sans,sans-serif] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  `Create ${form.role === "manager" ? "Manager" : "Employee"}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
