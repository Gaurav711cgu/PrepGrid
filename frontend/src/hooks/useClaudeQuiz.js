import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "./useAuth";

const API = import.meta.env.VITE_API_URL;
const QUIZ_DURATION = 5 * 60; // 5 minutes in seconds

const POPULAR_TOPICS = [
  "React Hooks", "JavaScript Closures", "CSS Flexbox", "TypeScript Generics",
  "Node.js Event Loop", "REST API Design", "SQL Joins", "MongoDB Aggregation",
  "System Design Basics", "OS Scheduling", "Computer Networks", "DBMS Normalization",
  "Dynamic Programming", "Graph Algorithms", "Binary Trees", "Sorting Algorithms",
  "Docker & Kubernetes", "Git Internals", "HTTP/HTTPS", "WebSockets",
];

export function useClaudeQuiz() {
  const { token } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | generating | active | submitting | complete
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [topic, setTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // Countdown timer
  useEffect(() => {
    if (status !== "active") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [status]);

  const generateQuiz = useCallback(async ({ topic: t, count = 5, type = "mcq" }) => {
    setStatus("generating");
    setError(null);
    setAnswers({});
    setResults(null);
    setTimeLeft(QUIZ_DURATION);

    try {
      const res = await fetch(`${API}/quiz/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ topic: t, count, type }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quiz");
      }
      const data = await res.json();
      setQuestions(data.questions);
      setTopic(data.topic);
      setStatus("active");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }, [token]);

  const selectAnswer = useCallback((questionIndex, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  }, []);

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    setStatus("submitting");

    const answersArray = questions.map((_, i) => answers[i] ?? -1);
    const timeTaken = QUIZ_DURATION - timeLeft;

    try {
      const res = await fetch(`${API}/quiz/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, questions, answers: answersArray, timeTaken }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      const data = await res.json();
      setResults(data);
      setStatus("complete");
    } catch (err) {
      setError(err.message);
      setStatus("active");
    }
  }, [questions, answers, topic, timeLeft, token]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setStatus("idle");
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setTopic("");
    setTimeLeft(QUIZ_DURATION);
    setError(null);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return {
    // State
    status, questions, answers, results, topic, timeLeft, error,
    // Actions
    generateQuiz, selectAnswer, handleSubmit, reset,
    // Utils
    POPULAR_TOPICS, formatTime,
    formattedTime: formatTime(timeLeft),
    answeredCount, progressPct,
    isGenerating: status === "generating",
    isActive: status === "active",
    isComplete: status === "complete",
    isSubmitting: status === "submitting",
    isTimeLow: timeLeft < 60,
  };
}
