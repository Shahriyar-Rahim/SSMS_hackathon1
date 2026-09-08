import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Provider } from "../models/Provider.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-smartservice-secret";

const buildToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "8h" },
  );

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phoneNumber,
      category,
      serviceCategories,
      hourlyRate,
      location,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }

    const requestedRole = role === "PROVIDER" ? "PROVIDER" : "CUSTOMER";

    if (requestedRole === "PROVIDER") {
      const parsedRate = Number(hourlyRate);
      if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
        return res.status(400).json({
          success: false,
          error: "Providers must submit a valid hourly rate greater than zero.",
        });
      }
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: requestedRole,
      phoneNumber: phoneNumber || "",
    });

    if (user.role === "PROVIDER") {
      const selectedCategory =
        category ||
        (Array.isArray(serviceCategories) && serviceCategories[0]) ||
        "Appliance & Gadget Repair";
      const categoriesList =
        Array.isArray(serviceCategories) && serviceCategories.length > 0
          ? serviceCategories
          : [selectedCategory];
      const providerRate = Number(hourlyRate);
      const providerLocation = location || { lat: 25.782, lng: 88.895 };

      await Provider.findOneAndUpdate(
        { email: normalizedEmail },
        {
          userId: user._id,
          fullName: user.fullName,
          email: normalizedEmail,
          category: selectedCategory,
          serviceCategories: categoriesList,
          hourlyRate:
            Number.isFinite(providerRate) && providerRate >= 0
              ? providerRate
              : 0,
          quotedRate:
            Number.isFinite(providerRate) && providerRate >= 0
              ? providerRate
              : 0,
          location: providerLocation,
          approvalStatus: "PENDING",
          isActive: false,
          approvedAt: null,
          approvedBy: null,
          rating: 5,
          skills: categoriesList.map((name) => ({ name, expertiseTier: 1 })),
        },
        { upsert: true, new: true },
      );
    }

    const token = buildToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const token = buildToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/logout", (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
});

export default router;
