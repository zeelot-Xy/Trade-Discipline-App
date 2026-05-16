import { prisma } from "../prisma/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildDashboardStats } from "../services/dashboardService.js";
import { buildRuleImpactReport } from "../services/ruleImpactService.js";
import { buildWeeklyReview } from "../services/weeklyReviewService.js";
import { buildStrategyPerformanceReport } from "../services/strategyPerformanceService.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.user.id },
    orderBy: { tradeDate: "asc" },
  });

  const stats = buildDashboardStats(trades);

  res.json({
    success: true,
    data: stats,
  });
});

export const getWeeklyReview = asyncHandler(async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.user.id },
    orderBy: { tradeDate: "asc" },
  });

  const review = buildWeeklyReview(trades, req.user.planType);

  res.json({
    success: true,
    data: review,
  });
});

export const getStrategyPerformance = asyncHandler(async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.user.id },
    orderBy: { tradeDate: "asc" },
  });

  const report = buildStrategyPerformanceReport(trades, req.user.planType);

  res.json({
    success: true,
    data: report,
  });
});

export const getRuleImpact = asyncHandler(async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.user.id },
    orderBy: { tradeDate: "asc" },
  });

  const report = buildRuleImpactReport(trades, req.user.planType);

  res.json({
    success: true,
    data: report,
  });
});
