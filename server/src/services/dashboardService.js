import { serializeTrade } from "../utils/serializeTrade.js";

const sum = (values) => values.reduce((total, value) => total + value, 0);
const safeAverage = (values) => (values.length ? sum(values) / values.length : 0);

export const buildDashboardStats = (trades) => {
  const serializedTrades = trades.map(serializeTrade).sort((a, b) => {
    return new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime();
  });

  const totalTrades = serializedTrades.length;
  const completedTrades = serializedTrades.filter((trade) => trade.status === "CLOSED").length;
  const winningTrades = serializedTrades.filter((trade) => trade.result === "WIN").length;
  const losingTrades = serializedTrades.filter((trade) => trade.result === "LOSS").length;
  const breakevenTrades = serializedTrades.filter((trade) => trade.result === "BREAKEVEN").length;

  const positivePnl = serializedTrades
    .map((trade) => trade.profitLoss ?? 0)
    .filter((value) => value > 0);
  const negativePnl = serializedTrades
    .map((trade) => trade.profitLoss ?? 0)
    .filter((value) => value < 0);

  const totalProfit = sum(positivePnl);
  const totalLoss = sum(negativePnl);
  const netProfitLoss = totalProfit + totalLoss;
  const winRate = completedTrades ? (winningTrades / completedTrades) * 100 : 0;
  const profitFactor =
    totalLoss !== 0 ? totalProfit / Math.abs(totalLoss) : totalProfit > 0 ? totalProfit : 0;
  const confluenceScores = serializedTrades
    .map((trade) => trade.confluenceScore)
    .filter((score) => score !== null && score !== undefined);
  const avgConfluence = safeAverage(confluenceScores);
  const avgDiscipline = safeAverage(
    serializedTrades
      .map((trade) => trade.disciplineScore)
      .filter((score) => score !== null && score !== undefined),
  );
  const largestWin = positivePnl.length ? Math.max(...positivePnl) : 0;
  const largestLoss = negativePnl.length ? Math.min(...negativePnl) : 0;
  const strategyMap = new Map();
  const mistakeMap = new Map();

  let bestStreak = 0;
  let currentStreak = 0;

  for (const trade of serializedTrades) {
    if (trade.result === "WIN") {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const calendarMap = new Map();

  for (const trade of serializedTrades) {
    const dateKey = new Date(trade.tradeDate).toISOString().split("T")[0];
    const existing = calendarMap.get(dateKey) || {
      date: dateKey,
      totalTrades: 0,
      netProfitLoss: 0,
      openTrades: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      trades: [],
    };

    existing.totalTrades += 1;
    existing.netProfitLoss += trade.profitLoss ?? 0;
    if (trade.status === "OPEN") {
      existing.openTrades += 1;
    }
    if (trade.result === "WIN") {
      existing.wins += 1;
    }
    if (trade.result === "LOSS") {
      existing.losses += 1;
    }
    if (trade.result === "BREAKEVEN") {
      existing.breakevens += 1;
    }

    existing.trades.push({
      id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      result: trade.result,
      status: trade.status,
      profitLoss: trade.profitLoss ?? 0,
      confluenceScore: trade.confluenceScore,
      setupQuality: trade.setupQuality,
      tradeDate: trade.tradeDate,
      strategyKey: trade.strategyKey ?? null,
      entrySource: trade.entrySource,
      importSource: trade.importSource ?? null,
      disciplineScore: trade.disciplineScore ?? null,
      disciplineSummary: trade.disciplineSummary ?? "",
      mistakeTags: trade.mistakeTags ?? [],
    });

    calendarMap.set(dateKey, existing);

    const strategyKey = trade.strategyKey ?? "legacy";
    const strategyEntry = strategyMap.get(strategyKey) || {
      strategyKey,
      trades: 0,
      completedTrades: 0,
      winningTrades: 0,
      netProfitLoss: 0,
      totalConfluence: 0,
      confluenceCount: 0,
      totalDiscipline: 0,
      disciplineCount: 0,
    };

    strategyEntry.trades += 1;
    strategyEntry.netProfitLoss += trade.profitLoss ?? 0;
    if (trade.confluenceScore !== null && trade.confluenceScore !== undefined) {
      strategyEntry.totalConfluence += trade.confluenceScore;
      strategyEntry.confluenceCount += 1;
    }
    if (trade.status === "CLOSED") {
      strategyEntry.completedTrades += 1;
    }
    if (trade.result === "WIN") {
      strategyEntry.winningTrades += 1;
    }
    if (trade.disciplineScore !== null && trade.disciplineScore !== undefined) {
      strategyEntry.totalDiscipline += trade.disciplineScore;
      strategyEntry.disciplineCount += 1;
    }

    strategyMap.set(strategyKey, strategyEntry);

    for (const tag of trade.mistakeTags ?? []) {
      const mistakeEntry = mistakeMap.get(tag) || {
        tag,
        trades: 0,
        netProfitLoss: 0,
      };
      mistakeEntry.trades += 1;
      mistakeEntry.netProfitLoss += trade.profitLoss ?? 0;
      mistakeMap.set(tag, mistakeEntry);
    }
  }

  const strategyBreakdown = Array.from(strategyMap.values()).map((entry) => ({
    strategyKey: entry.strategyKey,
    trades: entry.trades,
    completedTrades: entry.completedTrades,
    winningTrades: entry.winningTrades,
    winRate: entry.completedTrades ? (entry.winningTrades / entry.completedTrades) * 100 : 0,
    netProfitLoss: entry.netProfitLoss,
    avgConfluence: entry.confluenceCount ? entry.totalConfluence / entry.confluenceCount : 0,
    avgDiscipline: entry.disciplineCount
      ? entry.totalDiscipline / entry.disciplineCount
      : 0,
  }));

  const mistakeBreakdown = Array.from(mistakeMap.values()).sort((a, b) => b.trades - a.trades);
  const mostRepeatedMistake = mistakeBreakdown[0] || null;
  const mostCostlyMistake =
    [...mistakeBreakdown].sort((a, b) => a.netProfitLoss - b.netProfitLoss)[0] || null;

  return {
    totalTrades,
    completedTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    totalProfit,
    totalLoss,
    netProfitLoss,
    winRate,
    profitFactor,
    avgConfluence,
    avgDiscipline,
    largestWin,
    largestLoss,
    bestStreak,
    strategyBreakdown,
    mistakeBreakdown,
    mostRepeatedMistake,
    mostCostlyMistake,
    calendarData: Array.from(calendarMap.values()),
  };
};
