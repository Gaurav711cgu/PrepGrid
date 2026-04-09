import { useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

const API = import.meta.env.VITE_API_URL;

const ROLES = ["frontend", "backend", "fullstack", "dsa", "system-design"];
const DIFFICULTY_COLORS = { easy: "text-green-400", medium: "text-yellow-400", hard: "text-red-400" };

export function useClaudeInterview() {
  const { token } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | active | evaluating | complete
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState("medium");
  const [round, setRound] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]); // [{question, answer, evaluation}]
  const [overallScore, setOverallScore] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const startInterview = useCallback(async ({ role, difficulty = "medium" }) => {
    setStatus("loading");
    setError(null);
    setHistory([]);
    setEvaluation(null);
    setOverallScore(null);

    try {
      const res = await fetch(`${API}/interviews/start`, {
        method: "POST",
        headers,
        body: JSON.stringify({ role, difficulty }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start interview");
      }
      const data = await res.json();
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setCurrentDifficulty(data.difficulty);
      setRound(data.round);
      setStatus("active");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }, [token]);

  const submitAnswer = useCallback(async (answer) => {
    if (!sessionId || !answer.trim()) return;
    setStatus("evaluating");
    setError(null);

    try {
      const res = await fetch(`${API}/interviews/${sessionId}/answer`, {
        method: "POST",
        headers,
        body: JSON.stringify({ answer }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to evaluate answer");
      }
      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer, evaluation: data.evaluation, difficulty: currentDifficulty },
      ]);
      setEvaluation(data.evaluation);

      if (data.isComplete) {
        setOverallScore(data.overallScore);
        setStatus("complete");
      } else {
        setCurrentQuestion(data.nextQuestion);
        setCurrentDifficulty(data.nextDifficulty);
        setRound(data.round);
        setStatus("active");
      }
    } catch (err) {
      setError(err.message);
      setStatus("active");
    }
  }, [sessionId, currentQuestion, currentDifficulty, token]);

  const reset = useCallback(() => {
    setSessionId(null);
    setStatus("idle");
    setCurrentQuestion("");
    setCurrentDifficulty("medium");
    setRound(0);
    setEvaluation(null);
    setHistory([]);
    setOverallScore(null);
    setError(null);
  }, []);

  return {
    // State
    sessionId, status, currentQuestion, currentDifficulty,
    round, evaluation, history, overallScore, error,
    // Actions
    startInterview, submitAnswer, reset,
    // Utils
    ROLES, DIFFICULTY_COLORS,
    isLoading: status === "loading" || status === "evaluating",
    isActive: status === "active",
    isComplete: status === "complete",
  };
}
