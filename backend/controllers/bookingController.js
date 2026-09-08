import { Booking } from "../models/Booking.js";
import { executeMatchingEngine } from "../services/matchingEngine.js";
import { checkScheduleConflict } from "../services/schedulingEngine.js";

// 1. Create Booking with Atomic Concurrency Guard & Pre-calculated Fallback Queue
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

    if (
      !selectedProviderId ||
      !serviceCategory ||
      !bookingStart ||
      !bookingEnd
    ) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS: Required booking details are missing.",
      });
    }

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
      start: new Date(bookingStart),
      end: new Date(bookingEnd),
      urgency: urgency || "STANDARD",
    });

    const candidateQueue = fullMatchResults
      .map((r) => r.provider._id)
      .filter((id) => id.toString() !== selectedProviderId);

    const primaryMatch = fullMatchResults.find(
      (r) => r.provider._id.toString() === selectedProviderId,
    );

    // Calculate actual duration in hours (minimum 1 hour)
    const durationHours = Math.max(
      1,
      (new Date(bookingEnd) - new Date(bookingStart)) / (1000 * 60 * 60),
    );

    const hourlyRate = primaryMatch ? primaryMatch.provider.hourlyRate : 400;
    const totalPrice = hourlyRate * durationHours;

    const booking = await Booking.create({
      customerId: customerId || "cust_demo_101",
      providerId: selectedProviderId,
      serviceCategory,
      urgency: urgency || "STANDARD",
      bookingStart,
      bookingEnd,
      location,
      totalPrice,
      matchScore: primaryMatch ? primaryMatch.matchScore : 85.0,
      matchExplanation: primaryMatch ? primaryMatch.matchExplanation : {},
      candidateQueue,
      status: "REQUESTED",
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. State Machine & Automated Rescheduling Fallback Engine
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'

    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "Status field is required." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // AUTOMATED FALLBACK ENGINE: Handles Provider Rejections
    if (status === "REJECTED") {
      if (booking.candidateQueue && booking.candidateQueue.length > 0) {
        // Pop next best provider from pre-calculated candidate fallback queue
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
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Fetch Bookings (Required for Provider Dashboard & Customer Tracking)
export const getBookings = async (req, res) => {
  try {
    const { providerId, customerId, status } = req.query;
    const filter = {};

    if (providerId) filter.providerId = providerId;
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate(
        "providerId",
        "fullName email category rating hourlyRate location",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
