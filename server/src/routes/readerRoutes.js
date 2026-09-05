import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPaperForReader,
  streamPaperPdf,
  handleReaderAIAction,
  handleReaderChat,
  getPaperAnnotations,
  createPaperAnnotation,
  deleteAnnotation,
  updateAnnotation,
} from "../controllers/readerController.js";

const router = express.Router();

router.get("/:paperId", protect, getPaperForReader);
router.get("/:paperId/pdf", protect, streamPaperPdf);
router.post("/:paperId/ai-action", protect, handleReaderAIAction);
router.post("/:paperId/chat", protect, handleReaderChat);

// Annotations (highlights, notes, questions, ideas)
router.get("/:paperId/annotations", protect, getPaperAnnotations);
router.post("/:paperId/annotations", protect, createPaperAnnotation);
router.put("/annotations/:id", protect, updateAnnotation);
router.delete("/annotations/:id", protect, deleteAnnotation);

export default router;
