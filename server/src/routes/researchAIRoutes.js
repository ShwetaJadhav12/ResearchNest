import express from "express";

import {
  generatePaperSummary,
} from "../controllers/researchAIController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/summarize/:paperId",
  protect,
  generatePaperSummary
);

export default router;