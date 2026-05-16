import { serializeTrade } from "../utils/serializeTrade.js";

const safeAverage = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

const getMostFrequentItem = (items) => {
  const counts = new Map();

  for (const item of items) {
    if (!item) {
      continue;
    }

    counts.set(item, (counts.get(item) || 0) + 1);
  }

  const ranked = Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count);

  return ranked[0] || null;
};

const buildStrategyEntry = (strategyKey, trades) => {
  const completedTrades = trades.filter((trade) => trade.status === "CLOSED");
  const winningTrades = completedTrades.filter((trade) => trade.result === "WIN");
  const profitLosses = trades.map((trade) => trade.profitLoss ?? 0);
  const positivePnl = profitLosses.filter((value) => value > 0);
  const negativePnl = profitLosses.filter((value) => value < 0);
  const mistakeTags = trades.flatMap((trade) => trade.mistakeTags ?? []);
  const emotionsBefore = trades.map((trade) => trade.emotionBefore).filter(Boolean);
  const confluenceScores = trades
    .map((trade) => trade.confluenceScore)
    .filter((value) => value !== null && value !== undefined);
  const disciplineScores = trades
    .map((trade) => trade.disciplineScore)
    .filter((value) => value !== null && value !== undefined);

  const mostCommonMistake = getMostFrequentItem(mistakeTags);
  const mostCommonEmotionBefore = getMostFrequentItem(emotionsBefore);
  const strongestTrade = [...trades].sort((left, right) => {
    const leftDiscipline = left.disciplineScore ?? -1;
    const rightDiscipline = right.disciplineScore ?? -1;
    const leftProfit = left.profitLoss ?? Number.NEGATIVE_INFINITY;
    const rightProfit = right.profitLoss ?? Number.NEGATIVE_INFINITY;

    return (
      (right.confluenceScore ?? -1) - (left.confluenceScore ?? -1) ||
      rightDiscipline - leftDiscipline ||
      rightProfit - leftProfit
    );
  })[0] || null;

  return {
    strategyKey,
    totalTrades: trades.length,
    completedTrades: completedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: completedTrades.filter((trade) => trade.result === "LOSS").length,
    breakevenTrades: completedTrades.filter((trade) => trade.result === "BREAKEVEN").length,
    winRate: completedTrades.length ? (winningTrades.length / completedTrades.length) * 100 : 0,
    netProfitLoss: profitLosses.reduce((total, value) => total + value, 0),
    totalProfit: positivePnl.reduce((total, value) => total + value, 0),
    totalLoss: negativePnl.reduce((total, value) => total + value, 0),
    largestWin: positivePnl.length ? Math.max(...positivePnl) : 0,
    largestLoss: negativePnl.length ? Math.min(...negativePnl) : 0,
    avgConfluence: safeAverage(confluenceScores),
    avgDiscipline: safeAverage(disciplineScores),
    mostCommonMistake: mostCommonMistake
      ? { tag: mostCommonMistake.value, count: mostCommonMistake.count }
      : null,
    mostCommonEmotionBefore: mostCommonEmotionBefore
      ? { emotion: mostCommonEmotionBefore.value, count: mostCommonEmotionBefore.count }
      : null,
    strongestTrade,
  };
};

const buildComparison = (strategies) => {
  if (!strategies.length) {
    return {
      bestPerforming: null,
      weakestPerforming: null,
      strongestDisciplineButWeakOutcome: null,
      weakestDisciplineAndOutcome: null,
    };
  }

  const byPerformance = [...strategies].sort((left, right) => {
    return (
      right.netProfitLoss - left.netProfitLoss ||
      right.winRate - left.winRate ||
      right.avgDiscipline - left.avgDiscipline
    );
  });

  const byWeakness = [...strategies].sort((left, right) => {
    return (
      left.netProfitLoss - right.netProfitLoss ||
      left.winRate - right.winRate ||
      left.avgDiscipline - right.avgDiscipline
    );
  });

  const byDiscipline = [...strategies]
    .filter((strategy) => strategy.avgDiscipline > 0)
    .sort((left, right) => right.avgDiscipline - left.avgDiscipline);

  const strongestDisciplineButWeakOutcome =
    byDiscipline.find((strategy) => strategy.netProfitLoss <= 0) || null;

  const weakestDisciplineAndOutcome =
    [...strategies]
      .filter((strategy) => strategy.avgDiscipline > 0)
      .sort((left, right) => {
        return (
          left.avgDiscipline - right.avgDiscipline ||
          left.netProfitLoss - right.netProfitLoss
        );
      })[0] || null;

  return {
    bestPerforming: byPerformance[0] || null,
    weakestPerforming: byWeakness[0] || null,
    strongestDisciplineButWeakOutcome,
    weakestDisciplineAndOutcome,
  };
};

const buildRecommendation = (comparison) => {
  const notes = [];

  if (comparison.bestPerforming) {
    notes.push(
      `${comparison.bestPerforming.strategyKey} is currently your strongest performing strategy. Consider making it your benchmark process.`,
    );
  }

  if (comparison.weakestPerforming && comparison.weakestPerforming !== comparison.bestPerforming) {
    notes.push(
      `${comparison.weakestPerforming.strategyKey} is your weakest strategy right now. Review its entries before taking more of the same setup style.`,
    );
  }

  if (comparison.strongestDisciplineButWeakOutcome) {
    notes.push(
      `${comparison.strongestDisciplineButWeakOutcome.strategyKey} shows strong discipline but weak outcomes. The issue may be strategy quality rather than behavior.`,
    );
  }

  if (comparison.weakestDisciplineAndOutcome) {
    notes.push(
      `${comparison.weakestDisciplineAndOutcome.strategyKey} is struggling in both discipline and outcome. Tighten your process there before increasing size or frequency.`,
    );
  }

  return notes;
};

export const buildStrategyPerformanceReport = (trades, planType) => {
  const serializedTrades = trades.map(serializeTrade);
  const grouped = serializedTrades.reduce((accumulator, trade) => {
    const strategyKey = trade.strategyKey ?? "legacy";
    if (!accumulator.has(strategyKey)) {
      accumulator.set(strategyKey, []);
    }
    accumulator.get(strategyKey).push(trade);
    return accumulator;
  }, new Map());

  const strategies = Array.from(grouped.entries()).map(([strategyKey, strategyTrades]) =>
    buildStrategyEntry(strategyKey, strategyTrades),
  );

  const comparison = buildComparison(strategies);

  if (planType !== "PRO") {
    return {
      accessLevel: "FREE_PREVIEW",
      totalStrategiesTracked: strategies.length,
      totalTradesAnalyzed: serializedTrades.length,
      teaser: {
        headline: "Upgrade to compare strategy performance deeply",
        description:
          "Pro strategy analysis shows which trading style is performing best, where discipline is slipping, and what mistakes are tied to each strategy.",
        lockedSections: [
          "Full strategy-by-strategy scorecards",
          "Most common mistake and emotion per strategy",
          "Best and weakest strategy verdicts",
          "Discipline-vs-outcome comparison insights",
        ],
      },
    };
  }

  return {
    accessLevel: "PRO",
    totalStrategiesTracked: strategies.length,
    totalTradesAnalyzed: serializedTrades.length,
    strategies,
    comparison,
    recommendation: buildRecommendation(comparison),
  };
};
