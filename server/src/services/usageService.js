import { prisma } from "../prisma/prisma.js";

export const FREE_TRADE_LIMIT = 25;

export const getTradeLimitForPlan = (planType) =>
  planType === "PRO" ? null : FREE_TRADE_LIMIT;

export const buildUsageSummary = ({ planType, savedTrades }) => {
  const tradeLimit = getTradeLimitForPlan(planType);
  const canCreateTrade = tradeLimit === null ? true : savedTrades < tradeLimit;

  return {
    savedTrades,
    tradeLimit,
    canCreateTrade,
  };
};

export const getUsageSummaryForUser = async (userId, planType) => {
  const savedTrades = await prisma.trade.count({
    where: { userId },
  });

  return buildUsageSummary({ planType, savedTrades });
};
