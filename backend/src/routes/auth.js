import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redis } from "../app.js";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, plan: "free" } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid email or password" });

    // Streak tracking
    const today = new Date().toDateString();
    const lastLogin = user.lastLoginDate?.toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastLogin !== today) {
      user.currentStreak = lastLogin === yesterday ? user.currentStreak + 1 : 1;
      user.bestStreak = Math.max(user.bestStreak || 0, user.currentStreak);
      user.lastLoginDate = new Date();
      await user.save();
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, streak: user.currentStreak },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always respond 200 to prevent email enumeration
    if (!user) return res.json({ message: "If this email exists, an OTP has been sent." });

    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.setex(`otp:${email}`, 600, otp); // 10 min TTL

    await sendOTPEmail(email, otp, user.name);
    res.json({ message: "If this email exists, an OTP has been sent." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "Missing fields" });

    const stored = await redis.get(`otp:${email}`);
    if (!stored || stored !== otp) return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashed });
    await redis.del(`otp:${email}`);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
