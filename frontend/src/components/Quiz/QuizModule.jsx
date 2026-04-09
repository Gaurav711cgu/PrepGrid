import { useState } from "react";
import { useClaudeQuiz } from "../../hooks/useClaudeQuiz";

export default function QuizModule() {
  const {
    status, questions, answers, results, topic, error,
    generateQuiz, selectAnswer, handleSubmit, reset,
    POPULAR_TOPICS, formattedTime, answeredCount, progressPct,
    isGenerating, isActive, isComplete, isSubmitting, isTimeLow,
  } = useClaudeQuiz();

  const [customTopic, setCustomTopic] = useState("");
  const [count, setCount] = useState(5);

  const onStart = () => {
    const t = customTopic.trim() || "JavaScript";
    generateQuiz({ topic: t, count });
  };

  if (isComplete && results) {
    return <QuizResults results={results} topic={topic} questions={questions} answers={answers} onRetry={reset} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            ⚡ AI Quiz
          </h1>
          <p className="text-gray-400 text-sm mt-1">Instant MCQs on any CS topic, powered by Claude AI</p>
        </div>

        {/* Setup */}
        {status === "idle" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Topic</label>
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onStart()}
                placeholder="e.g. React Hooks, SQL Joins, OS Scheduling..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Popular Topics</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.slice(0, 12).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCustomTopic(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      customTopic === t
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Number of Questions: {count}</label>
              <input
                type="range" min={3} max={15} value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
            )}

            <button
              onClick={onStart}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isGenerating ? "Generating Quiz..." : "Generate Quiz →"}
            </button>
          </div>
        )}

        {/* Active Quiz */}
        {isActive && (
          <div className="space-y-4">
            {/* Timer + Progress */}
            <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-mono font-bold ${isTimeLow ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
                  ⏱ {formattedTime}
                </div>
                <div className="text-gray-500 text-sm">{topic}</div>
              </div>
              <div className="text-gray-400 text-sm">{answeredCount}/{questions.length} answered</div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Questions */}
            {questions.map((q, qi) => (
              <div key={qi} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-200 font-medium mb-4">
                  <span className="text-yellow-500 mr-2">Q{qi + 1}.</span>{q.q}
                </p>
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        answers[qi] === oi
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-200"
                          : "border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-gray-500 mr-2">{["A", "B", "C", "D"][oi]}.</span>{opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${questions.length} answered)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizResults({ results, topic, questions, answers, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center mb-6">
          <div className="text-5xl mb-4">{results.percentage >= 80 ? "🏆" : results.percentage >= 60 ? "🎯" : "📚"}</div>
          <div className="text-6xl font-black text-yellow-400">{results.percentage}%</div>
          <p className="text-gray-400 mt-2">{results.score}/{results.total} correct on {topic}</p>
        </div>

        <div className="space-y-3 mb-6">
          {questions.map((q, i) => {
            const r = results.results[i];
            return (
              <div key={i} className={`rounded-2xl p-4 border ${r.correct ? "border-green-800/50 bg-green-900/10" : "border-red-800/50 bg-red-900/10"}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span>{r.correct ? "✅" : "❌"}</span>
                  <p className="text-gray-200 text-sm font-medium">{q.q}</p>
                </div>
                {!r.correct && (
                  <p className="text-sm text-gray-400 ml-6">
                    Correct: <span className="text-green-400">{q.opts[r.correctAns]}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-6 mt-1">{r.explanation}</p>
              </div>
            );
          })}
        </div>

        <button onClick={onRetry} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Try Another Quiz →
        </button>
      </div>
    </div>
  );
}
