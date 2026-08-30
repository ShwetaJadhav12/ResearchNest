import Paper from "../models/Paper.js";
import { answerAcrossPapers, answerFromPaper, compareResearchPapers, createLiteratureReview, summarizePaper } from "../services/researchAIService.js";

const paperFields = "_id filename title authors abstract content topic";
const getUserPapers = (ids, userId) => Paper.find({ _id: { $in: ids }, uploadedBy: userId }).select(paperFields);

export const generatePaperSummary = async (req, res) => {
  try {
    const { paperId } = req.params;

    if (!paperId) {
      return res.status(400).json({
        success: false,
        message: "Paper ID is required",
      });
    }

    console.log("🔍 Finding paper:", paperId);

    // Only allow the logged-in user to access their own paper
    const paper = await Paper.findOne({
      _id: paperId,
      uploadedBy: req.user.id,
    }).select(
      "_id filename title authors abstract content topic"
    );

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    if (
      !paper.content ||
      paper.content.trim().length < 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This paper does not contain enough extracted text for AI analysis.",
      });
    }

    console.log(
      "🧠 Generating AI summary:",
      paper.title || paper.filename
    );

    const summary = await summarizePaper(paper);

    console.log("✅ AI summary generated");

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
    if (!question?.trim()) return res.status(400).json({ success: false, message: "Ask a question about the paper." });
    const paper = await Paper.findOne({ _id: req.params.paperId, uploadedBy: req.user.id }).select(paperFields);
    if (!paper?.content || paper.content.trim().length < 100) return res.status(404).json({ success: false, message: "Paper text is unavailable for retrieval." });
    const result = await answerFromPaper(paper, question.trim());
    return res.json({ success: true, paper: { id: paper._id, title: paper.title || paper.filename }, result });
  } catch (error) { return res.status(500).json({ success: false, message: error.message || "Unable to answer this question." }); }
};

export const generateLiteratureReview = async (req, res) => {
  try {
    const { paperIds = [], focus = "" } = req.body;
    if (!Array.isArray(paperIds) || paperIds.length < 2) return res.status(400).json({ success: false, message: "Select at least two papers for a literature review." });
    const papers = await getUserPapers(paperIds.slice(0, 6), req.user.id);
    if (papers.length < 2) return res.status(404).json({ success: false, message: "Selected papers were not found." });
    return res.json({ success: true, papers: papers.map((paper) => ({ id: paper._id, title: paper.title || paper.filename })), review: await createLiteratureReview(papers, focus) });
  } catch (error) { return res.status(500).json({ success: false, message: error.message || "Unable to generate literature review." }); }
};

export const comparePapers = async (req, res) => {
  try {
    const { paperIds = [] } = req.body;
    if (!Array.isArray(paperIds) || paperIds.length < 2) return res.status(400).json({ success: false, message: "Select at least two papers to compare." });
    const papers = await getUserPapers(paperIds.slice(0, 4), req.user.id);
    if (papers.length < 2) return res.status(404).json({ success: false, message: "Selected papers were not found." });
    return res.json({ success: true, comparison: await compareResearchPapers(papers) });
  } catch (error) { return res.status(500).json({ success: false, message: error.message || "Unable to compare papers." }); }
};

export const askAcrossPapers = async (req, res) => {
  try {
    const { paperIds = [], question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, message: "Ask a question about the selected papers." });
    if (!Array.isArray(paperIds) || paperIds.length < 2) return res.status(400).json({ success: false, message: "Select at least two papers for cross-paper Q&A." });
    const papers = await getUserPapers(paperIds.slice(0, 6), req.user.id);
    if (papers.length < 2) return res.status(404).json({ success: false, message: "Selected papers were not found." });
    return res.json({ success: true, result: await answerAcrossPapers(papers, question.trim()) });
  } catch (error) { return res.status(500).json({ success: false, message: error.message || "Unable to answer across papers." }); }
};
