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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Register user
router.post("/register", async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = client_1.UserRole.CUSTOMER, } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
            },
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});
// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const validPassword = await (0, bcrypt_1.compare)(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
});
// Get current user (protected route example)
router.get("/me", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
});
// Get all users (admin only)
router.get("/", auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRoles)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// Update user role (admin only)
router.patch("/:userId/role", auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRoles)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user role" });
    }
});
exports.default = router;
