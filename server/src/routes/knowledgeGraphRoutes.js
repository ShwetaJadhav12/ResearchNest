import express from "express";

import { getKnowledgeGraph } from "../controllers/knowledgeGraphController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getKnowledgeGraph
);

export default router;