import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import matchRoutes from "./routes/matchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/match", matchRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ONLINE",
    engine: "CSP-MCDM Core Dispatch",
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
  });
};

startServer();
