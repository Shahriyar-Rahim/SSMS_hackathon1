import React from 'react';
import { Home, Wrench, Clock, History, Shield, User, Store, Sparkles } from 'lucide-react';

const Navbar = ({ activeRole, setActiveRole, customerTab, setCustomerTab, activeRequestsCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveRole('customer'); setCustomerTab('book'); }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800">
                  SmartService
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 font-semibold text-blue-700 border border-blue-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Auto-Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Automated Home Appliance Dispatch System</p>
            </div>
          </div>

          {/* Navigation Links (When in Customer Mode) */}
          {activeRole === 'customer' && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setCustomerTab('book')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  customerTab === 'book'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                Book Service
              </button>

              <button
                onClick={() => setCustomerTab('track')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                  customerTab === 'track'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Track Requests
                {activeRequestsCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xs animate-pulse">
                    {activeRequestsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCustomerTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  customerTab === 'history'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                Service History
              </button>
            </nav>
          )}

          {/* Role Switcher Pill (Customer View vs Provider Dashboard) */}
          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setActiveRole('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeRole === 'customer'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                Customer Portal
              </button>
              <button
                onClick={() => setActiveRole('provider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeRole === 'provider'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                Provider Portal
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs for Customer */}
        {activeRole === 'customer' && (
          <div className="flex md:hidden border-t border-slate-100 py-2 space-x-1 justify-around">
            <button
              onClick={() => setCustomerTab('book')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                customerTab === 'book' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              }`}
            >
              Book Service
            </button>
            <button
              onClick={() => setCustomerTab('track')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold relative transition-colors ${
                customerTab === 'track' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              }`}
            >
              Track Requests ({activeRequestsCount})
            </button>
            <button
              onClick={() => setCustomerTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                customerTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              }`}
            >
              History
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;