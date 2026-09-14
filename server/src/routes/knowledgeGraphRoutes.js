import express from "express";
import { getKnowledgeGraph } from "../controllers/knowledgeGraphController.js";
import { getResearchHorizonData } from "../controllers/researchHorizonController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getKnowledgeGraph);
router.get("/horizon", protect, getResearchHorizonData);

export default router;