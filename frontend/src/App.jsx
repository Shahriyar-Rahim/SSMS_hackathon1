import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CategoryGrid from "./components/Customer/CategoryGrid";
import ServiceRequestForm from "./components/Customer/ServiceRequestForm";
import ProviderMatch from "./components/Customer/ProviderMatch";
import RequestTracker from "./components/Customer/RequestTracker";
import { ServiceHistory } from "./components/Customer/ServiceHistory";
import ProviderDashboard from "./components/Provider/ProviderDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import {
  fetchCategoriesAPI,
  getProviderMatchesAPI,
  createServiceRequestAPI,
  fetchBookingsAPI,
  loginUserAPI,
  registerUserAPI,
  updateBookingStatusAPI,
} from "./services/apiService";

const DEFAULT_REQUEST = {
  category: "Appliance & Gadget Repair",
  description: "",
  urgency: "STANDARD",
  preferredDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  preferredTime: "04:00 PM - 06:00 PM",
  location: { lat: 25.7801, lng: 88.8916 },
};

const AUTH_STORAGE_KEYS = {
  token: "smartservice_token",
  user: "smartservice_user",
};

export default function App() {
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEYS.token) || "",
  );
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const currentUserRole = authUser?.role || "CUSTOMER";
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "customer@smartservice.com",
    password: "123456",
    role: "CUSTOMER",
    category: "Appliance & Gadget Repair",
    hourlyRate: "0",
    latitude: 25.7801,
    longitude: 88.8916,
  });
  const [authError, setAuthError] = useState("");

  const [activeRole, setActiveRole] = useState("customer");
  const [customerTab, setCustomerTab] = useState("book");
  const [step, setStep] = useState(1);

  const [categories, setCategories] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [requestData, setRequestData] = useState(DEFAULT_REQUEST);

  useEffect(() => {
    if (!authUser) {
      setActiveRole("customer");
      return;
    }

    if (authUser.role === "ADMIN") {
      setActiveRole("admin");
    } else if (authUser.role === "PROVIDER") {
      setActiveRole("provider");
    } else {
      setActiveRole("customer");
    }
  }, [authUser]);

  const saveAuthSession = (token, user) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
    setAuthToken(token);
    setAuthUser(user);
  };

  const clearAuthSession = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    setAuthToken("");
    setAuthUser(null);
    setActiveRole("customer");
    setCustomerTab("book");
    setStep(1);
  };

  const loadInitialData = async () => {
    if (!authToken || !authUser?.id) return;
    try {
      setLoading(true);
      const filters =
        authUser.role === "CUSTOMER"
          ? { customerId: authUser.id }
          : authUser.role === "PROVIDER"
            ? {}
            : {};
      const [cats, bookings] = await Promise.all([
        fetchCategoriesAPI(),
        fetchBookingsAPI(filters),
      ]);
      setCategories(cats);
      setActiveBookings(bookings);
    } catch (err) {
      setError(
        "Failed to connect to automation backend. Is server running on port 5000?",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadInitialData();
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken || !selectedBooking?._id) return;

    const interval = setInterval(async () => {
      try {
        const filters =
          authUser?.role === "CUSTOMER" ? { customerId: authUser.id } : {};
        const bookings = await fetchBookingsAPI(filters);
        setActiveBookings(bookings);
        const updated = bookings.find((b) => b._id === selectedBooking._id);
        if (updated) setSelectedBooking(updated);
      } catch (err) {
        // Silent polling error handling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedBooking?._id, authToken]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    try {
      const handler = authMode === "login" ? loginUserAPI : registerUserAPI;
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : {
              fullName: authForm.fullName,
              email: authForm.email,
              password: authForm.password,
              role: authForm.role,
              ...(authForm.role === "PROVIDER"
                ? {
                    category: authForm.category,
                    serviceCategories: [authForm.category],
                    hourlyRate: Number(authForm.hourlyRate),
                    location: {
                      lat: Number(authForm.latitude),
                      lng: Number(authForm.longitude),
                    },
                  }
                : {}),
            };
      const response = await handler(payload);
      saveAuthSession(response.token, response.user);
      if (response.user.role === "PROVIDER") {
        setActiveRole("provider");
      } else if (response.user.role === "ADMIN") {
        setActiveRole("admin");
      } else {
        setActiveRole("customer");
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed");
    }
  };

  const handleRoleChange = (nextRole) => {
    if (!authUser) return;

    if (authUser.role === "ADMIN") {
      setActiveRole(nextRole);
      return;
    }

    if (authUser.role === "PROVIDER" && nextRole === "provider") {
      setActiveRole("provider");
      return;
    }

    if (authUser.role === "CUSTOMER" && nextRole === "customer") {
      setActiveRole("customer");
    }
  };

  const handleSelectCategory = (categoryObj) => {
    setRequestData((prev) => ({ ...prev, category: categoryObj.name }));
    setStep(2);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    const updatedRequest = { ...requestData, ...formData };
    setRequestData(updatedRequest);

    try {
      const matchedProviders = await getProviderMatchesAPI(updatedRequest);
      setMatches(matchedProviders);
      setStep(3);
    } catch (err) {
      setError(err.message || "Match calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (providerId) => {
    setLoading(true);
    setError(null);

    try {
      const newBooking = await createServiceRequestAPI({
        ...requestData,
        customerId: authUser?.id,
        selectedProviderId: providerId,
      });

      setSelectedBooking(newBooking);
      setCustomerTab("track");
      setStep(4);
      await loadInitialData();
    } catch (err) {
      setError(err.message || "Slot reservation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerUpdateBookingStatus = async (
    bookingId,
    payloadOrStatus,
    extraPayload = {},
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateBookingStatusAPI(
        bookingId,
        payloadOrStatus,
        extraPayload,
      );
      await loadInitialData();
      if (result.booking) {
        setSelectedBooking(result.booking);
      }
    } catch (err) {
      setError(err.message || "Failed to respond to proposed rate change.");
    } finally {
      setLoading(false);
    }
  };

  if (!authToken || !authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-amber-500/20 bg-stone-900/95 p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 font-bold text-white shadow-lg shadow-amber-500/25">
              S
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              SmartService Portal
            </h1>
            <p className="mt-1 text-xs text-amber-200/80 font-medium">
              {authMode === "login"
                ? "Sign in with your email and password"
                : "Create a new Customer or Provider account"}
            </p>
          </div>

          {/* Sub-tabs: Login / Register */}
          <div className="mb-6 flex rounded-xl border border-stone-800 bg-stone-950/80 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                authMode === "login"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                authMode === "register"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Full Name
                </label>
                <input
                  required
                  value={authForm.fullName}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, fullName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="e.g. Tariqul Hasan"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {/* REGISTER-ONLY: ROLE & PROVIDER SPECIALIZATION / POSITION SELECTOR */}
            {authMode === "register" && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Account Type (Role)
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAuthForm({ ...authForm, role: "CUSTOMER" })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        authForm.role === "CUSTOMER"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      👤 Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthForm({ ...authForm, role: "PROVIDER" })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        authForm.role === "PROVIDER"
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🛠️ Provider
                    </button>
                  </div>
                </div>

                {authForm.role === "PROVIDER" && (
                  <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-indigo-200">
                        🛠️ Primary Service Position / Specialization
                      </label>
                      <select
                        value={authForm.category}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-indigo-400/40 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-indigo-400"
                      >
                        <option>Appliance &amp; Gadget Repair</option>
                        <option>Plumbing Services</option>
                        <option>Electrical Repair &amp; Installation</option>
                        <option>Cleaning &amp; Sanitization</option>
                        <option>HVAC &amp; AC Maintenance</option>
                        <option>Carpentry &amp; Furniture Repair</option>
                        <option>Car &amp; Vehicle Maintenance</option>
                        <option>Smart Home &amp; Security Systems</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-indigo-200">
                        Standard Hourly Rate (৳/hr)
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={authForm.hourlyRate || 600}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, hourlyRate: e.target.value })
                        }
                        className="w-full rounded-xl border border-indigo-400/40 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-400"
                        placeholder="e.g. 600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {authError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.99]"
            >
              {authMode === "login"
                ? "Sign In to Account"
                : `Register as ${authForm.role === "PROVIDER" ? "Provider" : "Customer"}`}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        userRole={currentUserRole}
        customerTab={customerTab}
        setCustomerTab={(tab) => {
          setCustomerTab(tab);
          if (tab === "book") setStep(1);
          if (tab === "track") setStep(4);
        }}
        activeRequestsCount={
          activeBookings.filter(
            (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
          ).length
        }
        authUser={authUser}
        onLogout={clearAuthSession}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentUserRole === "ADMIN" && activeRole === "admin" ? (
          <AdminDashboard />
        ) : currentUserRole === "PROVIDER" || activeRole === "provider" ? (
          <ProviderDashboard />
        ) : (
          <div>
            {customerTab === "book" && step === 1 && (
              <CategoryGrid
                categories={categories}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {customerTab === "book" && step === 2 && (
              <ServiceRequestForm
                requestData={requestData}
                onSubmit={handleFormSubmit}
                onBack={() => setStep(1)}
                loading={loading}
              />
            )}

            {customerTab === "book" && step === 3 && (
              <ProviderMatch
                matches={matches}
                onSelectProvider={handleSelectProvider}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}

            {(customerTab === "track" || (customerTab === "book" && step === 4)) && (
              <RequestTracker
                bookings={activeBookings}
                selectedBooking={selectedBooking}
                onSelectBooking={setSelectedBooking}
                onUpdateStatus={handleCustomerUpdateBookingStatus}
                onNewBooking={() => {
                  setCustomerTab("book");
                  setStep(1);
                }}
              />
            )}

            {customerTab === "history" && (
              <ServiceHistory
                requests={activeBookings}
                onSubmitRating={(bookingId, rating, feedback) => {
                  console.log("Rating submitted:", bookingId, rating, feedback);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
