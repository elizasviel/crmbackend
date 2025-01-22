import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

// Submit feedback for a ticket
router.post(
  "/:ticketId",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const { rating, comment } = req.body;

      // Ensure the ticket exists
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!existingTicket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      // Basic validation for rating
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        res
          .status(400)
          .json({ error: "Rating must be a number between 1 and 5" });
        return;
      }

      const newFeedback = await prisma.feedback.create({
        data: {
          ticketId,
          rating,
          comment,
        },
      });

      res.status(201).json(newFeedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to create feedback" });
    }
  }
);

// Get feedback for a specific ticket
router.get(
  "/:ticketId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { ticketId } = req.params;

      const feedback = await prisma.feedback.findMany({
        where: { ticketId },
        orderBy: { createdAt: "desc" },
      });

      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve feedback" });
    }
  }
);

export default router;
