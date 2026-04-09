import { useState, useRef, useEffect } from "react";
import { useClaudeInterview } from "../../hooks/useClaudeInterview";
import ScoreCard from "./ScoreCard";
import SessionHistory from "./SessionHistory";
import VoiceInput from "./VoiceInput";

const ROLE_LABELS = {
  frontend: "🎨 Frontend",
  backend: "⚙️ Backend",
  fullstack: "🌐 Full Stack",
  dsa: "🧮 DSA",
  "system-design": "🏗️ System Design",
};

export default function InterviewModule() {
  const {
    status, currentQuestion, currentDifficulty, round,
    evaluation, history, overallScore, error,
    startInterview, submitAnswer, reset,
    DIFFICULTY_COLORS, isLoading, isActive, isComplete,
  } = useClaudeInterview();

  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isActive && textareaRef.current) textareaRef.current.focus();
  }, [isActive, currentQuestion]);

  const handleSubmit = () => {
    if (!answer.trim() || isLoading) return;
    submitAnswer(answer.trim());
    setAnswer("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) handleSubmit();
  };

  if (isComplete) {
    return <ScoreCard overallScore={overallScore} history={history} onRetry={reset} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              AI Interview
            </h1>
            <p className="text-gray-400 text-sm mt-1">Adaptive mock interviews powered by Claude AI</p>
          </div>
          {isActive && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Round {round}/10</span>
              <span className={`text-sm font-semibold capitalize ${DIFFICULTY_COLORS[currentDifficulty]}`}>
                ● {currentDifficulty}
              </span>
            </div>
          )}
        </div>

        {/* Setup Screen */}
        {status === "idle" && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6 text-gray-100">Choose Your Interview Track</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRole === role
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="text-lg mb-1">{label.split(" ")[0]}</div>
                  <div className="text-sm font-medium">{label.split(" ").slice(1).join(" ")}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => startInterview({ role: selectedRole })}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Starting..." : "Start Interview →"}
            </button>

            <p className="text-gray-500 text-xs text-center mt-4">
              10 adaptive questions • Difficulty adjusts to your performance
            </p>
          </div>
        )}

        {/* Active Interview */}
        {(isActive || isLoading) && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                style={{ width: `${(round / 10) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Question {round} — {currentDifficulty}
                  </p>
                  <p className="text-gray-100 text-lg leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </div>

            {/* Last Evaluation */}
            {evaluation && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-2xl font-bold ${evaluation.score >= 7 ? "text-green-400" : evaluation.score >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                    {evaluation.score}/10
                  </div>
                  <p className="text-gray-300 text-sm">{evaluation.feedback}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
                    <p className="text-green-400 font-medium mb-1">✓ Strengths</p>
                    <p className="text-gray-300">{evaluation.strengths}</p>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3">
                    <p className="text-amber-400 font-medium mb-1">↑ Improve</p>
                    <p className="text-gray-300">{evaluation.improvements}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-400 text-sm">Your Answer</label>
                <VoiceInput onTranscript={(t) => setAnswer((prev) => prev + t)} />
              </div>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                disabled={isLoading}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-gray-600 text-xs">{answer.length} chars</p>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {isLoading ? "Evaluating..." : "Submit →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Sidebar */}
        {history.length > 0 && <SessionHistory history={history} className="mt-6" />}
      </div>
    </div>
  );
}
