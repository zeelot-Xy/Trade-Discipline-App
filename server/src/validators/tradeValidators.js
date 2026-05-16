import { z } from "zod";
import {
  EMOTION_OPTIONS,
  MISTAKE_TAG_OPTIONS,
  STRATEGY_KEYS,
} from "../constants/tradingOptions.js";

const optionalNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value, context) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid numeric value.",
      });
      return z.NEVER;
    }

    return parsed;
  });

const screenshotPayloadSchema = z.object({
  dataUrl: z.string().trim().min(1, "Screenshot data is required."),
  fileName: z.string().trim().optional(),
});

export const createTradeSchema = z.object({
  strategyKey: z.enum(STRATEGY_KEYS).optional().or(z.literal("")),
  tradingViewUrl: z.string().trim().url("TradingView link must be a valid URL.").optional().or(z.literal("")),
  symbol: z.string().trim().max(30).optional().or(z.literal("")),
  direction: z.enum(["BUY", "SELL"]).optional().nullable(),
  entryPrice: optionalNumber.optional(),
  stopLoss: optionalNumber.optional(),
  takeProfit: optionalNumber.optional(),
  riskAmount: optionalNumber.optional(),
  rewardAmount: optionalNumber.optional(),
  profitLoss: optionalNumber.optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  result: z.enum(["WIN", "LOSS", "BREAKEVEN"]).optional().nullable(),
  confluenceScore: z.number().int().min(0).max(100),
  setupQuality: z.string().trim().min(1, "Setup quality is required."),
  checklistSnapshot: z.any(),
  mistakeTags: z.array(z.enum(MISTAKE_TAG_OPTIONS)).optional().default([]),
  notes: z.string().trim().optional().or(z.literal("")),
  emotionBefore: z.enum(EMOTION_OPTIONS).optional().or(z.literal("")),
  emotionAfter: z.enum(EMOTION_OPTIONS).optional().or(z.literal("")),
  beforeTradeScreenshot: screenshotPayloadSchema.optional(),
  afterTradeScreenshot: screenshotPayloadSchema.optional(),
  tradeDate: z.string().datetime().optional(),
});

export const updateTradeSchema = z.object({
  strategyKey: z.enum(STRATEGY_KEYS).optional().or(z.literal("")),
  tradingViewUrl: z.string().trim().url("TradingView link must be a valid URL.").optional().or(z.literal("")),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  result: z.enum(["WIN", "LOSS", "BREAKEVEN"]).nullable().optional(),
  profitLoss: optionalNumber.optional(),
  notes: z.string().trim().optional().or(z.literal("")),
  emotionAfter: z.enum(EMOTION_OPTIONS).optional().or(z.literal("")),
  mistakeTags: z.array(z.enum(MISTAKE_TAG_OPTIONS)).optional(),
  beforeTradeScreenshot: screenshotPayloadSchema.optional(),
  afterTradeScreenshot: screenshotPayloadSchema.optional(),
  removeBeforeTradeScreenshot: z.boolean().optional(),
  removeAfterTradeScreenshot: z.boolean().optional(),
});
