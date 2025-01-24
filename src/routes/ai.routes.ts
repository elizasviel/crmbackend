import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { AIService } from "../services/ai.service";

const router = Router();
const aiService = new AIService();

router.post("/analyze-ticket", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const analysis = await aiService.analyzeTicket(title, description);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze ticket" });
  }
});

export default router;
