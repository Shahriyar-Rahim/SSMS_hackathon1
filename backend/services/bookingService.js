import { Booking } from "../models/Booking.js";
import { Provider } from "../models/Provider.js";
import { checkScheduleConflict } from "./schedulingEngine.js";
import { executeMatchingEngine } from "./matchingEngine.js";

export const createBookingService = async (bookingData) => {
  const {
    customerId,
    providerId,
    serviceCategory,
    urgency,
    bookingStart,
    bookingEnd,
    location,
  } = bookingData;

  // 1. Conflict Check
  const isConflicted = await checkScheduleConflict(
    providerId,
    bookingStart,
    bookingEnd,
  );
  if (isConflicted) {
    throw new Error(
      "SLOT_UNAVAILABLE: Provider was booked during evaluation window.",
    );
  }

  // 2. Fetch Provider details for pricing
  const provider = await Provider.findById(providerId);
  if (!provider) {
    throw new Error("PROVIDER_NOT_FOUND: Selected provider does not exist.");
  }

  // 3. Pre-calculate candidate fallback queue
  const matchResults = await executeMatchingEngine({
    category: serviceCategory,
    location,
    start: new Date(bookingStart),
    end: new Date(bookingEnd),
    urgency,
  });

  const candidateQueue = matchResults
    .map((m) => m.provider._id)
    .filter((id) => id.toString() !== providerId.toString());

  const currentMatch = matchResults.find(
    (m) => m.provider._id.toString() === providerId.toString(),
  );

  // Calculate duration in hours for total cost
  const durationHours = Math.max(
    1,
    (new Date(bookingEnd) - new Date(bookingStart)) / (1000 * 60 * 60),
  );
  const totalPrice = provider.hourlyRate * durationHours;

  const booking = await Booking.create({
    customerId,
    providerId,
    serviceCategory,
    urgency: urgency || "STANDARD",
    bookingStart,
    bookingEnd,
    location,
    totalPrice,
    matchScore: currentMatch ? currentMatch.matchScore : 85.0,
    matchExplanation: currentMatch ? currentMatch.matchExplanation : {},
    candidateQueue,
    status: "REQUESTED",
  });

  return booking;
};

export const updateBookingStatusService = async (
  bookingId,
  status,
  actorId,
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // AUTOMATED FALLBACK ENGINE
  if (status === "REJECTED") {
    if (booking.candidateQueue && booking.candidateQueue.length > 0) {
      const nextProviderId = booking.candidateQueue.shift();

      booking.providerId = nextProviderId;
      booking.status = "REQUESTED"; // Reset status for the new provider
      await booking.save();

      return {
        reassigned: true,
        message:
          "AUTOMATED_DISPATCH: Primary provider rejected. Job reassigned to next best match.",
        booking,
      };
    } else {
      booking.status = "CANCELLED";
      await booking.save();
      return {
        reassigned: false,
        message: "DISPATCH_FAILED: All fallback candidates exhausted.",
        booking,
      };
    }
  }

  // If status is COMPLETED, increment provider daily completed count
  if (status === "COMPLETED" && booking.status !== "COMPLETED") {
    await Provider.findByIdAndUpdate(booking.providerId, {
      $inc: { jobsCompletedToday: 1 },
    });
  }

  booking.status = status;
  await booking.save();

  return {
    reassigned: false,
    message: `Booking status updated to ${status}`,
    booking,
  };
};
