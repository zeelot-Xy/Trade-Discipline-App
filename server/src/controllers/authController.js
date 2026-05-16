import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "../prisma/prisma.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidators.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/jwt.js";
import { serializeUser } from "../utils/userSerializer.js";
import { getUsageSummaryForUser } from "../services/usageService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const buildAuthPayload = async (user) => ({
  user: serializeUser(user),
  usage: await getUsageSummaryForUser(user.id, user.planType),
});

export const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      passwordHash,
    },
  });

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    data: await buildAuthPayload(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);

  res.json({
    success: true,
    data: await buildAuthPayload(user),
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    data: {},
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401);
  }

  res.json({
    success: true,
    data: await buildAuthPayload(req.user),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const payload = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  let resetUrl;
  let deliveryMode = "email";

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetUrl,
    });
    deliveryMode = emailResult.deliveryMode;
  }

  res.json({
    success: true,
    data: {
      message:
        "If an account with that email exists, a password reset link has been sent.",
      resetUrl: deliveryMode === "development-fallback" ? resetUrl : undefined,
      deliveryMode,
    },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = resetPasswordSchema.parse(req.body);
  const tokenHash = crypto.createHash("sha256").update(payload.token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError("This password reset link is invalid or has expired.", 400);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    },
  });

  clearAuthCookie(res);

  res.json({
    success: true,
    data: {
      message: "Your password has been reset successfully. Please log in with your new password.",
    },
  });
});
