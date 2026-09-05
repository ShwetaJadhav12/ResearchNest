import express from "express";
import {
  getMyWorkspaces,
  getWorkspacePapers,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyWorkspaces);
router.post("/", protect, createWorkspace);
router.get("/:workspaceId/papers", protect, getWorkspacePapers);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);

export default router;