import express from "express";
import axios from "axios";
import { authenticate } from "../middleware/auth.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

const router = express.Router();
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

const LANG_IDS = { javascript: 63, python: 71, java: 62, cpp: 54 };

// GET /api/questions — list with filters
router.get("/", async (req, res) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topics = topic;
    if (search) query.title = { $regex: search, $options: "i" };

    const [questions, total] = await Promise.all([
      Question.find(query)
        .select("title slug difficulty topics acceptanceRate companies")
        .sort({ difficulty: 1, title: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Question.countDocuments(query),
    ]);

    res.json({ questions, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET /api/questions/:slug
router.get("/:slug", authenticate, async (req, res) => {
  try {
    const question = await Question.findOne({ slug: req.params.slug }).select("-solution -testCases.isHidden");
    if (!question) return res.status(404).json({ error: "Question not found" });

    const user = await User.findById(req.user.id).select("solvedQuestions bookmarkedQuestions");
    res.json({
      ...question.toObject(),
      isSolved: user.solvedQuestions.includes(question._id),
      isBookmarked: user.bookmarkedQuestions.includes(question._id),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

// POST /api/questions/:slug/run — run code (public test cases)
router.post("/:slug/run", authenticate, async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: "code and language are required" });

    const langId = LANG_IDS[language];
    if (!langId) return res.status(400).json({ error: `Unsupported language: ${language}` });

    const question = await Question.findOne({ slug: req.params.slug }).select("testCases");
    const visibleTests = question.testCases.filter((t) => !t.isHidden).slice(0, 3);

    const results = await Promise.all(
      visibleTests.map(async (tc) => {
        const submission = await axios.post(
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
          { source_code: code, language_id: langId, stdin: tc.input, expected_output: tc.expectedOutput },
          { headers: JUDGE0_HEADERS }
        );
        const { stdout, stderr, status, time, memory } = submission.data;
        return {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: stdout?.trim(),
          passed: stdout?.trim() === tc.expectedOutput?.trim(),
          status: status?.description,
          time,
          memory,
          error: stderr,
        };
      })
    );

    res.json({ results, allPassed: results.every((r) => r.passed) });
  } catch (err) {
    console.error("Judge0 error:", err.message);
    res.status(500).json({ error: "Code execution failed" });
  }
});

// POST /api/questions/:slug/submit — submit and mark solved
router.post("/:slug/submit", authenticate, async (req, res) => {
  try {
    const { code, language } = req.body;
    const langId = LANG_IDS[language];
    if (!langId) return res.status(400).json({ error: "Unsupported language" });

    const question = await Question.findOne({ slug: req.params.slug });
    if (!question) return res.status(404).json({ error: "Question not found" });

    const results = await Promise.all(
      question.testCases.map(async (tc) => {
        const submission = await axios.post(
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
          { source_code: code, language_id: langId, stdin: tc.input, expected_output: tc.expectedOutput },
          { headers: JUDGE0_HEADERS }
        );
        const { stdout, status } = submission.data;
        return { passed: stdout?.trim() === tc.expectedOutput?.trim(), status: status?.description };
      })
    );

    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;

    if (allPassed) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { solvedQuestions: question._id },
        $inc: { problemsSolved: 1 },
        $push: { activityLog: { date: new Date(), type: "practice" } },
      });
      await Question.findByIdAndUpdate(question._id, { $inc: { totalSolved: 1, totalAttempts: 1 } });
    } else {
      await Question.findByIdAndUpdate(question._id, { $inc: { totalAttempts: 1 } });
    }

    res.json({ allPassed, passedCount, total: results.length, results: results.map((r) => ({ passed: r.passed, status: r.status })) });
  } catch (err) {
    res.status(500).json({ error: "Submission failed" });
  }
});

// POST /api/questions/:id/bookmark
router.post("/:id/bookmark", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("bookmarkedQuestions");
    const isBookmarked = user.bookmarkedQuestions.includes(req.params.id);
    const update = isBookmarked
      ? { $pull: { bookmarkedQuestions: req.params.id } }
      : { $addToSet: { bookmarkedQuestions: req.params.id } };
    await User.findByIdAndUpdate(req.user.id, update);
    res.json({ bookmarked: !isBookmarked });
  } catch (err) {
    res.status(500).json({ error: "Failed to bookmark" });
  }
});

export default router;
