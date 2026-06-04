import { useEffect, useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { getTeams } from "../../services/team";
import { getTasks } from "../../services/task";

const teamColors = ["#4f46e5", "#f59e0b", "#3b82f6", "#f97316", "#8b5cf6"];

const TeamCollaboration = ({ onOpenTeam }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, tasksRes] = await Promise.all([
          getTeams(),
          getTasks({ limit: 1000 }),
        ]);

        const taskList = tasksRes.data || [];
        const rows = (teamsRes.data || []).slice(0, 5).map((team) => {
          const teamTasks = taskList.filter((task) => {
            const byTeam = task.team?._id === team._id || task.team === team._id;
            const memberIds = new Set((team.members || []).map((member) => member._id));
            const byMember = memberIds.has(task.assignedTo?._id) || memberIds.has(task.assignedTo);
            return byTeam || byMember;
          });

          const completed = teamTasks.filter((task) => task.status === "completed").length;
          const progress = teamTasks.length ? Math.round((completed / teamTasks.length) * 100) : 0;

          return {
            ...team,
            taskCount: teamTasks.length,
            completed,
            progress,
          };
        });

        setTeams(rows);
      } catch {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px",
      border: "1px solid #f0f0f0", flex: 1,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Team Collaboration</h3>
        <button
          onClick={onOpenTeam}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 14px", borderRadius: 20,
            border: "1px solid #e0e0e0", background: "#fff",
            fontSize: 12, fontWeight: 600, color: "#555",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
          }}
        >
          <Plus size={12} /> New Team
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", color: "#aaa" }}>
          <Loader2 size={18} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> Loading...
        </div>
      ) : teams.length === 0 ? (
        <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "24px 0" }}>
          No teams found.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {teams.map((team, index) => {
            const color = teamColors[index % teamColors.length];

            return (
              <button
                key={team._id}
                onClick={onOpenTeam}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}18`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Users size={17} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                    {team.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: "#aaa",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {(team.members || []).length} member{(team.members || []).length !== 1 ? "s" : ""} - {team.completed}/{team.taskCount} tasks done
                  </p>
                </div>
                <div style={{ width: 78, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 10, fontWeight: 700, color }}>
                    {team.progress}%
                  </div>
                  <div style={{ width: "100%", height: 5, borderRadius: 999, background: "#f0f0f0", overflow: "hidden", marginTop: 4 }}>
                    <div style={{ width: `${team.progress}%`, height: "100%", borderRadius: 999, background: color }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamCollaboration;
