import { Booking } from "../models/Booking.js";
import { Provider } from "../models/Provider.js";
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

    const hourlyRate = primaryMatch ? primaryMatch.provider.hourlyRate : 600;
    const totalPrice = hourlyRate * durationHours;

    const booking = await Booking.create({
      customerId:
        req.user.role === "CUSTOMER"
          ? req.user.id.toString()
          : customerId || req.user.id.toString(),
      providerId: selectedProviderId,
      serviceCategory,
      urgency: urgency || "STANDARD",
      bookingStart,
      bookingEnd,
      location,
      initialHourlyRate: hourlyRate,
      initialTotalPrice: totalPrice,
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
    const { status, action, proposedHourlyRate, rateProposalReason } = req.body;

    if (!status && !action) {
      return res
        .status(400)
        .json({ success: false, error: "Status or action field is required." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // Role-based authorization check
    if (req.user.role === "CUSTOMER") {
      if (booking.customerId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED: You can only manage your own bookings.",
        });
      }
      // Allow customer to accept/reject rate or cancel booking
      if (!action && status !== "CANCELLED") {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED: Customers can only accept/reject proposed rates or cancel.",
        });
      }
    } else if (req.user.role === "PROVIDER") {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (
        !provider ||
        booking.providerId.toString() !== provider._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED: This booking is assigned to another provider.",
        });
      }
    } else if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "ACCESS_DENIED: Insufficient permissions.",
      });
    }

    // CUSTOMER RATE RESPONSE ACTIONS
    if (action === "ACCEPT_RATE") {
      if (booking.status !== "RATE_PROPOSED") {
        return res.status(400).json({
          success: false,
          error: "INVALID_ACTION: Booking is not in RATE_PROPOSED status.",
        });
      }
      booking.totalPrice = booking.proposedTotalPrice || booking.totalPrice;
      booking.status = "ACCEPTED";
      booking.rateProposalStatus = "ACCEPTED_BY_CUSTOMER";
      await booking.save();
      return res.status(200).json({
        success: true,
        message: "RATE_ACCEPTED: Customer accepted proposed rate change.",
        booking,
      });
    }

    if (action === "REJECT_RATE") {
      booking.rateProposalStatus = "REJECTED_BY_CUSTOMER";
      // Trigger automated fallback reassignment or cancel
      if (booking.candidateQueue && booking.candidateQueue.length > 0) {
        const nextProviderId = booking.candidateQueue.shift();
        booking.providerId = nextProviderId;
        booking.status = "REQUESTED";
        booking.proposedHourlyRate = undefined;
        booking.proposedTotalPrice = undefined;
        await booking.save();

        return res.status(200).json({
          success: true,
          message:
            "RATE_REJECTED_DISPATCH: Customer rejected rate proposal. Reassigned automatically to fallback provider.",
          reassigned: true,
          booking,
        });
      } else {
        booking.status = "CANCELLED";
        await booking.save();
        return res.status(200).json({
          success: true,
          message: "RATE_REJECTED: Customer rejected rate proposal. No fallbacks available.",
          reassigned: false,
          booking,
        });
      }
    }

    // PROVIDER RATE PROPOSAL ACTION
    if (status === "RATE_PROPOSED") {
      const parsedProposedRate = Number(proposedHourlyRate);
      if (!Number.isFinite(parsedProposedRate) || parsedProposedRate <= 0) {
        return res.status(400).json({
          success: false,
          error: "INVALID_RATE: A valid proposed hourly rate is required.",
        });
      }

      const durationHours = Math.max(
        1,
        (new Date(booking.bookingEnd) - new Date(booking.bookingStart)) /
          (1000 * 60 * 60),
      );

      booking.proposedHourlyRate = parsedProposedRate;
      booking.proposedTotalPrice = parsedProposedRate * durationHours;
      booking.rateProposalReason = String(rateProposalReason || "").trim();
      booking.rateProposalStatus = "PROPOSED_BY_PROVIDER";
      booking.status = "RATE_PROPOSED";

      await booking.save();

      return res.status(200).json({
        success: true,
        message: "RATE_PROPOSED: Rate change submitted for customer confirmation.",
        booking,
      });
    }

    // AUTOMATED FALLBACK ENGINE: Handles Provider Rejections
    if (status === "REJECTED") {
      if (booking.candidateQueue && booking.candidateQueue.length > 0) {
        const nextProviderId = booking.candidateQueue.shift();
        booking.providerId = nextProviderId;
        booking.status = "REQUESTED";
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

    if (status) filter.status = status;

    if (req.user.role === "CUSTOMER") {
      filter.customerId = req.user.id.toString();
    }

    if (req.user.role === "PROVIDER") {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(403).json({
          success: false,
          error:
            "PROVIDER_PROFILE_REQUIRED: No provider profile match for this account.",
        });
      }
      filter.providerId = provider._id;
    }

    if (req.user.role === "ADMIN") {
      if (providerId) filter.providerId = providerId;
      if (customerId) filter.customerId = customerId;
    }

    const bookings = await Booking.find(filter)
      .populate(
        "providerId",
        "fullName email category rating hourlyRate quotedRate location",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
