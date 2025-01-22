import { Router } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
import {
  authMiddleware,
  requireRoles,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

// Get tickets in a certain "queue"
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status, priority, teamId } = req.query;
    const filters: any = {};

    if (status) {
      filters.status = status as TicketStatus;
    }
    if (priority) {
      filters.priority = priority;
    }
    if (teamId) {
      filters.teamId = teamId;
    }

    // If the user is just a CUSTOMER, we might only want to show their tickets
    if (req.user?.role === "CUSTOMER") {
      filters.createdById = req.user.id;
    }

    const tickets = await prisma.ticket.findMany({
      where: filters,
      include: {
        createdBy: true,
        assignedTo: true,
        team: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve queue" });
  }
});

export default router;
