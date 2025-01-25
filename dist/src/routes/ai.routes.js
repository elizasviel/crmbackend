"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const ai_service_1 = require("../services/ai.service");
const router = (0, express_1.Router)();
const aiService = new ai_service_1.AIService();
router.post("/analyze-ticket", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const analysis = await aiService.analyzeTicket(title, description);
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to analyze ticket" });
    }
});
exports.default = router;
