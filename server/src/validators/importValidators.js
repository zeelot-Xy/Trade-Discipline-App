import { z } from "zod";

const optionalMappedField = z.string().trim().optional().or(z.literal(""));

export const genericCsvMappingSchema = z.object({
  sourceTradeId: optionalMappedField,
  externalReference: optionalMappedField,
  symbol: optionalMappedField,
  direction: optionalMappedField,
  entryPrice: optionalMappedField,
  exitPrice: optionalMappedField,
  stopLoss: optionalMappedField,
  takeProfit: optionalMappedField,
  profitLoss: optionalMappedField,
  status: optionalMappedField,
  result: optionalMappedField,
  tradeDate: optionalMappedField,
  notes: optionalMappedField,
});

export const genericCsvPreviewSchema = z.object({
  fileName: z.string().trim().min(1, "A CSV file name is required."),
  fileContent: z.string().trim().min(1, "CSV file content is required."),
  mapping: genericCsvMappingSchema.optional(),
});

export const mtPreviewSchema = z.object({
  fileName: z.string().trim().min(1, "A statement file name is required."),
  fileContent: z.string().trim().min(1, "Statement file content is required."),
});

const normalizedImportRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  entrySource: z.enum(["CSV_IMPORT", "MT_STATEMENT", "EXCHANGE_IMPORT", "MANUAL"]),
  importSource: z.enum(["GENERIC_CSV", "MT4", "MT5", "BINANCE", "BYBIT"]),
  sourceTradeId: z.string().nullable().optional(),
  externalReference: z.string().nullable().optional(),
  symbol: z.string().nullable().optional(),
  direction: z.enum(["BUY", "SELL"]).nullable().optional(),
  entryPrice: z.number().nullable().optional(),
  exitPrice: z.number().nullable().optional(),
  stopLoss: z.number().nullable().optional(),
  takeProfit: z.number().nullable().optional(),
  profitLoss: z.number().nullable().optional(),
  status: z.enum(["OPEN", "CLOSED"]),
  result: z.enum(["WIN", "LOSS", "BREAKEVEN"]).nullable().optional(),
  tradeDate: z.string(),
  notes: z.string().nullable().optional(),
  issues: z.array(z.string()).optional(),
  duplicateOf: z.string().nullable().optional(),
});

export const importConfirmSchema = z.object({
  normalizedRows: z.array(normalizedImportRowSchema).min(1, "Preview at least one trade before importing."),
});
