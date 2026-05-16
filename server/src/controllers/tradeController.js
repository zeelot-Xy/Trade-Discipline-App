import { prisma } from "../prisma/prisma.js";
import { createTradeSchema, updateTradeSchema } from "../validators/tradeValidators.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serializeTrade } from "../utils/serializeTrade.js";
import { getUsageSummaryForUser } from "../services/usageService.js";
import { calculateDisciplineSnapshot } from "../services/disciplineService.js";
import {
  deleteTradeScreenshots,
  persistTradeScreenshots,
} from "../services/screenshotService.js";

const parseNumberField = (value) => (value === undefined ? undefined : value);

const assertProfitLossMatchesResult = (result, profitLoss) => {
  if (result === "WIN" && profitLoss !== undefined && profitLoss <= 0) {
    throw new AppError("Winning trades must have a positive profit/loss value.");
  }

  if (result === "LOSS" && profitLoss !== undefined && profitLoss >= 0) {
    throw new AppError("Losing trades must have a negative profit/loss value.");
  }

  if (result === "BREAKEVEN" && profitLoss !== undefined && profitLoss !== 0) {
    throw new AppError("Breakeven trades should have a profit/loss of 0.");
  }
};

const ensureScreenshotPlanAccess = (planType, payload) => {
  const hasScreenshotMutation =
    payload.beforeTradeScreenshot ||
    payload.afterTradeScreenshot ||
    payload.removeBeforeTradeScreenshot ||
    payload.removeAfterTradeScreenshot;

  if (hasScreenshotMutation && planType !== "PRO") {
    throw new AppError("Screenshot uploads are available on the Pro plan.", 403, {
      code: "SCREENSHOTS_PRO_ONLY",
    });
  }
};

export const createTrade = asyncHandler(async (req, res) => {
  const payload = createTradeSchema.parse(req.body);
  const usage = await getUsageSummaryForUser(req.user.id, req.user.planType);
  ensureScreenshotPlanAccess(req.user.planType, payload);

  if (!usage.canCreateTrade) {
    throw new AppError(
      "You have reached the 25-trade free limit. Upgrade to continue saving trades.",
      403,
      {
        code: "TRADE_LIMIT_REACHED",
        data: { usage },
      },
    );
  }

  assertProfitLossMatchesResult(payload.result, payload.profitLoss);

  const discipline = calculateDisciplineSnapshot({
    confluenceScore: payload.confluenceScore,
    checklistSnapshot: payload.checklistSnapshot,
    direction: payload.direction,
    entryPrice: payload.entryPrice,
    stopLoss: payload.stopLoss,
    takeProfit: payload.takeProfit,
    riskAmount: payload.riskAmount,
    emotionBefore: payload.emotionBefore,
    status: payload.status || "OPEN",
    result: payload.result,
    profitLoss: payload.profitLoss,
    emotionAfter: payload.emotionAfter,
    notes: payload.notes,
    mistakeTags: payload.mistakeTags || [],
  });

  let trade;

  try {
    trade = await prisma.trade.create({
      data: {
        userId: req.user.id,
        entrySource: "MANUAL",
        strategyKey: payload.strategyKey || null,
        tradingViewUrl: payload.tradingViewUrl || null,
        symbol: payload.symbol || null,
        direction: payload.direction || null,
        entryPrice: parseNumberField(payload.entryPrice),
        stopLoss: parseNumberField(payload.stopLoss),
        takeProfit: parseNumberField(payload.takeProfit),
        riskAmount: parseNumberField(payload.riskAmount),
        rewardAmount: parseNumberField(payload.rewardAmount),
        profitLoss: parseNumberField(payload.profitLoss),
        status: payload.status || "OPEN",
        result: payload.result || null,
        confluenceScore: payload.confluenceScore,
        disciplineScore: discipline.score,
        disciplineSummary: discipline.summary,
        setupQuality: payload.setupQuality,
        checklistSnapshot: payload.checklistSnapshot,
        mistakeTags: payload.mistakeTags || [],
        notes: payload.notes || null,
        emotionBefore: payload.emotionBefore || null,
        emotionAfter: payload.emotionAfter || null,
        tradeDate: payload.tradeDate ? new Date(payload.tradeDate) : new Date(),
      },
    });

    if (payload.beforeTradeScreenshot || payload.afterTradeScreenshot) {
      const screenshots = await persistTradeScreenshots({
        userId: req.user.id,
        tradeId: trade.id,
        beforeTradeScreenshot: payload.beforeTradeScreenshot,
        afterTradeScreenshot: payload.afterTradeScreenshot,
      });

      trade = await prisma.trade.update({
        where: { id: trade.id },
        data: screenshots,
      });
    }
  } catch (error) {
    if (trade?.id) {
      await prisma.trade
        .delete({
          where: { id: trade.id },
        })
        .catch(() => {});
    }

    throw error;
  }

  res.status(201).json({
    success: true,
    data: {
      trade: serializeTrade(trade),
      usage: await getUsageSummaryForUser(req.user.id, req.user.planType),
    },
  });
});

export const getTrades = asyncHandler(async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.user.id },
    orderBy: { tradeDate: "desc" },
  });

  res.json({
    success: true,
    data: { trades: trades.map(serializeTrade) },
  });
});

export const getTradeById = asyncHandler(async (req, res) => {
  const trade = await prisma.trade.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!trade) {
    throw new AppError("Trade not found.", 404);
  }

  res.json({
    success: true,
    data: { trade: serializeTrade(trade) },
  });
});

export const updateTrade = asyncHandler(async (req, res) => {
  const payload = updateTradeSchema.parse(req.body);
  ensureScreenshotPlanAccess(req.user.planType, payload);

  const existingTrade = await prisma.trade.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!existingTrade) {
    throw new AppError("Trade not found.", 404);
  }

  const nextResult = payload.result !== undefined ? payload.result : existingTrade.result;
  const nextProfitLoss =
    payload.profitLoss !== undefined
      ? payload.profitLoss
      : existingTrade.profitLoss !== null && existingTrade.profitLoss !== undefined
        ? Number(existingTrade.profitLoss)
        : undefined;

  assertProfitLossMatchesResult(nextResult, nextProfitLoss);

  const nextStatus = payload.status ?? existingTrade.status;
  const nextNotes = payload.notes ?? existingTrade.notes ?? "";
  const nextEmotionAfter = payload.emotionAfter ?? existingTrade.emotionAfter ?? "";
  const nextMistakeTags = payload.mistakeTags ?? existingTrade.mistakeTags ?? [];

  const discipline = calculateDisciplineSnapshot({
    confluenceScore: existingTrade.confluenceScore,
    checklistSnapshot: existingTrade.checklistSnapshot,
    direction: existingTrade.direction,
    entryPrice:
      existingTrade.entryPrice !== null && existingTrade.entryPrice !== undefined
        ? Number(existingTrade.entryPrice)
        : undefined,
    stopLoss:
      existingTrade.stopLoss !== null && existingTrade.stopLoss !== undefined
        ? Number(existingTrade.stopLoss)
        : undefined,
    takeProfit:
      existingTrade.takeProfit !== null && existingTrade.takeProfit !== undefined
        ? Number(existingTrade.takeProfit)
        : undefined,
    riskAmount:
      existingTrade.riskAmount !== null && existingTrade.riskAmount !== undefined
        ? Number(existingTrade.riskAmount)
        : undefined,
    emotionBefore: existingTrade.emotionBefore,
    status: nextStatus,
    result: nextResult,
    profitLoss: nextProfitLoss,
    emotionAfter: nextEmotionAfter,
    notes: nextNotes,
    mistakeTags: nextMistakeTags,
  });

  const screenshotUpdates = await persistTradeScreenshots({
    userId: req.user.id,
    tradeId: existingTrade.id,
    currentBeforeTradeScreenshotUrl: existingTrade.beforeTradeScreenshotUrl,
    currentAfterTradeScreenshotUrl: existingTrade.afterTradeScreenshotUrl,
    beforeTradeScreenshot: payload.beforeTradeScreenshot,
    afterTradeScreenshot: payload.afterTradeScreenshot,
    removeBeforeTradeScreenshot: payload.removeBeforeTradeScreenshot,
    removeAfterTradeScreenshot: payload.removeAfterTradeScreenshot,
  });

  const updatedTrade = await prisma.trade.update({
    where: { id: existingTrade.id },
    data: {
      status: payload.status,
      strategyKey: payload.strategyKey === "" ? null : payload.strategyKey,
      tradingViewUrl: payload.tradingViewUrl === "" ? null : payload.tradingViewUrl,
      result: payload.result,
      profitLoss: parseNumberField(payload.profitLoss),
      notes: payload.notes,
      emotionAfter: payload.emotionAfter,
      mistakeTags: payload.mistakeTags,
      disciplineScore: discipline.score,
      disciplineSummary: discipline.summary,
      beforeTradeScreenshotUrl: screenshotUpdates.beforeTradeScreenshotUrl,
      afterTradeScreenshotUrl: screenshotUpdates.afterTradeScreenshotUrl,
    },
  });

  res.json({
    success: true,
    data: { trade: serializeTrade(updatedTrade) },
  });
});

export const deleteTrade = asyncHandler(async (req, res) => {
  const existingTrade = await prisma.trade.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!existingTrade) {
    throw new AppError("Trade not found.", 404);
  }

  await prisma.trade.delete({
    where: { id: existingTrade.id },
  });
  await deleteTradeScreenshots({
    beforeTradeScreenshotUrl: existingTrade.beforeTradeScreenshotUrl,
    afterTradeScreenshotUrl: existingTrade.afterTradeScreenshotUrl,
  });

  res.json({
    success: true,
    data: {
      usage: await getUsageSummaryForUser(req.user.id, req.user.planType),
    },
  });
});
