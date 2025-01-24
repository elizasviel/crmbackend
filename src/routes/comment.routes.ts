import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthRequest,
  requireRoles,
} from "../middleware/auth.middleware";
import { Server } from "socket.io";

const router = Router();
const prisma = new PrismaClient();
const io = new Server();

/**
 * Create a new comment on a ticket
 * Example request body:
 * {
 *   "content": "This is a new comment",
 *   "isInternal": false
 * }
 * Path param: "ticketId"
 */
router.post(
  "/:ticketId/comments",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const { content, isInternal = false } = req.body;

      // Validate request
      if (!content) {
        res.status(400).json({ error: "Comment content is required" });
        return;
      }

      // Ensure ticket exists
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!existingTicket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      // Create the comment
      const newComment = await prisma.comment.create({
        data: {
          content,
          isInternal,
          ticketId,
          userId: req.user!.id, // user must be authenticated
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // After successfully creating the comment:
      io.to(`ticket-${ticketId}`).emit("comment-added", newComment);

      // If the comment is from an agent and the ticket creator is a customer
      if (req.user?.role !== "CUSTOMER") {
        // Notify the customer
        io.to(`user-${existingTicket.createdById}`).emit("notification", {
          type: "NEW_COMMENT",
          ticketId,
          message: `New response on ticket: ${existingTicket.title}`,
        });
      }

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Failed to create comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  }
);

/**
 * Get all comments for a specific ticket
 * Path param: "ticketId"
 */
router.get(
  "/:ticketId/comments",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;

      // Ensure ticket exists
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!existingTicket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      // Retrieve comments
      // You can optionally filter out internal comments if user is a CUSTOMER
      let commentsQuery = {
        where: { ticketId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "asc" as const },
      };

      // If the user is a CUSTOMER, hide internal comments
      if (req.user?.role === "CUSTOMER") {
        (commentsQuery.where as any).isInternal = false;
      }

      const comments = await prisma.comment.findMany(commentsQuery);

      res.json(comments);
    } catch (error) {
      console.error("Failed to retrieve comments:", error);
      res.status(500).json({ error: "Failed to retrieve comments" });
    }
  }
);

export default router;
