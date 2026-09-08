import { Provider } from "../models/Provider.js";
import { calculateHaversineDistance } from "../utils/haversine.js";
import { checkScheduleConflict } from "./schedulingEngine.js";

// Dynamic weight allocation matrix based on Urgency Vectors
const WEIGHT_MATRIX = {
  STANDARD: {
    dist: 0.2,
    rate: 0.25,
    price: 0.2,
    exp: 0.15,
    work: 0.1,
    resp: 0.1,
  },
  HIGH: {
    dist: 0.35,
    rate: 0.15,
    price: 0.05,
    exp: 0.15,
    work: 0.1,
    resp: 0.2,
  },
  EMERGENCY: {
    dist: 0.45,
    rate: 0.05,
    price: 0.0,
    exp: 0.2,
    work: 0.1,
    resp: 0.2,
  },
  FLEXIBLE: {
    dist: 0.1,
    rate: 0.3,
    price: 0.3,
    exp: 0.15,
    work: 0.1,
    resp: 0.05,
  },
};

export const executeMatchingEngine = async (request) => {
  const {
    category,
    location,
    start,
    end,
    urgency = "STANDARD",
    maxPrice = 2000,
    minPrice = 300,
  } = request;

  // Extract core keywords from requested category for flexible matching
  const categoryKeywords = String(category || "")
    .toLowerCase()
    .split(/[\s&,/]+/)
    .filter((w) => w.length > 2);

  // PHASE 1: Deterministic CSP Filtering
  const allActive = await Provider.find({
    isActive: true,
    $or: [
      { approvalStatus: "APPROVED" },
      { approvalStatus: { $exists: false } },
    ],
  }).lean();

  const activeProviders = allActive.filter((p) => {
    const pCats = [p.category, ...(p.serviceCategories || [])]
      .filter(Boolean)
      .map((c) => c.toLowerCase());

    const isExact = pCats.some(
      (c) => c === String(category).toLowerCase(),
    );
    if (isExact) return true;

    // Check keyword overlap
    return pCats.some((c) =>
      categoryKeywords.some((kw) => c.includes(kw)),
    );
  });

  const candidatePool = [];

  for (const provider of activeProviders) {
    // 1. Geofence Check (with minimum 25km buffer to ensure candidate availability)
    const distanceKm = calculateHaversineDistance(
      location.lat,
      location.lng,
      provider.location.lat,
      provider.location.lng,
    );

    const maxRadius = Math.max(provider.maxRadiusKm || 15, 30);
    if (distanceKm > maxRadius) continue;

    // 2. Schedule Overlap Check
    const hasConflict = await checkScheduleConflict(provider._id, start, end);
    if (hasConflict) continue;

    // PHASE 2: Feature Normalization & MCDM Scoring
    const W = WEIGHT_MATRIX[urgency] || WEIGHT_MATRIX.STANDARD;

    // Normalization Formulas [0.0 - 1.0]
    const fDist = Math.max(0, 1 - distanceKm / provider.maxRadiusKm);
    const fRate = (provider.rating - 1.0) / 4.0;
    const fPrice = Math.max(
      0,
      1 - (provider.hourlyRate - minPrice) / (maxPrice - minPrice),
    );
    const fWork = Math.max(
      0,
      1 - provider.jobsCompletedToday / provider.maxDailyCapacity,
    );
    const fResp = Math.max(
      0,
      1 - Math.min(1, provider.avgResponseTimeMin / 60),
    );

    // Skill Tier Lookup
    const matchedSkill = provider.skills.find(
      (s) => s.name.toLowerCase() === category.toLowerCase(),
    );
    const fExp = matchedSkill ? matchedSkill.expertiseTier : 0.5;

    // Compute Composite Weighted Score
    const rawScore =
      W.dist * fDist +
      W.rate * fRate +
      W.price * fPrice +
      W.exp * fExp +
      W.work * fWork +
      W.resp * fResp;

    const matchScore = parseFloat((rawScore * 100).toFixed(1));

    // Construct Transparent Audit Log for UI
    const matchExplanation = {
      distanceKm,
      distanceContribution: `+${(W.dist * fDist * 100).toFixed(1)}`,
      ratingContribution: `+${(W.rate * fRate * 100).toFixed(1)}`,
      urgencyBoostApplied: urgency === "EMERGENCY" || urgency === "HIGH",
      workloadStatus: `${provider.jobsCompletedToday}/${provider.maxDailyCapacity} jobs today`,
    };

    candidatePool.push({
      provider,
      distanceKm,
      matchScore,
      matchExplanation,
    });
  }

  // PHASE 3: Ranking
  candidatePool.sort((a, b) => b.matchScore - a.matchScore);

  return candidatePool;
};
