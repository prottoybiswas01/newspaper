import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X, WifiOff } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const icons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
  error:   <XCircle    className="h-5 w-5 text-red-500    flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info:    <Info       className="h-5 w-5 text-blue-500   flex-shrink-0" />,
};

const borders = {
  success: 'border-l-4 border-emerald-500',
  error:   'border-l-4 border-red-500',
  warning: 'border-l-4 border-amber-500',
  info:    'border-l-4 border-blue-500',
};

// Truncate very long error messages (e.g. raw API error dumps)
const truncateMsg = (msg, max = 120) => {
  if (!msg) return '';
  const str = String(msg);
  // Strip raw quota/API error boilerplate
  const clean = str
    .replace(/\* Quota exceeded for metric:[^\n]*/gi, '')
    .replace(/https?:\/\/[^\s]*/g, '')
    .trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
};

const ToastItem = ({ id, type = 'info', message, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const displayMsg = truncateMsg(message);

  useEffect(() => {
    const auto = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(id), 300);
    }, type === 'error' ? 7000 : 4000);
    return () => clearTimeout(auto);
  }, [id, type, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-xs w-full pointer-events-auto bg-white dark:bg-slate-900 ${borders[type]}`}
      style={{
        animation: visible ? 'slideInRight 0.25s ease' : 'slideOutRight 0.25s ease forwards',
      }}
    >
      {icons[type]}
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 min-w-0">
        {displayMsg}
      </p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 mt-0.5 ml-1"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    // Avoid duplicate toasts
    setToasts(prev => {
      const last = prev[prev.length - 1];
      if (last && last.message === message) return prev;
      return [...prev.slice(-3), { id, message, type }];
    });
  }, []);

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg) => toast(msg, 'error'),   [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning'), [toast]);
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        aria-live="polite"
      >
        <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(110%); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(110%); }
          }
        `}</style>
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
