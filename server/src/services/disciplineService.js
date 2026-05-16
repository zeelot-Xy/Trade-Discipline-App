import { HIGH_RISK_EMOTIONS, MIN_DISCIPLINE_CONFLUENCE } from "../constants/tradingOptions.js";

const percent = (passed, total) => (total ? Math.round((passed / total) * 100) : 0);

const hasRiskConfirmations = (checklistSnapshot) => {
  const riskSection = checklistSnapshot?.find((section) => section.id === "risk-management");
  return Boolean(
    riskSection?.conditions?.length &&
      riskSection.conditions.every((condition) => condition.checked),
  );
};

export const calculateDisciplineSnapshot = ({
  confluenceScore,
  checklistSnapshot,
  direction,
  entryPrice,
  stopLoss,
  takeProfit,
  riskAmount,
  emotionBefore,
  status,
  result,
  profitLoss,
  emotionAfter,
  notes,
  mistakeTags = [],
}) => {
  const hasLiveChecklist =
    Array.isArray(checklistSnapshot) &&
    checklistSnapshot.length > 0 &&
    confluenceScore !== undefined &&
    confluenceScore !== null;

  if (!hasLiveChecklist) {
    return {
      score: null,
      summary: "No live discipline score was recorded for this imported trade.",
      factors: [],
    };
  }

  const factors = [
    {
      key: "risk-confirmations",
      label: "Risk confirmations completed",
      passed: hasRiskConfirmations(checklistSnapshot),
    },
    {
      key: "stop-loss",
      label: "Stop loss price entered",
      passed: stopLoss !== undefined && stopLoss !== null,
    },
    {
      key: "take-profit",
      label: "Take profit price entered",
      passed: takeProfit !== undefined && takeProfit !== null,
    },
    {
      key: "risk-amount",
      label: "Risk amount entered",
      passed: riskAmount !== undefined && riskAmount !== null,
    },
    {
      key: "trade-plan",
      label: "Direction, entry, stop loss, and take profit are fully planned",
      passed: Boolean(
        direction &&
          entryPrice !== undefined &&
          entryPrice !== null &&
          stopLoss !== undefined &&
          stopLoss !== null &&
          takeProfit !== undefined &&
          takeProfit !== null,
      ),
    },
    {
      key: "confluence-threshold",
      label: `Trade meets the minimum discipline threshold of ${MIN_DISCIPLINE_CONFLUENCE}% confluence`,
      passed: confluenceScore >= MIN_DISCIPLINE_CONFLUENCE,
    },
    {
      key: "emotion-before",
      label: "Pre-trade emotion was not a high-risk discipline emotion",
      passed: emotionBefore ? !HIGH_RISK_EMOTIONS.has(emotionBefore) : false,
    },
  ];

  if (status === "CLOSED") {
    factors.push(
      {
        key: "outcome-recorded",
        label: "Closed trade has result and realized P/L recorded",
        passed:
          Boolean(result) &&
          profitLoss !== undefined &&
          profitLoss !== null,
      },
      {
        key: "emotion-after",
        label: "Post-trade emotion recorded",
        passed: Boolean(emotionAfter),
      },
      {
        key: "mistake-review",
        label: "Closed trade has mistake review tags",
        passed: Array.isArray(mistakeTags) && mistakeTags.length > 0,
      },
      {
        key: "reflection",
        label: "Post-trade reflection notes recorded",
        passed: Boolean(notes?.trim()),
      },
    );
  }

  const passedFactors = factors.filter((factor) => factor.passed);
  const failedFactors = factors.filter((factor) => !factor.passed);
  const score = percent(passedFactors.length, factors.length);

  let verdict = "Discipline needs attention.";
  if (score >= 85) {
    verdict = "Strong discipline. Your trade process was followed cleanly.";
  } else if (score >= 70) {
    verdict = "Solid discipline with a few process gaps to tighten.";
  } else if (score >= 50) {
    verdict = "Mixed discipline. The setup may be valid, but execution habits need work.";
  }

  const summary = failedFactors.length
    ? `${verdict} Missing: ${failedFactors
        .slice(0, 2)
        .map((factor) => factor.label.toLowerCase())
        .join(" and ")}.`
    : verdict;

  return {
    score,
    summary,
    factors,
  };
};
