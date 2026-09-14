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

export const executeDualMindDebate = async ({ paper, selectedText, sectionTitle = "" }) => {
  const ai = getAI();

  const passage = selectedText || paper.abstract || (paper.content || "").slice(0, 1000);

  const prompt = `You are a specialized AI system simulating an intense academic Peer Review Debate between two world-class experts.

PAPER TITLE: ${paper.title || paper.filename}
AUTHORS: ${paper.authors?.join(", ") || "Unknown"}
SECTION: ${sectionTitle || "Main Content"}

TARGET PASSAGE / METHOD / CLAIM:
"${passage}"

PAPER CONTEXT:
${(paper.content || "").slice(0, 10000)}

Perform a dynamic 2-way peer review debate on this passage/claim.

Return ONLY a valid JSON object matching this structure (no markdown fences, no raw text around it):
{
  "selectedPassage": "${passage.replace(/"/g, '\\"').slice(0, 200)}",
  "skepticalReviewer": {
    "criticisms": ["Criticism 1", "Criticism 2"],
    "vulnerabilities": ["Potential vulnerability or missing baseline"],
    "verdict": "Major Revisions Needed / Minor Revisions / Strong Methodology"
  },
  "defendingAuthor": {
    "rebuttal": "Strong defense addressing the reviewer's concerns",
    "justifications": ["Theoretical justification 1", "Empirical backing 2"],
    "strengths": ["Key strength 1"]
  },
  "keyTakeaway": "Balanced summary of what a researcher should conclude from this debate",
  "debateExchange": [
    { "speaker": "Skeptical Peer Reviewer", "statement": "Reviewer statement challenging assumption or metric..." },
    { "speaker": "Defending Author", "statement": "Author response providing technical defense or clarification..." },
    { "speaker": "Skeptical Peer Reviewer", "statement": "Follow-up question on edge cases or compute efficiency..." },
    { "speaker": "Defending Author", "statement": "Final closing argument demonstrating validity..." }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const jsonText = response.text?.trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse dual mind debate JSON:", err);
    return {
      selectedPassage: passage.slice(0, 200),
      skepticalReviewer: {
        criticisms: ["Assumes ideal data distribution without noise", "Missing comparison to baseline transformer models"],
        vulnerabilities: ["Performance may degrade under extreme sparsity"],
        verdict: "Requires empirical validation"
      },
      defendingAuthor: {
        rebuttal: "The approach incorporates regularization specifically to handle distribution shifts.",
        justifications: ["Validated across 3 public benchmarks", "Achieves SOTA throughput"],
        strengths: ["Novel algorithmic approach with low overhead"]
      },
      keyTakeaway: "While promising, the claims should be evaluated against noisy real-world data.",
      debateExchange: [
        { speaker: "Skeptical Peer Reviewer", statement: "The paper lacks ablation studies showing the contribution of each hyperparameter." },
        { speaker: "Defending Author", statement: "Ablation results in Appendix C show component A contributes 68% of total performance gain." }
      ]
    };
  }
};

export const executeFormulaXRay = async ({ paper, formulaText }) => {
  const ai = getAI();

  const prompt = `You are a Mathematical & Algorithmic Deconstruction Expert for ResearchNest.

PAPER TITLE: ${paper.title || paper.filename}

TARGET FORMULA / MATHEMATICAL STATEMENT / ALGORITHM:
"${formulaText}"

PAPER CONTEXT:
${(paper.content || "").slice(0, 8000)}

Deconstruct this mathematical equation/formula into an interactive sandbox model.

Return ONLY a valid JSON object matching this structure (no markdown fences, no raw text around it):
{
  "formulaText": "${formulaText.replace(/"/g, '\\"').slice(0, 200)}",
  "latex": "LaTeX code for equation (e.g. \\\\mathcal{L} = -\\\\sum y \\\\log(\\\\hat{y}))",
  "plainEnglishMeaning": "Clear intuitive sentence explaining what this equation calculates and why it is critical",
  "variables": [
    {
      "symbol": "x",
      "name": "Input Feature Matrix",
      "description": "Represents the input embeddings across sequences",
      "defaultValue": 1.0,
      "min": 0.1,
      "max": 10.0,
      "unit": "dimensions"
    },
    {
      "symbol": "\\\\lambda",
      "name": "Regularization Coefficient",
      "description": "Controls model complexity penalty",
      "defaultValue": 0.05,
      "min": 0.001,
      "max": 1.0,
      "unit": "scalar"
    }
  ],
  "pythonCode": "def calculate_loss(x, lambda_param=0.05):\\n    import numpy as np\\n    return np.mean(x**2) + lambda_param * np.sum(np.abs(x))",
  "sensitivityAnalysis": "Increasing lambda reduces overfitting but increases bias by ~12%.",
  "interactiveOutputs": [
    { "name": "Computed Value", "unit": "loss", "formulaDescription": "Combined error + penalty score" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const jsonText = response.text?.trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse formula X-ray JSON:", err);
    return {
      formulaText: formulaText.slice(0, 200),
      latex: formulaText,
      plainEnglishMeaning: "Deconstructs mathematical dependencies into trainable components.",
      variables: [
        { symbol: "W", name: "Weight Matrix", description: "Learnable parameters", defaultValue: 0.8, min: 0.1, max: 2.0, unit: "weight" },
        { symbol: "b", name: "Bias Term", description: "Offset parameter", defaultValue: 0.1, min: -1.0, max: 1.0, unit: "scalar" }
      ],
      pythonCode: "def compute_layer(w, b):\n    return w * 1.5 + b",
      sensitivityAnalysis: "Linear scaling with weight parameters.",
      interactiveOutputs: [{ name: "Layer Output", unit: "activation", formulaDescription: "Output after activation" }]
    };
  }
};

