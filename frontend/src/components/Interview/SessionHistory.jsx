export default function SessionHistory({ history, className = "" }) {
  if (!history.length) return null;
  return (
    <div className={`bg-gray-900 rounded-2xl p-5 border border-gray-800 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Session History</h3>
      <div className="space-y-2">
        {history.map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 w-5 text-xs">#{i + 1}</span>
            <span className="flex-1 text-gray-400 line-clamp-1 text-xs">{r.question}</span>
            <span className={`font-bold text-xs ${r.evaluation?.score >= 7 ? "text-green-400" : r.evaluation?.score >= 4 ? "text-yellow-400" : "text-red-400"}`}>
              {r.evaluation?.score}/10
            </span>
            <span className="text-gray-600 text-xs capitalize">{r.difficulty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
