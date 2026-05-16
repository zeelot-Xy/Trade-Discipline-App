import { serializeUser } from "../utils/userSerializer.js";
import { prisma } from "../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";
import { authCookieName, verifyToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[authCookieName];

  if (!token) {
    throw new AppError("Authentication required.", 401);
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError("Session expired. Please log in again.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError("User account could not be found.", 401);
  }

  req.user = serializeUser(user);

  next();
});
