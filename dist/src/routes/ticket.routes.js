"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const search_service_1 = require("../services/search.service");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});
// Add the search route BEFORE the /:id route
router.get("/search", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const _a = req.query, { query } = _a, filters = __rest(_a, ["query"]);
        const searchService = new search_service_1.SearchService();
        const results = await searchService.searchTickets(query, filters);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to search tickets" });
    }
});
// Get a single ticket by ID
router.get("/:id", auth_middleware_1.authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch ticket" });
    }
});
// Create a ticket
router.post("/", auth_middleware_1.authMiddleware, async (req, res) => {
    var _a;
    try {
        const { title, description, priority = "MEDIUM", teamId } = req.body;
        // Use the authenticated user's ID from the token (set by authMiddleware)
        const createdById = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create ticket" });
    }
});
exports.default = router;
