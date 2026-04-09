import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL;

export default function AdminPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchUsers(search = "") {
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (search) params.set("search", search);
      const res = await fetch(`${API}/admin/users?${params}`, { headers });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
  }

  async function togglePlan(userId, currentPlan) {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    try {
      await fetch(`${API}/admin/users/${userId}/plan`, {
        method: "PATCH", headers,
        body: JSON.stringify({ plan: newPlan }),
      });
      fetchUsers(userSearch);
    } catch (err) { alert("Failed to update plan"); }
  }

  const TABS = ["overview", "users", "questions"];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">⚙️ Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Platform analytics and management</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 pb-0">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.users?.total, sub: `+${stats.users?.newThisWeek} this week`, color: "text-cyan-400" },
                { label: "Pro Members", value: stats.users?.pro, sub: `${Math.round((stats.users?.pro / stats.users?.total) * 100) || 0}% conversion`, color: "text-violet-400" },
                { label: "Interviews Done", value: stats.interviews?.total, sub: `avg ${stats.interviews?.avgScore}/10`, color: "text-green-400" },
                { label: "Quizzes Taken", value: stats.quizzes?.total, sub: `${stats.questions?.total} questions in bank`, color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <div className={`text-3xl font-black ${s.color}`}>{s.value ?? "—"}</div>
                  <p className="text-gray-400 text-sm font-medium mt-1">{s.label}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Popular Topics */}
            {stats.popularTopics?.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="font-semibold text-gray-100 mb-4">Most Popular Quiz Topics</h2>
                <div className="space-y-2">
                  {stats.popularTopics.slice(0, 8).map((t, i) => (
                    <div key={t._id} className="flex items-center gap-3">
                      <span className="text-gray-600 text-xs w-5">{i + 1}.</span>
                      <span className="text-gray-300 text-sm flex-1">{t._id}</span>
                      <span className="text-gray-500 text-xs">{t.count} attempts</span>
                      <span className={`text-xs font-semibold ${t.avgScore >= 70 ? "text-green-400" : t.avgScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {t.avgScore?.toFixed(0)}% avg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex gap-3">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers(userSearch)}
                placeholder="Search by name or email..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button onClick={() => fetchUsers(userSearch)}
                className="px-4 py-1.5 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                Search
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    {["Name", "Email", "Plan", "Interviews", "Streak", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-200">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.plan === "pro" ? "bg-violet-900/40 text-violet-400" : "bg-gray-800 text-gray-500"}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{u.interviewsCompleted ?? 0}</td>
                      <td className="px-4 py-3 text-orange-400">{u.currentStreak ?? 0}🔥</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePlan(u._id, u.plan)}
                          className={`text-xs px-3 py-1 rounded-lg transition-colors ${u.plan === "pro" ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-violet-900/30 text-violet-400 hover:bg-violet-900/50"}`}>
                          {u.plan === "pro" ? "Revoke Pro" : "Grant Pro"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">No users found</div>
              )}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {tab === "questions" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Use the REST API to manage questions. POST /api/admin/questions to add, PUT /api/admin/questions/:id to edit, DELETE to remove.</p>
            <div className="mt-4 bg-gray-800 rounded-xl p-4 font-mono text-xs text-gray-300">
              <p className="text-green-400 mb-2"># Add a question via curl</p>
              <p>curl -X POST {API}/admin/questions \</p>
              <p>  -H "Authorization: Bearer YOUR_TOKEN" \</p>
              <p>  -H "Content-Type: application/json" \</p>
              <p>  -d '&#123;"title":"Two Sum","difficulty":"easy",...&#125;'</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
