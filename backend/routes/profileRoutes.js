import express from "express";
import {
  saveCollege,
  removeCollege,
  getProfile,
  getRecommendations,
} from "../controllers/profileController.js";

const router = express.Router();

// Save college
router.post("/save", saveCollege);

// Remove college
router.post("/remove", removeCollege);

// Get user profile
router.get("/:userId", getProfile);

// Get recommendations
router.get("/recommend/:userId", getRecommendations);

export default router;