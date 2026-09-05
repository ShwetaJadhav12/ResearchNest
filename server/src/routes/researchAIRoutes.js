import express from "express";
import {
  askPaperQuestion,
  askAcrossPapers,
  comparePapers,
  generatePaperSummary,
  generateLiteratureReview,
  generateAcademicWriting,
  extractComponentsAction,
} from "../controllers/researchAIController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/summarize/:paperId", protect, generatePaperSummary);
router.post("/ask/:paperId", protect, askPaperQuestion);
router.post("/ask-across", protect, askAcrossPapers);
router.post("/literature-review", protect, generateLiteratureReview);
router.post("/compare", protect, comparePapers);
router.post("/paper-writer", protect, generateAcademicWriting);
router.post("/extract-components", protect, extractComponentsAction);

export default router;
