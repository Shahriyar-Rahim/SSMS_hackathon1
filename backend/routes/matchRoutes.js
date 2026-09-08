import express from "express";
import { executeMatchingEngine } from "../services/matchingEngine.js";
import { Provider } from "../models/Provider.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", authenticate, async (req, res) => {
  try {
    const DEFAULT_CATALOG = [
      {
        id: "cat_1",
        name: "Appliance & Gadget Repair",
        iconName: "Wrench",
        basePriceRange: "৳400 - ৳1500",
        description: "Verified technicians for refrigerators, washing machines, microwaves, TVs & gadgets.",
        popularServices: ["Fridge Repair", "Washing Machine", "Microwave Diagnostic"],
      },
      {
        id: "cat_2",
        name: "Plumbing Services",
        iconName: "Droplet",
        basePriceRange: "৳300 - ৳1200",
        description: "Pipe leak repairs, bathroom fittings, water pump maintenance & drainage solutions.",
        popularServices: ["Pipe Leakage", "Tap Repair", "Water Tank Fitting"],
      },
      {
        id: "cat_3",
        name: "Electrical Repair & Installation",
        iconName: "Zap",
        basePriceRange: "৳350 - ৳1500",
        description: "Short circuit fixes, fan/light wiring, circuit breaker upgrades & generator setup.",
        popularServices: ["Short Circuit", "Wiring", "Switchboard Upgrade"],
      },
      {
        id: "cat_4",
        name: "Cleaning & Sanitization",
        iconName: "Sparkles",
        basePriceRange: "৳400 - ৳2000",
        description: "Deep house cleaning, water tank sanitization, sofa & carpet wash, pest treatment.",
        popularServices: ["Deep Home Cleaning", "Water Tank Clean", "Sofa Wash"],
      },
      {
        id: "cat_5",
        name: "HVAC & AC Maintenance",
        iconName: "Truck",
        basePriceRange: "৳500 - ৳2500",
        description: "Air conditioner master servicing, gas refilling, cooling diagnostics & HVAC installation.",
        popularServices: ["AC Gas Refill", "AC Servicing", "Compressor Check"],
      },
      {
        id: "cat_6",
        name: "Carpentry & Furniture Repair",
        iconName: "Hammer",
        basePriceRange: "৳400 - ৳1800",
        description: "Door lock & hinge repair, custom cabinet modifications, furniture assembly & polish.",
        popularServices: ["Door Lock", "Cabinet Repair", "Furniture Assembly"],
      },
      {
        id: "cat_7",
        name: "Car & Vehicle Maintenance",
        iconName: "Car",
        basePriceRange: "৳500 - ৳3000",
        description: "Emergency battery jumpstart, vehicle wash, engine tuning & brake diagnostics.",
        popularServices: ["Engine Diagnostic", "Battery Jumpstart", "Oil Change"],
      },
      {
        id: "cat_8",
        name: "Smart Home & Security Systems",
        iconName: "UserCheck",
        basePriceRange: "৳600 - ৳3500",
        description: "CCTV camera installation, biometric smart locks, home automation & WiFi setup.",
        popularServices: ["CCTV Setup", "Smart Lock", "WiFi Router Setup"],
      },
    ];

    const categoryFilter =
      req.user.role === "PROVIDER"
        ? {}
        : {
            isActive: true,
            $or: [
              { approvalStatus: "APPROVED" },
              { approvalStatus: { $exists: false } },
            ],
          };
    const dbCategories = await Provider.distinct(
      "serviceCategories",
      categoryFilter,
    );

    // Merge catalog items with any custom provider categories in database
    const catalogNames = DEFAULT_CATALOG.map((c) => c.name.toLowerCase());
    const extraCategories = dbCategories
      .filter((cat) => cat && !catalogNames.includes(cat.toLowerCase()))
      .map((cat, idx) => ({
        id: `cat_extra_${idx + 1}`,
        name: cat,
        iconName: "Wrench",
        basePriceRange: "৳400 - ৳1500",
        description: `Verified ${cat} technicians available for dispatch in your zone.`,
        popularServices: [cat, "General Service", "Diagnostic"],
      }));

    const finalCategories = [...DEFAULT_CATALOG, ...extraCategories];

    res.status(200).json({
      success: true,
      count: finalCategories.length,
      categories: finalCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER", "ADMIN"),
  async (req, res) => {
    try {
      const matches = await executeMatchingEngine(req.body);
      res.status(200).json({ success: true, count: matches.length, matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

export default router;
