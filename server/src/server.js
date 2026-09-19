import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const httpServer = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Real-Time Socket: ${socket.id}`);

  socket.on("join-user", (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`👤 Socket ${socket.id} joined room user-${userId}`);
    }
  });

  socket.on("join-workspace", (workspaceId) => {
    if (workspaceId) {
      socket.join(`workspace-${workspaceId}`);
      console.log(`📌 Socket ${socket.id} joined room workspace-${workspaceId}`);
    }
  });

  socket.on("leave-workspace", (workspaceId) => {
    if (workspaceId) {
      socket.leave(`workspace-${workspaceId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO on port ${PORT}`);
});