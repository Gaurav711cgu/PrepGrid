import mongoose from "mongoose";

const topicScoreSchema = new mongoose.Schema({
  topic: String,
  avgScore: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
});

const activityLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["interview", "quiz", "practice", "login"] },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Stats
    interviewsCompleted: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    totalAICallsThisMonth: { type: Number, default: 0 },
    aiCallsResetAt: { type: Date, default: Date.now },

    // Streaks
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },

    // Performance
    topicScores: [topicScoreSchema],
    activityLog: [activityLogSchema],

    // Saved
    bookmarkedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

    // Payment
    razorpayCustomerId: String,
    proExpiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
