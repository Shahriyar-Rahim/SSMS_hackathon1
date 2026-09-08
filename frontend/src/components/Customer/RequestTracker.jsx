import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Play, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../Shared/Badge';

const LIFECYCLE_STEPS = ['Requested', 'Accepted', 'On the Way', 'In Progress', 'Completed'];

export const RequestTracker = ({ requests, activeRequestId, onSelectRequest, onUpdateStatus, onGoToHistory }) => {
  const activeRequest = requests.find(r => r.id === activeRequestId) || requests[0];

  if (!activeRequest) {
    return (
      <div className="max-w-3xl mx-auto bg-white/90 border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Active Service Requests</h3>
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
          You haven't submitted any active service requests yet. Choose a service category from the catalog to book your service technician.
        </p>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(activeRequest.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Request Switcher Dropdown (If multiple active requests) */}
      {requests.length > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Active Requests:</span>
          </div>
          <div className="flex gap-2">
            {requests.map(req => (
              <button
                key={req.id}
                onClick={() => onSelectRequest(req.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  req.id === activeRequest.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {req.id} ({req.serviceName})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Request Tracker Box */}
      <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Header Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                {activeRequest.id}
              </span>
              <Badge status={activeRequest.urgency} size="sm" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeRequest.serviceName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on {new Date(activeRequest.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={activeRequest.status} size="md" />
            {activeRequest.status === 'Completed' && (
              <button
                onClick={onGoToHistory}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                View Invoice & Receipt
              </button>
            )}
          </div>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="px-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Live Service Progress Lifecycle
          </h3>

          <div className="relative">
            {/* Progress line background */}
            <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full -z-0" />
            
            {/* Active filled line */}
            <div
              className="absolute top-4 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 -z-0"
              style={{
                width: `${(Math.max(0, currentStepIndex) / (LIFECYCLE_STEPS.length - 1)) * 100}%`
              }}
            />

            <div className="grid grid-cols-5 gap-2 relative z-10">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isCurrent
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/25 scale-110'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <span
                      className={`mt-2.5 text-xs ${
                        isCurrent
                          ? 'text-blue-700 font-extrabold'
                          : isPassed
                          ? 'text-slate-800 font-semibold'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assigned Technician & Service Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Provider Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Service Provider
            </h4>

            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-bold text-slate-900 text-base">{activeRequest.providerName}</h5>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Distance: <span className="font-semibold text-slate-700">{activeRequest.distanceKm} km away</span>
                </p>
              </div>

              <a
                href={`tel:${activeRequest.providerPhone || '+8801711000000'}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call Tech
              </a>
            </div>

            <div className="pt-2.5 border-t border-slate-200/60 text-xs text-slate-600 flex justify-between items-center">
              <span>Estimated Charge:</span>
              <span className="font-extrabold text-slate-900 text-sm">৳{activeRequest.estimatedCharge}</span>
            </div>
          </div>

          {/* Schedule & Address Details */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Booking & Location Details
            </h4>

            <div className="space-y-2 text-xs text-slate-700 font-medium">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date & Time: <strong className="text-slate-900">{activeRequest.preferredDate} ({activeRequest.preferredTime})</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span>Address: <strong className="text-slate-900">{activeRequest.address}, {activeRequest.location}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                <span>Issue Description: <strong className="text-slate-900">{activeRequest.problemDetails}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Status Audit Log
          </h4>

          <div className="space-y-2">
            {activeRequest.statusHistory?.map((log, lIdx) => (
              <div key={lIdx} className="flex items-center justify-between text-xs bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Badge status={log.status} size="sm" />
                  <span className="text-slate-700 font-medium">{log.note}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Control Panel for Evaluation */}
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Demo Simulation Toolbar
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Click to test live status progression</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {LIFECYCLE_STEPS.map(statusStep => (
              <button
                key={statusStep}
                disabled={activeRequest.status === statusStep}
                onClick={() => onUpdateStatus(activeRequest.id, statusStep)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeRequest.status === statusStep
                    ? 'bg-blue-600 text-white shadow-2xs cursor-default'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 shadow-2xs'
                }`}
              >
                Set: {statusStep}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

