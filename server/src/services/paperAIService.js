import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing from server/.env"
  );
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export const classifyPaperTopic = async (text) => {
  const prompt = `
You are an AI research paper organizer.

Analyze the research paper and identify its PRIMARY research topic.

Choose ONE simple workspace name.

Examples:
- Generative AI
- Medical AI
- Computer Vision
- Natural Language Processing
- Cybersecurity
- Robotics
- Data Science
- Climate Science
- Quantum Computing
- Software Engineering

Do not create a complicated hierarchy.

Return ONLY valid JSON in this exact format:

{
  "topic": "Medical AI"
}

Research paper:

${text.slice(0, 12000)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawText = response.text;

  console.log("🤖 Gemini raw response:", rawText);

  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const result = JSON.parse(cleaned);

  return result;
};