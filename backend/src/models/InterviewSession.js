import mongoose from "mongoose";

// ── Interview Session ─────────────────────────────────────────────────────────
const roundSchema = new mongoose.Schema({
  question: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  answer: String,
  score: { type: Number, min: 0, max: 10 },
  feedback: String,
  strengths: String,
  improvements: String,
  keyMissed: String,
  startedAt: Date,
  completedAt: Date,
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: {
      type: String,
      enum: ["frontend", "backend", "fullstack", "dsa", "system-design", "ml"],
      required: true,
    },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
    rounds: [roundSchema],
    overallScore: Number,
    completedAt: Date,
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

// ── Quiz Attempt ──────────────────────────────────────────────────────────────
const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true },
    type: { type: String, enum: ["mcq", "short-answer"], default: "mcq" },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: Number,
    timeTaken: Number, // seconds
    answers: [mongoose.Schema.Types.Mixed],
    results: [
      {
        correct: Boolean,
        correctAns: Number,
        explanation: String,
        aiScore: Number, // for short answer
        aiFeedback: String,
      },
    ],
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, topic: 1, createdAt: -1 });
quizAttemptSchema.index({ topic: 1, percentage: -1 }); // for leaderboard

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default InterviewSession;
