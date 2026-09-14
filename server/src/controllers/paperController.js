import pdfParse from "pdf-parse";
import Paper from "../models/Paper.js";
import Workspace from "../models/Workspace.js";
import Activity from "../models/Activity.js";
import { classifyPaperTopic } from "../services/paperAIService.js";

const stopWords = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "among",
  "around",
  "because",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "could",
  "during",
  "each",
  "few",
  "their",
  "there",
  "these",
  "those",
  "through",
  "under",
  "until",
  "while",
  "would",
  "with",
  "without",
  "within",
  "other",
  "which",
  "when",
  "where",
  "what",
  "who",
  "whom",
  "should",
  "from",
  "this",
  "that",
  "have",
  "has",
  "had",
  "were",
  "was",
  "been",
  "than",
  "then",
  "them",
  "they",
  "will",
  "also",
  "such",
  "into",
  "over",
  "most",
  "more",
  "can",
  "may",
  "using",
  "used",
  "use",
]);

const topicFolders = [
  {
    pattern:
      /machine learning|deep learning|neural network|computer vision|nlp|natural language processing|transformer|reinforcement learning|ai/i,
    folder: "AI & Machine Learning",
  },
  {
    pattern:
      /climate|environment|sustainability|ecology|carbon|weather|atmosphere/i,
    folder: "Climate & Environment",
  },
  {
    pattern: /robotics|automation|robot|autonomous/i,
    folder: "Robotics & Automation",
  },
  {
    pattern: /biotech|biology|genomics|medic|health|clinical/i,
    folder: "Biotech & Health",
  },
  {
    pattern: /quantum|physics|optics|photonic/i,
    folder: "Physics & Quantum",
  },
  {
    pattern:
      /policy|governance|economics|social|behavioral|ethics/i,
    folder: "Social Sciences",
  },
];

const keywordTagPatterns = [
  {
    pattern:
      /machine learning|deep learning|neural network|transformer|computer vision|nlp|natural language processing|reinforcement learning/i,
    tag: "Machine Learning",
  },
  {
    pattern: /climate|sustainability|environment|carbon|ecosystem/i,
    tag: "Climate",
  },
  {
    pattern: /robotics|automation|autonomous|sensor|actuator/i,
    tag: "Robotics",
  },
  {
    pattern: /genomics|biotech|medical|clinical|health/i,
    tag: "Biotech",
  },
  {
    pattern: /quantum|physics|optics|photonics/i,
    tag: "Physics",
  },
  {
    pattern: /policy|governance|economics|social|ethics/i,
    tag: "Social Science",
  },
  {
    pattern: /security|privacy|cryptography|blockchain/i,
    tag: "Security",
  },
  {
    pattern: /data mining|data science|analytics|visualization/i,
    tag: "Data Science",
  },
];

const normalizeText = (text = "") => {
  return String(text).replace(/\r/g, "").trim();
};

const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return normalizeText(data.text);
  } catch (error) {
    console.error("PDF text extraction failed:", error.message);
    return "";
  }
};

const isHeaderJunk = (line) => {
  if (!line || line.length < 3) return true;
  const l = line.toLowerCase();
  if (/^page\s+\d+/i.test(l) || /^arxiv:/i.test(l) || /^doi:/i.test(l)) return true;
  if (/^(http|https):\/\//i.test(l)) return true;
  if (/^(proceedings|journal|volume|vol\.|issn|isbn|ieee|acm|springer|elsevier|nature|biorxiv|medrxiv)\b/i.test(l)) return true;
  if (/^(preprint|under review|draft|working paper|technical report)\b/i.test(l)) return true;
  if (/^\d{1,4}(\/\d{1,4})?$/.test(l)) return true;
  if (/^copyright\s+/i.test(l) || /^all rights reserved/i.test(l)) return true;
  return false;
};

const inferTitle = (text, filename) => {
  let cleanFilename = filename
    ? filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim()
    : "";

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return cleanFilename || filename;
  }

  const candidates = [];
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (/^(abstract|1\.?\s*introduction|background)\b/i.test(line)) break;
    if (isHeaderJunk(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 25 && line.length <= 200) {
      candidates.push(line);
    }
  }

  if (candidates.length > 0) {
    let title = candidates[0];
    if (
      candidates.length > 1 &&
      !/^(by|author|abstract|university|department|email|gmail|com)\b/i.test(candidates[1]) &&
      !candidates[1].includes("@") &&
      candidates[0].length + candidates[1].length < 150
    ) {
      title += " " + candidates[1];
    }
    return title;
  }

  if (cleanFilename && cleanFilename.length > 3 && !/^\d+$/.test(cleanFilename)) {
    return cleanFilename;
  }

  return lines[0] || filename;
};

const inferAuthors = (text) => {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const candidates = lines[1]
    .split(/,|;| and /)
    .map((name) => name.trim())
    .filter(Boolean);

  if (
    candidates.length >= 1 &&
    candidates.every(
      (name) => name.split(" ").length <= 5
    )
  ) {
    return candidates;
  }

  const authorLine = lines
    .slice(0, 6)
    .find(
      (line) =>
        /by\s+/i.test(line) ||
        /author/i.test(line)
    );

  if (authorLine) {
    return authorLine
      .replace(/by\s+/i, "")
      .replace(/author[s]?:?/i, "")
      .split(/,|;| and /)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  return [];
};

const inferAbstract = (text) => {
  const abstractMatch = text.match(
    /abstract[:\s]*([\s\S]{20,900}?)(?=\n\s*\n|introduction|1\.|keywords\s*:)/i
  );

  if (abstractMatch) {
    return normalizeText(abstractMatch[1])
      .replace(/\n+/g, " ");
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(0, 5).join(" ");
};

const inferTags = (title, abstract) => {
  const combined =
    `${title} ${abstract}`.toLowerCase();

  const tagSet = new Set();

  keywordTagPatterns.forEach(({ pattern, tag }) => {
    if (pattern.test(combined)) {
      tagSet.add(tag);
    }
  });

  const candidates = (
    combined.match(/\b[a-z]{5,}\b/g) || []
  )
    .filter((word) => !stopWords.has(word))
    .reduce((count, word) => {
      count[word] = (count[word] || 0) + 1;
      return count;
    }, {});

  const sorted = Object.entries(candidates)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !tagSet.has(word))
    .slice(0, 6);

  sorted.forEach((tag) => {
    tagSet.add(
      tag.charAt(0).toUpperCase() + tag.slice(1)
    );
  });

  return Array.from(tagSet).slice(0, 8);
};

const inferFolder = (title, abstract) => {
  const combined = `${title} ${abstract}`;

  const match = topicFolders.find(({ pattern }) =>
    pattern.test(combined)
  );

  return match
    ? match.folder
    : "Research Library";
};

export const uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const {
      originalname,
      mimetype,
      size,
      buffer,
    } = req.file;

    const providedTitle =
      req.body.title?.trim();

    const providedAuthors = req.body.authors
      ? Array.isArray(req.body.authors)
        ? req.body.authors
        : String(req.body.authors)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

    const providedTags = req.body.tags
      ? Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

    const providedFolder =
      req.body.folder?.trim();
let inferredTitle = originalname;
let inferredAuthors = [];
let inferredAbstract = "";
let inferredTags = [];
let inferredFolder = "Research Library";

// 📄 Full extracted PDF text
let extractedContent = "";

// 🤖 AI topic
let aiTopic = "Research";

    /*
     * PDF PROCESSING
     */
    if (
      mimetype === "application/pdf" ||
      originalname
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      console.log(
        `📄 Processing PDF: ${originalname}`
      );

      const pdfText =
        await extractTextFromPdf(buffer);
        extractedContent = pdfText;

      if (pdfText) {
        console.log(
          `📝 Extracted ${pdfText.length} characters`
        );

        /*
         * Existing metadata extraction
         */
        inferredTitle = inferTitle(
          pdfText,
          originalname
        );

        inferredAuthors =
          inferAuthors(pdfText);

        inferredAbstract =
          inferAbstract(pdfText);

        inferredTags = inferTags(
          inferredTitle,
          inferredAbstract
        );

        inferredFolder = inferFolder(
          inferredTitle,
          inferredAbstract
        );

        /*
         * 🤖 GEMINI TOPIC CLASSIFICATION
         */
        try {
  console.log("🤖 Asking Gemini to classify paper...");

  let aiResult;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      aiResult = await classifyPaperTopic(pdfText);
      break;
    } catch (error) {
      console.log(
        `⚠️ Gemini attempt ${attempt} failed`
      );

      if (attempt === 3) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 * attempt)
      );
    }
  }

  aiTopic = aiResult?.topic || "Research";

  console.log(
    "🤖 AI detected topic:",
    aiTopic
  );

} catch (error) {

  console.error(
    "❌ AI classification failed after retries:",
    error.message
  );

  aiTopic = inferredFolder || "Research";
}
      }
    }
    let workspace = null;

try {
  workspace = await Workspace.findOne({
    name: aiTopic,
    createdBy: req.user.id,
  });

  if (!workspace) {
    workspace = await Workspace.create({
      name: aiTopic,
      topic: aiTopic,
      description: `Research papers related to ${aiTopic}`,
      createdBy: req.user.id,
    });

    console.log(
      "📁 Created workspace:",
      workspace.name
    );
  } else {
    console.log(
      "📁 Using existing workspace:",
      workspace.name
    );
  }
} catch (error) {
  console.error(
    "❌ Workspace creation failed:",
    error.message
  );
}

    /*
     * FINAL PAPER VALUES
     */
    const title =
      providedTitle || inferredTitle;

    const authors =
      providedAuthors.length > 0
        ? providedAuthors
        : inferredAuthors;

    const tags =
      providedTags.length > 0
        ? providedTags
        : inferredTags;

    const folder =
      providedFolder || inferredFolder;

    /*
     * SAVE PAPER
     */
    const paper = await Paper.create({
      filename: originalname,
      title,
      authors,
      tags,
      abstract: inferredAbstract,
      content: extractedContent,
      contentType: mimetype,
      size,
      data: buffer,
      folder,
      topic: aiTopic,
      uploadedBy: req.user.id,
      workspace: workspace?._id || null,
    });


    console.log(
      "✅ Paper saved:",
      paper.title
    );

    if (paper.workspace) {
      try {
        await Activity.create({
          workspace: paper.workspace,
          user: req.user.id,
          type: "paper_added",
          description: `${req.user.fullName || "A researcher"} uploaded paper "${paper.title}"`,
          metadata: { paperId: paper._id },
        });
      } catch (actErr) {
        console.warn("Activity log failed:", actErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Paper uploaded successfully",
      paper: {
        id: paper._id,
        filename: paper.filename,
        title: paper.title,
        authors: paper.authors,
        tags: paper.tags,
        abstract: paper.abstract,
        topic: paper.topic,
        size: paper.size,
        folder: paper.folder,
        uploadedAt: paper.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "❌ Upload paper error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

export const listPapers = async (req, res) => {
  try {
    const userWorkspaces = await Workspace.find({
      $or: [{ createdBy: req.user.id }, { "members.user": req.user.id }],
    }).select("_id");
    const workspaceIds = userWorkspaces.map((w) => w._id);

    const papers = await Paper.find({
      $or: [
        { uploadedBy: req.user.id },
        { workspace: { $in: workspaceIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .select(
        "_id filename title authors tags abstract size folder topic workspace source doi journal year citationCount pdfUrl createdAt"
      );

    return res.status(200).json({
      success: true,
      papers,
    });
  } catch (error) {
    console.error("❌ List papers error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const checkPaperAccess = async (paperId, userId) => {
  const paper = await Paper.findById(paperId);
  if (!paper) return null;

  if (paper.uploadedBy && String(paper.uploadedBy) === String(userId)) {
    return paper;
  }

  if (paper.workspace) {
    const ws = await Workspace.findById(paper.workspace);
    if (ws) {
      if (String(ws.createdBy) === String(userId)) return paper;
      const isMember = (ws.members || []).some(
        (m) => String(m.user) === String(userId)
      );
      if (isMember) return paper;
    }
  }

  return null;
};

export const downloadPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await checkPaperAccess(id, req.user.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied.",
      });
    }

    if (!paper.data || paper.data.length === 0) {
      if (paper.pdfUrl) {
        return res.redirect(paper.pdfUrl);
      }
      return res.status(404).json({
        success: false,
        message: "PDF data not available for download.",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.filename || "paper.pdf"}"`
    );

    res.setHeader(
      "Content-Type",
      paper.contentType || "application/pdf"
    );

    return res.send(paper.data);
  } catch (error) {
    console.error("❌ Download paper error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const viewPaperInline = async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await checkPaperAccess(id, req.user.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied.",
      });
    }

    if (!paper.data || paper.data.length === 0) {
      if (paper.pdfUrl) {
        return res.redirect(paper.pdfUrl);
      }
      return res.status(404).json({
        success: false,
        message: "PDF data not available.",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${paper.filename || "paper.pdf"}"`
    );

    res.setHeader(
      "Content-Type",
      paper.contentType || "application/pdf"
    );

    return res.send(paper.data);
  } catch (error) {
    console.error("❌ View paper inline error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await checkPaperAccess(id, req.user.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      paper: {
        _id: paper._id,
        filename: paper.filename,
        title: paper.title,
        authors: paper.authors,
        tags: paper.tags,
        abstract: paper.abstract,
        content: paper.content,
        topic: paper.topic,
        workspace: paper.workspace,
        source: paper.source,
        doi: paper.doi,
        journal: paper.journal,
        year: paper.year,
        citationCount: paper.citationCount,
        pdfUrl: paper.pdfUrl,
        hasPdfBinary: Boolean(paper.data && paper.data.length > 0),
        createdAt: paper.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Get paper error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
