import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CategoryGrid from "./components/Customer/CategoryGrid";
import ServiceRequestForm from "./components/Customer/ServiceRequestForm";
import ProviderMatch from "./components/Customer/ProviderMatch";
import RequestTracker from "./components/Customer/RequestTracker";
import ProviderDashboard from "./components/Provider/ProviderDashboard";
import {
  getProviderMatches,
  createServiceRequest,
  fetchBookings,
} from "./services/apiService";

export default function App() {
  const [view, setView] = useState("customer"); // 'customer' or 'provider'
  const [step, setStep] = useState(1); // 1: Category, 2: Form, 3: Match Results, 4: Tracking
  const [requestData, setRequestData] = useState({
    category: "",
    description: "",
    urgency: "STANDARD",
    preferredDate: "",
    preferredTime: "",
    location: { lat: 25.7801, lng: 88.8916 },
  });

  const [matches, setMatches] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll active bookings when on tracking step to reflect provider state changes
  useEffect(() => {
    if (step === 4 && activeBooking?._id) {
      const interval = setInterval(async () => {
        const bookings = await fetchBookings({ customerId: "cust_demo_101" });
        const current = bookings.find((b) => b._id === activeBooking._id);
        if (current) setActiveBooking(current);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step, activeBooking?._id]);

  const handleCategorySelect = (category) => {
    setRequestData((prev) => ({ ...prev, category }));
    setStep(2);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    const updated = { ...requestData, ...formData };
    setRequestData(updated);

    try {
      const matchedProviders = await getProviderMatches(updated);
      setMatches(matchedProviders);
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to calculate provider matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const newBooking = await createServiceRequest({
        ...requestData,
        selectedProviderId: providerId,
      });
      setActiveBooking(newBooking);
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to reserve booking slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar view={view} setView={setView} setStep={setStep} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {view === "customer" ? (
          <div>
            {step === 1 && (
              <CategoryGrid onSelectCategory={handleCategorySelect} />
            )}
            {step === 2 && (
              <ServiceRequestForm
                requestData={requestData}
                onSubmit={handleFormSubmit}
                onBack={() => setStep(1)}
                loading={loading}
              />
            )}
            {step === 3 && (
              <ProviderMatch
                matches={matches}
                onSelectProvider={handleSelectProvider}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}
            {step === 4 && activeBooking && (
              <RequestTracker
                booking={activeBooking}
                onNewRequest={() => setStep(1)}
              />
            )}
          </div>
        ) : (
          <ProviderDashboard />
        )}
      </main>
    </div>
  );
}
