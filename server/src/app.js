import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import { handlePaystackWebhook } from "./controllers/billingController.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handlePaystackWebhook);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

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
