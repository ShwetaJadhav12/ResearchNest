import Paper from "../models/Paper.js";
import Workspace from "../models/Workspace.js";
import Activity from "../models/Activity.js";
import SavedResearch from "../models/SavedResearch.js";
import {
  answerAcrossPapers,
  answerFromPaper,
  compareResearchPapers,
  createLiteratureReview,
  summarizePaper,
  generateAcademicPaperWithCitations,
  extractAcademicComponents,
  detectResearchGaps,
  generateResumeImpactFromPaper,
} from "../services/researchAIService.js";

const paperFields =
  "_id filename title authors abstract content topic workspace source doi journal year citationCount createdAt";

const getUserAccessiblePapers = async (ids, userId) => {
  const userWorkspaces = await Workspace.find({
    $or: [{ createdBy: userId }, { "members.user": userId }],
  }).select("_id");
  const workspaceIds = userWorkspaces.map((w) => w._id);

  return Paper.find({
    _id: { $in: ids },
    $or: [{ uploadedBy: userId }, { workspace: { $in: workspaceIds } }],
  }).select(paperFields);
};

export const generatePaperSummary = async (req, res) => {
  try {
    const { paperId } = req.params;

    if (!paperId) {
      return res.status(400).json({
        success: false,
        message: "Paper ID is required",
      });
    }

    const papers = await getUserAccessiblePapers([paperId], req.user.id);
    const paper = papers[0];

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied.",
      });
    }

    if (!paper.content || paper.content.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "This paper does not contain enough text for AI analysis.",
      });
    }

    const summary = await summarizePaper(paper);

    return res.status(200).json({
      success: true,
      paper: {
        id: paper._id,
        title: paper.title || paper.filename,
        authors: paper.authors,
        topic: paper.topic,
      },
      summary,
    });
  } catch (error) {
    console.error("❌ AI summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI summary",
      error: error.message,
    });
  }
};

export const askPaperQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "Ask a question about the paper." });
    }

    const papers = await getUserAccessiblePapers([req.params.paperId], req.user.id);
    const paper = papers[0];

    if (!paper?.content || paper.content.trim().length < 50) {
      return res.status(404).json({ success: false, message: "Paper text is unavailable for retrieval." });
    }

    const result = await answerFromPaper(paper, question.trim());
    return res.json({ success: true, paper: { id: paper._id, title: paper.title || paper.filename }, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to answer this question." });
  }
};

export const generateLiteratureReview = async (req, res) => {
  try {
    const { paperIds = [], focus = "" } = req.body;
    if (!Array.isArray(paperIds) || paperIds.length < 2) {
      return res.status(400).json({ success: false, message: "Select at least two papers for a literature review." });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 6), req.user.id);
    if (papers.length < 2) {
      return res.status(404).json({ success: false, message: "Selected papers were not found." });
    }

    return res.json({
      success: true,
      papers: papers.map((paper) => ({ id: paper._id, title: paper.title || paper.filename })),
      review: await createLiteratureReview(papers, focus),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to generate literature review." });
  }
};

export const comparePapers = async (req, res) => {
  try {
    const { paperIds = [] } = req.body;
    if (!Array.isArray(paperIds) || paperIds.length < 2) {
      return res.status(400).json({ success: false, message: "Select at least two papers to compare." });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 4), req.user.id);
    if (papers.length < 2) {
      return res.status(404).json({ success: false, message: "Selected papers were not found." });
    }

    return res.json({ success: true, comparison: await compareResearchPapers(papers) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to compare papers." });
  }
};

export const askAcrossPapers = async (req, res) => {
  try {
    const { paperIds = [], question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "Ask a question about the selected papers." });
    }
    if (!Array.isArray(paperIds) || paperIds.length < 2) {
      return res.status(400).json({ success: false, message: "Select at least two papers for cross-paper Q&A." });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 6), req.user.id);
    if (papers.length < 2) {
      return res.status(404).json({ success: false, message: "Selected papers were not found." });
    }

    return res.json({ success: true, result: await answerAcrossPapers(papers, question.trim()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to answer across papers." });
  }
};

// =========================================================================
// ACADEMIC PAPER & SURVEY WRITER WITH CITATION STYLES
// =========================================================================
export const generateAcademicWriting = async (req, res) => {
  try {
    const {
      paperIds = [],
      topic = "",
      section = "Full Paper",
      citationStyle = "IEEE",
      focus = "",
      workspaceId,
    } = req.body;

    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one paper for academic writing generation.",
      });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 8), req.user.id);
    if (papers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected papers were not found or access was denied.",
      });
    }

    const result = await generateAcademicPaperWithCitations({
      papers,
      topic,
      section,
      citationStyle,
      focus,
    });

    // Optionally persist into workspace
    if (workspaceId) {
      try {
        await SavedResearch.create({
          workspace: workspaceId,
          user: req.user.id,
          toolType: "paper_writer",
          title: result.title || `${section} on ${topic || "Selected Papers"}`,
          citationStyle,
          targetSection: section,
          papers: papers.map((p) => p._id),
          content: result,
        });

        await Activity.create({
          workspace: workspaceId,
          user: req.user.id,
          type: "ai_generated",
          description: `${req.user.fullName || "A researcher"} generated ${section} (${citationStyle} citations) using ${papers.length} papers`,
        });
      } catch (saveErr) {
        console.warn("Saving generated research failed:", saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      writing: result,
      sourcePapers: papers.map((p) => ({
        id: p._id,
        title: p.title || p.filename,
        authors: p.authors,
        year: p.year,
      })),
    });
  } catch (error) {
    console.error("❌ Generate academic writing error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate academic writing.",
    });
  }
};

// =========================================================================
// DEEP COMPONENT EXTRACTION (Datasets, Methodologies, Models, Timelines, etc.)
// =========================================================================
export const extractComponentsAction = async (req, res) => {
  try {
    const { paperIds = [], componentType = "datasets" } = req.body;

    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one paper for component extraction.",
      });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 6), req.user.id);
    if (papers.length === 0) {
      return res.status(404).json({ success: false, message: "Selected papers were not found." });
    }

    const result = await extractAcademicComponents({
      papers,
      componentType,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Component extraction error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to extract research components.",
    });
  }
};

// =========================================================================
// RESEARCH GAP FINDER ACTION
// =========================================================================
export const findResearchGapsAction = async (req, res) => {
  try {
    const { paperIds = [], topic = "", domainFocus = "", gapType = "all", workspaceId } = req.body;

    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one research paper to analyze gaps.",
      });
    }

    const papers = await getUserAccessiblePapers(paperIds.slice(0, 8), req.user.id);
    if (papers.length === 0) {
      return res.status(404).json({ success: false, message: "Selected papers were not found." });
    }

    const result = await detectResearchGaps({
      papers,
      topic: topic.trim() || papers[0].topic || "Academic Research Field",
      domainFocus: domainFocus.trim(),
      gapType,
    });

    if (workspaceId) {
      try {
        await SavedResearch.create({
          workspace: workspaceId,
          user: req.user.id,
          toolType: "gap_finder",
          title: `Research Gaps on ${topic || papers[0].title}`,
          targetSection: "Research Gap Analysis",
          papers: papers.map((p) => p._id),
          content: result,
        });

        await Activity.create({
          workspace: workspaceId,
          user: req.user.id,
          type: "ai_generated",
          description: `${req.user.fullName || "A researcher"} discovered ${result.gaps?.length || 0} research gaps across ${papers.length} papers`,
        });
      } catch (saveErr) {
        console.warn("Saving research gaps failed:", saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: result,
      sourcePapers: papers.map((p) => ({
        id: p._id,
        title: p.title || p.filename,
        authors: p.authors,
        year: p.year,
      })),
    });
  } catch (error) {
    console.error("❌ Research gap analysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze research gaps.",
    });
  }
};

export const generateResumeImpactAction = async (req, res) => {
  try {
    const { paperId, paperIds, roleTarget, focus, workspaceId } = req.body;
    const targetIds = paperIds?.length ? paperIds : paperId ? [paperId] : [];

    if (!targetIds.length) {
      return res.status(400).json({
        success: false,
        message: "At least one paper ID is required.",
      });
    }

    const papers = await getUserAccessiblePapers(targetIds, req.user.id);
    if (!papers.length) {
      return res.status(404).json({
        success: false,
        message: "No accessible papers found.",
      });
    }

    const result = await generateResumeImpactFromPaper({
      papers,
      roleTarget: roleTarget?.trim() || "AI & Machine Learning Engineer",
      focus: focus?.trim() || "",
    });

    if (workspaceId || papers[0]?.workspace) {
      try {
        const wsId = workspaceId || papers[0].workspace;
        await SavedResearch.create({
          workspace: wsId,
          user: req.user.id,
          toolType: "resume_impact",
          title: `Resume & CV Impact: ${papers[0].title || papers[0].filename}`,
          targetSection: "Resume & Career Impact Dossier",
          papers: papers.map((p) => p._id),
          content: result,
        });

        await Activity.create({
          workspace: wsId,
          user: req.user.id,
          type: "ai_generated",
          description: `${req.user.fullName || "A researcher"} generated Career & Resume Impact Dossier for "${papers[0].title || papers[0].filename}"`,
        });
      } catch (saveErr) {
        console.warn("Saving resume impact failed:", saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: result,
      sourcePapers: papers.map((p) => ({
        id: p._id,
        title: p.title || p.filename,
        authors: p.authors,
        year: p.year,
      })),
    });
  } catch (error) {
    console.error("❌ Resume impact generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate resume impact analysis.",
    });
  }
};

