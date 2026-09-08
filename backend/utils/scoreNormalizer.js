export const normalizeDistance = (distanceKm, maxRadiusKm) => {
  if (!maxRadiusKm || maxRadiusKm <= 0) return 0;
  return Math.max(0, 1 - distanceKm / maxRadiusKm);
};

export const normalizeRating = (rating) => {
  if (!rating) return 0.75; // Default fallback for unrated
  return Math.max(0, Math.min(1, (rating - 1.0) / 4.0));
};

export const normalizePrice = (hourlyRate, minPrice = 300, maxPrice = 2000) => {
  if (maxPrice === minPrice) return 1.0;
  return Math.max(0, 1 - (hourlyRate - minPrice) / (maxPrice - minPrice));
};

export const normalizeWorkload = (jobsCompleted, maxCapacity) => {
  if (!maxCapacity || maxCapacity <= 0) return 0;
  return Math.max(0, 1 - jobsCompleted / maxCapacity);
};

export const normalizeResponseTime = (avgResponseMin) => {
  if (!avgResponseMin) return 0.5;
  return Math.max(0, 1 - Math.min(1, avgResponseMin / 60));
};
