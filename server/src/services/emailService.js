import nodemailer from "nodemailer";

import { AppError } from "../utils/AppError.js";

const parseSecureFlag = (value) =>
  String(value || "").toLowerCase() === "true" || String(value || "") === "1";

const getMailConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: parseSecureFlag(process.env.SMTP_SECURE),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.MAIL_FROM || process.env.SMTP_USER || "",
});

export const isEmailDeliveryConfigured = () => {
  const config = getMailConfig();
  return Boolean(config.host && config.port && config.user && config.pass && config.from);
};

const createTransporter = () => {
  const config = getMailConfig();

  if (!isEmailDeliveryConfigured()) {
    throw new AppError(
      "Password reset email delivery is not configured on this server.",
      500,
      { code: "EMAIL_NOT_CONFIGURED" },
    );
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        "Password reset email delivery is not configured on this server.",
        500,
        { code: "EMAIL_NOT_CONFIGURED" },
      );
    }

    return {
      deliveryMode: "development-fallback",
    };
  }

  const transporter = createTransporter();
  const recipientName = fullName?.trim() || "Trader";
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your TradeCadet password",
    text: [
      `Hi ${recipientName},`,
      "",
      "We received a request to reset your TradeCadet password.",
      "Use the secure link below to choose a new password:",
      resetUrl,
      "",
      "This link expires in 30 minutes.",
      "",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; background: #020617; color: #e2e8f0; padding: 32px;">
        <div style="max-width: 560px; margin: 0 auto; background: rgba(15, 23, 42, 0.96); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px;">
          <p style="margin: 0; color: #86efac; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;">TradeCadet</p>
          <h1 style="margin: 16px 0 0; font-size: 28px; line-height: 1.2; color: #f8fafc;">Reset your password</h1>
          <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.7; color: #cbd5e1;">
            Hi ${recipientName}, we received a request to reset your TradeCadet password.
            Use the secure button below to choose a new one.
          </p>
          <div style="margin-top: 28px;">
            <a href="${resetUrl}" style="display: inline-block; background: #22c55e; color: #020617; text-decoration: none; font-weight: 700; padding: 14px 20px; border-radius: 16px;">
              Reset Password
            </a>
          </div>
          <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.7; color: #94a3b8;">
            This link expires in 30 minutes. If the button does not work, copy and paste this URL into your browser:
          </p>
          <p style="margin: 12px 0 0; font-size: 14px; line-height: 1.7; color: #67e8f9; word-break: break-word;">
            ${resetUrl}
          </p>
          <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.7; color: #94a3b8;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  return {
    deliveryMode: "email",
  };
};
