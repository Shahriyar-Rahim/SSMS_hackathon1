import React from 'react';

const STATUS_CONFIGS = {
  Requested: { bg: 'bg-amber-50/90 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  Accepted: { bg: 'bg-blue-50/90 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  'On the Way': { bg: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-500 animate-pulse' },
  'In Progress': { bg: 'bg-purple-50/90 text-purple-700 border-purple-200/80', dot: 'bg-purple-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  Urgent: { bg: 'bg-rose-50/90 text-rose-700 border-rose-200/80', dot: 'bg-rose-500 animate-pulse' },
  Normal: { bg: 'bg-slate-100/90 text-slate-700 border-slate-200/80', dot: 'bg-slate-400' },
  Available: { bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  Busy: { bg: 'bg-slate-100/90 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' }
};

export const Badge = ({ status, size = 'md', className = '' }) => {
  const config = STATUS_CONFIGS[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-[11px] font-bold' 
    : 'px-3 py-1 text-xs font-extrabold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${config.bg} ${sizeClasses} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

