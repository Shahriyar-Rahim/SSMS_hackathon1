import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    serviceCategory: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["STANDARD", "HIGH", "EMERGENCY", "FLEXIBLE"],
      default: "STANDARD",
    },
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ACCEPTED",
        "ON_THE_WAY",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "REQUESTED",
      index: true,
    },
    bookingStart: { type: Date, required: true, index: true },
    bookingEnd: { type: Date, required: true, index: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    totalPrice: { type: Number, required: true },
    matchScore: { type: Number },
    matchExplanation: { type: Object }, // Explanatory trace for UI transparency
    candidateQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Provider" }], // Pre-calculated fallbacks
  },
  { timestamps: true },
);

// Compound index for instant overlap collision detection
bookingSchema.index({
  providerId: 1,
  bookingStart: 1,
  bookingEnd: 1,
  status: 1,
});

export const Booking = mongoose.model("Booking", bookingSchema);
