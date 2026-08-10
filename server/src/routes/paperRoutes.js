import express from "express";
import multer from "multer";
import { uploadPaper, listPapers, downloadPaper } from "../controllers/paperController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadPaper);
router.get("/", listPapers);
router.get("/:id/download", downloadPaper);

export default router;
