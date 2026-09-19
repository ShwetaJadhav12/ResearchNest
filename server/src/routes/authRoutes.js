import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/preferences", protect, updatePreferences);
router.put("/change-password", protect, changePassword);

export default router;