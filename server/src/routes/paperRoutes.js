import express from "express";
import multer from "multer";

import {
  uploadPaper,
  listPapers,
  downloadPaper,
  getPaper,
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

router.get(
  "/:id",
  protect,
  getPaper
);

export default router;