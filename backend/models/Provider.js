import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      index: true,
      default: "Appliance & Gadget Repair",
    },
    rating: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    hourlyRate: { type: Number, required: true, default: 600 },
    quotedRate: { type: Number, default: 600 },
    maxRadiusKm: { type: Number, default: 15.0 },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true, index: true },
    maxDailyCapacity: { type: Number, default: 6 },
    jobsCompletedToday: { type: Number, default: 0 },
    avgResponseTimeMin: { type: Number, default: 15 },
    skills: [
      {
        name: { type: String, required: true },
        expertiseTier: { type: Number, default: 1.0, min: 0.2, max: 1.0 }, // 0.2 - 1.0
      },
    ],
  },
  { timestamps: true },
);

// Index for spatial filtering and active status
providerSchema.index({ category: 1, isActive: 1 });

export const Provider = mongoose.model("Provider", providerSchema);
