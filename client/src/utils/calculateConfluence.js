export const calculateSectionScore = (section) =>
  section.conditions.reduce(
    (total, condition) => total + (condition.checked ? condition.weight : 0),
    0
  );

export const calculateMaxScore = (sections) =>
  sections.reduce(
    (total, section) =>
      total +
      section.conditions.reduce((sectionTotal, condition) => sectionTotal + condition.weight, 0),
    0,
  );

export const calculateTotalScore = (sections) => {
  const maxScore = calculateMaxScore(sections);
  if (!maxScore) {
    return 0;
  }

  const rawScore = sections.reduce((total, section) => total + calculateSectionScore(section), 0);
  return Math.round((rawScore / maxScore) * 100);
};

export const classifySetup = (score) => {
  if (score >= 85) {
    return "Elite Setup";
  }

  if (score >= 70) {
    return "Strong Setup";
  }

  if (score >= 40) {
    return "Moderate Setup";
  }

  return "Weak Setup";
};

export const createChecklistSnapshot = (sections) =>
  sections.map((section) => ({
    id: section.id,
    title: section.title,
    score: calculateSectionScore(section),
    conditions: section.conditions.map((condition) => ({
      id: condition.id,
      label: condition.label,
      weight: condition.weight,
      checked: condition.checked
    }))
  }));
