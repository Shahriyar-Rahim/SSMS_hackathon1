import express from "express";
import { Provider } from "../models/Provider.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/providers", async (req, res) => {
  try {
    const providers = await Provider.find()
      .populate("userId", "fullName email phoneNumber createdAt")
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: providers.length, providers });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/providers/:id/status", async (req, res) => {
  try {
    const { approvalStatus, isActive } = req.body;
    const update = {};

    if (approvalStatus !== undefined) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(approvalStatus)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid approval status." });
      }
      update.approvalStatus = approvalStatus;
      update.isActive = approvalStatus === "APPROVED";
      update.approvedAt = approvalStatus === "APPROVED" ? new Date() : null;
      update.approvedBy = approvalStatus === "APPROVED" ? req.user.id : null;
    }

    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    ).populate("userId", "fullName email phoneNumber createdAt");

    if (!provider) {
      return res
        .status(404)
        .json({ success: false, error: "Provider not found." });
    }

    return res.json({ success: true, provider });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
