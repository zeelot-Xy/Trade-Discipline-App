import { buildDashboardStats } from "./dashboardService.js";
import { serializeTrade } from "../utils/serializeTrade.js";

const highRiskEmotions = new Set([
  "Anxious",
  "Fearful",
  "FOMO",
  "Frustrated",
  "Revenge-driven",
  "Overconfident",
]);

const formatStrategyKey = (strategyKey) =>
  String(strategyKey || "legacy")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const startOfWeek = (referenceDate = new Date()) => {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
};

const endOfWeek = (weekStart) => {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
};

const safeAverage = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

const buildEmotionSummary = (trades) => {
  const map = new Map();

  for (const trade of trades) {
    if (!trade.emotionBefore) {
      continue;
    }

    map.set(trade.emotionBefore, (map.get(trade.emotionBefore) || 0) + 1);
  }

  const breakdown = Array.from(map.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

  return {
    breakdown,
    mostCommon: breakdown[0] || null,
  };
};

const buildStrongestTrade = (trades) => {
  if (!trades.length) {
    return null;
  }

  const rankedTrades = [...trades].sort((left, right) => {
    const leftDiscipline = left.disciplineScore ?? -1;
    const rightDiscipline = right.disciplineScore ?? -1;
    const leftProfit = left.profitLoss ?? Number.NEGATIVE_INFINITY;
    const rightProfit = right.profitLoss ?? Number.NEGATIVE_INFINITY;

    return (
      (right.confluenceScore ?? -1) - (left.confluenceScore ?? -1) ||
      rightDiscipline - leftDiscipline ||
      rightProfit - leftProfit
    );
  });

  return rankedTrades[0];
};

const buildStrategyInsights = (strategyBreakdown) => {
  if (!strategyBreakdown.length) {
    return {
      bestStrategy: null,
      worstStrategy: null,
    };
  }

  const byBest = [...strategyBreakdown].sort((left, right) => {
    return (
      right.netProfitLoss - left.netProfitLoss ||
      right.winRate - left.winRate ||
      right.avgDiscipline - left.avgDiscipline
    );
  });

  const byWorst = [...strategyBreakdown].sort((left, right) => {
    return (
      left.netProfitLoss - right.netProfitLoss ||
      left.winRate - right.winRate ||
      left.avgDiscipline - right.avgDiscipline
    );
  });

  return {
    bestStrategy: byBest[0] || null,
    worstStrategy: byWorst[0] || null,
  };
};

const buildRecommendation = ({
  stats,
  bestStrategy,
  worstStrategy,
  mostCommonEmotion,
  strongestTrade,
}) => {
  const recommendations = [];

  if (stats.avgDiscipline < 70) {
    recommendations.push(
      "Reduce trade frequency this week and only take setups that keep your discipline score above 70%.",
    );
  }

  if (stats.mostRepeatedMistake?.tag) {
    recommendations.push(
      `Your most repeated mistake was "${stats.mostRepeatedMistake.tag}". Focus on eliminating that pattern before adding more trades.`,
    );
  }

  if (worstStrategy && bestStrategy && worstStrategy.strategyKey !== bestStrategy.strategyKey) {
    recommendations.push(
      `Lean harder into ${formatStrategyKey(bestStrategy.strategyKey)} setups and review why ${formatStrategyKey(worstStrategy.strategyKey)} underperformed this week.`,
    );
  }

  if (mostCommonEmotion && highRiskEmotions.has(mostCommonEmotion.emotion)) {
    recommendations.push(
      `Your most common pre-trade emotion was ${mostCommonEmotion.emotion}. Slow down whenever that emotion shows up before entry.`,
    );
  }

  if (strongestTrade && strongestTrade.result === "LOSS" && strongestTrade.disciplineScore >= 70) {
    recommendations.push(
      "Your strongest trade still lost, which suggests normal market variance rather than a broken process. Stay consistent with high-discipline setups.",
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Your process looked stable this week. Keep prioritizing the same setup quality and review discipline before increasing trade frequency.",
    );
  }

  return recommendations;
};

export const buildWeeklyReview = (trades, planType, referenceDate = new Date()) => {
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(weekStart);
  const weeklyTrades = trades
    .filter((trade) => {
      const tradeDate = new Date(trade.tradeDate);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    })
    .map(serializeTrade)
    .sort((left, right) => new Date(left.tradeDate).getTime() - new Date(right.tradeDate).getTime());

  const stats = buildDashboardStats(weeklyTrades);
  const emotionSummary = buildEmotionSummary(weeklyTrades);
  const strongestTrade = buildStrongestTrade(weeklyTrades);
  const { bestStrategy, worstStrategy } = buildStrategyInsights(stats.strategyBreakdown || []);
  const averageRiskReward = safeAverage(
    weeklyTrades
      .map((trade) =>
        trade.riskAmount && trade.rewardAmount && Number(trade.riskAmount) !== 0
          ? Number(trade.rewardAmount) / Number(trade.riskAmount)
          : null,
      )
      .filter((value) => value !== null),
  );

  const overview = {
    totalTrades: stats.totalTrades,
    completedTrades: stats.completedTrades,
    winningTrades: stats.winningTrades,
    losingTrades: stats.losingTrades,
    breakevenTrades: stats.breakevenTrades,
    netProfitLoss: stats.netProfitLoss,
    avgConfluence: stats.avgConfluence,
    avgDiscipline: stats.avgDiscipline,
    averageRiskReward,
  };

  if (planType !== "PRO") {
    return {
      accessLevel: "FREE_PREVIEW",
      week: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
      overview,
      totalTradesThisWeek: weeklyTrades.length,
      teaser: {
        headline: "Upgrade to unlock weekly discipline review",
        description:
          "Pro weekly reviews highlight your strongest strategy, repeated mistakes, emotional patterns, and a recommendation based on this week's behavior.",
        lockedSections: [
          "Best and worst strategy of the week",
          "Most repeated and most costly mistake",
          "Most common pre-trade emotion",
          "Strongest trade and weekly recommendation",
        ],
      },
    };
  }

  return {
    accessLevel: "PRO",
    week: {
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
    overview,
    insights: {
      bestStrategy,
      worstStrategy,
      mostRepeatedMistake: stats.mostRepeatedMistake,
      mostCostlyMistake: stats.mostCostlyMistake,
      mostCommonEmotionBeforeTrade: emotionSummary.mostCommon,
      emotionBreakdown: emotionSummary.breakdown,
      strongestTrade,
      recommendation: buildRecommendation({
        stats,
        bestStrategy,
        worstStrategy,
        mostCommonEmotion: emotionSummary.mostCommon,
        strongestTrade,
      }),
    },
  };
};
