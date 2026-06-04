import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, LayoutDashboard, LogOut, Users } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: CheckCircle2, label: "Tasks" },
  { icon: Calendar, label: "Calendar" },
  { icon: Users, label: "Team" },
];

const Sidebar = ({ active, setActive, collapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={`m-2 h-[calc(100vh-16px)] bg-[#ebebeb] rounded-2xl border-r border-[#f0f0f0] flex flex-col py-6 overflow-hidden transition-[width] duration-400 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[280px]"}`}
    >
      {/* Logo */}
      <div className="flex items-center overflow-hidden px-4 pb-8">
        <svg width="39" height="30" viewBox="0 0 30 30" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <rect width="30" height="30" rx="6" fill="#4f46e5" stroke="none" />
          <polyline points="5,24 5,16" /><polyline points="11,24 11,8" />
          <polyline points="17,24 17,18" /><polyline points="23,24 23,11" />
        </svg>
        <span
          className={`font-bold text-[18px] text-[#111] tracking-[-0.3px] whitespace-nowrap transition-all duration-300 ease-in-out
            ${collapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[200px] ml-2.5"}`}
        >
          Task<span className="text-[#4f46e5]">Flow</span>
        </span>
      </div>

      {/* Menu */}
      <div className="px-3 mb-2">
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "h-0 opacity-0" : "h-6 opacity-100 mb-2"}`}>
          <p className="text-[10px] font-semibold text-[#aaa] tracking-[0.08em] px-2">MENU</p>
        </div>

        {menuItems.map(({ icon: Icon, label }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center py-[10px] rounded-[10px] border-none cursor-pointer text-[14px] mb-0.5 transition-all duration-150 text-left
                ${collapsed ? "justify-center px-0" : "px-3"}
                ${isActive ? "bg-[#4f46e5] text-white font-semibold" : "bg-transparent text-[#555] font-normal"}`}
            >
              {createElement(Icon, { size: 17, className: "flex-shrink-0" })}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                  ${collapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[200px] ml-3 flex-1"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-3 mt-auto">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center py-[10px] rounded-[10px] border-none cursor-pointer bg-transparent text-[14px] font-normal mb-0.5 transition-all duration-150 text-left text-[#e53e3e]
            ${collapsed ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
              ${collapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[200px] ml-3"}`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
