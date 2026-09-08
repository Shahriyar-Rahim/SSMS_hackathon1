import React from "react";

export default function ProviderMatch({
  matches,
  onSelectProvider,
  onBack,
  loading,
}) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Running CSP-MCDM Algorithm Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm"
        >
          ← Back to Form
        </button>
        <h2 className="text-2xl font-bold text-white">
          Matched Provider Candidates
        </h2>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-400">
          No available providers passed the strict constraint filters in this
          zone.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className={`p-6 rounded-xl border transition-all ${
                index === 0
                  ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">
                      {match.fullName}
                    </h3>
                    {index === 0 && (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        ★ TOP ALGORITHMIC MATCH
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {match.category} Specialist
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-indigo-400">
                    {match.matchScore}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    / 100 MATCH SCORE
                  </span>
                </div>
              </div>

              {/* Explanatory AI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs mb-4">
                <div>
                  <span className="text-slate-500 block">Distance:</span>
                  <span className="text-slate-200 font-semibold">
                    {match.distanceKm} km away
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rating:</span>
                  <span className="text-amber-400 font-semibold">
                    ★ {match.rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hourly Rate:</span>
                  <span className="text-slate-200 font-semibold">
                    ৳{match.hourlyRate} / hr
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Proximity Score:</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {match.matchExplanation?.distanceContribution || "+0"} pts
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectProvider(match.id)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Request & Reserve Slot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
