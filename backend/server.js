import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import matchRoutes from "./routes/matchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smarthome_automation";

app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/api/v1/match", matchRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({
      status: "ONLINE",
      engine: "CSP-MCDM Core Dispatch",
      timestamp: new Date(),
    });
});

// Database Connection & Server Boot
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Engine Connected Successfully");
    app.listen(PORT, () =>
      console.log(`Smart Home Automation Server running on port ${PORT}`),
    );
  })
  .catch((err) => console.error("Database connection failure:", err));
