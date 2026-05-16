import crypto from "crypto";

import { prisma } from "../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  GENERIC_CSV_DEFAULT_MAPPING,
  IMPORT_BATCH_LIMIT,
  MT_STATEMENT_DEFAULT_MAPPING,
  REQUIRED_IMPORT_FIELDS,
} from "../constants/importOptions.js";

const htmlEntityMap = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const normalizeHeader = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s/]/g, "");

const decodeHtml = (value = "") =>
  String(value).replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match) => htmlEntityMap[match] || match);

const stripHtml = (value = "") =>
  decodeHtml(
    String(value)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

const parseCsvText = (text = "") => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(current);
      current = "";
      if (row.some((cell) => String(cell).trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => String(cell).trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

const convertRowsToObjects = (rows) => {
  if (!rows.length) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((header, index) => {
    const label = String(header || "").trim();
    return label || `Column ${index + 1}`;
  });

  return {
    headers,
    rows: rows.slice(1).map((cells, rowIndex) => {
      const values = Object.fromEntries(
        headers.map((header, index) => [header, String(cells[index] ?? "").trim()]),
      );

      return {
        rowNumber: rowIndex + 2,
        values,
      };
    }),
  };
};

const parseHtmlTables = (html = "") => {
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)];

  return tables
    .map((match) => {
      const rows = [...match[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((rowMatch) =>
        [...rowMatch[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cellMatch) =>
          stripHtml(cellMatch[1]),
        ),
      );

      return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
    })
    .filter((rows) => rows.length > 1);
};

const isMetaTraderExecutionType = (value = "") => {
  const normalized = normalizeHeader(value);
  return normalized === "buy" || normalized === "sell";
};

const detectMetaTraderHeader = (rows) => {
  for (let index = 0; index < rows.length; index += 1) {
    const normalizedRow = rows[index].map(normalizeHeader);
    const hasTicket = normalizedRow.some((cell) => cell === "ticket");
    const hasType = normalizedRow.some((cell) => cell === "type");
    const hasSymbol = normalizedRow.some((cell) => cell === "item" || cell === "symbol");
    const hasProfit = normalizedRow.some((cell) => cell === "profit" || cell === "p/l");

    if (hasTicket && hasType && hasSymbol && hasProfit) {
      const priceIndexes = normalizedRow.reduce((indexes, cell, cellIndex) => {
        if (cell === "price" || cell === "open price" || cell === "close price") {
          indexes.push(cellIndex);
        }
        return indexes;
      }, []);

      const findIndex = (predicate) => normalizedRow.findIndex(predicate);
      const openPriceIndex = findIndex((cell) => cell === "open price");
      const closePriceIndex = findIndex((cell) => cell === "close price");

      return {
        headerRowIndex: index,
        columns: {
          sourceTradeId: findIndex((cell) => cell === "ticket" || cell === "order" || cell === "deal"),
          tradeDate: findIndex((cell) => cell === "open time" || cell === "time"),
          direction: findIndex((cell) => cell === "type"),
          symbol: findIndex((cell) => cell === "item" || cell === "symbol" || cell === "instrument"),
          entryPrice:
            openPriceIndex !== -1
              ? openPriceIndex
              : priceIndexes.length
                ? priceIndexes[0]
                : -1,
          stopLoss: findIndex((cell) => cell === "s / l" || cell === "s/l" || cell === "sl"),
          takeProfit: findIndex((cell) => cell === "t / p" || cell === "t/p" || cell === "tp"),
          exitDate: findIndex((cell) => cell === "close time"),
          exitPrice:
            closePriceIndex !== -1
              ? closePriceIndex
              : priceIndexes.length > 1
                ? priceIndexes[1]
                : -1,
          profitLoss: findIndex((cell) => cell === "profit" || cell === "p/l"),
          notes: findIndex((cell) => cell === "comment"),
        },
      };
    }
  }

  return null;
};

const extractMetaTraderHtmlRows = (tables, importSource) => {
  const detectedTables = tables
    .map((rows) => {
      const header = detectMetaTraderHeader(rows);
      if (!header) {
        return null;
      }

      const tradeRows = rows
        .slice(header.headerRowIndex + 1)
        .map((cells, rowOffset) => ({
          cells,
          rowNumber: header.headerRowIndex + rowOffset + 2,
        }))
        .filter((row) => row.cells.length >= 10)
        .filter((row) =>
          isMetaTraderExecutionType(
            row.cells[header.columns.direction] ?? row.cells[2] ?? "",
          ),
        );

      return {
        header,
        tradeRows,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.tradeRows.length - left.tradeRows.length);

  const bestDetectedTable = detectedTables[0];

  if (bestDetectedTable?.tradeRows?.length) {
    return bestDetectedTable.tradeRows.map(({ cells, rowNumber }) => {
      const columns = bestDetectedTable.header.columns;
      const symbol = String(cells[columns.symbol] ?? "").trim();
      const profitLoss = parseNumberValue(cells[columns.profitLoss] ?? "");
      const parsedDate = parseDateValue(cells[columns.tradeDate] ?? "");
      const exitPrice = parseNumberValue(cells[columns.exitPrice] ?? "");
      const result = parseResult("", profitLoss);

      return {
        rowNumber,
        entrySource: "MT_STATEMENT",
        importSource,
        sourceTradeId: String(cells[columns.sourceTradeId] ?? "").trim() || null,
        externalReference: String(cells[columns.notes] ?? "").trim() || null,
        symbol: symbol ? symbol.toUpperCase() : null,
        direction: parseDirection(cells[columns.direction] ?? ""),
        entryPrice: parseNumberValue(cells[columns.entryPrice] ?? ""),
        exitPrice,
        stopLoss: parseNumberValue(cells[columns.stopLoss] ?? ""),
        takeProfit: parseNumberValue(cells[columns.takeProfit] ?? ""),
        profitLoss,
        status: buildImportedTradeStatus({
          status: "CLOSED",
          result,
          exitPrice,
          profitLoss,
        }),
        result,
        tradeDate: parsedDate ? parsedDate.toISOString() : null,
        notes: String(cells[columns.notes] ?? "").trim() || null,
        issues: [
          ...(symbol ? [] : ["Missing symbol."]),
          ...(parsedDate ? [] : ["Missing or invalid trade date."]),
        ],
      };
    });
  }

  const fallbackTable = tables
    .map((rows) => ({
      rows,
      tradeRows: rows
        .map((cells, rowIndex) => ({ cells, rowNumber: rowIndex + 1 }))
        .filter((row) => row.cells.length >= 14)
        .filter((row) => isMetaTraderExecutionType(row.cells[2] ?? "")),
    }))
    .sort((left, right) => right.tradeRows.length - left.tradeRows.length)[0];

  if (!fallbackTable?.tradeRows?.length) {
    return [];
  }

  return fallbackTable.tradeRows.map(({ cells, rowNumber }) => {
    const symbol = String(cells[4] ?? "").trim();
    const profitLoss = parseNumberValue(cells[13] ?? "");
    const parsedDate = parseDateValue(cells[1] ?? "");
    const exitPrice = parseNumberValue(cells[9] ?? "");
    const result = parseResult("", profitLoss);

    return {
      rowNumber,
      entrySource: "MT_STATEMENT",
      importSource,
      sourceTradeId: String(cells[0] ?? "").trim() || null,
      externalReference: String(cells[14] ?? "").trim() || null,
      symbol: symbol ? symbol.toUpperCase() : null,
      direction: parseDirection(cells[2] ?? ""),
      entryPrice: parseNumberValue(cells[5] ?? ""),
      exitPrice,
      stopLoss: parseNumberValue(cells[6] ?? ""),
      takeProfit: parseNumberValue(cells[7] ?? ""),
      profitLoss,
      status: buildImportedTradeStatus({
        status: "CLOSED",
        result,
        exitPrice,
        profitLoss,
      }),
      result,
      tradeDate: parsedDate ? parsedDate.toISOString() : null,
      notes: String(cells[14] ?? "").trim() || null,
      issues: [
        ...(symbol ? [] : ["Missing symbol."]),
        ...(parsedDate ? [] : ["Missing or invalid trade date."]),
      ],
    };
  });
};

const scoreTableForTrades = (headers) => {
  const normalized = headers.map(normalizeHeader);
  const keywords = ["ticket", "symbol", "item", "type", "time", "profit", "price"];
  return keywords.filter((keyword) => normalized.some((header) => header.includes(keyword))).length;
};

const pickTradeTable = (tables) => {
  const ranked = tables
    .map((rows) => ({
      rows,
      score: scoreTableForTrades(rows[0] || []),
    }))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.rows || [];
};

const resolveDefaultMapping = (headers, defaults) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  return Object.fromEntries(
    Object.entries(defaults).map(([field, aliases]) => {
      let match = null;

      for (const alias of aliases) {
        const normalizedAlias = normalizeHeader(alias);
        match = normalizedHeaders.find((header) => header.normalized === normalizedAlias);

        if (!match) {
          match = normalizedHeaders.find(
            (header) =>
              header.normalized.includes(normalizedAlias) ||
              normalizedAlias.includes(header.normalized),
          );
        }

        if (match) {
          break;
        }
      }

      return [field, match?.original || ""];
    }),
  );
};

const parseNumberValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDirection = (value) => {
  const normalized = normalizeHeader(value);
  if (normalized.includes("buy") || normalized === "long") {
    return "BUY";
  }
  if (normalized.includes("sell") || normalized === "short") {
    return "SELL";
  }
  return null;
};

const parseStatus = (value) => {
  const normalized = normalizeHeader(value);
  if (!normalized) {
    return null;
  }
  if (normalized.includes("open")) {
    return "OPEN";
  }
  if (
    normalized.includes("closed") ||
    normalized.includes("close") ||
    normalized.includes("filled") ||
    normalized.includes("complete")
  ) {
    return "CLOSED";
  }
  return null;
};

const parseResult = (value, profitLoss) => {
  const normalized = normalizeHeader(value);
  if (normalized === "win" || normalized === "profit") {
    return "WIN";
  }
  if (normalized === "loss") {
    return "LOSS";
  }
  if (normalized === "breakeven" || normalized === "break even") {
    return "BREAKEVEN";
  }
  if (profitLoss === null || profitLoss === undefined) {
    return null;
  }
  if (profitLoss > 0) {
    return "WIN";
  }
  if (profitLoss < 0) {
    return "LOSS";
  }
  return "BREAKEVEN";
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const normalized = String(value).trim().replace(/\./g, "-").replace(/\//g, "-");
  const fallback = new Date(normalized);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

const buildImportedTradeStatus = ({ status, result, exitPrice, profitLoss }) => {
  if (status) {
    return status;
  }
  if (result || exitPrice !== null || profitLoss !== null) {
    return "CLOSED";
  }
  return "OPEN";
};

const buildMappedRows = ({ rows, mapping, entrySource, importSource }) =>
  rows.map((row) => {
    const sourceTradeId = mapping.sourceTradeId ? row.values[mapping.sourceTradeId] : "";
    const externalReference = mapping.externalReference
      ? row.values[mapping.externalReference]
      : "";
    const symbol = mapping.symbol ? row.values[mapping.symbol] : "";
    const direction = parseDirection(mapping.direction ? row.values[mapping.direction] : "");
    const entryPrice = parseNumberValue(mapping.entryPrice ? row.values[mapping.entryPrice] : "");
    const exitPrice = parseNumberValue(mapping.exitPrice ? row.values[mapping.exitPrice] : "");
    const stopLoss = parseNumberValue(mapping.stopLoss ? row.values[mapping.stopLoss] : "");
    const takeProfit = parseNumberValue(mapping.takeProfit ? row.values[mapping.takeProfit] : "");
    const profitLoss = parseNumberValue(mapping.profitLoss ? row.values[mapping.profitLoss] : "");
    const parsedDate = parseDateValue(mapping.tradeDate ? row.values[mapping.tradeDate] : "");
    const status = parseStatus(mapping.status ? row.values[mapping.status] : "");
    const result = parseResult(mapping.result ? row.values[mapping.result] : "", profitLoss);
    const notes = mapping.notes ? row.values[mapping.notes] : "";

    const issues = [];

    if (!symbol?.trim()) {
      issues.push("Missing symbol.");
    }

    if (!parsedDate) {
      issues.push("Missing or invalid trade date.");
    }

    return {
      rowNumber: row.rowNumber,
      entrySource,
      importSource,
      sourceTradeId: sourceTradeId?.trim() || null,
      externalReference: externalReference?.trim() || null,
      symbol: symbol?.trim() || null,
      direction,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      profitLoss,
      status: buildImportedTradeStatus({
        status,
        result,
        exitPrice,
        profitLoss,
      }),
      result,
      tradeDate: parsedDate ? parsedDate.toISOString() : null,
      notes: notes?.trim() || null,
      issues,
    };
  });

const buildPreviewSummary = (normalizedRows) => {
  const validRows = normalizedRows.filter((row) => !row.issues.length);
  const duplicateRows = normalizedRows.filter((row) => row.duplicateOf);
  return {
    parsedRows: normalizedRows.length,
    validRows: validRows.length,
    invalidRows: normalizedRows.length - validRows.length,
    duplicateRows: duplicateRows.length,
  };
};

const toDuplicateKey = (row) => {
  const profitKey =
    row.profitLoss !== null && row.profitLoss !== undefined
      ? Number(row.profitLoss).toFixed(2)
      : "";
  const dateKey = row.tradeDate ? row.tradeDate.slice(0, 16) : "";
  return [row.importSource, row.symbol || "", dateKey, profitKey].join("|");
};

const markDuplicates = async (userId, normalizedRows) => {
  const sourceTradeIds = normalizedRows.map((row) => row.sourceTradeId).filter(Boolean);
  const symbols = [...new Set(normalizedRows.map((row) => row.symbol).filter(Boolean))];
  const validDates = normalizedRows
    .map((row) => (row.tradeDate ? new Date(row.tradeDate) : null))
    .filter(Boolean);

  const minDate = validDates.length
    ? new Date(Math.min(...validDates.map((date) => date.getTime())))
    : null;
  const maxDate = validDates.length
    ? new Date(Math.max(...validDates.map((date) => date.getTime())))
    : null;

  const duplicateWhere = [
    sourceTradeIds.length ? { sourceTradeId: { in: sourceTradeIds } } : null,
    symbols.length && minDate && maxDate
      ? {
          symbol: { in: symbols },
          tradeDate: {
            gte: new Date(minDate.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(maxDate.getTime() + 24 * 60 * 60 * 1000),
          },
        }
      : null,
  ].filter(Boolean);

  if (!duplicateWhere.length) {
    return normalizedRows.map((row) => ({
      ...row,
      duplicateOf: null,
    }));
  }

  const existingTrades = await prisma.trade.findMany({
    where: {
      userId,
      OR: duplicateWhere,
    },
    select: {
      id: true,
      importSource: true,
      sourceTradeId: true,
      symbol: true,
      tradeDate: true,
      profitLoss: true,
    },
  });

  const bySourceTradeId = new Map();
  const byProbableKey = new Map();

  for (const trade of existingTrades) {
    if (trade.sourceTradeId) {
      bySourceTradeId.set(trade.sourceTradeId, trade.id);
    }
    byProbableKey.set(
      [
        trade.importSource || "MANUAL",
        trade.symbol || "",
        trade.tradeDate.toISOString().slice(0, 16),
        trade.profitLoss !== null && trade.profitLoss !== undefined
          ? Number(trade.profitLoss).toFixed(2)
          : "",
      ].join("|"),
      trade.id,
    );
  }

  return normalizedRows.map((row) => {
    const duplicateOf =
      (row.sourceTradeId ? bySourceTradeId.get(row.sourceTradeId) : null) ||
      byProbableKey.get(toDuplicateKey(row)) ||
      null;

    return {
      ...row,
      duplicateOf,
    };
  });
};

export const previewGenericCsvImport = async ({ userId, fileName, fileContent, mapping }) => {
  const parsed = convertRowsToObjects(parseCsvText(fileContent));
  const defaultMapping = resolveDefaultMapping(parsed.headers, GENERIC_CSV_DEFAULT_MAPPING);

  if (parsed.rows.length > IMPORT_BATCH_LIMIT) {
    throw new AppError(`Please import ${IMPORT_BATCH_LIMIT} rows or fewer at a time.`, 400);
  }

  if (!mapping) {
    return {
      sourceType: "GENERIC_CSV",
      fileName,
      detectedColumns: parsed.headers,
      suggestedMapping: defaultMapping,
      sampleRows: parsed.rows.slice(0, 5),
      requiresMapping: true,
      summary: {
        parsedRows: parsed.rows.length,
      },
    };
  }

  const normalizedRows = await markDuplicates(
    userId,
    buildMappedRows({
      rows: parsed.rows,
      mapping,
      entrySource: "CSV_IMPORT",
      importSource: "GENERIC_CSV",
    }),
  );

  return {
    sourceType: "GENERIC_CSV",
    fileName,
    detectedColumns: parsed.headers,
    suggestedMapping: defaultMapping,
    mappedFields: mapping,
    normalizedRows,
    requiresMapping: false,
    summary: buildPreviewSummary(normalizedRows),
  };
};

const detectMtImportSource = (fileName, fileContent) => {
  const lowerName = String(fileName || "").toLowerCase();
  const lowerContent = String(fileContent || "").toLowerCase();

  if (lowerName.includes("mt5") || lowerContent.includes("metatrader 5")) {
    return "MT5";
  }

  return "MT4";
};

export const previewMtStatementImport = async ({ userId, fileName, fileContent }) => {
  const importSource = detectMtImportSource(fileName, fileContent);
  const isHtml = /<table[\s\S]*?>/i.test(fileContent) || /\.html?$/i.test(fileName || "");

  let parsed = null;
  let mapping = {};
  let normalizedRows = [];

  if (isHtml) {
    normalizedRows = extractMetaTraderHtmlRows(parseHtmlTables(fileContent), importSource);
    if (!normalizedRows.length) {
      throw new AppError("No trade rows could be detected in this MT4/MT5 statement.", 400);
    }
    parsed = {
      headers: [],
      rows: normalizedRows.map((row) => ({
        rowNumber: row.rowNumber,
        values: {},
      })),
    };
  } else {
    parsed = convertRowsToObjects(parseCsvText(fileContent));

    if (!parsed.rows.length) {
      throw new AppError("No trade rows could be detected in this MT4/MT5 statement.", 400);
    }

    mapping = resolveDefaultMapping(parsed.headers, MT_STATEMENT_DEFAULT_MAPPING);
    normalizedRows = buildMappedRows({
      rows: parsed.rows,
      mapping,
      entrySource: "MT_STATEMENT",
      importSource,
    });
  }

  if (normalizedRows.length > IMPORT_BATCH_LIMIT) {
    throw new AppError(`Please import ${IMPORT_BATCH_LIMIT} rows or fewer at a time.`, 400);
  }

  const duplicateMarkedRows = await markDuplicates(userId, normalizedRows);

  return {
    sourceType: importSource,
    fileName,
    detectedColumns: parsed.headers || [],
    mappedFields: mapping,
    normalizedRows: duplicateMarkedRows,
    requiresMapping: false,
    summary: buildPreviewSummary(duplicateMarkedRows),
  };
};

const serializeImportedChecklistSnapshot = ({ importSource, sourceTradeId, externalReference }) => ({
  imported: true,
  importSource,
  sourceTradeId: sourceTradeId || null,
  externalReference: externalReference || null,
});

export const confirmImportedTrades = async ({ userId, planType, normalizedRows }) => {
  const rowsToCreate = normalizedRows
    .filter((row) => !row.duplicateOf && (!row.issues || row.issues.length === 0))
    .slice(0, IMPORT_BATCH_LIMIT);

  const recheckedRows = await markDuplicates(userId, rowsToCreate);
  const importBatchId = crypto.randomUUID();

  let createdCount = 0;
  let skippedCount = 0;
  let duplicateCount = 0;

  for (const row of recheckedRows) {
    if (row.duplicateOf) {
      duplicateCount += 1;
      skippedCount += 1;
      continue;
    }

    await prisma.trade.create({
      data: {
        userId,
        entrySource: row.entrySource,
        importSource: row.importSource,
        importBatchId,
        sourceTradeId: row.sourceTradeId,
        externalReference: row.externalReference,
        symbol: row.symbol,
        direction: row.direction,
        entryPrice: row.entryPrice,
        exitPrice: row.exitPrice,
        stopLoss: row.stopLoss,
        takeProfit: row.takeProfit,
        profitLoss: row.profitLoss,
        status: row.status,
        result: row.result,
        confluenceScore: null,
        disciplineScore: null,
        disciplineSummary: "Imported trade. No live discipline score was recorded.",
        setupQuality: null,
        checklistSnapshot: serializeImportedChecklistSnapshot(row),
        notes: row.notes,
        tradeDate: new Date(row.tradeDate),
      },
    });

    createdCount += 1;
  }

  skippedCount += normalizedRows.filter((row) => row.issues?.length).length;

  return {
    importBatchId,
    createdCount,
    skippedCount,
    duplicateCount,
    usage:
      planType === "PRO"
        ? { savedTrades: await prisma.trade.count({ where: { userId } }), tradeLimit: null, canCreateTrade: true }
        : null,
  };
};

export const isImportRowShapeValid = (rows) =>
  Array.isArray(rows) &&
  rows.every(
    (row) =>
      typeof row === "object" &&
      typeof row.entrySource === "string" &&
      typeof row.importSource === "string" &&
      typeof row.tradeDate === "string",
  );

export const validateMapping = (mapping) =>
  REQUIRED_IMPORT_FIELDS.every((field) => mapping?.[field]?.trim());
