"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Submit feedback for a ticket
router.post("/:ticketId", auth_middleware_1.authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create feedback" });
    }
});
// Get feedback for a specific ticket
router.get("/:ticketId", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const feedback = await prisma.feedback.findMany({
            where: { ticketId },
            orderBy: { createdAt: "desc" },
        });
        res.json(feedback);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve feedback" });
    }
});
exports.default = router;
