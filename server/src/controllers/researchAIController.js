import Paper from "../models/Paper.js";
import { summarizePaper } from "../services/researchAIService.js";

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