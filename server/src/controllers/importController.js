import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { getUsageSummaryForUser } from "../services/usageService.js";
import {
  confirmImportedTrades,
  previewGenericCsvImport,
  previewMtStatementImport,
  validateMapping,
} from "../services/importService.js";
import {
  genericCsvPreviewSchema,
  importConfirmSchema,
  mtPreviewSchema,
} from "../validators/importValidators.js";

const assertProImportAccess = (planType) => {
  if (planType !== "PRO") {
    throw new AppError("Trade import is available on the Pro plan.", 403, {
      code: "IMPORTS_PRO_ONLY",
    });
  }
};

export const previewCsvImport = asyncHandler(async (req, res) => {
  const payload = genericCsvPreviewSchema.parse(req.body);

  if (payload.mapping && !validateMapping(payload.mapping)) {
    throw new AppError("Map at least Symbol and Trade Date before previewing imported trades.", 400);
  }

  const preview = await previewGenericCsvImport({
    userId: req.user.id,
    fileName: payload.fileName,
    fileContent: payload.fileContent,
    mapping: payload.mapping,
  });

  res.json({
    success: true,
    data: preview,
  });
});

export const confirmCsvImport = asyncHandler(async (req, res) => {
  assertProImportAccess(req.user.planType);
  const payload = importConfirmSchema.parse(req.body);

  const result = await confirmImportedTrades({
    userId: req.user.id,
    planType: req.user.planType,
    normalizedRows: payload.normalizedRows,
  });

  res.status(201).json({
    success: true,
    data: {
      ...result,
      usage: await getUsageSummaryForUser(req.user.id, req.user.planType),
    },
  });
});

export const previewMtImport = asyncHandler(async (req, res) => {
  const payload = mtPreviewSchema.parse(req.body);
  const preview = await previewMtStatementImport({
    userId: req.user.id,
    fileName: payload.fileName,
    fileContent: payload.fileContent,
  });

  res.json({
    success: true,
    data: preview,
  });
});

export const confirmMtImport = asyncHandler(async (req, res) => {
  assertProImportAccess(req.user.planType);
  const payload = importConfirmSchema.parse(req.body);

  const result = await confirmImportedTrades({
    userId: req.user.id,
    planType: req.user.planType,
    normalizedRows: payload.normalizedRows,
  });

  res.status(201).json({
    success: true,
    data: {
      ...result,
      usage: await getUsageSummaryForUser(req.user.id, req.user.planType),
    },
  });
});
