import express from "express";
import {
  createBooking,
  updateBookingStatus,
  getBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.patch("/:id/status", updateBookingStatus);

export default router;
