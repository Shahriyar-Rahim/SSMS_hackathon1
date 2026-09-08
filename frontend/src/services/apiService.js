const API_BASE_URL = "http://localhost:5000/api/v1";

// 1. Fetch Providers via CSP-MCDM Matching Engine
export const getProviderMatches = async (requestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: requestData.category,
        location: requestData.location || { lat: 25.7801, lng: 88.8916 }, // BAUST Default
        start:
          requestData.preferredDate && requestData.preferredTime
            ? new Date(
                `${requestData.preferredDate}T${requestData.preferredTime}:00Z`,
              ).toISOString()
            : new Date().toISOString(),
        end:
          requestData.preferredDate && requestData.preferredTime
            ? new Date(
                new Date(
                  `${requestData.preferredDate}T${requestData.preferredTime}:00Z`,
                ).getTime() +
                  2 * 3600000,
              ).toISOString()
            : new Date(Date.now() + 2 * 3600000).toISOString(),
        urgency: (requestData.urgency || "STANDARD").toUpperCase(),
      }),
    });

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch provider matches");

    // Transform backend match array into UI-friendly structure
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

// 2. Create Booking Record with Pre-calculated Candidate Queue
export const createServiceRequest = async (bookingPayload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: "cust_demo_101",
        serviceCategory: bookingPayload.category,
        urgency: (bookingPayload.urgency || "STANDARD").toUpperCase(),
        bookingStart:
          bookingPayload.preferredDate && bookingPayload.preferredTime
            ? new Date(
                `${bookingPayload.preferredDate}T${bookingPayload.preferredTime}:00Z`,
              ).toISOString()
            : new Date().toISOString(),
        bookingEnd:
          bookingPayload.preferredDate && bookingPayload.preferredTime
            ? new Date(
                new Date(
                  `${bookingPayload.preferredDate}T${bookingPayload.preferredTime}:00Z`,
                ).getTime() +
                  2 * 3600000,
              ).toISOString()
            : new Date(Date.now() + 2 * 3600000).toISOString(),
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

// 3. Update Booking Status (Accept, Reject / Auto-Fallback Trigger, Complete)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

// 4. Get Active Bookings for Provider Dashboard & Customer Tracking
export const fetchBookings = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/bookings?${queryParams}`);

    const data = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch bookings");

    return data.bookings;
  } catch (error) {
    console.error("API Error (fetchBookings):", error);
    throw error;
  }
};
