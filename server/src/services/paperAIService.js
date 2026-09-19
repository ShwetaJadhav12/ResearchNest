import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from server/.env");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export const classifyPaperTopic = async (text) => {
  return extractPaperMetadataWithAI(text);
};

export const extractPaperMetadataWithAI = async (text) => {
  const prompt = `
You are an expert AI research paper metadata extractor.

Analyze the research paper text below and extract:
1. "title": The EXACT, complete title of the paper. Ignore journal headers, page numbers, arXiv IDs, copyright lines, proceedings banners, or conference names.
2. "authors": An array of author full names (strings).
3. "topic": Primary research topic (choose ONE simple workspace name, e.g. "Generative AI", "Computer Vision", "Natural Language Processing", "Medical AI", "Robotics", "Cybersecurity", "Data Science", "Climate Science", "Quantum Computing", "Software Engineering").
4. "abstract": A concise 2-3 sentence abstract summary if available.

Return ONLY valid JSON in this exact structure:

{
  "title": "Attention Is All You Need",
  "authors": ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
  "topic": "Natural Language Processing",
  "abstract": "We propose the Transformer, a novel neural network architecture based solely on attention mechanisms..."
}

Research paper snippet:

${text.slice(0, 10000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text;
    console.log("🤖 Gemini metadata response:", rawText);

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    return {
      title: result.title?.trim() || "",
      authors: Array.isArray(result.authors) ? result.authors : [],
      topic: result.topic?.trim() || "Research",
      abstract: result.abstract?.trim() || "",
    };
  } catch (error) {
    console.error("❌ AI metadata extraction error:", error.message);
    return {
      title: "",
      authors: [],
      topic: "Research",
      abstract: "",
    };
  }
};