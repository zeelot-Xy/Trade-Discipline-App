import jwt from "jsonwebtoken";

const COOKIE_NAME = "perfect_trade_token";

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

export const authCookieName = COOKIE_NAME;
