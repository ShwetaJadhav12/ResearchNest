import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI analysis is unavailable because GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const parseJson = (rawResponse) => {
  const cleanedResponse = rawResponse
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleanedResponse);
};

const tokens = (value = "") => new Set(String(value).toLowerCase().match(/[a-z0-9]{3,}/g) || []);

export const retrieveRelevantPassages = (content, query, limit = 5) => {
  const chunks = String(content || "").match(/.{1,1100}(?:\s|$)/gs) || [];
  const queryTokens = tokens(query);
  return chunks
    .map((text, index) => ({ index: index + 1, text: text.trim(), score: [...tokens(text)].reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0) }))
    .filter((chunk) => chunk.text.length > 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const summarizePaper = async (paper) => {
  const ai = getAI();
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
  "dataset": "The dataset, participants, or evaluation setting used",
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

  try {
    return parseJson(rawResponse);
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

export const answerFromPaper = async (paper, question) => {
  const passages = retrieveRelevantPassages(paper.content, question);
  if (!passages.length) throw new Error("No usable passages were found in this paper.");
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You answer academic questions using only the retrieved passages below. If the evidence is insufficient, say so. Return ONLY valid JSON: {"answer":"clear answer", "confidence":"high|medium|low"}.\n\nQUESTION: ${question}\n\n${passages.map((passage) => `[Passage ${passage.index}] ${passage.text}`).join("\n\n")}`,
  });
  const result = parseJson(response.text?.trim() || "");
  return { ...result, sources: passages.map(({ index, text }) => ({ passage: index, excerpt: text.slice(0, 280) })) };
};

export const createLiteratureReview = async (papers, focus) => {
  const evidence = papers.flatMap((paper) => retrieveRelevantPassages(paper.content, focus || "research contribution methodology findings limitations", 2).map((passage) => ({ title: paper.title || paper.filename, ...passage })));
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write a concise literature review using only the supplied evidence. Cite paper titles in the prose. Treat all gaps as AI-generated suggestions, not established scientific claims. Return ONLY valid JSON: {"introduction":"...", "existingApproaches":["..."], "methodologicalTrends":["..."], "keyFindings":["..."], "researchGaps":["..."], "futureDirections":["..."], "commonlyStudied":["..."], "underexplored":["..."]}.\n\nFOCUS: ${focus || "General synthesis"}\n\nEVIDENCE:\n${evidence.map((item) => `[${item.title}] ${item.text}`).join("\n\n")}`,
  });
  return parseJson(response.text?.trim() || "");
};

export const compareResearchPapers = async (papers) => {
  const evidence = papers.map((paper) => `TITLE: ${paper.title || paper.filename}\nAUTHORS: ${paper.authors?.join(", ") || "Unknown"}\nABSTRACT: ${paper.abstract || "Not available"}\nEXCERPT: ${(paper.content || "").slice(0, 4500)}`).join("\n\n---\n\n");
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Compare these academic papers using only their supplied content. Return ONLY valid JSON: {"summary":"...", "dimensions":[{"name":"Research problem", "values":[{"paper":"title", "value":"..."}]}], "takeaway":"..."}. Include exactly these dimensions when evidence exists: Research problem, Methodology, Dataset, Results, Strengths, Limitations.\n\n${evidence}`,
  });
  return parseJson(response.text?.trim() || "");
};

export const answerAcrossPapers = async (papers, question) => {
  const passages = papers.flatMap((paper) => retrieveRelevantPassages(paper.content, question, 3).map((passage) => ({ title: paper.title || paper.filename, ...passage })));
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Answer the question using only the retrieved paper passages. Compare evidence across papers when relevant and explicitly name the papers that support the answer. If evidence is insufficient, say so. Return ONLY valid JSON: {"answer":"...", "confidence":"high|medium|low"}.\n\nQUESTION: ${question}\n\n${passages.map((item) => `[${item.title}, passage ${item.index}] ${item.text}`).join("\n\n")}`,
  });
  const result = parseJson(response.text?.trim() || "");
  return { ...result, sources: passages.map(({ title, index, text }) => ({ title, passage: index, excerpt: text.slice(0, 220) })) };
};
