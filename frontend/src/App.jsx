import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { Navbar } from './components/Navbar';
import { CategoryGrid } from './components/Customer/CategoryGrid';
import { ServiceRequestForm } from './components/Customer/ServiceRequestForm';
import { ProviderMatch } from './components/Customer/ProviderMatch';
import { RequestTracker } from './components/Customer/RequestTracker';
import { ServiceHistory } from './components/Customer/ServiceHistory';
import { ProviderDashboard } from './components/Provider/ProviderDashboard';
import { Toast } from './components/Shared/Toast';
import { RefreshCw, HeartHandshake } from 'lucide-react';

export function App() {
  // Global Portal Mode: 'customer' | 'provider'
  const [activeRole, setActiveRole] = useState('customer');

  // Customer Navigation Tab: 'book' | 'track' | 'history'
  const [customerTab, setCustomerTab] = useState('book');

  // Booking Flow Steps: 'categories' -> 'form' -> 'match'
  const [bookingStep, setBookingStep] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [requestCriteria, setRequestCriteria] = useState(null);
  const [matchedProviders, setMatchedProviders] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);

  // App Data State
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Initial Data Fetch
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, locs, provs, reqs] = await Promise.all([
        apiService.getServiceCategories(),
        apiService.getLocations(),
        apiService.getProviders(),
        apiService.getRequests()
      ]);
      setCategories(cats);
      setLocations(locs);
      setProviders(provs);
      setRequests(reqs);

      // Default active request if available
      const active = reqs.find(r => r.status !== 'Completed');
      if (active) setActiveRequestId(active.id);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Error loading application data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Select Category in Catalog
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setBookingStep('form');
  };

  // 2. Submit Request Details Form -> Trigger Smart Match Algorithm
  const handleSubmitRequestForm = async (criteria) => {
    setRequestCriteria(criteria);
    setIsLoading(true);

    try {
      const matches = await apiService.matchProviders(criteria);
      setMatchedProviders(matches);
      setBookingStep('match');
    } catch (err) {
      showToast('Failed to match providers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Confirm Booking with Selected Provider
  const handleConfirmBooking = async (provider) => {
    if (!requestCriteria) return;

    try {
      const newReq = await apiService.createRequest({
        ...requestCriteria,
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.phone,
        estimatedCharge: provider.estimatedCharge,
        distanceKm: provider.distanceKm,
        matchScore: provider.matchScore
      });

      const updatedRequests = await apiService.getRequests();
      setRequests(updatedRequests);
      setActiveRequestId(newReq.id);

      showToast(`Request ${newReq.id} booked with ${provider.name}!`, 'success');

      // Reset booking flow and navigate to Live Tracker
      setBookingStep('categories');
      setSelectedCategory(null);
      setRequestCriteria(null);
      setCustomerTab('track');
    } catch (err) {
      showToast('Failed to complete booking', 'error');
    }
  };

  // Update Request Status (Shared by Customer Tracker & Provider Dashboard)
  const handleUpdateStatus = async (requestId, newStatus, note) => {
    try {
      const updated = await apiService.updateRequestStatus(requestId, newStatus, note);
      const reqs = await apiService.getRequests();
      setRequests(reqs);
      showToast(`Request ${requestId} status updated to "${newStatus}"`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Submit Rating & Feedback
  const handleSubmitRating = async (requestId, rating, feedback) => {
    try {
      await apiService.submitRating(requestId, rating, feedback);
      const reqs = await apiService.getRequests();
      setRequests(reqs);
      showToast('Thank you! Rating submitted successfully.', 'success');
    } catch (err) {
      showToast('Failed to submit rating', 'error');
    }
  };

  // Toggle Provider Availability Status
  const handleToggleProviderAvailability = async (providerId, status) => {
    try {
      await apiService.updateProviderStatus(providerId, status);
      const provs = await apiService.getProviders();
      setProviders(provs);
      showToast(`Provider status set to ${status}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Reset Demo Database
  const handleResetData = async () => {
    await apiService.resetToSeedData();
    await loadData();
    setBookingStep('categories');
    showToast('Demo dataset reset to initial state', 'info');
  };

  const activeRequestsCount = requests.filter(r => r.status !== 'Completed').length;
  const currentProvider = providers[0] || { id: 'prov-101', name: 'Rahim Electronics & AC Solutions', status: 'Available' };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      {/* Top Navbar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        customerTab={customerTab}
        setCustomerTab={setCustomerTab}
        activeRequestsCount={activeRequestsCount}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-md shadow-blue-500/20" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Processing smart automation engine...</p>
          </div>
        ) : activeRole === 'customer' ? (
          /* Customer Portal Views */
          <div>
            {customerTab === 'book' && (
              <div>
                {bookingStep === 'categories' && (
                  <CategoryGrid
                    categories={categories}
                    onSelectCategory={handleSelectCategory}
                  />
                )}

                {bookingStep === 'form' && selectedCategory && (
                  <ServiceRequestForm
                    category={selectedCategory}
                    locations={locations}
                    onBack={() => setBookingStep('categories')}
                    onSubmitRequest={handleSubmitRequestForm}
                  />
                )}

                {bookingStep === 'match' && requestCriteria && (
                  <ProviderMatch
                    requestCriteria={requestCriteria}
                    matchedProviders={matchedProviders}
                    onBack={() => setBookingStep('form')}
                    onConfirmBooking={handleConfirmBooking}
                  />
                )}
              </div>
            )}

            {customerTab === 'track' && (
              <RequestTracker
                requests={requests.filter(r => r.status !== 'Completed')}
                activeRequestId={activeRequestId}
                onSelectRequest={setActiveRequestId}
                onUpdateStatus={handleUpdateStatus}
                onGoToHistory={() => setCustomerTab('history')}
              />
            )}

            {customerTab === 'history' && (
              <ServiceHistory
                requests={requests}
                onSubmitRating={handleSubmitRating}
              />
            )}
          </div>
        ) : (
          /* Service Provider Dashboard View */
          <ProviderDashboard
            provider={currentProvider}
            requests={requests}
            onUpdateStatus={handleUpdateStatus}
            onToggleAvailability={handleToggleProviderAvailability}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SmartService Automation</span>
            <span>• Automated dispatch & technician matching system</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 font-bold transition-all shadow-2xs border border-slate-200/60"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reset Demo Dataset
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification Popup */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default App;
