import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  searchResearch,
  getDiscoveryOverview,
  addDiscoveredPaperToWorkspace,
} from "../controllers/discoveryController.js";

const router = express.Router();

router.get("/search", protect, searchResearch);
router.post("/overview", protect, getDiscoveryOverview);
router.post("/add-to-workspace", protect, addDiscoveredPaperToWorkspace);

export default router;
