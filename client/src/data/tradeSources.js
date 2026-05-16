export const entrySourceLabels = {
  MANUAL: "Manual",
  CSV_IMPORT: "CSV Import",
  MT_STATEMENT: "MT Statement",
  EXCHANGE_IMPORT: "Exchange Import",
};

export const importSourceLabels = {
  GENERIC_CSV: "Generic CSV",
  MT4: "MT4",
  MT5: "MT5",
  BINANCE: "Binance",
  BYBIT: "Bybit",
};

export const getTradeSourceLabel = (trade) => {
  if (!trade?.entrySource || trade.entrySource === "MANUAL") {
    return "Manual";
  }

  return importSourceLabels[trade.importSource] || entrySourceLabels[trade.entrySource] || "Imported";
};

export const isImportedTrade = (trade) => trade?.entrySource && trade.entrySource !== "MANUAL";

export const genericImportFieldOptions = [
  { key: "sourceTradeId", label: "Trade ID / Ticket" },
  { key: "externalReference", label: "External Reference / Comment" },
  { key: "symbol", label: "Symbol" },
  { key: "direction", label: "Direction" },
  { key: "entryPrice", label: "Entry Price" },
  { key: "exitPrice", label: "Exit Price" },
  { key: "stopLoss", label: "Stop Loss" },
  { key: "takeProfit", label: "Take Profit" },
  { key: "profitLoss", label: "Profit / Loss" },
  { key: "status", label: "Status" },
  { key: "result", label: "Result" },
  { key: "tradeDate", label: "Trade Date" },
  { key: "notes", label: "Notes / Comment" },
];
