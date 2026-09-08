import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = type === 'success' 
    ? 'bg-slate-900/95 text-white border-slate-800' 
    : type === 'error'
    ? 'bg-rose-950/95 text-white border-rose-800'
    : 'bg-indigo-950/95 text-white border-indigo-800';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md ${bgStyles} transition-all duration-200 animate-in slide-in-from-bottom-5 text-xs font-semibold`}>
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
      {type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

