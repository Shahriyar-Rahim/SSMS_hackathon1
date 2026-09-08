import { SERVICE_CATEGORIES, LOCATIONS, INITIAL_PROVIDERS, INITIAL_REQUESTS } from './mockData';

const STORAGE_KEYS = {
  PROVIDERS: 'smarthome_providers_v1',
  REQUESTS: 'smarthome_requests_v1'
};

// Helper: simulated network latency (100-250ms) to make UI state feel realistic
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 150));

// Storage helper functions
const getStoredProviders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return data ? JSON.parse(data) : INITIAL_PROVIDERS;
  } catch (err) {
    console.warn('LocalStorage error, falling back to mock seed data:', err);
    return INITIAL_PROVIDERS;
  }
};

const saveStoredProviders = (providers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  } catch (err) {
    console.error('Failed to save providers to localStorage:', err);
  }
};

const getStoredRequests = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : INITIAL_REQUESTS;
  } catch (err) {
    console.warn('LocalStorage error, falling back to mock seed data:', err);
    return INITIAL_REQUESTS;
  }
};

const saveStoredRequests = (requests) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage:', err);
  }
};

/**
 * Smart Home API Service Module
 * Clean service layer designed for easy substitution with backend REST/GraphQL APIs (MongoDB, Redis, Node/Express)
 */
export const apiService = {
  // 1. Service Categories & Metadata
  async getServiceCategories() {
    await simulateNetworkDelay();
    return SERVICE_CATEGORIES;
  },

  async getLocations() {
    await simulateNetworkDelay();
    return LOCATIONS;
  },

  // 2. Smart Provider Matching Algorithm
  async matchProviders({ categoryId, location, urgency = "Normal", preferredTime }) {
    await simulateNetworkDelay();
    const providers = getStoredProviders();
    const requests = getStoredRequests();

    // Find providers offering this category
    const eligibleProviders = providers.filter(p => p.categoryIds.includes(categoryId));

    const scoredProviders = eligibleProviders.map(p => {
      // Calculate Distance Score (max 30 pts)
      const distanceKm = (p.distanceMap && p.distanceMap[location]) || 5.0;
      const distanceScore = Math.max(0, 30 - distanceKm * 2);

      // Calculate Rating Score (max 25 pts)
      const ratingScore = (p.rating / 5) * 25;

      // Price Score (max 20 pts)
      const priceScore = Math.max(5, 20 - (p.baseCharge / 300));

      // Availability & Double-Booking Check (max 25 pts)
      // Check if provider is already booked for this time slot
      const isSlotBooked = requests.some(r => 
        r.providerId === p.id && 
        r.preferredTime === preferredTime && 
        ["Accepted", "On the Way", "In Progress"].includes(r.status)
      );

      let availabilityScore = 25;
      if (isSlotBooked) {
        availabilityScore = 0; // Penalty for double booking
      } else if (p.status !== "Available") {
        availabilityScore = 10;
      }

      // Urgency boost for nearby verified providers
      let urgencyBonus = 0;
      if (urgency === "Urgent" && distanceKm <= 3.0) {
        urgencyBonus = 5;
      }

      const totalScore = Math.min(100, Math.round(distanceScore + ratingScore + priceScore + availabilityScore + urgencyBonus));

      // Estimated price multiplier for urgent requests (+20%)
      const finalEstimatedCharge = urgency === "Urgent" ? Math.round(p.baseCharge * 1.2) : p.baseCharge;

      return {
        ...p,
        distanceKm,
        matchScore: totalScore,
        isDoubleBooked: isSlotBooked,
        estimatedCharge: finalEstimatedCharge,
        matchReasons: [
          distanceKm <= 2.5 ? `Close proximity (${distanceKm.toFixed(1)} km)` : `${distanceKm.toFixed(1)} km away`,
          `⭐ ${p.rating} Rating (${p.reviewsCount} reviews)`,
          isSlotBooked ? "⚠️ Time slot conflict" : "Slot available & open",
          p.isVerified ? "Verified Expert Partner" : null
        ].filter(Boolean)
      };
    });

    // Sort by Match Score descending, filtering out double-booked providers if possible
    return scoredProviders.sort((a, b) => b.matchScore - a.matchScore);
  },

  // 3. Customer Requests CRUD
  async getRequests() {
    await simulateNetworkDelay();
    return getStoredRequests();
  },

  async getRequestById(id) {
    await simulateNetworkDelay();
    const requests = getStoredRequests();
    return requests.find(r => r.id === id) || null;
  },

  async createRequest(requestData) {
    await simulateNetworkDelay();
    const requests = getStoredRequests();

    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newRequest = {
      id: newId,
      ...requestData,
      status: "Requested",
      createdAt: nowIso,
      statusHistory: [
        {
          status: "Requested",
          timestamp: nowIso,
          note: "Service request submitted by customer"
        }
      ]
    };

    const updatedRequests = [newRequest, ...requests];
    saveStoredRequests(updatedRequests);
    return newRequest;
  },

  async updateRequestStatus(requestId, newStatus, note = "") {
    await simulateNetworkDelay();
    const requests = getStoredRequests();
    const nowIso = new Date().toISOString();

    let updatedRequest = null;

    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        const history = req.statusHistory || [];
        const newHistory = [
          ...history,
          {
            status: newStatus,
            timestamp: nowIso,
            note: note || `Status updated to ${newStatus}`
          }
        ];

        updatedRequest = {
          ...req,
          status: newStatus,
          completedAt: newStatus === "Completed" ? nowIso : req.completedAt,
          statusHistory: newHistory
        };
        return updatedRequest;
      }
      return req;
    });

    saveStoredRequests(updatedRequests);
    return updatedRequest;
  },

  async submitRating(requestId, rating, feedback) {
    await simulateNetworkDelay();
    const requests = getStoredRequests();
    let updated = null;

    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        updated = {
          ...req,
          rating,
          feedback
        };
        return updated;
      }
      return req;
    });

    saveStoredRequests(updatedRequests);
    return updated;
  },

  // 4. Provider Portal Specific Methods
  async getProviders() {
    await simulateNetworkDelay();
    return getStoredProviders();
  },

  async getProviderJobs(providerId) {
    await simulateNetworkDelay();
    const requests = getStoredRequests();
    return requests.filter(r => r.providerId === providerId);
  },

  async updateProviderStatus(providerId, status) {
    await simulateNetworkDelay();
    const providers = getStoredProviders();
    const updatedProviders = providers.map(p => 
      p.id === providerId ? { ...p, status } : p
    );
    saveStoredProviders(updatedProviders);
    return updatedProviders.find(p => p.id === providerId);
  },

  // Utility to reset database back to initial state
  async resetToSeedData() {
    saveStoredProviders(INITIAL_PROVIDERS);
    saveStoredRequests(INITIAL_REQUESTS);
    return { providers: INITIAL_PROVIDERS, requests: INITIAL_REQUESTS };
  }
};
