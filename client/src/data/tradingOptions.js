export const emotionBeforeOptions = [
  "Calm",
  "Focused",
  "Confident",
  "Patient",
  "Neutral",
  "Hesitant",
  "Anxious",
  "Fearful",
  "FOMO",
  "Frustrated",
  "Revenge-driven",
  "Overconfident",
];

export const emotionAfterOptions = [
  "Calm",
  "Satisfied",
  "Proud",
  "Relieved",
  "Focused",
  "Neutral",
  "Disappointed",
  "Frustrated",
  "Anxious",
  "Overconfident",
];

export const emotionOptions = [...new Set([...emotionBeforeOptions, ...emotionAfterOptions])];

export const mistakeTagOptions = [
  "No notable mistake",
  "Entered too early",
  "Entered late",
  "Ignored higher timeframe",
  "No clear confirmation",
  "Moved stop loss",
  "Closed too early",
  "Held too long",
  "Over-risked",
  "Revenge trade",
  "FOMO entry",
  "Traded during low confidence",
  "Broke strategy rules",
  "Did not wait for retest",
  "Ignored checklist warning",
];

export const riskyEmotionSet = new Set([
  "Anxious",
  "Fearful",
  "FOMO",
  "Frustrated",
  "Revenge-driven",
  "Overconfident",
]);
