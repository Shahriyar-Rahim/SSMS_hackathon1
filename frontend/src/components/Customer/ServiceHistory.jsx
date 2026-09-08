import React, { useState } from 'react';
import { History, Star, Download, FileText, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '../Shared/Badge';
import { Modal } from '../Shared/Modal';

export const ServiceHistory = ({ requests, onSubmitRating }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ratingModalReq, setRatingModalReq] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const completedRequests = requests.filter(r => r.status === 'Completed');

  const handleOpenRating = (req) => {
    setRatingModalReq(req);
    setRatingValue(req.rating || 5);
    setFeedbackText(req.feedback || '');
  };

  const handleSaveRating = () => {
    if (ratingModalReq) {
      onSubmitRating(ratingModalReq.id, ratingValue, feedbackText);
      setRatingModalReq(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Service History & Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">View past completed home service jobs and print/download invoices</p>
        </div>
        <span className="text-xs font-bold bg-slate-100/90 text-slate-700 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          {completedRequests.length} Completed Jobs
        </span>
      </div>

      {completedRequests.length === 0 ? (
        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Past Service History</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
            Once your service requests are completed by technician partners, you will see your receipts, invoices, and ratings here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedRequests.map(req => (
            <div key={req.id} className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    {req.id}
                  </span>
                  <Badge status="Completed" size="sm" />
                  <span className="text-xs text-slate-400 font-medium">
                    Completed on {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : req.preferredDate}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{req.serviceName}</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Provider: <strong className="text-slate-900">{req.providerName}</strong> • Location: {req.location}
                </p>

                {req.rating ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold pt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{req.rating}/5 Rating</span>
                    {req.feedback && <span className="text-slate-500 font-normal italic ml-1">"{req.feedback}"</span>}
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenRating(req)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 pt-1"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Leave Rating & Feedback
                  </button>
                )}
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <span className="text-lg font-extrabold text-slate-900 mb-2">৳{req.estimatedCharge}</span>

                <button
                  onClick={() => setSelectedInvoice(req)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> View Official Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Official Service Invoice"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Invoice Number</span>
                <p className="font-mono font-bold text-slate-900 text-base">INV-{selectedInvoice.id}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Date Issued</span>
                <p className="text-xs font-semibold text-slate-700">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[11px]">Billed To</span>
                <p className="font-bold text-slate-900">{selectedInvoice.customerName}</p>
                <p className="text-slate-600">{selectedInvoice.address}</p>
                <p className="text-slate-600">{selectedInvoice.location}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[11px]">Service Provider</span>
                <p className="font-bold text-slate-900">{selectedInvoice.providerName}</p>
                <p className="text-slate-600">Verified Partner #PROV-101</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3.5 text-slate-900">{selectedInvoice.serviceName} Base Service Fee</td>
                    <td className="p-3.5 text-right font-semibold">৳{Math.round(selectedInvoice.estimatedCharge * 0.9)}</td>
                  </tr>
                  {selectedInvoice.urgency === 'Urgent' && (
                    <tr>
                      <td className="p-3.5 text-rose-700">Urgent Emergency Dispatch Fee (+10%)</td>
                      <td className="p-3.5 text-right text-rose-700 font-semibold">৳{Math.round(selectedInvoice.estimatedCharge * 0.1)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="bg-slate-50/80 p-4 flex justify-between items-center border-t border-slate-200/80 font-bold text-sm">
                <span>Total Amount Paid</span>
                <span className="text-blue-700 text-lg font-extrabold">৳{selectedInvoice.estimatedCharge}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Download className="w-4 h-4" /> Print / Save Invoice PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={!!ratingModalReq}
        onClose={() => setRatingModalReq(null)}
        title="Rate Your Technician Experience"
      >
        {ratingModalReq && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              How was your service experience with <strong className="text-slate-900">{ratingModalReq.providerName}</strong>?
            </p>

            <div className="flex items-center gap-2 justify-center py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 transition-colors transform hover:scale-110 duration-150"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Feedback Comments</label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share details about punctuality, service quality, or technician professionalism..."
                className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRatingModalReq(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRating}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

