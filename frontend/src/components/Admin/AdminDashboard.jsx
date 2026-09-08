import React, { useEffect, useState } from "react";
import { fetchBookingsAPI } from "../../services/apiService";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchBookingsAPI();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load control center data.");
      console.error("Failed to load admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-400">
        Loading admin control center...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white">Admin Control Center</h2>
        <p className="text-sm text-slate-400 mt-2">
          Full oversight of customers, bookings, dispatch state, and provider
          assignments.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Total bookings
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {bookings.length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Requested
          </p>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {bookings.filter((b) => b.status === "REQUESTED").length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Completed
          </p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {bookings.filter((b) => b.status === "COMPLETED").length}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Active assignments
          </p>
          <p className="mt-3 text-3xl font-bold text-cyan-400">
            {
              bookings.filter((b) => b.providerId && b.status !== "COMPLETED")
                .length
            }
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No bookings available.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {booking.serviceCategory}
                    </span>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Customer: {booking.customerId || "Unknown customer"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Provider:{" "}
                    {booking.providerId?.fullName || "Pending assignment"}
                  </p>
                </div>

                <div className="text-left md:text-right text-sm text-slate-300">
                  <p>Price: ৳{booking.totalPrice || 0}</p>
                  <p>Match score: {booking.matchScore || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                <p>Start: {new Date(booking.bookingStart).toLocaleString()}</p>
                <p>End: {new Date(booking.bookingEnd).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
