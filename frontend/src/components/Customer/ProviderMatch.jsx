import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, CheckCircle2, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../Shared/Badge';

export const ProviderMatch = ({ requestCriteria, matchedProviders, onBack, onConfirmBooking }) => {
  const [selectedProviderId, setSelectedProviderId] = useState(
    matchedProviders.length > 0 ? matchedProviders[0].id : null
  );

  const [isConfirming, setIsConfirming] = useState(false);

  const selectedProvider = matchedProviders.find(p => p.id === selectedProviderId);

  const handleConfirm = () => {
    if (!selectedProvider) return;
    setIsConfirming(true);
    setTimeout(() => {
      onConfirmBooking(selectedProvider);
      setIsConfirming(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recommended Technicians</h2>
            <p className="text-xs text-slate-500">
              Matched for <span className="font-semibold text-slate-800">{requestCriteria.serviceName}</span> in{' '}
              <span className="font-semibold text-blue-600">{requestCriteria.location}</span>
            </p>
          </div>
        </div>

        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Smart Match Engine
        </span>
      </div>

      {/* Summary Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-md border border-slate-800">
        <div>
          <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">
            Service Request Criteria
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{requestCriteria.serviceName}</span>
            <Badge status={requestCriteria.urgency} size="sm" />
          </div>
          <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
            <span>📅 {requestCriteria.preferredDate}</span>
            <span>•</span>
            <span>⏰ {requestCriteria.preferredTime}</span>
          </p>
        </div>

        <div className="text-right border-l border-slate-700/60 pl-6 hidden sm:block">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Target Location</span>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{requestCriteria.address}</p>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Matched Technicians ({matchedProviders.length} Available)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Sorted by match score & distance</span>
        </div>

        {matchedProviders.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-slate-800 font-bold text-sm">No technicians available for this slot</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different date, time slot, or location.</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Modify Request Criteria
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedProviders.map((provider, index) => {
              const isSelected = provider.id === selectedProviderId;

              return (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={`relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer bg-white ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/5'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {index === 0 && (
                    <span className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                      Best Overall Match
                    </span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{provider.name}</h4>
                        {provider.isVerified && (
                          <span className="inline-flex items-center text-blue-700 text-[11px] font-bold bg-blue-50/80 border border-blue-200/60 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" /> Verified Partner
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                        <span className="flex items-center text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                          {provider.rating} <span className="text-slate-400 font-normal ml-1">({provider.reviewsCount})</span>
                        </span>

                        <span className="flex items-center text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                          {provider.distanceKm.toFixed(1)} km away ({provider.baseLocation})
                        </span>

                        <span className="text-slate-500">
                          {provider.completedJobs} jobs completed
                        </span>
                      </div>

                      {/* Match Reasons Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {provider.matchReasons.map((reason, rIdx) => (
                          <span key={rIdx} className="text-[11px] font-medium bg-slate-100/90 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Price & Score Box */}
                    <div className="flex sm:flex-col items-end justify-between border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">Match Score</span>
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {provider.matchScore}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right mt-2">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">Est. Service Charge</span>
                        <span className="text-lg font-extrabold text-slate-900">৳{provider.estimatedCharge.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Confirm CTA */}
      {selectedProvider && (
        <div className="sticky bottom-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl flex items-center justify-between z-30">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Selected Provider</span>
            <span className="font-bold text-slate-900 text-sm">{selectedProvider.name}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200 flex items-center gap-2"
          >
            {isConfirming ? (
              <>Confirming Request...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Book Request (৳{selectedProvider.estimatedCharge})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

