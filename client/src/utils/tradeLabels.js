export const normalizeSetupQualityLabel = (value) => {
  if (!value) {
    return value;
  }

  return value === "Perfect Trade" ? "Elite Setup" : value;
};
