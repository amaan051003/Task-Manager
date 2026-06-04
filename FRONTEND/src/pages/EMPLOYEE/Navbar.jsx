import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Loader2, Menu, Search, X } from "lucide-react";
import { getMe } from "../../services/auth";
import { getNotifications, markAllAsRead, markAsRead } from "../../services/notification";
import { getTasks } from "../../services/task";

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

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
};

const Navbar = ({ collapsed, setCollapsed, setActive }) => {
  const [user, setUser] = useState(getStoredUser());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    getMe()
      .then((res) => {
        const currentUser = res.user || res.data?.user;
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      })
      .catch(() => { });
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotifsLoading(true);
      const res = await getNotifications();
      const rows = res.data || [];
      setNotifications(rows);
      setUnreadCount(rows.filter((n) => !n.isRead).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotifsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchNotifications, 0);
    const interval = setInterval(fetchNotifications, 30000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await getTasks({ search: searchQuery, limit: 5 });
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((curr) => curr.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((curr) => curr.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { }
  };

  return (
    <header className="mr-2 mt-2 bg-[#e7e9eb] border-b border-[#f0f0f0] px-7 py-[14px] flex items-center gap-4 rounded-2xl relative z-30">
      {/* Collapse toggle */}
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
          placeholder="Search my tasks..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          className="border-none bg-transparent outline-none text-[13px] text-[#555] w-full"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="cursor-pointer bg-transparent border-none p-0">
            <X size={13} color="#aaa" />
          </button>
        )}

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
                <button
                  key={task._id}
                  onClick={() => { setActive("Tasks"); setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
                  className="w-full text-left px-4 py-3 hover:bg-[#f7f7f7] cursor-pointer border-b border-[#f9f9f9] last:border-none bg-white"
                >
                  <p className="text-[13px] font-semibold text-[#111]">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[task.status] || statusColor.pending}`}>
                      {fmt(task.status)}
                    </span>
                    <span className="text-[11px] text-[#aaa]">{formatDate(task.deadline)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Notifications */}
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

        {showNotifs && (
          <div className="absolute right-0 top-12 w-[320px] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-[#f0f0f0] z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f5f5]">
              <p className="text-[14px] font-bold text-[#111]">
                Notifications {unreadCount > 0 && <span className="text-[#4f46e5]">({unreadCount})</span>}
              </p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="flex items-center gap-1 text-[11px] font-semibold text-[#4f46e5] cursor-pointer bg-transparent border-none">
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
                <div className="text-center py-8 text-[13px] text-[#aaa]">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[#f9f9f9] last:border-none transition ${n.isRead ? "bg-white" : "bg-[#f5f7ff]"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#333] leading-snug">{n.message}</p>
                      <p className="text-[10px] text-[#aaa] mt-1">{formatDate(n.createdAt)}</p>
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

      {/* User avatar */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-bold text-[14px]"
          style={{ background: user?.avatarColor || "#4f46e5" }}
        >
          {user?.name?.charAt(0) || "E"}
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#111]">{user?.name || "Employee"}</p>
          <p className="text-[11px] text-[#aaa]">{user?.email || ""}</p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
