import StatCards from "./StatCards";
import ReminderCard from "./ReminderCard";
import TasksList from "./TasksList";
import TeamOverview from "./TeamOverview";
import CompletionRing from "./CompletionRing";

const DashboardPage = ({ setActive }) => (
  <>
    <div className="flex items-start justify-between mb-7 flex-shrink-0">
      <div>
        <h1 className="text-[28px] font-extrabold text-[#111] mb-1">Dashboard</h1>
        <p className="text-[13px] text-[#888]">Track assigned work, submissions, deadlines, and team context.</p>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-5">
      <StatCards />

      <div className="flex gap-4">
        <ReminderCard onOpenCalendar={() => setActive?.("Calendar")} />
        <TasksList onOpenTasks={() => setActive?.("Tasks")} />
      </div>

      <div className="flex gap-4">
        <TeamOverview onOpenTeam={() => setActive?.("Team")} />
        <CompletionRing />
      </div>
    </div>
  </>
);

export default DashboardPage;
