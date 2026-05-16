import { Router } from "express";

import {
  getDashboardStats,
  getRuleImpact,
  getStrategyPerformance,
  getWeeklyReview,
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/weekly-review", authMiddleware, getWeeklyReview);
router.get("/strategy-performance", authMiddleware, getStrategyPerformance);
router.get("/rule-impact", authMiddleware, getRuleImpact);

export default router;
