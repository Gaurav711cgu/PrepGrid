export default function ScoreCard({ overallScore, history, onRetry }) {
  const grade =
    overallScore >= 8 ? { label: "Excellent", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", emoji: "🏆" }
    : overallScore >= 6 ? { label: "Good", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", emoji: "🎯" }
    : overallScore >= 4 ? { label: "Average", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", emoji: "📈" }
    : { label: "Needs Work", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", emoji: "💪" };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Overall Score */}
        <div className={`rounded-2xl p-8 border ${grade.bg} text-center mb-8`}>
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <p className="text-gray-400 mb-2">Overall Score</p>
          <div className={`text-7xl font-black ${grade.color}`}>{overallScore?.toFixed(1)}</div>
          <div className="text-gray-400 text-lg">/10 — {grade.label}</div>
        </div>

        {/* Per-Round Breakdown */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">Round Breakdown</h3>
          <div className="space-y-3">
            {history.map((round, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">#{i + 1}</span>
                    <span className="text-gray-300 text-sm line-clamp-1 max-w-xs">{round.question}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${round.evaluation?.score >= 7 ? "text-green-400" : round.evaluation?.score >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                      {round.evaluation?.score}/10
                    </span>
                    <span className="text-gray-500 text-xs capitalize">{round.difficulty}</span>
                  </div>
                </summary>
                <div className="px-3 pb-3 space-y-2 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Q:</p>
                    <p className="text-gray-200">{round.question}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Your Answer:</p>
                    <p className="text-gray-300">{round.answer}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Feedback:</p>
                    <p className="text-gray-300">{round.evaluation?.feedback}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again →
          </button>
          <a href="/dashboard" className="flex-1 py-3 border border-gray-700 rounded-xl font-semibold text-center text-gray-300 hover:border-gray-500 transition-colors">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
