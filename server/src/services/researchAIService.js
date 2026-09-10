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

// =========================================================================
// CITATION INTEGRATION & ACADEMIC PAPER / SURVEY GENERATOR
// Supported styles: IEEE, APA 7, MLA, Chicago, Harvard, BibTeX
// Sections: Abstract, Introduction, Literature Review, Methodology, Results,
//           Discussion, Conclusion, Future Work, or Full Paper
// =========================================================================
export const generateAcademicPaperWithCitations = async ({
  papers,
  topic = "",
  section = "Full Paper",
  citationStyle = "IEEE",
  focus = "",
}) => {
  const ai = getAI();

  // Create authoritative citation source list
  const sourceCatalogue = papers.map((p, idx) => {
    const authorsStr = Array.isArray(p.authors) && p.authors.length ? p.authors.join(", ") : "Unknown Author";
    const yearStr = p.year || (p.createdAt ? new Date(p.createdAt).getFullYear() : 2024);
    const journalStr = p.journal || "Academic Repository";
    const doiStr = p.doi ? `DOI: ${p.doi}` : "";
    return {
      index: idx + 1,
      id: p._id,
      title: p.title || p.filename,
      authors: authorsStr,
      firstAuthor: authorsStr.split(",")[0].trim().split(" ").pop(),
      year: yearStr,
      journal: journalStr,
      doi: doiStr,
      abstract: p.abstract || "",
      excerpt: (p.content || "").slice(0, 4000),
    };
  });

  const prompt = `You are ResearchNest AI, an elite academic writing engine.
Your mission is to generate high-standard academic writing with RIGOROUS, ACCURATE IN-TEXT CITATIONS and a COMPLETE REFERENCE LIST based SOLELY on the supplied research papers.

TARGET SECTION: ${section}
TOPIC / TITLE: ${topic || "Academic Research Synthesis"}
FOCUS / INSTRUCTIONS: ${focus || "Comprehensive synthesis and rigorous critical analysis"}
CITATION STYLE: ${citationStyle}

SUPPLIED PAPERS CATALOGUE (Base all in-text citations and references ONLY on these):
${sourceCatalogue
  .map(
    (s) =>
      `[Ref #${s.index}] Title: "${s.title}" | Authors: ${s.authors} | Year: ${s.year} | Venue: ${s.journal} ${s.doi}\nAbstract: ${s.abstract}\nKey text: ${s.excerpt}`
  )
  .join("\n\n---\n\n")}

CRITICAL CITATION RULES:
1. CITATION STYLE IN-TEXT FORMAT:
   - If IEEE: Use numbered brackets like [1], [2], [1, 2] corresponding directly to the reference list numbers.
   - If APA 7: Use (Author, Year) or Author (Year). For 3+ authors use (Author et al., Year).
   - If MLA: Use (Author) or (Author Page).
   - If Chicago: Use (Author Year).
   - If Harvard: Use (Author, Year).
   - If BibTeX: Use \\cite{citationKey} e.g. \\cite{author2024}.
2. REFERENCE LIST:
   - Format each reference strictly according to ${citationStyle} standard conventions.
   - Do NOT invent or fabricate papers, journals, or DOIs not present in the catalogue.
   - References must correspond 1:1 to the sources cited in the prose.
3. ACADEMIC TONE:
   - Publication-ready, clear, objective, analytical.
   - If generating "Full Paper", include standard subsections (Abstract, Introduction, Literature Review, Methodology, Results & Discussion, Conclusion, Future Work).
   - If a single section is requested (e.g., "Literature Review" or "Methodology"), produce an exhaustive, deep section text with embedded citations.

Return ONLY a valid JSON object matching this schema (do not wrap in markdown fences):
{
  "title": "Clear academic title",
  "section": "${section}",
  "citationStyle": "${citationStyle}",
  "content": "The complete generated academic prose with properly formatted in-text citations...",
  "sections": [
    { "heading": "Heading Name", "body": "Prose content..." }
  ],
  "references": [
    { "index": 1, "text": "Full formatted citation string according to ${citationStyle}" }
  ],
  "bibtex": "Full @article or @inproceedings BibTeX entries for each paper cited",
  "keyTakeaways": ["Key insight 1", "Key insight 2"]
}`;

  console.log(`🤖 Generating academic writing (${section}) with ${citationStyle} citations...`);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawText = response.text?.trim() || "";
  return parseJson(rawText);
};

// =========================================================================
// DEEP COMPONENT EXTRACTION
// Extracts: datasets, methodologies, models, findings, timelines, limitations
// =========================================================================
export const extractAcademicComponents = async ({ papers, componentType = "datasets" }) => {
  const ai = getAI();

  const evidence = papers
    .map(
      (p) =>
        `PAPER: ${p.title || p.filename}\nAUTHORS: ${p.authors?.join(", ") || "Unknown"}\nABSTRACT: ${p.abstract}\nCONTENT: ${(p.content || "").slice(0, 7000)}`
    )
    .join("\n\n---\n\n");

  let prompt = "";
  switch (componentType) {
    case "datasets":
      prompt = `Extract all datasets, benchmarks, evaluation corpora, and data sources used across the papers.
Return ONLY valid JSON:
{
  "component": "datasets",
  "items": [
    {
      "name": "Dataset Name",
      "paperTitle": "Paper that used it",
      "description": "Characteristics, size, modality (text, image, tabular, etc.)",
      "benchmarkTask": "Target task or benchmark metric",
      "availability": "Public / Private / Unknown"
    }
  ],
  "synthesis": "Comparative summary of data landscape across these papers"
}
EVIDENCE:
${evidence}`;
      break;

    case "methodologies":
      prompt = `Extract and analyze all core methodologies, theoretical frameworks, and research paradigms from the papers.
Return ONLY valid JSON:
{
  "component": "methodologies",
  "items": [
    {
      "name": "Methodology Name",
      "paperTitle": "Paper",
      "type": "Empirical / Theoretical / Experimental / Survey",
      "description": "Detailed explanation of the protocol or framework",
      "novelty": "What is new or unique about this approach"
    }
  ],
  "synthesis": "Cross-study synthesis of methodological evolution"
}
EVIDENCE:
${evidence}`;
      break;

    case "models":
      prompt = `Extract all AI/ML models, neural architectures, mathematical algorithms, and baseline algorithms from the papers.
Return ONLY valid JSON:
{
  "component": "models",
  "items": [
    {
      "name": "Model or Algorithm Name",
      "paperTitle": "Paper",
      "architecture": "Transformer, CNN, GNN, Bayesian, etc.",
      "keyMechanisms": "Attention mechanisms, loss formulations, training strategies",
      "reportedPerformance": "Accuracy, F1, latency or metrics reported"
    }
  ],
  "synthesis": "Comparative analysis of model architectures"
}
EVIDENCE:
${evidence}`;
      break;

    case "timelines":
      prompt = `Synthesize a chronological research timeline tracking how the ideas and contributions evolved across these papers.
Return ONLY valid JSON:
{
  "component": "timelines",
  "items": [
    {
      "year": 2023,
      "paperTitle": "Paper",
      "milestone": "Key contribution or advance",
      "significance": "Impact on subsequent research"
    }
  ],
  "trajectory": "Overall evolution and direction of this research trajectory"
}
EVIDENCE:
${evidence}`;
      break;

    case "limitations":
      prompt = `Extract and critically synthesize all stated and unstated limitations, research gaps, and constraints across these papers.
Return ONLY valid JSON:
{
  "component": "limitations",
  "items": [
    {
      "paperTitle": "Paper",
      "limitation": "Specific constraint, bias, or computational bottleneck",
      "implication": "How this impacts real-world deployment or validity",
      "suggestedFutureWork": "Potential remedy or direction"
    }
  ],
  "synthesis": "Common unaddressed bottlenecks across the entire literature"
}
EVIDENCE:
${evidence}`;
      break;

    default:
      prompt = `Extract important findings and insights from these papers.
Return ONLY valid JSON:
{
  "component": "findings",
  "items": [
    {
      "paperTitle": "Paper",
      "finding": "Key finding",
      "evidence": "Supporting qualitative or quantitative data"
    }
  ],
  "synthesis": "Comprehensive takeaways"
}
EVIDENCE:
${evidence}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return parseJson(response.text?.trim() || "{}");
};

// =========================================================================
// AI RESEARCH DISCOVERY OVERVIEW
// Synthesizes retrieved search results into strategic academic insights
// =========================================================================
export const generateDiscoveryOverview = async ({ papers, topic }) => {
  const ai = getAI();

  const paperSummaries = papers.slice(0, 15).map((p, i) =>
    `[${i + 1}] Title: "${p.title}" (${p.year})
Authors: ${p.authors?.join(", ") || "Unknown"} | Venue: ${p.journal || "Unknown"}
Abstract: ${(p.abstract || "").slice(0, 500)}
Concepts: ${p.topics?.join(", ") || "N/A"}`
  ).join("\n\n");

  const prompt = `You are ResearchNest AI, an advanced research intelligence analyst.
Analyze the following ${papers.length} real academic research papers retrieved for the topic: "${topic}".

Generate a structured academic research intelligence overview based STRICTLY on the retrieved papers.

Return ONLY a valid JSON object matching this schema (do not wrap in markdown fences):
{
  "topic": "${topic}",
  "executiveSummary": "A concise 2-3 sentence state-of-the-art overview of this topic based on the retrieved papers.",
  "majorResearchAreas": [
    {
      "name": "Area Name",
      "description": "What this subfield explores",
      "trend": "Growing / Established / Emerging",
      "paperTitles": ["Representative Paper Title"]
    }
  ],
  "commonMethods": [
    {
      "method": "Method or Framework Name",
      "description": "How researchers utilize it in these papers"
    }
  ],
  "emergingDirections": [
    {
      "direction": "Emerging topic / hypothesis",
      "whyItMatters": "Why this is becoming important"
    }
  ],
  "importantThemes": [
    "Theme or consensus observed in the literature"
  ],
  "researchOpportunities": [
    {
      "opportunity": "Identified gap or opportunity",
      "potentialImpact": "Significance if addressed"
    }
  ]
}

RETRIEVED RESEARCH PAPERS:
${paperSummaries}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return parseJson(response.text?.trim() || "{}");
};

// =========================================================================
// AI RESEARCH GAP FINDER
// Discovers unaddressed limitations, unexplored intersections & novel frontiers
// =========================================================================
export const detectResearchGaps = async ({ papers, topic, domainFocus = "", gapType = "all" }) => {
  const ai = getAI();

  const evidence = papers
    .map((p, index) => {
      const excerpt = (p.content || p.abstract || "").slice(0, 5000);
      return `[PAPER ${index + 1}] Title: "${p.title || p.filename}" (${p.year || "Recent"})
Authors: ${p.authors?.join(", ") || "Unknown"}
Journal/Conference: ${p.journal || "N/A"}
Abstract: ${p.abstract || "N/A"}
Key Text Excerpt:
${excerpt}`;
    })
    .join("\n\n---\n\n");

  const prompt = `You are ResearchNest AI, an elite academic research methodologist and peer review expert.
Analyze the following ${papers.length} research papers to perform a rigorous Research Gap Analysis.
Topic Focus: "${topic || "Domain Overview"}"
Target Gap Dimension: "${gapType}"
Specific Domain Focus: "${domainFocus || "General Analysis"}"

Analyze the provided research papers and extract genuine, concrete, and high-value research gaps based on limitations, omitted assumptions, unaddressed questions, evaluation bottlenecks, and dataset boundaries.

Return ONLY a valid JSON object matching this schema (do NOT wrap in markdown fences or comments):
{
  "topic": "${topic || "Research Gap Analysis"}",
  "gapDimension": "${gapType}",
  "executiveLandscape": "A concise 2-3 sentence overview assessing the current frontiers, saturation points, and primary voids across these papers.",
  "gaps": [
    {
      "id": "gap-1",
      "title": "Concise, descriptive gap title",
      "category": "Methodological / Empirical & Datasets / Theoretical / Scalability & Efficiency / Real-World Translation",
      "severity": "Critical / High / Medium",
      "unaddressedQuestion": "What precise research question or hypothesis remains unanswered in existing literature?",
      "evidenceFromLiterature": "Specific limitations, performance drops, or omitted variables noted in the provided papers",
      "missingComponents": [
        "Omitted benchmark / dataset / parameter / modality"
      ],
      "recommendedApproach": "Actionable methodology, architecture, or empirical experiment recommended to resolve this gap",
      "potentialImpact": "Significance, theoretical contribution, and practical importance to researchers",
      "relevantPapers": [
        "Title of cited paper from the provided list"
      ]
    }
  ],
  "unexploredCombinations": [
    {
      "combination": "Specific synthesis of two distinct techniques, domains, or frameworks",
      "rationale": "Why these concepts have not been converged yet and what new advantage they unlock"
    }
  ],
  "proposedResearchHypotheses": [
    "Testable, falsifiable research hypothesis formulated to address the primary identified gaps",
    "Secondary novel hypothesis for high-impact grant or paper submission"
  ]
}

RESEARCH PAPERS:
${evidence}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return parseJson(response.text?.trim() || "{}");
};
