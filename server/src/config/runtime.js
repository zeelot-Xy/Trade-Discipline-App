import path from "path";

const localClientUrl = "http://localhost:5173";
const localApiUrl = "http://localhost:5000/api";

const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const parseCsvEnv = (value) =>
  String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wildcardToRegex = (pattern) => {
  const normalized = normalizeUrl(pattern);
  const escaped = escapeRegex(normalized).replace(/\\\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
};

export const getClientUrl = () => normalizeUrl(process.env.CLIENT_URL) || localClientUrl;

export const getApiUrl = () => normalizeUrl(process.env.API_URL) || localApiUrl;

export const getAllowedCorsOrigins = () => {
  const exactOrigins = new Set();
  const wildcardPatterns = [];

  [getClientUrl(), ...parseCsvEnv(process.env.ALLOWED_ORIGINS)].forEach((origin) => {
    if (!origin) {
      return;
    }

    if (origin.includes("*")) {
      wildcardPatterns.push(wildcardToRegex(origin));
      return;
    }

    exactOrigins.add(normalizeUrl(origin));
  });

  return { exactOrigins, wildcardPatterns };
};

export const isAllowedCorsOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeUrl(origin);
  const { exactOrigins, wildcardPatterns } = getAllowedCorsOrigins();

  if (exactOrigins.has(normalizedOrigin)) {
    return true;
  }

  return wildcardPatterns.some((pattern) => pattern.test(normalizedOrigin));
};

export const getUploadsRoot = () =>
  path.resolve(process.env.UPLOADS_DIR?.trim() || "uploads");

