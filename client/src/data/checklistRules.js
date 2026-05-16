const legacyStrategyLabels = {
  "smart-money": "Smart Money",
  "ema-pullback": "EMA Pullback",
  "breakout-retest": "Breakout Retest",
};

export const strategyPresets = {
  trend: {
    key: "trend",
    label: "Trend",
    description:
      "Built for traders following the dominant market direction and looking for continuation quality across timeframes.",
    glossary: [
      { term: "EMA", meaning: "Exponential Moving Average used for pullback structure and trend support." },
      { term: "Momentum Shift", meaning: "A lower timeframe signal that continuation pressure is returning." },
    ],
    sections: [
      {
        id: "weekly",
        title: "Higher Timeframe Bias",
        conditions: [
          { id: "macro-trend", label: "Macro trend is clear", weight: 10 },
          { id: "structure", label: "Structure supports continuation", weight: 10 },
          { id: "space", label: "Clean space to the next target", weight: 5 },
        ],
      },
      {
        id: "daily",
        title: "Daily Continuation Quality",
        conditions: [
          { id: "daily-trend", label: "Daily trend still intact", weight: 10 },
          { id: "pullback-zone", label: "Pullback into a healthy continuation zone", weight: 10 },
          { id: "ema-support", label: "EMA or dynamic support is respected", weight: 5 },
        ],
      },
      {
        id: "four-hour",
        title: "4H Confirmation",
        conditions: [
          { id: "4h-rejection", label: "4H rejection from continuation area", weight: 10 },
          { id: "4h-pattern", label: "Continuation pattern is intact", weight: 10 },
          { id: "4h-candle", label: "Strong continuation candle forms", weight: 5 },
        ],
      },
      {
        id: "lower-timeframes",
        title: "Lower Timeframe Entry",
        conditions: [
          { id: "ltf-break", label: "Lower timeframe momentum shift", weight: 10 },
          { id: "ltf-entry", label: "Entry trigger aligns with trend plan", weight: 10 },
        ],
      },
      {
        id: "entry-signal",
        title: "Execution Trigger",
        conditions: [
          { id: "engulfing", label: "Confirmation candle supports continuation", weight: 10 },
          { id: "invalidated", label: "Invalidation level is clear", weight: 5 },
        ],
      },
      {
        id: "risk-management",
        title: "Stop Loss & Take Profit",
        conditions: [
          { id: "stop-loss-confirmed", label: "Stop Loss Confirmed", weight: 5, required: true },
          { id: "take-profit-confirmed", label: "Take Profit Confirmed", weight: 5, required: true },
        ],
      },
    ],
  },
  swing: {
    key: "swing",
    label: "Swing",
    description:
      "Designed for traders holding setups across larger structure moves, focusing on zones, patience, and reward-to-risk quality.",
    glossary: [
      { term: "POI", meaning: "Point of Interest where a larger swing reaction is expected." },
      { term: "Structure", meaning: "Support, resistance, and trend context across higher timeframes." },
    ],
    sections: [
      {
        id: "weekly",
        title: "Weekly Context",
        conditions: [
          { id: "weekly-bias", label: "Weekly bias is aligned", weight: 10 },
          { id: "weekly-zone", label: "Price is at a major swing zone", weight: 10 },
          { id: "weekly-space", label: "There is room for the swing to develop", weight: 5 },
        ],
      },
      {
        id: "daily",
        title: "Daily Setup",
        conditions: [
          { id: "daily-zone", label: "Daily POI is active", weight: 10 },
          { id: "daily-rejection", label: "Daily rejection confirms interest", weight: 10 },
          { id: "daily-structure", label: "Daily structure favors the idea", weight: 5 },
        ],
      },
      {
        id: "four-hour",
        title: "4H Refinement",
        conditions: [
          { id: "4h-entry-zone", label: "4H gives a refined entry zone", weight: 10 },
          { id: "4h-candle", label: "4H confirmation candle is present", weight: 10 },
          { id: "4h-pattern", label: "Pattern supports a swing continuation", weight: 5 },
        ],
      },
      {
        id: "lower-timeframes",
        title: "Lower Timeframe Timing",
        conditions: [
          { id: "ltf-confirm", label: "Lower timeframe confirms the bounce or reversal", weight: 10 },
          { id: "ltf-clean", label: "Entry timing is clean and patient", weight: 10 },
        ],
      },
      {
        id: "entry-signal",
        title: "Execution Trigger",
        conditions: [
          { id: "engulfing", label: "Strong swing confirmation candle", weight: 10 },
          { id: "rr-clear", label: "Risk-to-reward is clearly favorable", weight: 5 },
        ],
      },
      {
        id: "risk-management",
        title: "Stop Loss & Take Profit",
        conditions: [
          { id: "stop-loss-confirmed", label: "Stop Loss Confirmed", weight: 5, required: true },
          { id: "take-profit-confirmed", label: "Take Profit Confirmed", weight: 5, required: true },
        ],
      },
    ],
  },
  scalping: {
    key: "scalping",
    label: "Scalping",
    description:
      "Focused on fast execution, session timing, precise lower timeframe confirmation, and strict risk control.",
    glossary: [
      { term: "Session Bias", meaning: "The expected directional context during the active trading session." },
      { term: "Liquidity Sweep", meaning: "A quick move through a local level before reversal or continuation." },
    ],
    sections: [
      {
        id: "higher-bias",
        title: "Session Bias",
        conditions: [
          { id: "session-trend", label: "Higher timeframe bias is clear", weight: 10 },
          { id: "session-window", label: "Setup is inside an active trading session", weight: 10 },
          { id: "session-space", label: "There is enough short-term room to target", weight: 5 },
        ],
      },
      {
        id: "setup-zone",
        title: "Setup Zone",
        conditions: [
          { id: "liquidity-area", label: "Price is reacting at a clear intraday level", weight: 10 },
          { id: "rejection", label: "Rejection or sweep has occurred", weight: 10 },
          { id: "micro-structure", label: "Micro structure supports the idea", weight: 5 },
        ],
      },
      {
        id: "lower-timeframes",
        title: "Lower Timeframe Confirmation",
        conditions: [
          { id: "momentum-shift", label: "Momentum shifts in your favor", weight: 10 },
          { id: "confirmation-candle", label: "A strong confirmation candle appears", weight: 10 },
          { id: "precise-entry", label: "Entry is precise and not chased", weight: 5 },
        ],
      },
      {
        id: "execution",
        title: "Execution Quality",
        conditions: [
          { id: "tight-risk", label: "Tight invalidation is available", weight: 10 },
          { id: "quick-rr", label: "R:R is still attractive for a scalp", weight: 10 },
        ],
      },
      {
        id: "entry-signal",
        title: "Trigger",
        conditions: [
          { id: "fast-trigger", label: "Entry trigger is immediate and clean", weight: 10 },
          { id: "no-hesitation", label: "No forced or late entry", weight: 5 },
        ],
      },
      {
        id: "risk-management",
        title: "Stop Loss & Take Profit",
        conditions: [
          { id: "stop-loss-confirmed", label: "Stop Loss Confirmed", weight: 5, required: true },
          { id: "take-profit-confirmed", label: "Take Profit Confirmed", weight: 5, required: true },
        ],
      },
    ],
  },
};

export const defaultStrategyKey = "trend";

export const strategyOptions = Object.values(strategyPresets).map((strategy) => ({
  key: strategy.key,
  label: strategy.label,
  description: strategy.description,
}));

export const createChecklistState = (strategyKey = defaultStrategyKey) => {
  const strategy = strategyPresets[strategyKey] || strategyPresets[defaultStrategyKey];

  return strategy.sections.map((section) => ({
    ...section,
    conditions: section.conditions.map((condition) => ({
      ...condition,
      checked: false,
    })),
  }));
};

export const getStrategyMeta = (strategyKey) =>
  strategyPresets[strategyKey] ||
  (legacyStrategyLabels[strategyKey]
    ? {
        key: strategyKey,
        label: legacyStrategyLabels[strategyKey],
        description: "Legacy strategy record from an earlier checklist version.",
        glossary: [],
      }
    : null);

export const getStrategyLabel = (strategyKey) =>
  strategyKey ? getStrategyMeta(strategyKey)?.label || "Legacy Strategy" : "Not assigned";
