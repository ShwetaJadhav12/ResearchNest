import express from "express";

import {
  askPaperQuestion,
  askAcrossPapers,
  comparePapers,
  generatePaperSummary,
  generateLiteratureReview,
} from "../controllers/researchAIController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/summarize/:paperId",
  protect,
  generatePaperSummary
);
router.post("/ask/:paperId", protect, askPaperQuestion);
router.post("/ask-across", protect, askAcrossPapers);
router.post("/literature-review", protect, generateLiteratureReview);
router.post("/compare", protect, comparePapers);

export default router;
