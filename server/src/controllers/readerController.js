import Paper from "../models/Paper.js";
import Workspace from "../models/Workspace.js";
import Annotation from "../models/Annotation.js";
import Activity from "../models/Activity.js";
import {
  executeReaderAIAction,
  chatWithPaper,
  executeDualMindDebate,
  executeFormulaXRay,
} from "../services/readerAIService.js";

// Check if user has read permission to paper (owner OR workspace member)
const verifyPaperAccess = async (paperId, userId) => {
  const paper = await Paper.findById(paperId);
  if (!paper) return null;

  if (paper.uploadedBy && String(paper.uploadedBy) === String(userId)) {
    return paper;
  }

  if (paper.workspace) {
    const workspace = await Workspace.findById(paper.workspace);
    if (workspace) {
      if (String(workspace.createdBy) === String(userId)) return paper;
      const isMember = (workspace.members || []).some(
        (m) => String(m.user) === String(userId)
      );
      if (isMember) return paper;
    }
  }

  return null;
};

// GET /api/reader/:paperId
export const getPaperForReader = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await verifyPaperAccess(paperId, req.user.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied.",
      });
    }

    const annotationsCount = await Annotation.countDocuments({
      paper: paper._id,
      $or: [{ user: req.user.id }, { isShared: true }],
    });

    let displayTitle = paper.title || paper.filename;
    if (/^(arxiv:|page\s+\d+|doi:|http|https|proceedings|journal|volume|preprint|under review)/i.test(displayTitle.trim())) {
      const lines = (paper.content || "")
        .split(/\n+/)
        .map((l) => l.trim())
        .filter((l) => l && !/^(arxiv:|page\s+\d+|doi:|http|https|proceedings|journal|volume|preprint|under review)/i.test(l));
      if (lines.length > 0 && lines[0].length <= 200) {
        displayTitle = lines[0];
      } else if (paper.filename) {
        displayTitle = paper.filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim();
      }
    }

    return res.status(200).json({
      success: true,
      paper: {
        _id: paper._id,
        filename: paper.filename,
        title: displayTitle,
        authors: paper.authors || [],
        abstract: paper.abstract || "",
        content: paper.content || "",
        topic: paper.topic || "Research",
        doi: paper.doi || "",
        journal: paper.journal || "",
        year: paper.year,
        pdfUrl: paper.pdfUrl || "",
        officialUrl: paper.officialUrl || "",
        hasPdfBinary: Boolean(paper.data && paper.data.length > 0),
        workspace: paper.workspace,
        createdAt: paper.createdAt,
        annotationsCount,
      },
    });
  } catch (error) {
    console.error("Get reader paper error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reader/:paperId/pdf - Inline PDF stream for browser PDF viewer
export const streamPaperPdf = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await verifyPaperAccess(paperId, req.user.id);

    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    if (paper.data && paper.data.length > 0) {
      res.setHeader("Content-Disposition", `inline; filename="${paper.filename || "paper.pdf"}"`);
      res.setHeader("Content-Type", paper.contentType || "application/pdf");
      res.setHeader("Cache-Control", "private, max-age=120");
      return res.send(paper.data);
    }

    // If no binary data but has direct open-access pdfUrl, redirect or proxy
    if (paper.pdfUrl) {
      return res.redirect(paper.pdfUrl);
    }

    return res.status(404).json({
      success: false,
      message: "No PDF binary or URL available for this paper.",
    });
  } catch (error) {
    console.error("Stream PDF error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reader/:paperId/ai-action
export const handleReaderAIAction = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { selectedText = "", action = "explain", customQuestion = "", sectionTitle = "" } = req.body;

    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const result = await executeReaderAIAction({
      paper,
      selectedText,
      action,
      customQuestion,
      sectionTitle,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Reader AI action error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reader/:paperId/chat
export const handleReaderChat = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { question, history = [] } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "Question is required." });
    }

    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const reply = await chatWithPaper({
      paper,
      question: question.trim(),
      history,
    });

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Reader chat error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reader/:paperId/annotations
export const getPaperAnnotations = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const annotations = await Annotation.find({
      paper: paperId,
      $or: [{ user: req.user.id }, { isShared: true }],
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      annotations,
    });
  } catch (error) {
    console.error("Get annotations error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reader/:paperId/annotations
export const createPaperAnnotation = async (req, res) => {
  try {
    const { paperId } = req.params;
    const {
      type = "highlight",
      selectedText = "",
      content = "",
      aiResponse = "",
      color = "purple",
      pageNumber = 1,
      tags = [],
      isShared = true,
    } = req.body;

    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const annotation = await Annotation.create({
      paper: paperId,
      workspace: paper.workspace,
      user: req.user.id,
      type,
      selectedText,
      content,
      aiResponse,
      color,
      pageNumber,
      tags,
      isShared,
    });

    await annotation.populate("user", "fullName email");

    // Track activity in workspace if linked
    if (paper.workspace) {
      const typeLabel =
        type === "highlight"
          ? "highlighted text in"
          : type === "note"
          ? "added a personal note to"
          : type === "idea"
          ? "saved a research idea from"
          : "asked a question on";

      await Activity.create({
        workspace: paper.workspace,
        user: req.user.id,
        type: "note_created",
        description: `${req.user.fullName || "A researcher"} ${typeLabel} "${paper.title || paper.filename}"`,
        metadata: {
          paperId: paper._id,
          annotationId: annotation._id,
          snippet: (selectedText || content).slice(0, 80),
        },
      });
    }

    return res.status(201).json({
      success: true,
      annotation,
    });
  } catch (error) {
    console.error("Create annotation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reader/annotations/:id
export const deleteAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const annotation = await Annotation.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: "Annotation not found or you do not have permission to delete it.",
      });
    }

    await Annotation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Annotation removed",
    });
  } catch (error) {
    console.error("Delete annotation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reader/annotations/:id
export const updateAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, color, tags, isShared } = req.body;

    const annotation = await Annotation.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!annotation) {
      return res.status(404).json({ success: false, message: "Annotation not found" });
    }

    if (content !== undefined) annotation.content = content;
    if (color !== undefined) annotation.color = color;
    if (tags !== undefined) annotation.tags = tags;
    if (isShared !== undefined) annotation.isShared = isShared;

    await annotation.save();

    return res.status(200).json({
      success: true,
      annotation,
    });
  } catch (error) {
    console.error("Update annotation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reader/:paperId/dual-mind-debate
export const handleDualMindDebate = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { selectedText = "", sectionTitle = "" } = req.body;

    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const debate = await executeDualMindDebate({ paper, selectedText, sectionTitle });

    return res.status(200).json({
      success: true,
      debate,
    });
  } catch (error) {
    console.error("Dual mind debate error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reader/:paperId/formula-xray
export const handleFormulaXRay = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { formulaText = "" } = req.body;

    if (!formulaText.trim()) {
      return res.status(400).json({ success: false, message: "Formula text is required." });
    }

    const paper = await verifyPaperAccess(paperId, req.user.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const xray = await executeFormulaXRay({ paper, formulaText });

    return res.status(200).json({
      success: true,
      xray,
    });
  } catch (error) {
    console.error("Formula X-Ray error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

