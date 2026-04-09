# 🧠 PrepGrid — AI-Powered Interview & Practice Platform

> **DevFusion Hackathon 2026 — Problem Statement #26ENPRE1**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-prepgrid.vercel.app-22D3EE?style=for-the-badge)](https://prepgrid.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-A78BFA?style=for-the-badge)](#)
[![AI Powered](https://img.shields.io/badge/AI-Claude%20Sonnet-4ADE80?style=for-the-badge)](https://anthropic.com)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

The **all-in-one placement preparation platform** for engineering students — featuring real-time AI mock interviews, instant quiz generation, adaptive coding practice, streak gamification, and a full analytics dashboard.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI Integration](#-ai-integration)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [📸 Screenshots](#-screenshots)
- [👥 Team](#-team)

---

## ✨ Features

### 🎤 AI Interview Module
- **Adaptive mock interviews** powered by Claude Sonnet (`claude-sonnet-4-20250514`)
- Role-specific questions: Frontend, Backend, Full Stack, DSA, System Design
- Real-time answer evaluation — score (0–10) + strengths + improvement tips + key missed concepts
- **Adaptive difficulty**: harder questions after strong answers (≥8), easier after weak (<5)
- Voice input via Web Speech API — answer by speaking, not just typing
- Full session history with per-round review and collapsible answer breakdown
- AI-powered **weak area detection** — flags consistently low-scoring topics across sessions

### ⚡ AI Quiz Module
- **Instant MCQ generation** on any CS topic (React Hooks, DBMS, OS Scheduling, Graph Theory…)
- Cached quiz generation — identical topic/count combos reuse results (Redis, 10 min TTL)
- 5-minute countdown timer with auto-submit on timeout
- Topic-wise result breakdown with correct answers + AI-written explanations
- **Leaderboard** showing top scorers per topic (cached, 5 min TTL)
- Short-answer mode with AI evaluation via Claude

### 💻 Coding Practice Module
- **2,400+ curated problems** across Easy / Medium / Hard — 10 sample problems seeded by default
- Topic filters: Arrays, Strings, Trees, DP, Graphs, SQL, Sorting, Recursion
- **Monaco Editor** in-browser with JavaScript, Python, Java, C++ support
- **Judge0 API** code execution against public test cases (Run) and all test cases (Submit)
- Bookmark questions and track solved/unsolved status per user
- Paginated problem list with full-text search

### 📊 User Dashboard
- Live stats: problems solved, interviews attempted, quizzes taken
- **Streak tracker** — daily login detection with current & best streak
- Weak area detection — AI analyzes topic scores across sessions and recommends study plan
- Recent interview history with score breakdown

### 💳 Payments
- **Free tier**: 5 AI interviews/month, 30 quiz generations/month, 50 problems/day
- **Pro tier** (₹499/month): Unlimited access — Razorpay sandbox checkout
- Monthly quota auto-reset, server-side enforcement
- Billing handled via Razorpay order + HMAC-SHA256 signature verification

### ⚙️ Admin Panel
- Platform analytics: users, pro conversions, interview stats, popular quiz topics
- User management: search, view activity, grant/revoke Pro
- Question bank management via REST API

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────┐
                    │          React 18 Frontend           │
                    │   Vite · Tailwind · Monaco Editor    │
                    └──────────────┬──────────────────────┘
                                   │ REST API (JWT)
                    ┌──────────────▼──────────────────────┐
                    │        Node.js / Express             │
                    │  Rate Limiting · Helmet · CORS       │
                    └───┬──────────┬───────────┬──────────┘
                        │          │           │
          ┌─────────────▼─┐  ┌─────▼─────┐ ┌─▼──────────┐
          │   MongoDB      │  │   Redis   │ │ Anthropic  │
          │  Mongoose ORM  │  │  Cache +  │ │ Claude API │
          │  5 models      │  │  Sessions │ │ (Sonnet)   │
          └────────────────┘  └───────────┘ └────────────┘
                                                  │
                                        ┌─────────▼──────┐
                                        │   Judge0 API   │
                                        │ Code Execution │
                                        └────────────────┘
```

---

## 🤖 AI Integration

All AI features use `claude-sonnet-4-20250514` via the official Anthropic SDK.

### Adaptive Interview System
```
Score ≥ 8  →  Next question: HARD
Score 5–7  →  Next question: MEDIUM
Score < 5  →  Next question: EASY
```

Every question generation avoids repeating previous questions in the session. Weak topics from the user's history seed the question generator for targeted practice.

### Evaluation Prompt Design
The evaluation prompt returns structured JSON with:
```json
{
  "score": 7,
  "feedback": "...",
  "strengths": "...",
  "improvements": "...",
  "keyMissed": "...",
  "nextDifficulty": "hard"
}
```

### Quiz Caching Strategy
```
Quiz request → Redis check → HIT: return cached questions
                           → MISS: Claude API → store in Redis (10 min TTL) → return
```

### Weak Area Detection
Aggregates per-topic average scores from `QuizAttempt` and `InterviewSession`, sends to Claude for natural language analysis and prioritized study plan generation.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Backend** | Node.js 20, Express 4, ESModules |
| **Database** | MongoDB + Mongoose (5 models, compound indexes) |
| **Cache** | Redis via ioredis (quiz cache, OTP storage, session state) |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **Code Execution** | Judge0 API via RapidAPI |
| **Payments** | Razorpay (HMAC-SHA256 signature verification) |
| **Email** | Nodemailer (OTP, welcome emails, HTML templates) |
| **Security** | Helmet, express-rate-limit (global + AI-specific), bcryptjs, JWT |
| **Deploy** | Vercel (frontend) + Railway (backend) + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas (free tier works)
- Redis (local or [Upstash](https://upstash.com) free tier)
- [Anthropic API key](https://console.anthropic.com)
- [Judge0 API key](https://rapidapi.com/judge0-official/api/judge0-ce) (100 req/day free)
- Razorpay test account (free sandbox)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-team/prepgrid.git
cd prepgrid

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

**`backend/.env`** (copy from `.env.example`):
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key_at_least_32_chars
ANTHROPIC_API_KEY=sk-ant-...
JUDGE0_API_KEY=your_rapidapi_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

**`frontend/.env`**:
```env
VITE_API_URL=http://localhost:3000/api
```

### Seed the Database

```bash
cd backend && npm run seed
# Seeds 10 sample coding problems
```

### Run Development

```bash
# Terminal 1 — Backend (port 3000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🚀

### Docker (Full Stack)

```bash
cp backend/.env.example backend/.env   # fill in your keys
docker compose up --build
```

---

## 📁 Project Structure

```
prepgrid/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Interview/
│   │   │   │   ├── InterviewModule.jsx   # Main interview UI
│   │   │   │   ├── ScoreCard.jsx         # End-of-session results
│   │   │   │   ├── SessionHistory.jsx    # Per-round mini timeline
│   │   │   │   └── VoiceInput.jsx        # Web Speech API wrapper
│   │   │   ├── Quiz/
│   │   │   │   └── QuizModule.jsx        # Quiz UI + timer + results
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx         # Stats, streaks, weak areas
│   │   │   └── UI/
│   │   │       └── Navbar.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js                # JWT auth context
│   │   │   ├── useClaudeInterview.js     # Interview state machine
│   │   │   └── useClaudeQuiz.js          # Quiz state + countdown timer
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx             # + RegisterPage export
│   │   │   ├── PracticePage.jsx          # Monaco + Judge0 integration
│   │   │   ├── PricingPage.jsx           # Razorpay checkout
│   │   │   └── AdminPage.jsx
│   │   └── App.jsx                       # Route definitions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Register, login, OTP password reset
│   │   │   ├── interviews.js    # Start, answer, history, weak-areas
│   │   │   ├── quiz.js          # Generate, submit, leaderboard, history
│   │   │   ├── questions.js     # CRUD, run code, submit code, bookmark
│   │   │   ├── payments.js      # Razorpay order, verify, status
│   │   │   └── admin.js         # Stats, user management, question CRUD
│   │   ├── models/
│   │   │   ├── User.js          # Auth, stats, streaks, topic scores
│   │   │   ├── Question.js      # Problem bank with test cases
│   │   │   └── InterviewSession.js  # + QuizAttempt model
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verify, admin guard, quota check
│   │   │   └── errorHandler.js  # Global error handler
│   │   └── utils/
│   │       ├── aiService.js     # All Claude API calls (4 functions)
│   │       ├── mailer.js        # OTP + welcome emails (HTML templates)
│   │       └── seed.js          # DB seed script
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 👥 Team

| Name | Role |
|------|------|
| Arjun Sharma | Full Stack + AI Integration |
| Priya Patel | Frontend + UI/UX |
| Rahul Verma | Backend + Database |
| Neha Singh | Prompt Engineering + Testing |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for DevFusion Hackathon 2026</strong><br/>
  <em>Problem Statement #26ENPRE1 — PrepGrid: AI-Powered Interview & Practice Platform</em><br/><br/>
  <a href="https://prepgrid.vercel.app">🌐 Live Demo</a> ·
  <a href="#-getting-started">🚀 Quick Start</a> ·
  <a href="#-ai-integration">🤖 AI Docs</a>
</div>
