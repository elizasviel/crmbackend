import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        createdBy: true,
        assignedTo: true,
        team: true,
        comments: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Get a single ticket by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        team: true,
        comments: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

// Create a ticket
router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const { title, description, priority = "MEDIUM", teamId } = req.body;

      // Use the authenticated user's ID from the token (set by authMiddleware)
      const createdById = req.user?.id;

      if (!createdById || !title || !description) {
        res.status(400).json({
          error: "Missing required fields: title, description, or user token",
        });
        return;
      }

      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          priority,
          createdById,
          teamId,
        },
        include: {
          createdBy: true,
          team: true,
        },
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  }
);

export default router;
