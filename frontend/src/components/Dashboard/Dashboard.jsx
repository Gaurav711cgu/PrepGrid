import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weakAreas, setWeakAreas] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meRes, interviewsRes, weakRes] = await Promise.all([
          fetch(`${API}/auth/me`, { headers }),
          fetch(`${API}/interviews?limit=5`, { headers }),
          fetch(`${API}/interviews/weak-areas`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" } }),
        ]);
        const me = await meRes.json();
        const interviews = await interviewsRes.json();
        const weak = await weakRes.json();
        setStats(me);
        setRecentInterviews(interviews.sessions || []);
        setWeakAreas(weak);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Problems Solved", value: stats?.problemsSolved ?? 0, icon: "💻", color: "text-cyan-400" },
    { label: "Interviews Done", value: stats?.interviewsCompleted ?? 0, icon: "🎤", color: "text-violet-400" },
    { label: "Day Streak 🔥", value: stats?.currentStreak ?? 0, suffix: "days", icon: "🔥", color: "text-orange-400" },
    { label: "Best Streak", value: stats?.bestStreak ?? 0, suffix: "days", icon: "⭐", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Welcome back, {stats?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {stats?.plan === "pro" ? "✨ Pro Member" : "Free Tier"} • {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black ${s.color}`}>
                {s.value}{s.suffix && <span className="text-lg text-gray-500 font-normal ml-1">{s.suffix}</span>}
              </div>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Weak Areas */}
          {weakAreas?.weakTopics?.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="font-semibold text-gray-100 mb-4 flex items-center gap-2">
                ⚠️ Areas to Improve
              </h2>
              <div className="space-y-2 mb-4">
                {weakAreas.weakTopics.map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-gray-300">{t}</span>
                  </div>
                ))}
              </div>
              {weakAreas.recommendation && (
                <p className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3 leading-relaxed">
                  💡 {weakAreas.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Recent Interviews */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="font-semibold text-gray-100 mb-4">Recent Interviews</h2>
            {recentInterviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-3">No interviews yet</p>
                <a href="/interview" className="text-cyan-400 text-sm hover:underline">Start your first →</a>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.map((session) => (
                  <a
                    key={session._id}
                    href={`/interview/${session._id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <div>
                      <p className="text-gray-200 text-sm capitalize font-medium">{session.role}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(session.createdAt).toLocaleDateString()}
                        {" • "}{session.rounds?.length ?? 0} rounds
                      </p>
                    </div>
                    <div className="text-right">
                      {session.overallScore != null ? (
                        <span className={`font-bold ${session.overallScore >= 7 ? "text-green-400" : session.overallScore >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                          {session.overallScore.toFixed(1)}/10
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs capitalize">{session.status}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { href: "/interview", label: "Start Interview", icon: "🎤", gradient: "from-cyan-500 to-violet-500" },
            { href: "/quiz", label: "Take Quiz", icon: "⚡", gradient: "from-yellow-500 to-orange-500" },
            { href: "/practice", label: "Coding Practice", icon: "💻", gradient: "from-green-500 to-teal-500" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`py-4 bg-gradient-to-r ${action.gradient} rounded-xl font-semibold text-center hover:opacity-90 transition-opacity text-sm`}
            >
              <div className="text-xl mb-1">{action.icon}</div>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
