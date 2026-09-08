import express from "express";
import {
  createBooking,
  updateBookingStatus,
  getBookings,
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

export default router;
