import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// Pages
import DashboardPage from "./DashboardPage";
import TasksPage from "./TasksPage";
import CalendarPage from "./CalendarPage";
import TeamPage from "./TeamPage";

const PAGES = {
  Dashboard: DashboardPage,
  Tasks: TasksPage,
  Calendar: CalendarPage,
  Team: TeamPage,
};

const ManagerDashboard = () => {
  const [active, setActive] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const ActivePage = PAGES[active] || DashboardPage;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="flex h-screen bg-[#fff] font-[DM_Sans,sans-serif] overflow-hidden">

        {/* Sidebar — fixed, never scrolls */}
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar active={active} setActive={setActive} collapsed={collapsed} />
        </div>

        {/* Right side */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

          {/* Navbar */}
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} setActive={setActive} />

          {/* Page Content — swaps based on active */}
          <div className="flex-1 overflow-hidden">
            <main className="h-[97.6%] p-7 bg-[#ebebeb] rounded-2xl mt-2 mr-2 flex flex-col">
              <ActivePage setActive={setActive} />
            </main>
          </div>

        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
