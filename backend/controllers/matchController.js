import { executeMatchingEngine } from "../services/matchingEngine.js";

export const findMatches = async (req, res) => {
  try {
    const { category, location, start, end, urgency, minPrice, maxPrice } =
      req.body;

    if (
      !category ||
      !location ||
      !location.lat ||
      !location.lng ||
      !start ||
      !end
    ) {
      return res.status(400).json({
        success: false,
        error:
          "INVALID_INPUT: Missing required fields (category, location, start, end)",
      });
    }

    const matches = await executeMatchingEngine({
      category,
      location,
      start: new Date(start),
      end: new Date(end),
      urgency: urgency || "STANDARD",
      minPrice: minPrice || 300,
      maxPrice: maxPrice || 2000,
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      urgency: urgency || "STANDARD",
      matches,
    });
  } catch (error) {
    console.error("Error in findMatches controller:", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR: Failed to calculate provider matches",
      details: error.message,
    });
  }
};
