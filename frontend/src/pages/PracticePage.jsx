import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL;

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const TOPICS = ["all", "Arrays", "Strings", "Trees", "Graphs", "DP", "Sorting", "SQL", "Recursion"];
const LANGUAGES = ["javascript", "python", "java", "cpp"];
const STARTER = {
  javascript: "// Write your solution here\nfunction solution(nums) {\n  \n}\n",
  python: "# Write your solution here\ndef solution(nums):\n    pass\n",
  java: "class Solution {\n    public int[] solution(int[] nums) {\n        \n    }\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums) {\n        \n    }\n};\n",
};

export default function PracticePage() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState(STARTER.javascript);
  const [language, setLanguage] = useState("javascript");
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchQuestions();
  }, [page, difficulty, topic]);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (difficulty !== "all") params.set("difficulty", difficulty);
      if (topic !== "all") params.set("topic", topic);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/questions?${params}`, { headers });
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openQuestion(slug) {
    try {
      const res = await fetch(`${API}/questions/${slug}`, { headers });
      const data = await res.json();
      setSelected(data);
      setCode(data.starterCode?.[language] || STARTER[language]);
      setRunResult(null);
      setSubmitResult(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function runCode() {
    if (!selected) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch(`${API}/questions/${selected.slug}/run`, {
        method: "POST", headers,
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setRunResult(data);
    } catch (err) {
      setRunResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  }

  async function submitCode() {
    if (!selected) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch(`${API}/questions/${selected.slug}/submit`, {
        method: "POST", headers,
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setSubmitResult(data);
    } catch (err) {
      setSubmitResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const diffColor = { easy: "text-green-400", medium: "text-yellow-400", hard: "text-red-400" };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-gray-100">💻 Coding Practice</h1>
        <span className="text-gray-500 text-sm">{total} problems</span>
        <div className="flex gap-2 flex-wrap ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
            placeholder="Search problems..."
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-44"
          />
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${difficulty === d ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Problem List */}
        <div className="w-80 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          {/* Topic Filter */}
          <div className="p-3 border-b border-gray-800 flex gap-1.5 flex-wrap">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => { setTopic(t); setPage(1); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${topic === t ? "border-cyan-500 text-cyan-400 bg-cyan-500/10" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500 animate-pulse">Loading...</div>
          ) : (
            <div>
              {questions.map((q, i) => (
                <button key={q._id} onClick={() => openQuestion(q.slug)}
                  className={`w-full text-left p-3 border-b border-gray-800/50 hover:bg-gray-900 transition-colors ${selected?.slug === q.slug ? "bg-gray-900 border-l-2 border-l-cyan-500" : ""}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-200 text-sm font-medium line-clamp-1">{q.title}</span>
                    <span className={`text-xs capitalize flex-shrink-0 ml-2 ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {q.topics?.slice(0, 2).map((t) => (
                      <span key={t} className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                    {q.acceptanceRate > 0 && (
                      <span className="text-xs text-gray-600 ml-auto">{q.acceptanceRate?.toFixed(0)}% AC</span>
                    )}
                  </div>
                </button>
              ))}
              {/* Pagination */}
              <div className="flex justify-between p-3">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="text-gray-500 text-xs hover:text-gray-300 disabled:opacity-30">← Prev</button>
                <span className="text-gray-600 text-xs">Page {page}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={questions.length < 20}
                  className="text-gray-500 text-xs hover:text-gray-300 disabled:opacity-30">Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Editor + Problem */}
        {selected ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Problem description */}
            <div className="h-52 overflow-y-auto p-5 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                <span className={`text-sm capitalize ${diffColor[selected.difficulty]}`}>{selected.difficulty}</span>
                {selected.isSolved && <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">✓ Solved</span>}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">{selected.description}</p>
              {selected.examples?.map((ex, i) => (
                <div key={i} className="mb-2 bg-gray-800 rounded-lg p-3 text-xs font-mono">
                  <p className="text-gray-400">Input: <span className="text-gray-200">{ex.input}</span></p>
                  <p className="text-gray-400">Output: <span className="text-gray-200">{ex.output}</span></p>
                  {ex.explanation && <p className="text-gray-500 mt-1">// {ex.explanation}</p>}
                </div>
              ))}
            </div>

            {/* Language selector + Editor */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900">
              <select value={language} onChange={(e) => { setLanguage(e.target.value); setCode(selected.starterCode?.[e.target.value] || STARTER[e.target.value]); }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="flex gap-2 ml-auto">
                <button onClick={runCode} disabled={running || submitting}
                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                  {running ? "Running..." : "▶ Run"}
                </button>
                <button onClick={submitCode} disabled={running || submitting}
                  className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : language}
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 2 }}
              />
            </div>

            {/* Results */}
            {(runResult || submitResult) && (
              <div className="h-36 overflow-y-auto border-t border-gray-800 bg-gray-900 p-4">
                {runResult && (
                  <div>
                    <p className="text-gray-400 text-xs mb-2 font-medium">RUN RESULTS</p>
                    <div className="space-y-1">
                      {runResult.results?.map((r, i) => (
                        <div key={i} className={`flex items-center gap-3 text-xs px-3 py-1.5 rounded-lg ${r.passed ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"}`}>
                          <span>{r.passed ? "✓" : "✗"}</span>
                          <span>Case {i + 1}</span>
                          {!r.passed && <span className="text-gray-500">Got: {r.actualOutput} | Expected: {r.expectedOutput}</span>}
                          <span className="ml-auto text-gray-500">{r.time}s</span>
                        </div>
                      ))}
                      {runResult.error && <p className="text-red-400 text-xs">{runResult.error}</p>}
                    </div>
                  </div>
                )}
                {submitResult && (
                  <div>
                    <p className={`text-sm font-bold mb-2 ${submitResult.allPassed ? "text-green-400" : "text-red-400"}`}>
                      {submitResult.allPassed ? "🎉 Accepted!" : `❌ Wrong Answer — ${submitResult.passedCount}/${submitResult.total} passed`}
                    </p>
                    {submitResult.error && <p className="text-red-400 text-xs">{submitResult.error}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="text-5xl mb-4">💻</div>
              <p className="text-gray-400">Select a problem to start coding</p>
              <p className="text-gray-600 text-sm mt-2">{total} problems available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
