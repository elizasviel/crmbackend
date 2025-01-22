import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import teamRoutes from "./routes/team.routes";
import queueRoutes from "./routes/queue.routes";
import feedbackRoutes from "./routes/feedback.routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Use CORS
app.use(
  cors({
    origin: "http://localhost:5173", // or '*'
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

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
