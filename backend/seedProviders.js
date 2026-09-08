import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Provider } from "./models/Provider.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/SSMS_hackathon1";

const providerSeedData = [
  {
    fullName: "Tariqul Hasan",
    email: "provider@smartservice.com",
    category: "Appliance & Gadget Repair",
    serviceCategories: ["Appliance & Gadget Repair", "Electrical Repair & Installation"],
    hourlyRate: 600,
    rating: 4.9,
    location: { lat: 25.782, lng: 88.895 },
  },
  {
    fullName: "Kamal Hossain",
    email: "kamal.provider@gmail.com",
    category: "Electrical Repair & Installation",
    serviceCategories: ["Electrical Repair & Installation", "Appliance & Gadget Repair"],
    hourlyRate: 450,
    rating: 4.8,
    location: { lat: 25.78, lng: 88.891 },
  },
  {
    fullName: "Rafiqul Islam",
    email: "rafiq.provider@gmail.com",
    category: "Plumbing Services",
    serviceCategories: ["Plumbing Services"],
    hourlyRate: 500,
    rating: 4.7,
    location: { lat: 25.778, lng: 88.889 },
  },
  {
    fullName: "Anowar Hossain",
    email: "anowar.provider@gmail.com",
    category: "Cleaning & Sanitization",
    serviceCategories: ["Cleaning & Sanitization"],
    hourlyRate: 400,
    rating: 4.6,
    location: { lat: 25.785, lng: 88.9 },
  },
  {
    fullName: "Tanvir Ahmed",
    email: "tanvir.provider@gmail.com",
    category: "HVAC & AC Maintenance",
    serviceCategories: ["HVAC & AC Maintenance", "Appliance & Gadget Repair"],
    hourlyRate: 700,
    rating: 4.9,
    location: { lat: 25.783, lng: 88.897 },
  },
  {
    fullName: "Habib Rahman",
    email: "habib.provider@gmail.com",
    category: "Carpentry & Furniture Repair",
    serviceCategories: ["Carpentry & Furniture Repair"],
    hourlyRate: 550,
    rating: 4.5,
    location: { lat: 25.779, lng: 88.893 },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to MongoDB:", MONGO_URI);

    const passwordHash = await bcrypt.hash("123456", 12);

    // 1. Ensure test Customer user exists
    const customerUser = await User.findOneAndUpdate(
      { email: "customer@smartservice.com" },
      {
        fullName: "Test Customer",
        email: "customer@smartservice.com",
        passwordHash,
        role: "CUSTOMER",
        phoneNumber: "+8801700000001",
      },
      { upsert: true, new: true },
    );
    console.log("[Seed] Test customer ensured:", customerUser.email);

    // 2. Insert/Update Provider Users and linked Provider profiles
    for (const p of providerSeedData) {
      const user = await User.findOneAndUpdate(
        { email: p.email },
        {
          fullName: p.fullName,
          email: p.email,
          passwordHash,
          role: "PROVIDER",
          phoneNumber: "+88017000000" + Math.floor(100 + Math.random() * 900),
          location: p.location,
        },
        { upsert: true, new: true },
      );

      const provider = await Provider.findOneAndUpdate(
        { email: p.email },
        {
          userId: user._id,
          fullName: p.fullName,
          email: p.email,
          category: p.category,
          serviceCategories: p.serviceCategories,
          hourlyRate: p.hourlyRate,
          quotedRate: p.hourlyRate,
          rating: p.rating,
          location: p.location,
          isActive: true,
          maxDailyCapacity: 8,
          jobsCompletedToday: 0,
          avgResponseTimeMin: 10,
          skills: p.serviceCategories.map((cat) => ({ name: cat, expertiseTier: 1.0 })),
        },
        { upsert: true, new: true },
      );

      console.log(`[Seed] Provider created/updated: ${provider.fullName} (${provider.email}) - ${provider.category}`);
    }

    console.log("\n✅ [Seed] Successfully added test provider accounts to MongoDB!");
    console.log("All accounts use password: 123456\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Seed Error]", err);
    process.exit(1);
  }
};

seedDB();
