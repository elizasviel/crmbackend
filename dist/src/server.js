"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const scheduler_service_1 = require("./services/scheduler.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Use CORS
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // or '*'
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Routes
app.use("/api/users", user_routes_1.default);
app.use("/api/tickets", ticket_routes_1.default);
app.use("/api/tickets", comment_routes_1.default);
app.use("/api/teams", team_routes_1.default);
app.use("/api/queues", queue_routes_1.default);
app.use("/api/feedback", feedback_routes_1.default);
app.use("/api/analytics", analytics_routes_1.default);
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
exports.io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("join-ticket", (ticketId) => {
        socket.join(`ticket-${ticketId}`);
    });
    socket.on("leave-ticket", (ticketId) => {
        socket.leave(`ticket-${ticketId}`);
    });
});
const scheduler = new scheduler_service_1.SchedulerService();
scheduler.startJobs();
const PORT = process.env.PORT || 3000;
async function main() {
    try {
        await prisma.$connect();
        console.log("Database connection established");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
main();
