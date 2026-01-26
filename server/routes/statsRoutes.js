import express from "express";
import { getStats } from "../controllers/statsController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect stats route with admin access
router.route("/").get(protect, admin, getStats);

export default router;