import React, { useState, useEffect } from "react";
import { fetchBookings, updateBookingStatus } from "../../services/apiService";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load provider bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      await loadBookings();
    } catch (err) {
      alert("Action failed: " + err.message);
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
    <div className="max-w-5xl mx-auto">
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
          onClick={loadBookings}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700"
        >
          ↻ Refresh Queue
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          No active dispatch requests in queue.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {b.serviceCategory}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Assigned Provider:{" "}
                    {b.providerId?.fullName || "Auto-Dispatch Candidate"}
                  </h3>
                  <p className="text-xs text-slate-400">Booking ID: {b._id}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                    {b.status}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 block mt-2">
                    ৳{b.totalPrice}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex space-x-3 pt-3 border-t border-slate-800">
                {b.status === "REQUESTED" && (
                  <>
                    <button
                      onClick={() => handleAction(b._id, "ACCEPTED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-xs"
                    >
                      ✓ Accept Job
                    </button>
                    <button
                      onClick={() => handleAction(b._id, "REJECTED")}
                      className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold py-2 rounded text-xs"
                    >
                      ✕ Reject (Trigger Fallback)
                    </button>
                  </>
                )}
                {b.status === "ACCEPTED" && (
                  <button
                    onClick={() => handleAction(b._id, "IN_PROGRESS")}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded text-xs"
                  >
                    Start Service Operations
                  </button>
                )}
                {b.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleAction(b._id, "COMPLETED")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-xs"
                  >
                    Mark Job Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
