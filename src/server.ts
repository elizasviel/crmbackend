import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import teamRoutes from "./routes/team.routes";
import queueRoutes from "./routes/queue.routes";
import feedbackRoutes from "./routes/feedback.routes";
import analyticsRoutes from "./routes/analytics.routes";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { SchedulerService } from "./services/scheduler.service";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Replace with the array of allowed origins, or use '*'
const allowedOrigins = [
  "http://localhost:5173",
  "https://crmfrontendnorman-c9fc49bd7c94.herokuapp.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets", commentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("join-ticket", (ticketId) => {
    socket.join(`ticket-${ticketId}`);
  });

  socket.on("leave-ticket", (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
  });
});

const scheduler = new SchedulerService();
scheduler.startJobs();

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connection established");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
