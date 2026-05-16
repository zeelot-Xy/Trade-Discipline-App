const decimalKeys = [
  "entryPrice",
  "exitPrice",
  "stopLoss",
  "takeProfit",
  "riskAmount",
  "rewardAmount",
  "profitLoss",
];

export const serializeTrade = (trade) => {
  if (!trade) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(trade).map(([key, value]) => {
      if (decimalKeys.includes(key) && value !== null) {
        return [key, Number(value)];
      }

      if (key === "mistakeTags" && value === null) {
        return [key, []];
      }

      if (
        (key === "beforeTradeScreenshotUrl" || key === "afterTradeScreenshotUrl") &&
        value === null
      ) {
        return [key, null];
      }

      return [key, value];
    }),
  );
};
