import { prisma } from "../prisma/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  constructPaystackWebhookEvent,
  createCheckoutSessionForUser,
  createCustomerPortalSessionForUser,
  syncUserSubscriptionFromWebhookEvent,
} from "../services/billingService.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new AppError("User account could not be found.", 404);
  }

  const session = await createCheckoutSessionForUser(user);

  res.json({
    success: true,
    data: {
      url: session.url,
    },
  });
});

export const createCustomerPortalSession = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new AppError("User account could not be found.", 404);
  }

  const session = await createCustomerPortalSessionForUser(user);

  res.json({
    success: true,
    data: {
      url: session.url,
    },
  });
});

export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const event = constructPaystackWebhookEvent(req.body, signature);

  await syncUserSubscriptionFromWebhookEvent(event);

  res.json({ received: true });
});
