import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import Redis from "ioredis";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interviews.js";
import quizRoutes from "./routes/quiz.js";
import questionsRoutes from "./routes/questions.js";
import paymentsRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: "AI rate limit exceeded. Try again in a minute." });

app.use(express.json({ limit: "10kb" }));
app.use("/api", limiter);
app.use("/api/interviews", aiLimiter);
app.use("/api/quiz", aiLimiter);

// ── Database (lazy connection — reused across serverless invocations) ──────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 });
  isConnected = true;
  console.log("✅ MongoDB connected");
}
// Middleware: ensure DB is connected before every request
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { res.status(503).json({ error: "Database unavailable" }); }
});

// ── Redis (gracefully disabled if not configured) ─────────────────────────────
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on("error", (err) => console.warn("Redis warning:", err.message));
}

// Null-safe redis wrapper — ops silently no-op if Redis isn't configured
export const redis = {
  get: (key) => redisClient?.get(key).catch(() => null) ?? Promise.resolve(null),
  set: (key, val) => redisClient?.set(key, val).catch(() => null) ?? Promise.resolve(null),
  setex: (key, ttl, val) => redisClient?.setex(key, ttl, val).catch(() => null) ?? Promise.resolve(null),
  del: (key) => redisClient?.del(key).catch(() => null) ?? Promise.resolve(null),
};

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use(errorHandler);

// ── Start server only when run directly (not in Vercel serverless) ────────────
if (process.env.NODE_ENV !== "production" || process.env.FORCE_SERVER) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 PrepGrid backend running on port ${PORT}`));
}

export default app;
