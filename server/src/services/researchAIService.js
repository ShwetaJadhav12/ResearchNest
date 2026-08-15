import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from server/.env");
}

const ai = new GoogleGenAI({
  apiKey,
});

export const summarizePaper = async (paper) => {
  const prompt = `
You are ResearchNest AI, an academic research assistant.

Analyze the research paper below and create a structured research summary.

IMPORTANT:
- Use ONLY information contained in the provided paper.
- Do not invent results, datasets, methods, or conclusions.
- Keep the language clear and suitable for a student/researcher.
- Return ONLY valid JSON.
- Do not wrap the JSON in markdown or code fences.

Return exactly this structure:

{
  "tldr": "A concise 2-3 sentence overview",
  "researchProblem": "The main research problem",
  "methodology": "The methodology or approach used",
  "keyFindings": [
    "Important finding 1",
    "Important finding 2",
    "Important finding 3"
  ],
  "limitations": [
    "Important limitation 1",
    "Important limitation 2"
  ],
  "conclusion": "The main conclusion of the research"
}

PAPER TITLE:
${paper.title || paper.filename}

AUTHORS:
${paper.authors?.join(", ") || "Not available"}

ABSTRACT:
${paper.abstract || "Not available"}

PAPER CONTENT:
${paper.content.slice(0, 30000)}
`;

  console.log("🤖 Sending paper to Gemini for summarization...");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawResponse = response.text?.trim();

  if (!rawResponse) {
    throw new Error("Gemini returned an empty response");
  }

  console.log("🤖 Gemini summary received");

  const cleanedResponse = rawResponse
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error(
      "❌ Failed to parse Gemini response:",
      rawResponse
    );

    throw new Error(
      "Gemini returned an invalid summary format"
    );
  }
};