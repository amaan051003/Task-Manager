import { useEffect, useState } from "react";
import { getTasks } from "../../services/task";

const CompletionRing = () => {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTasks({ limit: 1000 });
        const tasks = res.data || [];
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        setCompletion(total ? Math.round((completed / total) * 100) : 0);
      } catch {
        setCompletion(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#f0f0f0] w-[260px] flex-shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <h3 className="text-[15px] font-bold text-[#111] mb-5">Completion</h3>
      <div className="flex items-center justify-center">
        <div
          className="relative w-36 h-36 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#4f46e5 ${completion * 3.6}deg, #eef2ff 0deg)` }}
        >
          <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-[28px] font-extrabold text-[#111]">
              {loading ? "—" : `${completion}%`}
            </span>
            <span className="text-[11px] text-[#aaa]">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionRing;
