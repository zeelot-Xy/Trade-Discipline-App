import { serializeTrade } from "../utils/serializeTrade.js";

const safeAverage = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

const createBucket = () => ({
  totalTrades: 0,
  completedTrades: 0,
  wins: 0,
  losses: 0,
  breakevens: 0,
  netProfitLoss: 0,
  confluenceScores: [],
  disciplineScores: [],
});

const finalizeBucket = (bucket) => ({
  totalTrades: bucket.totalTrades,
  completedTrades: bucket.completedTrades,
  wins: bucket.wins,
  losses: bucket.losses,
  breakevens: bucket.breakevens,
  winRate: bucket.completedTrades ? (bucket.wins / bucket.completedTrades) * 100 : 0,
  netProfitLoss: bucket.netProfitLoss,
  avgConfluence: safeAverage(bucket.confluenceScores),
  avgDiscipline: safeAverage(bucket.disciplineScores),
});

const updateBucket = (bucket, trade) => {
  bucket.totalTrades += 1;
  bucket.netProfitLoss += trade.profitLoss ?? 0;
  if (trade.confluenceScore !== null && trade.confluenceScore !== undefined) {
    bucket.confluenceScores.push(trade.confluenceScore);
  }

  if (trade.disciplineScore !== null && trade.disciplineScore !== undefined) {
    bucket.disciplineScores.push(trade.disciplineScore);
  }

  if (trade.status === "CLOSED") {
    bucket.completedTrades += 1;
  }
  if (trade.result === "WIN") {
    bucket.wins += 1;
  }
  if (trade.result === "LOSS") {
    bucket.losses += 1;
  }
  if (trade.result === "BREAKEVEN") {
    bucket.breakevens += 1;
  }
};

const buildRecommendation = ({ topPositiveRule, topNegativeRule }) => {
  const recommendations = [];

  if (topPositiveRule) {
    recommendations.push(
      `The condition "${topPositiveRule.label}" is currently your strongest positive rule signal. Respect it more consistently when it appears.`,
    );
  }

  if (topNegativeRule) {
    recommendations.push(
      `The condition "${topNegativeRule.label}" is currently associated with weaker outcomes. Review whether you are overvaluing it or taking it without enough supporting confirmation.`,
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "You need more saved trades before rule-level impact becomes meaningful. Keep journaling consistently.",
    );
  }

  return recommendations;
};

export const buildRuleImpactReport = (trades, planType) => {
  const serializedTrades = trades.map(serializeTrade);
  const conditionMap = new Map();

  for (const trade of serializedTrades) {
    for (const section of trade.checklistSnapshot || []) {
      for (const condition of section.conditions || []) {
        const key = `${section.id}:${condition.id}`;
        const existing = conditionMap.get(key) || {
          key,
          sectionId: section.id,
          sectionTitle: section.title,
          conditionId: condition.id,
          label: condition.label,
          weight: condition.weight,
          checked: createBucket(),
          unchecked: createBucket(),
        };

        updateBucket(condition.checked ? existing.checked : existing.unchecked, trade);
        conditionMap.set(key, existing);
      }
    }
  }

  const conditions = Array.from(conditionMap.values()).map((entry) => {
    const checked = finalizeBucket(entry.checked);
    const unchecked = finalizeBucket(entry.unchecked);
    const winRateDelta = checked.winRate - unchecked.winRate;
    const pnlDelta = checked.netProfitLoss - unchecked.netProfitLoss;
    const disciplineDelta = checked.avgDiscipline - unchecked.avgDiscipline;

    return {
      key: entry.key,
      sectionId: entry.sectionId,
      sectionTitle: entry.sectionTitle,
      conditionId: entry.conditionId,
      label: entry.label,
      weight: entry.weight,
      checked,
      unchecked,
      winRateDelta,
      pnlDelta,
      disciplineDelta,
      impactScore: winRateDelta + pnlDelta * 0.05 + disciplineDelta * 0.2,
    };
  });

  const sortedByImpact = [...conditions].sort((left, right) => right.impactScore - left.impactScore);
  const topPositiveRule = sortedByImpact[0] || null;
  const topNegativeRule = [...sortedByImpact].sort((left, right) => left.impactScore - right.impactScore)[0] || null;

  if (planType !== "PRO") {
    return {
      accessLevel: "FREE_PREVIEW",
      totalRulesAnalyzed: conditions.length,
      totalTradesAnalyzed: serializedTrades.length,
      teaser: {
        headline: "Upgrade to see which rules are actually helping",
        description:
          "Rule Impact Analysis compares outcomes when each checklist condition was checked versus unchecked, so you can find the parts of your process that really matter.",
        lockedSections: [
          "Top positive and negative rule signals",
          "Win-rate and P/L deltas per checklist condition",
          "Rule-by-rule confluence and discipline context",
          "Actionable recommendation from your own rule history",
        ],
      },
    };
  }

  return {
    accessLevel: "PRO",
    totalRulesAnalyzed: conditions.length,
    totalTradesAnalyzed: serializedTrades.length,
    topPositiveRule,
    topNegativeRule,
    conditions: sortedByImpact,
    recommendation: buildRecommendation({ topPositiveRule, topNegativeRule }),
  };
};
