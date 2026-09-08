import { Booking } from "../models/Booking.js";
import { executeMatchingEngine } from "../services/matchingEngine.js";
import { checkScheduleConflict } from "../services/schedulingEngine.js";

// 1. Create Booking with Atomic Concurrency Guard
export const createBooking = async (req, res) => {
  try {
    const {
      customerId,
      serviceCategory,
      urgency,
      bookingStart,
      bookingEnd,
      location,
      selectedProviderId,
    } = req.body;

    // Verify candidate availability before writing record
    const isConflicted = await checkScheduleConflict(
      selectedProviderId,
      bookingStart,
      bookingEnd,
    );
    if (isConflicted) {
      return res.status(409).json({
        success: false,
        error:
          "SLOT_UNAVAILABLE: Provider was booked during evaluation. Re-run matching.",
      });
    }

    // Pre-calculate candidate fallback queue in case primary provider rejects
    const fullMatchResults = await executeMatchingEngine({
      category: serviceCategory,
      location,
      start: bookingStart,
      end: bookingEnd,
      urgency,
    });

    const candidateQueue = fullMatchResults
      .map((r) => r.provider._id)
      .filter((id) => id.toString() !== selectedProviderId);

    const primaryMatch = fullMatchResults.find(
      (r) => r.provider._id.toString() === selectedProviderId,
    );

    const booking = await Booking.create({
      customerId,
      providerId: selectedProviderId,
      serviceCategory,
      urgency,
      bookingStart,
      bookingEnd,
      location,
      totalPrice: primaryMatch ? primaryMatch.provider.hourlyRate * 2 : 1000,
      matchScore: primaryMatch ? primaryMatch.matchScore : 85.0,
      matchExplanation: primaryMatch ? primaryMatch.matchExplanation : {},
      candidateQueue,
      status: "REQUESTED",
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. State Machine & Automated Rescheduling Engine
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'ACCEPTED', 'REJECTED', 'COMPLETED'

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // AUTOMATED FALLBACK ENGINE: Handles Provider Rejections
    if (status === "REJECTED") {
      if (booking.candidateQueue.length > 0) {
        // Pop next best provider from fallback queue
        const nextProviderId = booking.candidateQueue.shift();

        booking.providerId = nextProviderId;
        booking.status = "REQUESTED"; // Reset state for new provider
        await booking.save();

        return res.status(200).json({
          success: true,
          message:
            "AUTOMATED_DISPATCH: Primary provider rejected. Job automatically reassigned to next best candidate.",
          reassigned: true,
          booking,
        });
      } else {
        booking.status = "CANCELLED";
        await booking.save();
        return res.status(200).json({
          success: true,
          message: "DISPATCH_FAILED: No fallback providers available in zone.",
          reassigned: false,
          booking,
        });
      }
    }

    // Standard State Machine Progression
    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
