import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

async function chat(messages, systemPrompt, maxTokens = 1000) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages,
    ],
  });
  return response.choices[0].message.content.trim();
}

export async function generateInterviewQuestion({ role, difficulty, previousQuestions = [], weakTopics = [] }) {
  const previousQsText = previousQuestions.length
    ? `\nAvoid repeating these questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "";
  const weakTopicsText = weakTopics.length
    ? `\nFocus on these weak areas if possible: ${weakTopics.join(", ")}`
    : "";

  const system = `You are a senior technical interviewer at a FAANG-tier company.
Generate ONE precise, ${difficulty.toUpperCase()} difficulty technical interview question for a ${role} position.
${previousQsText}${weakTopicsText}
Rules:
- Output ONLY the question, no preamble, no numbering
- EASY: fundamentals and definitions
- MEDIUM: practical problem-solving
- HARD: system design trade-offs and advanced algorithms`;

  return await chat([{ role: "user", content: `Generate a ${difficulty} ${role} interview question.` }], system, 300);
}

export async function evaluateAnswer({ question, answer, role, difficulty }) {
  if (!answer || answer.trim().length < 10) {
    return { score: 0, feedback: "Answer too short.", strengths: "N/A", improvements: "Provide a complete answer.", nextDifficulty: "easy" };
  }

  const prompt = `You are evaluating a ${role} interview answer.
Question: "${question}"
Candidate Answer: "${answer}"
Difficulty: ${difficulty}

Return ONLY valid JSON, no markdown:
{"score":<0-10>,"feedback":"<2-3 sentences>","strengths":"<what they did well>","improvements":"<what to improve>","keyMissed":"<missed concept or null>"}`;

  const raw = await chat([{ role: "user", content: prompt }], null, 500);
  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  parsed.nextDifficulty = parsed.score >= 8 ? "hard" : parsed.score >= 5 ? "medium" : "easy";
  return parsed;
}

export async function generateQuiz({ topic, count = 5, type = "mcq" }) {
  const prompt = type === "mcq"
    ? `Generate exactly ${count} MCQ questions about "${topic}" for engineering placement prep.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"q":"<question>","opts":["<A>","<B>","<C>","<D>"],"ans":<0-3>,"explanation":"<why correct>"}]`
    : `Generate exactly ${count} short-answer questions about "${topic}".
Return ONLY a valid JSON array, no markdown:
[{"q":"<question>","sampleAnswer":"<ideal answer>","keyPoints":["<point1>","<point2>"]}]`;

  const raw = await chat([{ role: "user", content: prompt }], null, 1500);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

export async function evaluateShortAnswer({ question, answer, sampleAnswer, keyPoints }) {
  const prompt = `Evaluate this short answer.
Question: "${question}"
Student Answer: "${answer}"
Ideal Answer: "${sampleAnswer}"
Key Points: ${keyPoints.join(", ")}

Return ONLY valid JSON:
{"score":<0-10>,"covered":["<points mentioned>"],"missed":["<points missed>"],"feedback":"<brief feedback>"}`;

  const raw = await chat([{ role: "user", content: prompt }], null, 400);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

export async function detectWeakAreas({ userId, topicScores }) {
  const summary = topicScores.map((t) => `${t.topic}: avg ${t.avgScore.toFixed(1)}/10 over ${t.attempts} attempts`).join("\n");
  const prompt = `Analyze this student's performance:
${summary}

Return ONLY valid JSON:
{"weakTopics":["<topic>"],"strongTopics":["<topic>"],"recommendation":"<2-3 sentence study plan>","priorityOrder":["<topic>"]}`;

  const raw = await chat([{ role: "user", content: prompt }], null, 400);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
