import express from "express";
import {
  createBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
