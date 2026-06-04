import { Plus } from "lucide-react";
import StatCards from "./StatCards";
// import AnalyticsChart from "./AnalyticsChart";
import ReminderCard from "./ReminderCard";
import ProjectsList from "./ProjectsList";
import TeamCollaboration from "./TeamCollaboration";
import ProjectProgress from "./ProjectProgress";
// import TimeTracker from "./TimeTracker";

const DashboardPage = ({ setActive }) => (
  <>
    {/* Page Title + Action Buttons — pinned, never scrolls */}
    <div className="flex items-start justify-between mb-7 flex-shrink-0">
      <div>
        <h1 className="text-[28px] font-extrabold text-[#111] mb-1">Dashboard</h1>
        <p className="text-[13px] text-[#888]">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => setActive?.("Tasks")}
          className="flex items-center gap-2 px-5 py-[11px] bg-[#4f46e5] border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(79,70,229,0.3)] font-[DM_Sans,sans-serif]"
        >
          <Plus size={15} /> Add Project
        </button>
      </div>
    </div>

    {/* Scrollable inner content */}
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-5">
      <StatCards />
      <div className="flex gap-4">
        <ReminderCard onOpenCalendar={() => setActive?.("Calendar")} />
        <ProjectsList onNewTask={() => setActive?.("Tasks")} />
      </div>
      <div className="flex gap-4">
        <TeamCollaboration onOpenTeam={() => setActive?.("Team")} />
        <ProjectProgress />
      </div>
    </div>
  </>
);

export default DashboardPage;
