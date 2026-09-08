import { Booking } from "../models/Booking.js";

export const checkScheduleConflict = async (providerId, reqStart, reqEnd) => {
  const BUFFER_MS = 30 * 60 * 1000; // 30 Minutes transit buffer

  const paddedStart = new Date(new Date(reqStart).getTime() - BUFFER_MS);
  const paddedEnd = new Date(new Date(reqEnd).getTime() + BUFFER_MS);

  // Search for active bookings that overlap with requested time window
  const conflictingBooking = await Booking.findOne({
    providerId,
    status: { $in: ["REQUESTED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS"] },
    $or: [
      {
        bookingStart: { $lt: paddedEnd },
        bookingEnd: { $gt: paddedStart },
      },
    ],
  });

  return conflictingBooking !== null; // True if collision exists
};
