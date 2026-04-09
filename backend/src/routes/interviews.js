import express from "express";
import { authenticate, checkQuota } from "../middleware/auth.js";
import { generateInterviewQuestion, evaluateAnswer, detectWeakAreas } from "../utils/aiService.js";
import InterviewSession from "../models/InterviewSession.js";
import User from "../models/User.js";
import { redis } from "../app.js";

const router = express.Router();
router.use(authenticate);

// POST /api/interviews/start
router.post("/start", checkQuota("interview"), async (req, res) => {
  try {
    const { role, difficulty = "medium" } = req.body;
    if (!role) return res.status(400).json({ error: "role is required" });

    // Get user's weak topics for adaptive seeding
    const user = await User.findById(req.user.id).select("topicScores");
    const weakTopics = user?.topicScores
      ?.filter((t) => t.avgScore < 5)
      .map((t) => t.topic) || [];

    const question = await generateInterviewQuestion({ role, difficulty, weakTopics });

    const session = await InterviewSession.create({
      userId: req.user.id,
      role,
      status: "active",
      rounds: [{ question, difficulty, startedAt: new Date() }],
    });

    // Cache session state for fast retrieval
    await redis.setex(`session:${session._id}`, 3600, JSON.stringify({ role, difficulty, questionCount: 1 }));

    res.status(201).json({ sessionId: session._id, question, difficulty, round: 1 });
  } catch (err) {
    console.error("start interview error:", err);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// POST /api/interviews/:id/answer
router.post("/:id/answer", async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: "answer is required" });

    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "active") return res.status(400).json({ error: "Session is not active" });

    const currentRound = session.rounds[session.rounds.length - 1];
    const evaluation = await evaluateAnswer({
      question: currentRound.question,
      answer,
      role: session.role,
      difficulty: currentRound.difficulty,
    });

    // Update round with answer + evaluation
    currentRound.answer = answer;
    currentRound.score = evaluation.score;
    currentRound.feedback = evaluation.feedback;
    currentRound.strengths = evaluation.strengths;
    currentRound.improvements = evaluation.improvements;
    currentRound.completedAt = new Date();

    const roundNumber = session.rounds.length;
    const isLastRound = roundNumber >= 10;

    if (isLastRound) {
      session.status = "completed";
      const avgScore = session.rounds.reduce((sum, r) => sum + (r.score || 0), 0) / session.rounds.length;
      session.overallScore = Math.round(avgScore * 10) / 10;
      session.completedAt = new Date();

      // Update user stats
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { interviewsCompleted: 1 },
        $push: { activityLog: { date: new Date(), type: "interview" } },
      });

      await session.save();
      return res.json({ evaluation, isComplete: true, overallScore: session.overallScore, session });
    }

    // Generate next question
    const nextDifficulty = evaluation.nextDifficulty;
    const previousQuestions = session.rounds.map((r) => r.question);
    const nextQuestion = await generateInterviewQuestion({
      role: session.role,
      difficulty: nextDifficulty,
      previousQuestions,
    });

    session.rounds.push({ question: nextQuestion, difficulty: nextDifficulty, startedAt: new Date() });
    await session.save();

    res.json({
      evaluation,
      isComplete: false,
      nextQuestion,
      nextDifficulty,
      round: roundNumber + 1,
    });
  } catch (err) {
    console.error("answer error:", err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

// GET /api/interviews — list user's sessions
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const sessions = await InterviewSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-rounds.answer");

    const total = await InterviewSession.countDocuments({ userId: req.user.id });
    res.json({ sessions, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/interviews/:id — full session detail
router.get("/:id", async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// POST /api/interviews/weak-areas — AI weak area analysis
router.post("/weak-areas", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("topicScores");
    if (!user?.topicScores?.length) {
      return res.json({ message: "Complete more interviews to get personalized analysis.", weakTopics: [], strongTopics: [] });
    }
    const analysis = await detectWeakAreas({ userId: req.user.id, topicScores: user.topicScores });
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze weak areas" });
  }
});

export default router;
