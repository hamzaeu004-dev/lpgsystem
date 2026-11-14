// Shared UI building blocks used across ERP pages (stat cards, badges, modals, form fields).
import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

export const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

export const TONE = {
  emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  rose: { icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  amber: { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  blue: { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400', text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  slate: { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-500 dark:text-slate-400', bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' }
};

/** KPI tile. Pass `to` to make the whole card a link; `valueClass` overrides the value color. */
export const StatCard = ({ icon: Icon, label, value, hint, tone = 'slate', to, valueClass }) => {
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-[26px] leading-tight font-semibold mt-2 tracking-tight tabular-nums break-words ${valueClass || 'text-slate-800 dark:text-white'}`}>{value}</p>
        {hint && <p className={`text-xs font-medium mt-1 ${TONE[tone].text}`}>{hint}</p>}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 ${TONE[tone].icon}`}>
        <Icon />
      </div>
    </>
  );
  const cls = 'bg-white dark:bg-slate-900 p-5 rounded-2xl border border-white dark:border-slate-800 shadow-soft flex items-start gap-4 min-w-0';
  return to ? (
    <Link to={to} className={`${cls} transition-all hover:-translate-y-0.5 hover:border-[#9B1C1C]/30 dark:hover:border-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1C1C]/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
};

/** White/dark surface card with an optional header row. */
export const Panel = ({ title, subtitle, action, children, className = '', bodyClass = 'p-5' }) => (
  <section className={`bg-white dark:bg-slate-900 rounded-2xl border border-white dark:border-slate-800 shadow-soft min-w-0 ${className}`}>
    {(title || action) && (
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-slate-700 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={bodyClass}>{children}</div>
  </section>
);

export const Badge = ({ tone = 'slate', icon: Icon, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${TONE[tone].badge}`}>
    {Icon && <Icon className="text-[9px]" />}
    {children}
  </span>
);

export const Progress = ({ value, max, tone = 'emerald' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="h-1.5 flex-1 min-w-[80px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${TONE[tone].bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="py-14 px-6 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-lg mb-3">
      <Icon />
    </div>
    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const inputCls =
  'w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#9B1C1C] focus:ring-2 focus:ring-[#9B1C1C]/15 transition';

export const toolbarInputCls =
  'w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-[#9B1C1C] focus:ring-2 focus:ring-[#9B1C1C]/15 transition';

export const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {children}
  </label>
);

export const Modal = ({ title, subtitle, icon: Icon, onClose, children, maxWidth = 'max-w-md', closeOnBackdrop = false }) =>
  createPortal(
    <div
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl my-auto text-slate-900 dark:text-white`}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[#9B1C1C]/10 text-[#9B1C1C] dark:bg-[#9B1C1C]/30 dark:text-red-300 flex items-center justify-center shrink-0">
                <Icon />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-black truncate">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-1 text-slate-400 rounded-lg cursor-pointer shrink-0"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );

export const ModalActions = ({ onCancel, submitLabel }) => (
  <div className="flex items-center justify-end gap-2.5 pt-4 mt-1 border-t border-slate-100 dark:border-slate-800">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
    >
      Cancel
    </button>
    <button type="submit" className="btn-primary !px-5 !py-2.5 !text-xs !font-black cursor-pointer">
      {submitLabel}
    </button>
  </div>
);

export const thCls = 'px-5 py-3 whitespace-nowrap font-bold';
export const tdCls = 'px-5 py-3.5 whitespace-nowrap align-middle';

