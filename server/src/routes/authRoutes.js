import { Router } from "express";

import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
