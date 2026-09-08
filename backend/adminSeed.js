import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists (${existingAdmin.email}).`);
      process.exit(0);
    }

    const rawPassword = "12345678";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const adminData = {
      fullName: "System Administrator",
      email: "admin@gmail.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      phoneNumber: "+8801700000000",
      location: {
        lat: 25.782,
        lng: 88.895,
      },
    };

    const admin = await User.create(adminData);
    console.log(`[Seed] Admin created successfully: ${admin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error] Failed to create admin:", error);
    process.exit(1);
  }
};

seedAdmin();
