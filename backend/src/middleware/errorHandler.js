export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.method}] ${req.path} — ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }

  // JWT errors handled in middleware/auth.js
  res.status(status).json({ error: message });
}
