import express from "express";
import { Provider } from "../models/Provider.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorizeRoles("PROVIDER"),
  async (req, res) => {
    try {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: "PROVIDER_PROFILE_REQUIRED: Provider profile not found.",
        });
      }
      return res.json({ success: true, provider });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

router.patch(
  "/me",
  authenticate,
  authorizeRoles("PROVIDER"),
  async (req, res) => {
    try {
      const { serviceCategories, hourlyRate, location } = req.body;
      const normalizedCategories = Array.isArray(serviceCategories)
        ? [
            ...new Set(
              serviceCategories
                .map((item) => String(item).trim())
                .filter(Boolean),
            ),
          ]
        : null;

      if (normalizedCategories && normalizedCategories.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one service category is required.",
        });
      }

      const update = {};
      if (normalizedCategories) {
        update.serviceCategories = normalizedCategories;
        update.category = normalizedCategories[0];
        update.skills = normalizedCategories.map((name) => ({
          name,
          expertiseTier: 1,
        }));
      }
      if (hourlyRate !== undefined) {
        const parsedRate = Number(hourlyRate);
        if (!Number.isFinite(parsedRate) || parsedRate < 0) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid hourly rate." });
        }
        update.hourlyRate = parsedRate;
        update.quotedRate = parsedRate;
      }
      if (location !== undefined) {
        const latitude = Number(location.lat);
        const longitude = Number(location.lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return res.status(400).json({
            success: false,
            error: "Valid latitude and longitude are required.",
          });
        }
        update.location = { lat: latitude, lng: longitude };
      }

      const provider = await Provider.findOneAndUpdate(
        { userId: req.user.id },
        { $set: update },
        { new: true, runValidators: true },
      );

      if (!provider) {
        return res
          .status(404)
          .json({ success: false, error: "Provider profile not found." });
      }

      return res.json({ success: true, provider });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
);

export default router;
