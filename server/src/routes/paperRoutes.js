import express from "express";
import multer from "multer";

import {
  uploadPaper,
  listPapers,
  downloadPaper,
  getPaper,
  viewPaperInline,
} from "../controllers/paperController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

// ===============================
// UPLOAD PAPER
// ===============================

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadPaper
);

// ===============================
// LIST USER'S PAPERS
// ===============================

router.get(
  "/",
  protect,
  listPapers
);

// ===============================
// DOWNLOAD PAPER
// ===============================

router.get(
  "/:id/download",
  protect,
  downloadPaper
);

// ===============================
// GET SINGLE PAPER
// Used by AI Research Assistant
// ===============================

// ===============================
// VIEW PAPER INLINE (PDF VIEWER)
// ===============================

router.get(
  "/:id/view",
  protect,
  viewPaperInline
);

router.get(
  "/:id",
  protect,
  getPaper
);

export default router;