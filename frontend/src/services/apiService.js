const API_BASE_URL = "http://localhost:5000/api/v1";

const getStoredToken = () => localStorage.getItem("smartservice_token");

const parseTimeWindow = (value, preferredDate) => {
  if (!preferredDate)
    return {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 2 * 3600000).toISOString(),
    };

  const match = String(value).match(
    /(\d{1,2}:\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)/i,
  );
  if (!match) {
    const fallback = new Date(`${preferredDate}T09:00:00`);
    return {
      start: new Date(fallback).toISOString(),
      end: new Date(fallback.getTime() + 2 * 3600000).toISOString(),
    };
  }

  const [_, startTime, startMeridiem, endTime, endMeridiem] = match;
  const toMinutes = (timeString, meridiem) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    let total = hours % 12;
    if (meridiem.toUpperCase() === "PM") total += 12;
    return total * 60 + minutes;
  };

  const startMinutes = toMinutes(startTime, startMeridiem);
  const endMinutes = toMinutes(endTime, endMeridiem);
  const start = new Date(
    `${preferredDate}T${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}:00`,
  );
  const end = new Date(
    `${preferredDate}T${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}:00`,
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const getAuthHeaders = (extra = {}) => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const registerUserAPI = async ({
  fullName,
  email,
  password,
  role = "CUSTOMER",
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fullName, email, password, role }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Registration failed");
  return data;
};

export const loginUserAPI = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Login failed");
  return data;
};

export const fetchCategoriesAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/categories`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch categories");
    return data.categories;
  } catch (error) {
    console.error("API Error (fetchCategories):", error);
    throw error;
  }
};

export const getProviderMatchesAPI = async (requestData) => {
  try {
    const schedule = parseTimeWindow(
      requestData.preferredTime,
      requestData.preferredDate,
    );
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        category: requestData.category,
        location: requestData.location || { lat: 25.7801, lng: 88.8916 },
        start: schedule.start,
        end: schedule.end,
        urgency: (requestData.urgency || "STANDARD").toUpperCase(),
      }),
    });

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to calculate matches");

    return data.matches.map((m) => ({
      id: m.provider._id,
      fullName: m.provider.fullName,
      category: m.provider.category,
      rating: m.provider.rating,
      hourlyRate: m.provider.hourlyRate,
      distanceKm: m.distanceKm,
      matchScore: m.matchScore,
      matchExplanation: m.matchExplanation,
      location: m.provider.location,
    }));
  } catch (error) {
    console.error("API Error (getProviderMatches):", error);
    throw error;
  }
};

export const createServiceRequestAPI = async (bookingPayload) => {
  try {
    const schedule = parseTimeWindow(
      bookingPayload.preferredTime,
      bookingPayload.preferredDate,
    );
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customerId: "cust_demo_101",
        serviceCategory: bookingPayload.category,
        urgency: (bookingPayload.urgency || "STANDARD").toUpperCase(),
        bookingStart: schedule.start,
        bookingEnd: schedule.end,
        location: bookingPayload.location || { lat: 25.7801, lng: 88.8916 },
        selectedProviderId: bookingPayload.selectedProviderId,
      }),
    });

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to create booking");

    return data.booking;
  } catch (error) {
    console.error("API Error (createServiceRequest):", error);
    throw error;
  }
};

export const updateBookingStatusAPI = async (bookingId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      },
    );

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to update booking status");

    return data;
  } catch (error) {
    console.error("API Error (updateBookingStatus):", error);
    throw error;
  }
};

export const fetchBookingsAPI = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/bookings?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch bookings");

    return data.bookings;
  } catch (error) {
    console.error("API Error (fetchBookings):", error);
    throw error;
  }
};
