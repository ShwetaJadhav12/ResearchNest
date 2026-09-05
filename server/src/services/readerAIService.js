import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured in server/.env");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const executeReaderAIAction = async ({
  paper,
  selectedText,
  action,
  customQuestion = "",
  sectionTitle = "",
}) => {
  const ai = getAI();

  const paperContext = `
PAPER TITLE: ${paper.title || paper.filename}
AUTHORS: ${paper.authors?.join(", ") || "Unknown"}
ABSTRACT: ${paper.abstract || "Not available"}
EXCERPT FROM PAPER: ${(paper.content || "").slice(0, 15000)}
`;

  let prompt = "";
  const selectedSnippet = selectedText ? `\n\nSELECTED PASSAGE / TEXT:\n"${selectedText}"\n` : "";
  const sectionSnippet = sectionTitle ? `\nSECTION: ${sectionTitle}\n` : "";

  switch (action) {
    case "explain":
      prompt = `You are ResearchNest AI, an interactive academic reading assistant.
Explain the following highlighted passage from the paper in clear, rigorous academic terms. Explain what it means, why it matters, and how it connects to the broader research.
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "simplify":
      prompt = `You are ResearchNest AI.
Simplify the technical concepts and jargon in the highlighted passage below into plain, intuitive English. Use a helpful analogy if appropriate, but do not lose scientific accuracy.
${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "summarize":
      prompt = `You are ResearchNest AI.
Summarize the key points of the selected passage concisely. Provide 2-4 bullet points highlighting the core takeaway, empirical finding, or conceptual argument.
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "methodology":
      prompt = `You are ResearchNest AI.
Analyze and explain the methodology, model architecture, mathematical formulation, or experimental protocol described in this passage or section. Break down:
1. Core approach / model
2. Variables or setup
3. Key technical novelty
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "results":
      prompt = `You are ResearchNest AI.
Explain the experimental results, quantitative metrics, or empirical outcomes discussed in this passage. Interpret what the numbers, benchmarks, or findings demonstrate and their statistical or practical significance.
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "limitations":
      prompt = `You are ResearchNest AI.
Critique the limitations, underlying assumptions, unaddressed edge cases, or potential caveats associated with this passage or section.
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "important_points":
      prompt = `You are ResearchNest AI.
Extract and highlight the most critical insights, contributions, and definitions from the following passage:
${sectionSnippet}${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
      break;

    case "ask":
      prompt = `You are ResearchNest AI.
Answer the user's question about this paper, focusing specifically on the highlighted passage if relevant.

USER QUESTION: ${customQuestion}
${selectedSnippet}
PAPER CONTEXT:
${paperContext}

Provide a direct, evidence-based answer. If the paper does not mention it, state that explicitly.`;
      break;

    default:
      prompt = `You are ResearchNest AI.
Analyze the following text from the research paper:
${selectedSnippet}
PAPER CONTEXT:
${paperContext}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const answer = response.text?.trim();
  if (!answer) {
    throw new Error("AI did not return an explanation.");
  }

  return {
    action,
    selectedText,
    result: answer,
  };
};

export const chatWithPaper = async ({ paper, question, history = [] }) => {
  const ai = getAI();

  const formattedHistory = history
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "Researcher" : "AI"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are ResearchNest AI, an interactive academic reading partner assisting a researcher reading this paper.

PAPER TITLE: ${paper.title || paper.filename}
AUTHORS: ${paper.authors?.join(", ") || "Unknown"}
ABSTRACT: ${paper.abstract || "Not available"}

PAPER CONTENT EXCERPTS:
${(paper.content || "").slice(0, 25000)}

CONVERSATION HISTORY:
${formattedHistory}

RESEARCHER'S QUESTION:
${question}

Answer clearly, professionally, and accurately using evidence from the paper. Reference specific sections or metrics where applicable. If the paper does not contain the answer, say so honestly without hallucinating.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text?.trim() || "Unable to formulate an answer.";
};
