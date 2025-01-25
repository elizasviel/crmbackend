"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const socket_io_1 = require("socket.io");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const io = new socket_io_1.Server();
/**
 * Create a new comment on a ticket
 * Example request body:
 * {
 *   "content": "This is a new comment",
 *   "isInternal": false
 * }
 * Path param: "ticketId"
 */
router.post("/:ticketId/comments", auth_middleware_1.authMiddleware, async (req, res) => {
    var _a;
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
                userId: req.user.id, // user must be authenticated
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
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "CUSTOMER") {
            // Notify the customer
            io.to(`user-${existingTicket.createdById}`).emit("notification", {
                type: "NEW_COMMENT",
                ticketId,
                message: `New response on ticket: ${existingTicket.title}`,
            });
        }
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error("Failed to create comment:", error);
        res.status(500).json({ error: "Failed to create comment" });
    }
});
/**
 * Get all comments for a specific ticket
 * Path param: "ticketId"
 */
router.get("/:ticketId/comments", auth_middleware_1.authMiddleware, async (req, res) => {
    var _a;
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
            orderBy: { createdAt: "asc" },
        };
        // If the user is a CUSTOMER, hide internal comments
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "CUSTOMER") {
            commentsQuery.where.isInternal = false;
        }
        const comments = await prisma.comment.findMany(commentsQuery);
        res.json(comments);
    }
    catch (error) {
        console.error("Failed to retrieve comments:", error);
        res.status(500).json({ error: "Failed to retrieve comments" });
    }
});
exports.default = router;
