import React, { useState } from 'react';
import { 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Sparkles
} from 'lucide-react';
import { Badge } from '../Shared/Badge';

export const ProviderDashboard = ({ provider, requests, onUpdateStatus, onToggleAvailability }) => {
  const [activeFilter, setActiveFilter] = useState('active'); // 'incoming', 'active', 'completed'

  // Filter jobs for this provider
  const providerRequests = requests.filter(r => r.providerId === provider.id || !r.providerId);

  const incomingJobs = providerRequests.filter(r => r.status === 'Requested');
  const activeJobs = providerRequests.filter(r => ['Accepted', 'On the Way', 'In Progress'].includes(r.status));
  const completedJobs = providerRequests.filter(r => r.status === 'Completed');

  const totalEarnings = completedJobs.reduce((sum, r) => sum + (r.estimatedCharge || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Provider Header Card */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{provider.name}</h1>
              <span className="bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Provider
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Base Service Location: <span className="text-slate-200 font-semibold">{provider.baseLocation}</span> • Phone: {provider.phone}
            </p>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
            <span className="text-xs text-slate-300 font-medium pl-2">Availability:</span>
            <button
              onClick={() => onToggleAvailability(provider.id, provider.status === 'Available' ? 'Busy' : 'Available')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                provider.status === 'Available'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              ● {provider.status}
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 relative z-10">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Incoming Alerts</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{incomingJobs.length}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Active Jobs</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-1 block">{activeJobs.length}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Jobs Completed</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{completedJobs.length + provider.completedJobs}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Rating & Earnings</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-white">⭐ {provider.rating}</span>
              <span className="text-xs font-semibold text-slate-300">৳{totalEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 inline-flex gap-1">
          <button
            onClick={() => setActiveFilter('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'incoming'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incoming Queue ({incomingJobs.length})
          </button>

          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'active'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Jobs ({activeJobs.length})
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed History ({completedJobs.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeFilter === 'incoming' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
            Incoming Service Requests
          </h3>

          {incomingJobs.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 text-xs shadow-xs font-medium">
              No new incoming requests at the moment.
            </div>
          ) : (
            incomingJobs.map(req => (
              <div key={req.id} className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                      {req.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-lg">{req.serviceName}</h4>
                    <Badge status={req.urgency} size="sm" />
                  </div>
                  <span className="text-lg font-extrabold text-slate-900">৳{req.estimatedCharge}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[11px] block mb-1">Customer Info</span>
                    <p className="font-bold text-slate-900">{req.customerName}</p>
                    <p className="flex items-center gap-1 text-slate-600 mt-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {req.customerPhone}
                    </p>
                    <p className="flex items-center gap-1 text-slate-600 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.address}, {req.location} ({req.distanceKm} km away)
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[11px] block mb-1">Requested Schedule</span>
                    <p className="flex items-center gap-1 font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {req.preferredDate} ({req.preferredTime})
                    </p>
                    <p className="mt-2 text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 italic">
                      "{req.problemDetails}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => onUpdateStatus(req.id, 'Accepted', 'Provider accepted incoming job')}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Job Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeFilter === 'active' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
            Active Jobs Dispatch Manager
          </h3>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 text-xs shadow-xs font-medium">
              No jobs currently in progress. Accept an incoming request to start.
            </div>
          ) : (
            activeJobs.map(req => (
              <div key={req.id} className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                        {req.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-lg">{req.serviceName}</h4>
                      <Badge status={req.status} size="md" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Customer: <strong className="text-slate-800">{req.customerName}</strong> ({req.customerPhone}) • Address: {req.address}, {req.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Job Value</span>
                    <span className="text-xl font-extrabold text-slate-900">৳{req.estimatedCharge}</span>
                  </div>
                </div>

                {/* Progress Workflow Buttons */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                    Update Job Lifecycle State
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      disabled={req.status === 'On the Way' || req.status === 'In Progress'}
                      onClick={() => onUpdateStatus(req.id, 'On the Way', 'Technician is en route to customer address')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        req.status === 'On the Way'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:border-indigo-400 shadow-2xs'
                      }`}
                    >
                      Step 1: Mark "On the Way"
                    </button>

                    <button
                      disabled={req.status === 'In Progress'}
                      onClick={() => onUpdateStatus(req.id, 'In Progress', 'Technician started diagnostics/repair on site')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        req.status === 'In Progress'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:border-purple-400 shadow-2xs'
                      }`}
                    >
                      Step 2: Mark "In Progress"
                    </button>

                    <button
                      onClick={() => onUpdateStatus(req.id, 'Completed', 'Service finished successfully and payment collected')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 sm:ml-auto shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Final Step: Mark "Completed"
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeFilter === 'completed' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
            Completed Service Log
          </h3>

          {completedJobs.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 text-xs shadow-xs font-medium">
              No completed jobs in current session.
            </div>
          ) : (
            completedJobs.map(req => (
              <div key={req.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-900">{req.id} - {req.serviceName}</span>
                  <p className="text-slate-500 mt-0.5">{req.customerName} ({req.location})</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-extrabold text-emerald-700 text-sm">৳{req.estimatedCharge}</span>
                  <Badge status="Completed" size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

