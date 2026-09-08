import React, { useState, useEffect } from "react";
import {
  fetchBookingsAPI,
  fetchCategoriesAPI,
  fetchProviderProfileAPI,
  updateProviderProfileAPI,
  updateBookingStatusAPI,
} from "../../services/apiService";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(600);
  const [latitude, setLatitude] = useState(25.7801);
  const [longitude, setLongitude] = useState(88.8916);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const data = await fetchBookingsAPI();
      setBookings(data);
      const [provider, availableCategories] = await Promise.all([
        fetchProviderProfileAPI(),
        fetchCategoriesAPI(),
      ]);
      setProfile(provider);
      setCategories(availableCategories);
      setSelectedCategories(provider.serviceCategories || [provider.category]);
      setHourlyRate(provider.hourlyRate || 600);
      setLatitude(provider.location?.lat || 25.7801);
      setLongitude(provider.location?.lng || 88.8916);
    } catch (err) {
      console.error("Failed to load provider dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateBookingStatusAPI(id, status);
      await loadDashboard();
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const saveProfile = async () => {
    if (selectedCategories.length === 0) return;
    try {
      setSavingProfile(true);
      const updated = await updateProviderProfileAPI({
        serviceCategories: selectedCategories,
        hourlyRate,
        location: { lat: latitude, lng: longitude },
      });
      setProfile(updated);
      setProfileMessage("Service preferences saved.");
    } catch (err) {
      setProfileMessage(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-400 text-center py-12">
        Loading Provider Operations Portal...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Provider Dispatch Operations
          </h2>
          <p className="text-sm text-slate-400">
            Real-Time Automated Dispatch Queue
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700"
        >
          ↻ Refresh Queue
        </button>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">My service profile</h3>
            <p className="text-sm text-slate-400 mt-1">
              Choose the work you want to receive from customers.
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${profile?.isActive ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" : "text-rose-300 border-rose-500/30 bg-rose-500/10"}`}
          >
            {profile?.approvalStatus === "PENDING"
              ? "Awaiting admin approval"
              : profile?.approvalStatus === "REJECTED"
                ? "Rejected by admin"
                : profile?.isActive
                  ? "Approved and available"
                  : "Deactivated by admin"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategories.includes(category.name);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.name)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selected ? "border-indigo-400 bg-indigo-500/20 text-indigo-200" : "border-slate-700 bg-slate-800 text-slate-400"}`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="text-xs font-semibold text-slate-400">
            Hourly rate
            <input
              type="number"
              min="0"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              className="mt-1 block w-40 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile || selectedCategories.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save preferences"}
          </button>
          {profileMessage && (
            <span className="text-xs text-slate-400">{profileMessage}</span>
          )}
        </div>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-400">
            Latitude
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Longitude
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">My work timeline</h3>
          <span className="text-xs text-slate-500">
            {bookings.length} total jobs
          </span>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            No customer requests have been assigned to you yet.
          </div>
        ) : (
          <div className="relative space-y-4 border-l border-slate-700 pl-5">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="relative bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <span className="absolute -left-[1.85rem] top-6 h-3 w-3 rounded-full border-2 border-slate-950 bg-indigo-400" />
                <div className="flex flex-col md:flex-row md:justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {b.serviceCategory}
                    </span>
                    <h4 className="mt-2 text-base font-bold text-white">
                      Customer request
                    </h4>
                    <p className="text-xs text-slate-400">
                      Booking ID: {b._id}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Scheduled: {new Date(b.bookingStart).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                      {b.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-200 block mt-2">
                      ৳{b.totalPrice}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-800">
                  {b.status === "REQUESTED" && (
                    <>
                      <button
                        onClick={() => handleAction(b._id, "ACCEPTED")}
                        className="flex-1 min-w-32 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-xs"
                      >
                        ✓ Accept Job
                      </button>
                      <button
                        onClick={() => handleAction(b._id, "REJECTED")}
                        className="flex-1 min-w-32 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold py-2 rounded text-xs"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {b.status === "ACCEPTED" && (
                    <button
                      onClick={() => handleAction(b._id, "IN_PROGRESS")}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded text-xs"
                    >
                      Start service
                    </button>
                  )}
                  {b.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleAction(b._id, "COMPLETED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-xs"
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
