import pdfParse from "pdf-parse";
import Paper from "../models/Paper.js";
import Workspace from "../models/Workspace.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import { extractPaperMetadataWithAI } from "../services/paperAIService.js";

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
  if (/^page\s+\d+/i.test(l) || /^arxiv[:\d\.]+/i.test(l) || /^doi:/i.test(l)) return true;
  if (/^\[?cs\.[a-z\.-]+\]?/i.test(l) || /^\d{4}\.\d{4,5}/.test(l)) return true;
  if (/^(http|https):\/\//i.test(l) || /www\./i.test(l)) return true;
  if (/^(proceedings|journal|volume|vol\.|issn|isbn|ieee|acm|springer|elsevier|nature|biorxiv|medrxiv|neurips|icml|iclr|aaai|acl|cvpr|iccv|eccv)\b/i.test(l)) return true;
  if (/^(preprint|under review|draft|working paper|technical report|research article|review article|accepted paper)\b/i.test(l)) return true;
  if (/^\d{1,4}(\/\d{1,4})?$/.test(l)) return true;
  if (/^copyright\s+/i.test(l) || /^all rights reserved/i.test(l) || /^licensed under/i.test(l)) return true;
  if (/^(department|university|faculty|school|institute|center|laboratory|inc\.|ltd\.|corp\.)\b/i.test(l)) return true;
  if (l.includes("@") || /^\d+\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i.test(l)) return true;
  return false;
};

const inferTitle = (text, filename) => {
  let cleanFilename = filename
    ? filename
        .replace(/\.pdf$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim()
    : "";

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return cleanFilename || filename;
  }

  const candidates = [];
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    if (/^(abstract|1\.?\s*introduction|background|keywords)\b/i.test(line)) break;
    if (isHeaderJunk(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 25 && line.length <= 220) {
      candidates.push(line);
    }
  }

  if (candidates.length > 0) {
    let title = candidates[0];
    if (
      candidates.length > 1 &&
      !/^(by|author|abstract|university|department|email|gmail|com|keywords|table|figure)\b/i.test(candidates[1].toLowerCase()) &&
      !candidates[1].includes("@") &&
      !isHeaderJunk(candidates[1]) &&
      candidates[0].length + candidates[1].length < 160
    ) {
      title += " " + candidates[1];
    }
    return title.replace(/\s+/g, " ").trim();
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
    candidates.every((name) => name.split(" ").length <= 5)
  ) {
    return candidates;
  }

  const authorLine = lines
    .slice(0, 8)
    .find((line) => /by\s+/i.test(line) || /author/i.test(line));

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
    return normalizeText(abstractMatch[1]).replace(/\n+/g, " ");
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(0, 5).join(" ");
};

const inferTags = (title, abstract) => {
  const combined = `${title} ${abstract}`.toLowerCase();
  const tagSet = new Set();

  keywordTagPatterns.forEach(({ pattern, tag }) => {
    if (pattern.test(combined)) {
      tagSet.add(tag);
    }
  });

  const candidates = (combined.match(/\b[a-z]{5,}\b/g) || [])
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
    tagSet.add(tag.charAt(0).toUpperCase() + tag.slice(1));
  });

  return Array.from(tagSet).slice(0, 8);
};

const inferFolder = (title, abstract) => {
  const combined = `${title} ${abstract}`;
  const match = topicFolders.find(({ pattern }) => pattern.test(combined));
  return match ? match.folder : "Research Library";
};

export const uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    const providedTitle = req.body.title?.trim();

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

    const providedFolder = req.body.folder?.trim();
    let inferredTitle = originalname;
    let inferredAuthors = [];
    let inferredAbstract = "";
    let inferredTags = [];
    let inferredFolder = "Research Library";

    let extractedContent = "";
    let aiTopic = "Research";

    if (
      mimetype === "application/pdf" ||
      originalname.toLowerCase().endsWith(".pdf")
    ) {
      const pdfText = await extractTextFromPdf(buffer);
      extractedContent = pdfText;

      if (pdfText) {
        // Fallback heuristic extraction
        inferredTitle = inferTitle(pdfText, originalname);
        inferredAuthors = inferAuthors(pdfText);
        inferredAbstract = inferAbstract(pdfText);
        inferredTags = inferTags(inferredTitle, inferredAbstract);
        inferredFolder = inferFolder(inferredTitle, inferredAbstract);

        // 🤖 Gemini AI metadata extraction (Works for IEEE, ACM, arXiv, Springer, Nature, NIPS, etc.)
        try {
          console.log("🤖 Extracting paper metadata with Gemini AI...");
          let aiMeta;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              aiMeta = await extractPaperMetadataWithAI(pdfText);
              break;
            } catch (error) {
              if (attempt === 3) throw error;
              await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
            }
          }

          if (aiMeta?.title && aiMeta.title.length > 3) {
            console.log(" Gemini extracted accurate title:", aiMeta.title);
            inferredTitle = aiMeta.title;
          }

          if (aiMeta?.authors && aiMeta.authors.length > 0) {
            inferredAuthors = aiMeta.authors;
          }

          if (aiMeta?.topic) {
            aiTopic = aiMeta.topic;
          }

          if (aiMeta?.abstract) {
            inferredAbstract = aiMeta.abstract;
          }
        } catch (error) {
          console.warn("⚠️ Gemini metadata fallback used:", error.message);
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
      }
    } catch (error) {
      console.error("Workspace creation failed:", error.message);
    }

    const title = providedTitle || inferredTitle;
    const authors = providedAuthors.length > 0 ? providedAuthors : inferredAuthors;
    const tags = providedTags.length > 0 ? providedTags : inferredTags;
    const folder = providedFolder || inferredFolder;

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

    if (paper.workspace && workspace) {
      try {
        await Activity.create({
          workspace: paper.workspace,
          user: req.user.id,
          type: "paper_added",
          description: `${req.user.fullName || "A researcher"} uploaded paper "${paper.title}"`,
          metadata: { paperId: paper._id },
        });

        // Notify workspace members
        const membersToNotify = new Set();
        if (workspace.createdBy) membersToNotify.add(String(workspace.createdBy));
        (workspace.members || []).forEach((m) => {
          if (m.user) membersToNotify.add(String(m.user));
        });
        membersToNotify.delete(String(req.user.id));

        const notifs = Array.from(membersToNotify).map((recipientId) => ({
          recipient: recipientId,
          sender: req.user.id,
          workspace: workspace._id,
          type: "paper_added",
          title: "New Paper Added",
          message: `${req.user.fullName || "A researcher"} added paper "${paper.title}" to ${workspace.name}.`,
          link: `/reader/${paper._id}`,
        }));

        if (notifs.length > 0) {
          const createdNotifs = await Notification.insertMany(notifs);
          const io = req.app.get("io");
          if (io) {
            createdNotifs.forEach((n) => {
              io.to(`user-${n.recipient}`).emit("notification", n);
            });
            io.to(`workspace-${workspace._id}`).emit("workspace-activity", {
              type: "paper_added",
              paperId: paper._id,
              title: paper.title,
            });
          }
        }
      } catch (actErr) {
        console.warn("Activity/Notification log failed:", actErr.message);
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
    console.error("Upload paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    console.error("List papers error:", error);
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
    console.error("Download paper error:", error);
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
    console.error("View paper inline error:", error);
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
    console.error("Get paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
