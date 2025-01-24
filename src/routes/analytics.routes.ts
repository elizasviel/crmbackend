import { Router } from "express";
import { authMiddleware, requireRoles } from "../middleware/auth.middleware";
import { AnalyticsService } from "../services/analytics.service";
import { UserRole } from "@prisma/client";

const router = Router();
const analyticsService = new AnalyticsService();

router.get(
  "/dashboard",
  authMiddleware,
  requireRoles([UserRole.ADMIN, UserRole.AGENT]),
  async (req, res) => {
    try {
      const metrics = await analyticsService.getTicketMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  }
);

export default router;
