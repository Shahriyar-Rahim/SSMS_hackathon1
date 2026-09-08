import express from "express";
import { executeMatchingEngine } from "../services/matchingEngine.js";
import { Provider } from "../models/Provider.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", authenticate, async (req, res) => {
  try {
    const categories = await Provider.distinct("category", { isActive: true });

    const ICON_MAP = {
      Electrical: "Zap",
      Plumbing: "Droplet",
      "Appliance & Gadget Repair": "Wrench",
      "Cleaning & Pest Control": "Sparkles",
    };

    const formattedCategories = categories.map((cat, idx) => ({
      id: `cat_${idx + 1}`,
      name: cat,
      iconName: ICON_MAP[cat] || "Wrench",
      basePriceRange: "৳300 - ৳1500",
      description: `Verified ${cat} technicians available for dispatch in Saidpur & Rangpur zones.`,
      popularServices: [cat, "Diagnostic", "Installation"],
    }));

    res.status(200).json({
      success: true,
      count: formattedCategories.length,
      categories: formattedCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER", "ADMIN"),
  async (req, res) => {
    try {
      const matches = await executeMatchingEngine(req.body);
      res.status(200).json({ success: true, count: matches.length, matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

export default router;
