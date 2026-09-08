import express from "express";
import { executeMatchingEngine } from "../services/matchingEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const results = await executeMatchingEngine(req.body);
    res
      .status(200)
      .json({ success: true, count: results.length, matches: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
