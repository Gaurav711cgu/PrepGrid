import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("id plan role totalAICallsThisMonth aiCallsResetAt");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired" });
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

// Quota check: free tier limits
const FREE_LIMITS = { interview: 5, quiz: 30 }; // per month
const PRO_LIMITS = { interview: Infinity, quiz: Infinity };

export function checkQuota(type) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (user.plan === "pro") return next();

      // Reset monthly counter if needed
      const now = new Date();
      const resetMonth = user.aiCallsResetAt?.getMonth();
      if (resetMonth !== now.getMonth()) {
        await User.findByIdAndUpdate(user.id, { totalAICallsThisMonth: 0, aiCallsResetAt: now });
        user.totalAICallsThisMonth = 0;
      }

      const limit = FREE_LIMITS[type] || 10;
      if (user.totalAICallsThisMonth >= limit) {
        return res.status(429).json({
          error: `Free tier limit reached (${limit} ${type}s/month). Upgrade to Pro for unlimited access.`,
          upgradeUrl: "/pricing",
        });
      }

      await User.findByIdAndUpdate(user.id, { $inc: { totalAICallsThisMonth: 1 } });
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
}
