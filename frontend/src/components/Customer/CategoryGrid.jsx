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
  ZapIcon
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

export default CategoryGrid = ({ categories, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.popularServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Hero Banner / Quick Intro */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-7 sm:p-10 shadow-xl overflow-hidden border border-slate-800">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-300 text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Automated Home Service Platform
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Instant Smart Dispatch for Appliance Repair
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Choose your service, set your schedule, and let our match engine instantly assign nearby verified technicians with upfront fixed pricing.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl text-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparent Pricing
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl text-slate-200 shadow-2xs">
              <ZapIcon className="w-4 h-4 text-amber-400" /> Instant Match Algorithm
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl text-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Live Lifecycle Tracking
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. AC Repair, Water Leakage, Deep Cleaning..."
            className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 transition-all duration-200 shadow-lg"
          />
        </div>
      </div>

      {/* Category List Header */}
      <div>
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Service Categories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a category to customize your service request</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/80">
            {filteredCategories.length} Categories
          </span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <p className="text-slate-600 font-medium text-sm">No service categories found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  );
};

