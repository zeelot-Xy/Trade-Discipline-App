export const ENTRY_SOURCES = ["MANUAL", "CSV_IMPORT", "MT_STATEMENT", "EXCHANGE_IMPORT"];

export const IMPORT_SOURCES = ["GENERIC_CSV", "MT4", "MT5", "BINANCE", "BYBIT"];

export const IMPORT_FIELD_KEYS = [
  "sourceTradeId",
  "externalReference",
  "symbol",
  "direction",
  "entryPrice",
  "exitPrice",
  "stopLoss",
  "takeProfit",
  "profitLoss",
  "status",
  "result",
  "tradeDate",
  "notes",
];

export const REQUIRED_IMPORT_FIELDS = ["symbol", "tradeDate"];

export const GENERIC_CSV_DEFAULT_MAPPING = {
  sourceTradeId: [
    "ticket",
    "order",
    "deal",
    "id",
    "trade id",
    "order id",
    "position id",
  ],
  externalReference: ["reference", "comment", "memo"],
  symbol: ["symbol", "pair", "instrument", "item"],
  direction: ["direction", "side", "type", "action"],
  entryPrice: ["entry", "entry price", "open", "open price", "price", "buy price", "sell price"],
  exitPrice: ["exit", "exit price", "close", "close price"],
  stopLoss: ["sl", "s/l", "stop loss", "stoploss"],
  takeProfit: ["tp", "t/p", "take profit", "takeprofit"],
  profitLoss: [
    "profit",
    "p/l",
    "pnl",
    "pl",
    "net profit",
    "gross profit",
    "net p/l",
    "gross p/l",
    "net pl",
    "gross pl",
    "profit/loss",
    "realized pnl",
    "realized p/l",
  ],
  status: ["status", "trade status"],
  result: ["result", "outcome"],
  tradeDate: [
    "trade date",
    "entry time",
    "open time",
    "timestamp",
    "date",
    "time",
    "opened",
    "close time",
    "exit time",
  ],
  notes: ["notes", "comment", "memo", "remarks"],
};

export const MT_STATEMENT_DEFAULT_MAPPING = {
  sourceTradeId: ["ticket", "order", "deal", "position"],
  externalReference: ["comment"],
  symbol: ["item", "symbol", "instrument"],
  direction: ["type", "direction"],
  entryPrice: ["price", "open price", "entry price"],
  exitPrice: ["close price", "exit price"],
  stopLoss: ["s / l", "s/l", "sl", "stop loss"],
  takeProfit: ["t / p", "t/p", "tp", "take profit"],
  profitLoss: ["profit", "p/l", "pl", "net profit", "net p/l", "gross p/l"],
  tradeDate: ["time", "open time", "date"],
  notes: ["comment"],
};

export const IMPORT_BATCH_LIMIT = 1000;
