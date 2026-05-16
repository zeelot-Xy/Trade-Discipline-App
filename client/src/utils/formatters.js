export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(Number(value || 0));

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const formatDateOnly = (value) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
  }).format(new Date(value));
