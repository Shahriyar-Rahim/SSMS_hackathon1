import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CategoryGrid from "./components/Customer/CategoryGrid";
import ServiceRequestForm from "./components/Customer/ServiceRequestForm";
import ProviderMatch from "./components/Customer/ProviderMatch";
import RequestTracker from "./components/Customer/RequestTracker";
import ProviderDashboard from "./components/Provider/ProviderDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import {
  fetchCategoriesAPI,
  getProviderMatchesAPI,
  createServiceRequestAPI,
  fetchBookingsAPI,
  loginUserAPI,
  registerUserAPI,
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

  if (!authToken || !authUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white">
              S
            </div>
            <h1 className="text-2xl font-bold">SmartService Access</h1>
            <p className="mt-2 text-sm text-slate-400">
              Secure dispatcher portal
            </p>
          </div>

          <div className="mb-5 flex rounded-xl border border-slate-700 bg-slate-800/60 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${authMode === "login" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${authMode === "register" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Full name
                </label>
                <input
                  value={authForm.fullName}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, fullName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="Your full name"
                />
              </div>
            )}

            {authMode === "register" && authForm.role === "PROVIDER" && (
              <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Primary service
                  </label>
                  <select
                    value={authForm.category}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
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
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Your hourly rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={authForm.hourlyRate}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, hourlyRate: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Example: 600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    required
                    value={authForm.latitude}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, latitude: e.target.value })
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    value={authForm.longitude}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, longitude: e.target.value })
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Longitude"
                  />
                </div>
                <p className="text-xs text-amber-300">
                  Your profile will remain pending until an admin approves it.
                </p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="Password"
              />
            </div>

            {authMode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Role
                </label>
                <select
                  value={authForm.role}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, role: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                </select>
              </div>
            )}

            {authError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500"
            >
              {authMode === "login" ? "Login" : "Create account"}
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
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-end">
          <button
            onClick={clearAuthSession}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Logout
          </button>
        </div>

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

            {(customerTab === "track" || step === 4) && (
              <RequestTracker
                bookings={activeBookings}
                selectedBooking={selectedBooking}
                onSelectBooking={setSelectedBooking}
                onNewBooking={() => {
                  setCustomerTab("book");
                  setStep(1);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
