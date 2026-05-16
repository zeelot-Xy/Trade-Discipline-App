import { Router } from "express";

import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "../controllers/billingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/create-checkout-session", createCheckoutSession);
router.post("/create-customer-portal-session", createCustomerPortalSession);

export default router;
