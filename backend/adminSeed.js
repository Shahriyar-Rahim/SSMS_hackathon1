import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect using your db configuration
    await connectDB();

    // 2. Prevent duplicate admin creation
    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists (${existingAdmin.email}).`);
      process.exit(0);
    }

    // 3. Hash the initial admin password
    const rawPassword ="12345678";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 4. Create the admin user matching your schema & BAUST/Saidpur location
    const adminData = {
      fullName: "System Administrator",
      email:"admin@gmail.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      phoneNumber: "+8801700000000",
      location: {
        lat: 25.782, // Centered near BAUST / Saidpur
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
