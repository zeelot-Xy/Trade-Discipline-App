import { Router } from "express";

import {
  createTrade,
  deleteTrade,
  getTradeById,
  getTrades,
  updateTrade,
} from "../controllers/tradeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.route("/").post(createTrade).get(getTrades);
router.route("/:id").get(getTradeById).patch(updateTrade).delete(deleteTrade);

export default router;
