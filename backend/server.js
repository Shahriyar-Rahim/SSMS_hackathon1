import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import matchRoutes from "./routes/matchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/api/v1/match", matchRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Health Check
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
    console.log(
      `API is running on http://localhost:${PORT}`,
    );
  });
};

startServer();
