import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import { InterviewSession, QuizAttempt } from "../models/InterviewSession.js";

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/stats — platform overview
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, proUsers, totalInterviews, totalQuizzes, totalQuestions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: "pro" }),
      InterviewSession.countDocuments(),
      QuizAttempt.countDocuments(),
      Question.countDocuments(),
    ]);

    // New users in last 7 days
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: since7d } });

    // Avg interview score
    const scoreAgg = await InterviewSession.aggregate([
      { $match: { status: "completed", overallScore: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$overallScore" } } },
    ]);

    // Most popular quiz topics
    const popularTopics = await QuizAttempt.aggregate([
      { $group: { _id: "$topic", count: { $sum: 1 }, avgScore: { $avg: "$percentage" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      users: { total: totalUsers, pro: proUsers, newThisWeek: newUsersThisWeek },
      interviews: { total: totalInterviews, avgScore: scoreAgg[0]?.avg?.toFixed(2) ?? "N/A" },
      quizzes: { total: totalQuizzes },
      questions: { total: totalQuestions },
      popularTopics,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
    const users = await User.find(query)
      .select("-password -topicScores -activityLog")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/admin/users/:id/plan
router.patch("/users/:id/plan", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["free", "pro"].includes(plan)) return res.status(400).json({ error: "Invalid plan" });
    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true }).select("name email plan");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user plan" });
  }
});

// POST /api/admin/questions — add question
router.post("/questions", async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/questions/:id
router.put("/questions/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/questions/:id
router.delete("/questions/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
