import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { getTeams } from "../../services/team";

const TeamOverview = ({ onOpenTeam }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await getTeams();
        setTeams((res.data || []).slice(0, 4));
      } catch {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#f0f0f0] flex-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-[#111]">My Teams</h3>
        <button
          onClick={onOpenTeam}
          className="text-[12px] font-semibold text-[#4f46e5] bg-transparent border-none cursor-pointer"
        >
          Open teams
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-[#aaa]">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading...
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#aaa]">
          <Users size={28} strokeWidth={1.5} />
          <p className="text-[13px]">You are not assigned to a team yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {teams.map((team) => (
            <div key={team._id} className="bg-[#f9f9fb] rounded-[12px] p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#eef2ff] flex items-center justify-center">
                  <Users size={16} className="text-[#4f46e5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#111] truncate">{team.name}</p>
                  <p className="text-[11px] text-[#aaa]">{team.members?.length || 0} members</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamOverview;
