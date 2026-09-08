import React, { useState } from 'react';
import { 
  Wrench, 
  Droplet, 
  Zap, 
  Sparkles, 
  Hammer, 
  Truck, 
  Car, 
  UserCheck, 
  Search, 
  ChevronRight,
  ShieldCheck,
  ZapIcon,
  CheckCircle2,
  X
} from 'lucide-react';

const ICON_MAP = {
  Wrench,
  Droplet,
  Zap,
  Sparkles,
  Hammer,
  Truck,
  Car,
  UserCheck
};

export const CategoryGrid = ({ categories, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.popularServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Top Header with Search Bar & Button */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Available Home Services
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Select an Available Service
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse our verified service categories below or search for specific appliance repairs
            </p>
          </div>

          {/* Search Bar with Explicit Search Button */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-auto min-w-[300px] sm:min-w-[380px] lg:min-w-[420px]">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. AC Repair, Water Leakage..."
                className="w-full pl-11 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-24 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main 2-Column Section: Available Services on Left (Very Top), Basic Texts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Available Services Grid (Very Top) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Service Categories</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                {filteredCategories.length} Available
              </span>
            </h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 underline"
              >
                Show all categories
              </button>
            )}
          </div>

          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-bold text-base">No services found for "{searchQuery}"</p>
              <p className="text-slate-500 text-xs">Try searching for AC, Plumbing, Electrical, or Appliance Repair</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredCategories.map((category) => {
                const IconComponent = ICON_MAP[category.iconName] || Wrench;
                return (
                  <div
                    key={category.id}
                    onClick={() => onSelectCategory(category)}
                    className="group bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center">
                          <IconComponent className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/70">
                          {category.basePriceRange}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {category.description}
                      </p>

                      {/* Popular Services Pills */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {category.popularServices.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            {item}
                          </span>
                        ))}
                        {category.popularServices.length > 2 && (
                          <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                            +{category.popularServices.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>Book Service</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Basic Texts & Information Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Info Card / Hero Banner on Right */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden border border-slate-800">
            {/* Glow background accents */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Automated Platform
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                Instant Smart Dispatch for Appliance Repair
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Choose your service, set your schedule, and let our match engine instantly assign nearby verified technicians with upfront fixed pricing.
              </p>

              <div className="pt-2 border-t border-white/10 space-y-2.5 text-xs font-medium text-slate-200">
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transparent Pricing & Fixed Quotes</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <ZapIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Technician Match Algorithm</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Live Lifecycle Tracking & Status Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information / How It Works Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              How Smart Booking Works
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Select Service Category</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Choose from our available appliance & home repair services.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Smart Technician Matching</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automated engine pairs you with verified technicians nearby.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Live Status & Rating</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Track arrival live and rate your technician after service completion.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};


