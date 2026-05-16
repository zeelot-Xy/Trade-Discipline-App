import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

import { AppError } from "../utils/AppError.js";

const uploadsRoot = path.resolve("uploads");
const supportedMimeTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/webp", "webp"],
]);
const maxScreenshotBytes = 5 * 1024 * 1024;

const extractFileInfoFromDataUrl = (dataUrl) => {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || "");

  if (!match) {
    throw new AppError("Screenshot must be a valid PNG, JPG, or WebP image.", 400);
  }

  const mimeType = match[1].toLowerCase();
  const extension = supportedMimeTypes.get(mimeType);

  if (!extension) {
    throw new AppError("Only PNG, JPG, and WebP screenshots are supported.", 400);
  }

  const buffer = Buffer.from(match[2], "base64");

  if (!buffer.length || buffer.length > maxScreenshotBytes) {
    throw new AppError("Each screenshot must be 5MB or smaller.", 400);
  }

  return { buffer, extension };
};

const ensureTradeUploadDirectory = async (userId, tradeId) => {
  const tradeDirectory = path.join(uploadsRoot, "trades", userId, tradeId);
  await fs.mkdir(tradeDirectory, { recursive: true });
  return tradeDirectory;
};

const buildPublicUrl = (filePath) => {
  const relativePath = path.relative(uploadsRoot, filePath).replaceAll(path.sep, "/");
  return `/uploads/${relativePath}`;
};

const deleteLocalFileIfPresent = async (publicUrl) => {
  if (!publicUrl?.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(uploadsRoot, publicUrl.replace("/uploads/", "").replaceAll("/", path.sep));

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const writeScreenshotFile = async ({ userId, tradeId, dataUrl, slot }) => {
  const { buffer, extension } = extractFileInfoFromDataUrl(dataUrl);
  const tradeDirectory = await ensureTradeUploadDirectory(userId, tradeId);
  const fileName = `${slot}-${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(tradeDirectory, fileName);

  await fs.writeFile(filePath, buffer);

  return buildPublicUrl(filePath);
};

export const persistTradeScreenshots = async ({
  userId,
  tradeId,
  currentBeforeTradeScreenshotUrl = null,
  currentAfterTradeScreenshotUrl = null,
  beforeTradeScreenshot,
  afterTradeScreenshot,
  removeBeforeTradeScreenshot = false,
  removeAfterTradeScreenshot = false,
}) => {
  let nextBeforeTradeScreenshotUrl = currentBeforeTradeScreenshotUrl;
  let nextAfterTradeScreenshotUrl = currentAfterTradeScreenshotUrl;

  if (beforeTradeScreenshot?.dataUrl) {
    const newUrl = await writeScreenshotFile({
      userId,
      tradeId,
      dataUrl: beforeTradeScreenshot.dataUrl,
      slot: "before",
    });
    await deleteLocalFileIfPresent(currentBeforeTradeScreenshotUrl);
    nextBeforeTradeScreenshotUrl = newUrl;
  } else if (removeBeforeTradeScreenshot) {
    await deleteLocalFileIfPresent(currentBeforeTradeScreenshotUrl);
    nextBeforeTradeScreenshotUrl = null;
  }

  if (afterTradeScreenshot?.dataUrl) {
    const newUrl = await writeScreenshotFile({
      userId,
      tradeId,
      dataUrl: afterTradeScreenshot.dataUrl,
      slot: "after",
    });
    await deleteLocalFileIfPresent(currentAfterTradeScreenshotUrl);
    nextAfterTradeScreenshotUrl = newUrl;
  } else if (removeAfterTradeScreenshot) {
    await deleteLocalFileIfPresent(currentAfterTradeScreenshotUrl);
    nextAfterTradeScreenshotUrl = null;
  }

  return {
    beforeTradeScreenshotUrl: nextBeforeTradeScreenshotUrl,
    afterTradeScreenshotUrl: nextAfterTradeScreenshotUrl,
  };
};

export const deleteTradeScreenshots = async ({
  beforeTradeScreenshotUrl,
  afterTradeScreenshotUrl,
}) => {
  await deleteLocalFileIfPresent(beforeTradeScreenshotUrl);
  await deleteLocalFileIfPresent(afterTradeScreenshotUrl);
};
