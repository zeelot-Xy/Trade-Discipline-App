import crypto from "crypto";

import { prisma } from "../prisma/prisma.js";
import { AppError } from "../utils/AppError.js";

const PAYSTACK_API_BASE_URL = "https://api.paystack.co";
const DEFAULT_SUCCESS_REDIRECT = "/upgrade?checkout=success&provider=paystack";
const DEFAULT_CANCEL_REDIRECT = "/upgrade?checkout=cancel&provider=paystack";

const ACTIVE_PLAN_STATUSES = new Set(["active", "non-renewing"]);

const getRequiredEnv = (key, fallbackMessage) => {
  const value = process.env[key];

  if (!value) {
    throw new AppError(fallbackMessage, 500, {
      code: "BILLING_NOT_CONFIGURED",
    });
  }

  return value;
};

const getPaystackSecretKey = () =>
  getRequiredEnv(
    "PAYSTACK_SECRET_KEY",
    "Paystack billing is not configured yet. Add PAYSTACK_SECRET_KEY to continue.",
  );

const getPaystackPlanCode = () =>
  getRequiredEnv(
    "PAYSTACK_PRO_PLAN_CODE",
    "Paystack billing is not configured yet. Add PAYSTACK_PRO_PLAN_CODE to continue.",
  );

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

const buildCallbackUrl = () => `${getClientUrl()}${DEFAULT_SUCCESS_REDIRECT}`;

const buildCancelUrl = () => `${getClientUrl()}${DEFAULT_CANCEL_REDIRECT}`;

const buildReference = (userId) =>
  `pt_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}_${Date.now()}`;

const normalizePaystackStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  switch (normalized) {
    case "active":
      return "ACTIVE";
    case "non-renewing":
      return "CANCELED";
    case "disabled":
    case "cancelled":
    case "canceled":
    case "complete":
      return "CANCELED";
    case "attention":
    case "failed":
      return "PAST_DUE";
    default:
      return "INACTIVE";
  }
};

const shouldGrantProAccess = (status) => ACTIVE_PLAN_STATUSES.has(String(status || "").toLowerCase());

const toDateOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const extractEmail = (payload) =>
  payload?.customer?.email || payload?.data?.customer?.email || payload?.email || null;

const extractCustomerCode = (payload) =>
  payload?.customer?.customer_code ||
  payload?.customer_code ||
  payload?.data?.customer?.customer_code ||
  null;

const extractSubscriptionCode = (payload) =>
  payload?.subscription?.subscription_code ||
  payload?.subscription_code ||
  payload?.data?.subscription?.subscription_code ||
  null;

const extractNextPaymentDate = (payload) =>
  payload?.subscription?.next_payment_date ||
  payload?.next_payment_date ||
  payload?.data?.subscription?.next_payment_date ||
  payload?.paid_at ||
  null;

const normalizeMetadata = (metadata) => {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  return typeof metadata === "object" ? metadata : null;
};

const extractMetadataUserId = (payload) => {
  const metadata =
    normalizeMetadata(payload?.metadata) || normalizeMetadata(payload?.data?.metadata);

  return metadata?.userId || metadata?.user_id || null;
};

const callPaystack = async (path, options = {}) => {
  const secretKey = getPaystackSecretKey();
  const response = await fetch(`${PAYSTACK_API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.status) {
    throw new AppError(
      payload?.message || "Paystack request failed. Please try again.",
      response.status >= 400 && response.status < 600 ? response.status : 502,
      {
        code: "PAYSTACK_REQUEST_FAILED",
      },
    );
  }

  return payload.data;
};

const findUserForBillingEvent = async ({
  userId,
  email,
  customerCode,
  subscriptionCode,
}) => {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      return user;
    }
  }

  if (subscriptionCode) {
    const user = await prisma.user.findUnique({
      where: { paystackSubscriptionCode: subscriptionCode },
    });

    if (user) {
      return user;
    }
  }

  if (customerCode) {
    const user = await prisma.user.findUnique({
      where: { paystackCustomerCode: customerCode },
    });

    if (user) {
      return user;
    }
  }

  if (email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  return null;
};

export const createCheckoutSessionForUser = async (user) => {
  const plan = getPaystackPlanCode();
  const callbackUrl = buildCallbackUrl();
  const reference = buildReference(user.id);
  const redirectUrl = buildCancelUrl();

  const data = await callPaystack("/transaction/initialize", {
    method: "POST",
    body: {
      email: user.email,
      plan,
      reference,
      callback_url: callbackUrl,
      metadata: JSON.stringify({
        userId: user.id,
        planType: "PRO",
        cancelRedirect: redirectUrl,
      }),
    },
  });

  return {
    url: data.authorization_url,
    reference: data.reference,
  };
};

export const createCustomerPortalSessionForUser = async (user) => {
  if (!user.paystackSubscriptionCode) {
    throw new AppError(
      "Your Paystack subscription record is not ready yet. Please wait a moment and try again.",
      409,
      {
        code: "SUBSCRIPTION_NOT_READY",
      },
    );
  }

  const data = await callPaystack(
    `/subscription/${encodeURIComponent(user.paystackSubscriptionCode)}/manage/link`,
  );

  return {
    url: data.link,
  };
};

export const constructPaystackWebhookEvent = (rawBody, signature) => {
  const secretKey = getPaystackSecretKey();

  if (!signature) {
    throw new AppError("Paystack webhook signature is missing.", 400);
  }

  const payloadString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody || "");
  const expectedSignature = crypto
    .createHmac("sha512", secretKey)
    .update(payloadString)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new AppError("Paystack webhook signature is invalid.", 400);
  }

  try {
    return JSON.parse(payloadString);
  } catch {
    throw new AppError("Paystack webhook payload could not be parsed.", 400);
  }
};

export const syncUserSubscriptionFromPaystack = async ({
  userId,
  email,
  customerCode,
  subscriptionCode,
  paystackStatus,
  nextPaymentDate,
}) => {
  const user = await findUserForBillingEvent({
    userId,
    email,
    customerCode,
    subscriptionCode,
  });

  if (!user) {
    return null;
  }

  const normalizedStatus = normalizePaystackStatus(paystackStatus);
  const nextPeriodEnd = toDateOrNull(nextPaymentDate);
  const planType = shouldGrantProAccess(paystackStatus) ? "PRO" : "FREE";

  return prisma.user.update({
    where: { id: user.id },
    data: {
      planType,
      subscriptionStatus: normalizedStatus,
      paystackCustomerCode: customerCode || user.paystackCustomerCode,
      paystackSubscriptionCode: subscriptionCode || user.paystackSubscriptionCode,
      currentPeriodEnd:
        nextPeriodEnd ||
        (normalizedStatus === "CANCELED" || normalizedStatus === "INACTIVE" ? null : user.currentPeriodEnd),
    },
  });
};

export const syncUserSubscriptionFromWebhookEvent = async (event) => {
  const payload = event?.data;

  if (!payload) {
    return null;
  }

  switch (event.event) {
    case "subscription.create":
      return syncUserSubscriptionFromPaystack({
        userId: extractMetadataUserId(payload),
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: payload.status || "active",
        nextPaymentDate: extractNextPaymentDate(payload),
      });

    case "charge.success": {
      if (!payload.plan && !payload.subscription) {
        return null;
      }

      return syncUserSubscriptionFromPaystack({
        userId: extractMetadataUserId(payload),
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: "active",
        nextPaymentDate: extractNextPaymentDate(payload),
      });
    }

    case "invoice.update": {
      const status = payload.paid ? "active" : payload.status || "attention";
      return syncUserSubscriptionFromPaystack({
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: status,
        nextPaymentDate: extractNextPaymentDate(payload),
      });
    }

    case "invoice.payment_failed":
      return syncUserSubscriptionFromPaystack({
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: "failed",
        nextPaymentDate: extractNextPaymentDate(payload),
      });

    case "subscription.not_renew":
      return syncUserSubscriptionFromPaystack({
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: "non-renewing",
        nextPaymentDate: extractNextPaymentDate(payload),
      });

    case "subscription.disable":
      return syncUserSubscriptionFromPaystack({
        email: extractEmail(payload),
        customerCode: extractCustomerCode(payload),
        subscriptionCode: extractSubscriptionCode(payload),
        paystackStatus: payload.status || "disabled",
      });

    default:
      return null;
  }
};
