import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, AlertCircle, Upload, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "10:00 AM - 12:00 PM",
  "11:30 AM - 01:30 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "05:00 PM - 07:00 PM"
];

export const ServiceRequestForm = ({ category, locations, onBack, onSubmitRequest }) => {
  // Form State
  const [formData, setFormData] = useState({
    serviceName: category.popularServices[0] || category.name,
    customServiceName: '',
    location: locations[0] || 'Dhanmondi',
    address: '',
    customerName: '',
    customerPhone: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow default
    preferredTime: TIME_SLOTS[0],
    urgency: 'Normal',
    problemDetails: '',
    photoPreview: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Photo Upload Simulation
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Please enter your full name';
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
      newErrors.customerPhone = 'Please enter a valid phone number (min 10 digits)';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Please specify house number, road, or area details';
    }
    if (!formData.problemDetails.trim() || formData.problemDetails.length < 10) {
      newErrors.problemDetails = 'Please provide at least a brief description (min 10 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const finalServiceName = formData.serviceName === 'Other' ? formData.customServiceName : formData.serviceName;

    setTimeout(() => {
      onSubmitRequest({
        serviceCategory: category.id,
        serviceName: finalServiceName,
        location: formData.location,
        address: formData.address,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        urgency: formData.urgency,
        problemDetails: formData.problemDetails,
        photoUrl: formData.photoPreview
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configure Service Request</h2>
          <p className="text-xs text-slate-500">
            Selected Category: <span className="font-semibold text-blue-600">{category.name}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Section 1: Specific Service */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1. Service Details
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Specific Service <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200"
            >
              {category.popularServices.map((service, idx) => (
                <option key={idx} value={service}>{service}</option>
              ))}
              <option value="Other">Other Custom Service</option>
            </select>
          </div>

          {formData.serviceName === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specify Service Name</label>
              <input
                type="text"
                value={formData.customServiceName}
                onChange={(e) => setFormData({ ...formData, customServiceName: e.target.value })}
                placeholder="e.g. Microwave turntable motor replacement"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Section 2: Location & Contact */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> 2. Location & Contact Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Area / City Zone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Rahim Ahmed"
                className={`w-full px-3.5 py-2.5 bg-slate-50/70 border ${
                  errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200`}
              />
              {errors.customerName && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.customerName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="e.g. +880 1712-345678"
                className={`w-full px-3.5 py-2.5 bg-slate-50/70 border ${
                  errors.customerPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200`}
              />
              {errors.customerPhone && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.customerPhone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House #, Road #, Apartment Flat #"
                className={`w-full px-3.5 py-2.5 bg-slate-50/70 border ${
                  errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200`}
              />
              {errors.address && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Schedule & Urgency */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 3. Schedule & Priority
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={formData.preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Time Slot <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200"
                >
                  {TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Urgency Level Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Service Urgency Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  formData.urgency === 'Normal'
                    ? 'border-blue-500/80 bg-blue-50/60 ring-2 ring-blue-500/10 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="Normal"
                  checked={formData.urgency === 'Normal'}
                  onChange={() => setFormData({ ...formData, urgency: 'Normal' })}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-sm text-slate-900">Standard Schedule</span>
                  <p className="text-xs text-slate-500 mt-0.5">Regular base service charges apply.</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  formData.urgency === 'Urgent'
                    ? 'border-rose-500/80 bg-rose-50/60 ring-2 ring-rose-500/10 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="Urgent"
                  checked={formData.urgency === 'Urgent'}
                  onChange={() => setFormData({ ...formData, urgency: 'Urgent' })}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-sm text-rose-700 flex items-center gap-1">
                    Emergency Dispatch
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">Urgent priority assignment (+20% surcharge).</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Problem Details & Photo */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> 4. Issue Description & Attachments
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe the Problem <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.problemDetails}
              onChange={(e) => setFormData({ ...formData, problemDetails: e.target.value })}
              placeholder="e.g. AC cooling compressor is shutting off after 10 minutes, error code E4 showing."
              className={`w-full px-3.5 py-2.5 bg-slate-50/70 border ${
                errors.problemDetails ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              } rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200`}
            />
            {errors.problemDetails && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.problemDetails}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Optional Problem Photo / Diagram
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-slate-500" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {formData.photoPreview && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Image attached
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Finding Best Providers...</>
            ) : (
              <>Find & Match Recommended Technicians →</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

