import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWorkspaceCollaborationHub,
  inviteMember,
  updateMemberRole,
  removeMember,
  postDiscussionMessage,
  updateWorkspaceProgress,
  saveWorkspaceResearch,
} from "../controllers/collaborationController.js";

const router = express.Router();

router.get("/:workspaceId/hub", protect, getWorkspaceCollaborationHub);
router.post("/:workspaceId/invite", protect, inviteMember);
router.patch("/:workspaceId/members/:memberUserId", protect, updateMemberRole);
router.delete("/:workspaceId/members/:memberUserId", protect, removeMember);
router.post("/:workspaceId/discussions", protect, postDiscussionMessage);
router.patch("/:workspaceId/progress", protect, updateWorkspaceProgress);
router.post("/:workspaceId/save-research", protect, saveWorkspaceResearch);

export default router;
