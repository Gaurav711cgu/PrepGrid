import express from "express";
import { authenticate, checkQuota } from "../middleware/auth.js";
import { generateQuiz, evaluateShortAnswer } from "../utils/aiService.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import { redis } from "../app.js";

const router = express.Router();
router.use(authenticate);

// POST /api/quiz/generate
router.post("/generate", checkQuota("quiz"), async (req, res) => {
  try {
    const { topic, count = 5, type = "mcq" } = req.body;
    if (!topic) return res.status(400).json({ error: "topic is required" });
    if (count < 1 || count > 20) return res.status(400).json({ error: "count must be 1-20" });

    // Cache quiz for 10 minutes to avoid re-generation
    const cacheKey = `quiz:${topic.toLowerCase().replace(/\s+/g, "-")}:${type}:${count}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json({ questions: JSON.parse(cached), fromCache: true, topic });
    }

    const questions = await generateQuiz({ topic, count, type });

    await redis.setex(cacheKey, 600, JSON.stringify(questions));

    res.json({ questions, fromCache: false, topic });
  } catch (err) {
    console.error("quiz generate error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// POST /api/quiz/submit
router.post("/submit", async (req, res) => {
  try {
    const { topic, questions, answers, timeTaken, type = "mcq" } = req.body;
    if (!topic || !questions || !answers) return res.status(400).json({ error: "Missing required fields" });

    let score = 0;
    const results = [];

    if (type === "mcq") {
      for (let i = 0; i < questions.length; i++) {
        const correct = questions[i].ans === answers[i];
        if (correct) score++;
        results.push({ correct, correctAns: questions[i].ans, explanation: questions[i].explanation });
      }
    }

    const percentage = Math.round((score / questions.length) * 100);

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      topic,
      type,
      score,
      total: questions.length,
      percentage,
      timeTaken,
      answers,
      results,
    });

    // Update user topic score
    await User.findByIdAndUpdate(req.user.id, {
      $push: { activityLog: { date: new Date(), type: "quiz" } },
    });

    await updateTopicScore(req.user.id, topic, percentage / 10);

    res.json({ attemptId: attempt._id, score, total: questions.length, percentage, results });
  } catch (err) {
    console.error("quiz submit error:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// POST /api/quiz/evaluate-short
router.post("/evaluate-short", async (req, res) => {
  try {
    const { question, answer, sampleAnswer, keyPoints } = req.body;
    const evaluation = await evaluateShortAnswer({ question, answer, sampleAnswer, keyPoints });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

// GET /api/quiz/leaderboard/:topic
router.get("/leaderboard/:topic", async (req, res) => {
  try {
    const cacheKey = `leaderboard:${req.params.topic}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    const leaderboard = await QuizAttempt.aggregate([
      { $match: { topic: req.params.topic, type: "mcq" } },
      { $group: { _id: "$userId", best: { $max: "$percentage" }, attempts: { $sum: 1 } } },
      { $sort: { best: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", avatar: "$user.avatar", best: 1, attempts: 1 } },
    ]);

    await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/quiz/history
router.get("/history", async (req, res) => {
  try {
    const { page = 1, limit = 10, topic } = req.query;
    const query = { userId: req.user.id };
    if (topic) query.topic = topic;

    const attempts = await QuizAttempt.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-answers -results");

    const total = await QuizAttempt.countDocuments(query);
    res.json({ attempts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

async function updateTopicScore(userId, topic, newScore) {
  const user = await User.findById(userId);
  if (!user) return;

  const existing = user.topicScores?.find((t) => t.topic === topic);
  if (existing) {
    existing.attempts += 1;
    existing.avgScore = ((existing.avgScore * (existing.attempts - 1)) + newScore) / existing.attempts;
  } else {
    if (!user.topicScores) user.topicScores = [];
    user.topicScores.push({ topic, avgScore: newScore, attempts: 1 });
  }
  await user.save();
}

export default router;
