import { Router } from "express";

import {
  confirmCsvImport,
  confirmMtImport,
  previewCsvImport,
  previewMtImport,
} from "../controllers/importController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/csv/preview", previewCsvImport);
router.post("/csv/confirm", confirmCsvImport);
router.post("/mt/preview", previewMtImport);
router.post("/mt/confirm", confirmMtImport);

export default router;
