import { Router, Request, Response } from "express";
import { PrismaClient, TeamRole, UserRole } from "@prisma/client";
import {
  authMiddleware,
  requireRoles,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

// Create a new team
router.post(
  "/",
  authMiddleware,
  requireRoles([UserRole.ADMIN]), // only admins can create teams, for example
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      const newTeam = await prisma.team.create({
        data: {
          name,
          description,
        },
      });
      res.status(201).json(newTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  }
);

// Get all teams
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: { members: true },
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Get a single team by ID
router.get(
  "/:teamId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { teamId } = req.params;
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
        },
      });
      if (!team) {
        res.status(404).json({ error: "Team not found" });
        return;
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  }
);

// Update a team
router.put(
  "/:teamId",
  authMiddleware,
  requireRoles([UserRole.ADMIN]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { teamId } = req.params;
      const { name, description } = req.body;

      const updated = await prisma.team.update({
        where: { id: teamId },
        data: {
          name,
          description,
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team" });
    }
  }
);

// Delete a team
router.delete(
  "/:teamId",
  authMiddleware,
  requireRoles([UserRole.ADMIN]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { teamId } = req.params;
      await prisma.team.delete({
        where: { id: teamId },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team" });
    }
  }
);

// Add a user to a team
router.post(
  "/:teamId/members",
  authMiddleware,
  requireRoles([UserRole.ADMIN, UserRole.AGENT]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { teamId } = req.params;
      const { userId, role } = req.body; // role can be 'LEADER' or 'AGENT'

      // Optional: Validate that the userId is valid
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser) {
        res.status(400).json({ error: "User does not exist" });
        return;
      }

      const newMember = await prisma.teamMember.create({
        data: {
          userId,
          teamId,
          role: role || TeamRole.AGENT,
        },
      });
      res.status(201).json(newMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to add member to team" });
    }
  }
);

// Remove a user from a team
router.delete(
  "/:teamId/members/:userId",
  authMiddleware,
  requireRoles([UserRole.ADMIN, UserRole.AGENT]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { teamId, userId } = req.params;

      // You might want to check permissions, role, etc. here as well
      await prisma.teamMember.deleteMany({
        where: {
          teamId,
          userId,
        },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member from team" });
    }
  }
);

export default router;
