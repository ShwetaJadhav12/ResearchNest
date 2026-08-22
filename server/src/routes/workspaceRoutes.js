import express from "express";

import {
  getMyWorkspaces,
  getWorkspacePapers,
} from "../controllers/workspaceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Get logged-in user's workspaces
router.get(
  "/",
  protect,
  getMyWorkspaces
);


// Get papers inside a workspace
router.get(
  "/:workspaceId/papers",
  protect,
  getWorkspacePapers
);


export default router;