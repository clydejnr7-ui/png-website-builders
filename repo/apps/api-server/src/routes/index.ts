import { Router } from "express";
import authRouter from "./auth.js";
import creditsRouter from "./credits.js";
import sitesRouter from "./sites.js";

const router = Router();

router.use(authRouter);
router.use(creditsRouter);
router.use(sitesRouter);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
