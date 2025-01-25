"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get tickets in a certain "queue"
router.get("/", auth_middleware_1.authMiddleware, async (req, res) => {
    var _a;
    try {
        const { status, priority, teamId } = req.query;
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (priority) {
            filters.priority = priority;
        }
        if (teamId) {
            filters.teamId = teamId;
        }
        // If the user is just a CUSTOMER, we might only want to show their tickets
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "CUSTOMER") {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve queue" });
    }
});
exports.default = router;
