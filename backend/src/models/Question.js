import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    topics: [{ type: String }],
    description: { type: String, required: true },
    examples: [{ input: String, output: String, explanation: String }],
    constraints: [String],
    starterCode: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
    },
    testCases: [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false } }],
    hints: [String],
    solution: { javascript: String, python: String },
    acceptanceRate: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    companies: [String],
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ difficulty: 1, topics: 1 });
questionSchema.index({ slug: 1 });
questionSchema.pre("save", function (next) {
  if (!this.slug) this.slug = this.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  next();
});

export default mongoose.model("Question", questionSchema);
