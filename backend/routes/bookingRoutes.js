import express from "express";
import {
  createBooking,
  updateBookingStatus,
  getBookings,
  clearAllBookings,
} from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER", "ADMIN"),
  createBooking,
);
router.get("/", authenticate, getBookings);
router.patch("/:id/status", authenticate, updateBookingStatus);
router.delete(
  "/clear-all",
  authenticate,
  authorizeRoles("ADMIN"),
  clearAllBookings,
);

export default router;
