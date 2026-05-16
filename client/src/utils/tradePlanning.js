const parseNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDirectionValidation = ({ direction, entryPrice, stopLoss, takeProfit }) => {
  if (!direction || entryPrice === null || stopLoss === null || takeProfit === null) {
    return null;
  }

  if (direction === "BUY") {
    if (!(stopLoss < entryPrice && takeProfit > entryPrice)) {
      return "For a BUY trade, stop loss should be below entry and take profit should be above entry.";
    }
  }

  if (direction === "SELL") {
    if (!(stopLoss > entryPrice && takeProfit < entryPrice)) {
      return "For a SELL trade, stop loss should be above entry and take profit should be below entry.";
    }
  }

  return null;
};

export const calculatePlannedTradeMetrics = (values) => {
  const direction = values.direction || "";
  const entryPrice = parseNumber(values.entryPrice);
  const stopLoss = parseNumber(values.stopLoss);
  const takeProfit = parseNumber(values.takeProfit);
  const riskAmount = parseNumber(values.riskAmount);

  const geometryWarning = getDirectionValidation({
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
  });

  if (geometryWarning) {
    return {
      riskDistance: null,
      rewardDistance: null,
      rrMultiple: null,
      rewardAmount: null,
      warning: geometryWarning,
      canCalculate: false,
    };
  }

  if (
    !direction ||
    entryPrice === null ||
    stopLoss === null ||
    takeProfit === null
  ) {
    return {
      riskDistance: null,
      rewardDistance: null,
      rrMultiple: null,
      rewardAmount: null,
      warning: "",
      canCalculate: false,
    };
  }

  const riskDistance = Math.abs(entryPrice - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entryPrice);

  if (riskDistance === 0) {
    return {
      riskDistance,
      rewardDistance,
      rrMultiple: null,
      rewardAmount: null,
      warning: "Entry price and stop loss cannot be the same.",
      canCalculate: false,
    };
  }

  const rrMultiple = rewardDistance / riskDistance;
  const rewardAmount = riskAmount !== null ? riskAmount * rrMultiple : null;

  return {
    riskDistance,
    rewardDistance,
    rrMultiple,
    rewardAmount,
    warning: "",
    canCalculate: true,
  };
};
