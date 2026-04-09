import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { authenticate } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
router.use(authenticate);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PRO_PRICE_INR = 49900; // ₹499/month in paise

// POST /api/payments/create-order
router.post("/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: PRO_PRICE_INR,
      currency: "INR",
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id.toString() },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/payments/verify
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Activate Pro for 30 days
    const proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(req.user.id, { plan: "pro", proExpiresAt });

    res.json({ success: true, message: "Pro plan activated!", proExpiresAt });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET /api/payments/status
router.get("/status", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("plan proExpiresAt");
    const isProActive = user.plan === "pro" && user.proExpiresAt > new Date();
    if (!isProActive && user.plan === "pro") {
      await User.findByIdAndUpdate(req.user.id, { plan: "free" });
    }
    res.json({ plan: isProActive ? "pro" : "free", proExpiresAt: user.proExpiresAt });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

export default router;
