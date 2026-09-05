import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import researchAIRoutes from "./routes/researchAIRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import knowledgeGraphRoutes from "./routes/knowledgeGraphRoutes.js";
import readerRoutes from "./routes/readerRoutes.js";
import discoveryRoutes from "./routes/discoveryRoutes.js";
import collaborationRoutes from "./routes/collaborationRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResearchNest API is running 🚀",
  });
});

app.use("/api/auth", (await import("./routes/authRoutes.js")).default);
app.use("/api/papers", (await import("./routes/paperRoutes.js")).default);
app.use("/api/ai", researchAIRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/reader", readerRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/knowledge-graph", knowledgeGraphRoutes);

export default app;
