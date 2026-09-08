import mongoose from "mongoose";
import dotenv from "dotenv";
import { Provider } from "./models/Provider.js";
import { Booking } from "./models/Booking.js";
import { User } from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Mock Providers centered around BAUST / Saidpur Campus Area
const seedProviders = [
  {
    fullName: "Kamal Hossain",
    email: "kamal.elec@gmail.com",
    category: "Electrical",
    rating: 4.9,
    hourlyRate: 450,
    maxRadiusKm: 20,
    location: { lat: 25.782, lng: 88.895 }, // ~0.5 km from BAUST
    isActive: true,
    maxDailyCapacity: 6,
    jobsCompletedToday: 2,
    avgResponseTimeMin: 10,
    skills: [
      { name: "Electrical", expertiseTier: 1.0 },
      { name: "Appliance Repair", expertiseTier: 0.8 },
    ],
  },
  {
    fullName: "Rafiqul Islam",
    email: "rafiq.plumb@gmail.com",
    category: "Plumbing",
    rating: 4.7,
    hourlyRate: 400,
    maxRadiusKm: 15,
    location: { lat: 25.778, lng: 88.889 }, // ~0.4 km from BAUST
    isActive: true,
    maxDailyCapacity: 5,
    jobsCompletedToday: 1,
    avgResponseTimeMin: 15,
    skills: [{ name: "Plumbing", expertiseTier: 0.9 }],
  },
  {
    fullName: "Tariqul Hasan",
    email: "tariq.ac@gmail.com",
    category: "Appliance & Gadget Repair",
    rating: 4.8,
    hourlyRate: 600,
    maxRadiusKm: 25,
    location: { lat: 25.785, lng: 88.9 }, // Saidpur Town (~1.2 km)
    isActive: true,
    maxDailyCapacity: 4,
    jobsCompletedToday: 0,
    avgResponseTimeMin: 8,
    skills: [
      { name: "Appliance & Gadget Repair", expertiseTier: 1.0 },
      { name: "Electrical", expertiseTier: 0.7 },
    ],
  },
  {
    fullName: "Anowar Hossain",
    email: "anowar.clean@gmail.com",
    category: "Cleaning & Pest Control",
    rating: 4.5,
    hourlyRate: 350,
    maxRadiusKm: 12,
    location: { lat: 25.75, lng: 88.85 }, // Farther out (~6 km)
    isActive: true,
    maxDailyCapacity: 8,
    jobsCompletedToday: 4,
    avgResponseTimeMin: 25,
    skills: [{ name: "Cleaning & Pest Control", expertiseTier: 0.8 }],
  },
  {
    fullName: "Biplob Chandra",
    email: "biplob.elec@gmail.com",
    category: "Electrical",
    rating: 4.2,
    hourlyRate: 320,
    maxRadiusKm: 18,
    location: { lat: 25.79, lng: 88.91 },
    isActive: true,
    maxDailyCapacity: 6,
    jobsCompletedToday: 1,
    avgResponseTimeMin: 20,
    skills: [{ name: "Electrical", expertiseTier: 0.6 }],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to MongoDB");

    await Provider.deleteMany({});
    await Booking.deleteMany({});

    console.log("[Seed] Cleaned existing collections");

    const linkedProviders = await Promise.all(
      seedProviders.map(async (provider) => {
        const user = await User.findOne({ email: provider.email });
        return user ? { ...provider, userId: user._id } : provider;
      }),
    );

    const createdProviders = await Provider.insertMany(linkedProviders);
    console.log(`[Seed] Inserted ${createdProviders.length} mock providers.`);

    console.log("[Seed] Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error);
    process.exit(1);
  }
};

seedData();
