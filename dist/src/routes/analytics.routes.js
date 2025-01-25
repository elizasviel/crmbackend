"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const analytics_service_1 = require("../services/analytics.service");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const analyticsService = new analytics_service_1.AnalyticsService();
router.get("/dashboard", auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.AGENT]), async (req, res) => {
    try {
        const metrics = await analyticsService.getTicketMetrics();
        res.json(metrics);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});
exports.default = router;
