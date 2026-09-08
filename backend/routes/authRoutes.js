import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
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
    const { fullName, email, password, role, phoneNumber } = req.body;

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

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role:
        role && ["CUSTOMER", "PROVIDER", "ADMIN"].includes(role)
          ? role
          : "CUSTOMER",
      phoneNumber: phoneNumber || "",
    });

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
