import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import researchAIRoutes from "./routes/researchAIRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use(
  "/api/workspaces",
  workspaceRoutes
);

export default app;