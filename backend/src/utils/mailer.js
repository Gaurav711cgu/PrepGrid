import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendOTPEmail(to, otp, name) {
  await transporter.sendMail({
    from: `"PrepGrid" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your PrepGrid Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
        <h2 style="color:#22d3ee;margin:0 0 8px">PrepGrid 🧠</h2>
        <p style="color:#94a3b8;margin:0 0 24px">Hi ${name},</p>
        <p style="margin:0 0 24px">Your password reset OTP is:</p>
        <div style="text-align:center;background:#1e293b;border:2px solid #22d3ee;border-radius:12px;padding:20px;margin:0 0 24px">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#22d3ee">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:14px;margin:0">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border-color:#1e293b;margin:24px 0"/>
        <p style="color:#475569;font-size:12px;margin:0">PrepGrid — AI-Powered Interview & Practice Platform</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to, name) {
  await transporter.sendMail({
    from: `"PrepGrid" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to PrepGrid! 🚀",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px">
        <h2 style="color:#22d3ee">Welcome to PrepGrid, ${name}! 🧠</h2>
        <p>You're all set to crack your dream interview. Here's what you can do:</p>
        <ul style="color:#94a3b8;padding-left:20px">
          <li>🎤 AI adaptive mock interviews</li>
          <li>⚡ Instant quizzes on any CS topic</li>
          <li>💻 2,400+ coding problems with in-browser execution</li>
          <li>📊 Personal dashboard with streak tracking</li>
        </ul>
        <a href="${process.env.CLIENT_URL}/interview" style="display:inline-block;background:linear-gradient(to right,#06b6d4,#8b5cf6);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">
          Start Practicing →
        </a>
      </div>
    `,
  });
}
