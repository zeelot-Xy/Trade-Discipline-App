import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import { getUploadsRoot, isAllowedCorsOrigin } from "./config/runtime.js";
import { handlePaystackWebhook } from "./controllers/billingController.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("This origin is not allowed to access the API."));
    },
    credentials: true,
  }),
);
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handlePaystackWebhook);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(getUploadsRoot()));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/imports", importRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
