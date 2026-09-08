import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Provider } from "./models/Provider.js";
import { Booking } from "./models/Booking.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ssms";

// Rich Seed dataset with multiple providers for EVERY maintenance category centered around Saidpur / BAUST
const providersData = [
  // 1. Appliance & Gadget Repair
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
    fullName: "Dulal Miah",
    email: "dulal.appliance@gmail.com",
    category: "Appliance & Gadget Repair",
    serviceCategories: ["Appliance & Gadget Repair"],
    hourlyRate: 550,
    rating: 4.7,
    location: { lat: 25.785, lng: 88.898 },
  },
  {
    fullName: "Shamsul Haque",
    email: "shamsul.gadget@gmail.com",
    category: "Appliance & Gadget Repair",
    serviceCategories: ["Appliance & Gadget Repair", "HVAC & AC Maintenance"],
    hourlyRate: 500,
    rating: 4.8,
    location: { lat: 25.779, lng: 88.892 },
  },

  // 2. Plumbing Services
  {
    fullName: "Rafiqul Islam",
    email: "rafiq.plumb@gmail.com",
    category: "Plumbing Services",
    serviceCategories: ["Plumbing Services"],
    hourlyRate: 400,
    rating: 4.7,
    location: { lat: 25.778, lng: 88.889 },
  },
  {
    fullName: "Kabir Hossain",
    email: "kabir.plumb@gmail.com",
    category: "Plumbing Services",
    serviceCategories: ["Plumbing Services"],
    hourlyRate: 450,
    rating: 4.9,
    location: { lat: 25.783, lng: 88.894 },
  },
  {
    fullName: "Sohel Rana",
    email: "sohel.plumb@gmail.com",
    category: "Plumbing Services",
    serviceCategories: ["Plumbing Services"],
    hourlyRate: 380,
    rating: 4.6,
    location: { lat: 25.781, lng: 88.888 },
  },

  // 3. Electrical Repair & Installation
  {
    fullName: "Kamal Hossain",
    email: "kamal.elec@gmail.com",
    category: "Electrical Repair & Installation",
    serviceCategories: ["Electrical Repair & Installation", "Appliance & Gadget Repair"],
    hourlyRate: 450,
    rating: 4.9,
    location: { lat: 25.782, lng: 88.895 },
  },
  {
    fullName: "Biplob Chandra",
    email: "biplob.elec@gmail.com",
    category: "Electrical Repair & Installation",
    serviceCategories: ["Electrical Repair & Installation"],
    hourlyRate: 350,
    rating: 4.5,
    location: { lat: 25.79, lng: 88.91 },
  },
  {
    fullName: "Jahangir Alam",
    email: "jahangir.elec@gmail.com",
    category: "Electrical Repair & Installation",
    serviceCategories: ["Electrical Repair & Installation"],
    hourlyRate: 500,
    rating: 4.8,
    location: { lat: 25.78, lng: 88.891 },
  },

  // 4. Cleaning & Sanitization
  {
    fullName: "Anowar Hossain",
    email: "anowar.clean@gmail.com",
    category: "Cleaning & Sanitization",
    serviceCategories: ["Cleaning & Sanitization"],
    hourlyRate: 350,
    rating: 4.6,
    location: { lat: 25.75, lng: 88.85 },
  },
  {
    fullName: "Rina Begum",
    email: "rina.clean@gmail.com",
    category: "Cleaning & Sanitization",
    serviceCategories: ["Cleaning & Sanitization"],
    hourlyRate: 400,
    rating: 4.8,
    location: { lat: 25.784, lng: 88.896 },
  },
  {
    fullName: "Nazrul Islam",
    email: "nazrul.clean@gmail.com",
    category: "Cleaning & Sanitization",
    serviceCategories: ["Cleaning & Sanitization"],
    hourlyRate: 320,
    rating: 4.5,
    location: { lat: 25.78, lng: 88.89 },
  },

  // 5. HVAC & AC Maintenance
  {
    fullName: "Tanvir Ahmed",
    email: "tanvir.hvac@gmail.com",
    category: "HVAC & AC Maintenance",
    serviceCategories: ["HVAC & AC Maintenance", "Appliance & Gadget Repair"],
    hourlyRate: 700,
    rating: 4.9,
    location: { lat: 25.783, lng: 88.897 },
  },
  {
    fullName: "Farhan Masud",
    email: "farhan.ac@gmail.com",
    category: "HVAC & AC Maintenance",
    serviceCategories: ["HVAC & AC Maintenance"],
    hourlyRate: 650,
    rating: 4.7,
    location: { lat: 25.786, lng: 88.902 },
  },
  {
    fullName: "Mostafa Kamal",
    email: "mostafa.ac@gmail.com",
    category: "HVAC & AC Maintenance",
    serviceCategories: ["HVAC & AC Maintenance"],
    hourlyRate: 600,
    rating: 4.8,
    location: { lat: 25.781, lng: 88.893 },
  },

  // 6. Carpentry & Furniture Repair
  {
    fullName: "Habib Rahman",
    email: "habib.carpenter@gmail.com",
    category: "Carpentry & Furniture Repair",
    serviceCategories: ["Carpentry & Furniture Repair"],
    hourlyRate: 550,
    rating: 4.7,
    location: { lat: 25.779, lng: 88.893 },
  },
  {
    fullName: "Mizanur Rahman",
    email: "mizan.wood@gmail.com",
    category: "Carpentry & Furniture Repair",
    serviceCategories: ["Carpentry & Furniture Repair"],
    hourlyRate: 500,
    rating: 4.6,
    location: { lat: 25.784, lng: 88.891 },
  },
  {
    fullName: "Abdul Kaddus",
    email: "kaddus.carpenter@gmail.com",
    category: "Carpentry & Furniture Repair",
    serviceCategories: ["Carpentry & Furniture Repair"],
    hourlyRate: 480,
    rating: 4.8,
    location: { lat: 25.782, lng: 88.897 },
  },

  // 7. Car & Vehicle Maintenance
  {
    fullName: "Jamil Hossain",
    email: "jamil.auto@gmail.com",
    category: "Car & Vehicle Maintenance",
    serviceCategories: ["Car & Vehicle Maintenance"],
    hourlyRate: 600,
    rating: 4.8,
    location: { lat: 25.783, lng: 88.895 },
  },
  {
    fullName: "Rashid Khan",
    email: "rashid.garage@gmail.com",
    category: "Car & Vehicle Maintenance",
    serviceCategories: ["Car & Vehicle Maintenance"],
    hourlyRate: 550,
    rating: 4.6,
    location: { lat: 25.78, lng: 88.892 },
  },

  // 8. Smart Home & Security Systems
  {
    fullName: "Arifur Rahman",
    email: "arif.security@gmail.com",
    category: "Smart Home & Security Systems",
    serviceCategories: ["Smart Home & Security Systems", "Electrical Repair & Installation"],
    hourlyRate: 800,
    rating: 4.9,
    location: { lat: 25.785, lng: 88.899 },
  },
  {
    fullName: "Mahmudul Hasan",
    email: "mahmud.cctv@gmail.com",
    category: "Smart Home & Security Systems",
    serviceCategories: ["Smart Home & Security Systems"],
    hourlyRate: 750,
    rating: 4.8,
    location: { lat: 25.781, lng: 88.894 },
  },
];

const seedAll = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to MongoDB:", MONGO_URI);

    const passwordHash = await bcrypt.hash("123456", 12);
    const adminPasswordHash = await bcrypt.hash("12345678", 12);

    // 1. Ensure Admin User exists
    await User.findOneAndUpdate(
      { email: "admin@gmail.com" },
      {
        fullName: "System Administrator",
        email: "admin@gmail.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        phoneNumber: "+8801700000000",
        location: { lat: 25.782, lng: 88.895 },
      },
      { upsert: true, new: true },
    );
    console.log("[Seed] Admin user created/updated: admin@gmail.com");

    // 2. Ensure Test Customer User exists
    const customer = await User.findOneAndUpdate(
      { email: "customer@smartservice.com" },
      {
        fullName: "Test Customer",
        email: "customer@smartservice.com",
        passwordHash,
        role: "CUSTOMER",
        phoneNumber: "+8801700000001",
        location: { lat: 25.7801, lng: 88.8916 },
      },
      { upsert: true, new: true },
    );
    console.log("[Seed] Customer user created/updated: customer@smartservice.com");

    // 3. Seed Provider Users & Provider Documents
    let providerCount = 0;
    for (const p of providersData) {
      const user = await User.findOneAndUpdate(
        { email: p.email },
        {
          fullName: p.fullName,
          email: p.email,
          passwordHash,
          role: "PROVIDER",
          phoneNumber: "+8801700000" + Math.floor(100 + Math.random() * 900),
          location: p.location,
        },
        { upsert: true, new: true },
      );

      await Provider.findOneAndUpdate(
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
          maxRadiusKm: 30,
          maxDailyCapacity: 8,
          jobsCompletedToday: 0,
          avgResponseTimeMin: 10,
          skills: p.serviceCategories.map((cat) => ({ name: cat, expertiseTier: 1.0 })),
        },
        { upsert: true, new: true },
      );
      providerCount++;
    }

    console.log(`[Seed] Successfully seeded ${providerCount} providers across all 8 maintenance categories!`);
    console.log("[Seed] Done!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error]", err);
    process.exit(1);
  }
};

seedAll();
