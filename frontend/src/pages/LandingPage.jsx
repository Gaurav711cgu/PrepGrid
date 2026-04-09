import { useAuth } from "../hooks/useAuth";

const STATS = [
  { value: "2,400+", label: "Problems" },
  { value: "25+", label: "Topics" },
  { value: "18K+", label: "Students" },
  { value: "94%", label: "Placement Rate" },
];

const FEATURES = [
  {
    icon: "🎤",
    title: "AI Mock Interviews",
    description: "Adaptive difficulty. Real-time scoring. Role-specific for Frontend, Backend, DSA & more.",
    color: "from-cyan-500/20 to-violet-500/20 border-cyan-500/30",
  },
  {
    icon: "⚡",
    title: "Instant AI Quizzes",
    description: "Generate 5 MCQs on any CS topic in seconds. Leaderboards, explanations, timers.",
    color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  },
  {
    icon: "💻",
    title: "Coding Practice",
    description: "2,400+ problems with Monaco editor, Judge0 execution, bookmark & streak tracking.",
    color: "from-green-500/20 to-teal-500/20 border-green-500/30",
  },
  {
    icon: "📊",
    title: "Smart Dashboard",
    description: "Streak calendar, weak area detection by AI, interview history, and progress charts.",
    color: "from-violet-500/20 to-pink-500/20 border-violet-500/30",
  },
];

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            DevFusion Hackathon 2026 — Problem #26ENPRE1
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Crack Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Dream Interview
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            The all-in-one placement prep platform for engineering students — adaptive AI interviews, instant quizzes, 2,400+ coding problems, and streak tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={token ? "/dashboard" : "/register"}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free →
            </a>
            <a
              href="/interview"
              className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-2xl font-bold text-lg hover:border-gray-500 transition-colors"
            >
              Try Demo Interview
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">land the job</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6`}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-3xl p-10">
          <h2 className="text-3xl font-bold mb-4">Start preparing today</h2>
          <p className="text-gray-400 mb-8">Free tier includes 5 AI interviews/month and 10 practice questions/day. No credit card needed.</p>
          <a
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Create Free Account →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        <p>Built with ❤️ by Team BEAST MODE for DevFusion Hackathon 2026</p>
        <p className="mt-1">Powered by Claude AI (Anthropic) · React · Node.js · MongoDB</p>
      </footer>
    </div>
  );
}
