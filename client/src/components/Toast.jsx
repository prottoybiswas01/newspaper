import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const icons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />,
  error:   <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />,
  info:    <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />,
};

const colors = {
  success: 'border-l-4 border-emerald-500 bg-white dark:bg-slate-900',
  error:   'border-l-4 border-red-500 bg-white dark:bg-slate-900',
  warning: 'border-l-4 border-amber-500 bg-white dark:bg-slate-900',
  info:    'border-l-4 border-blue-500 bg-white dark:bg-slate-900',
};

const ToastItem = ({ id, type = 'info', message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), type === 'error' ? 6000 : 3500);
    return () => clearTimeout(timer);
  }, [id, type, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-sm w-full pointer-events-auto ${colors[type]}`}
      style={{ animation: 'slideInRight 0.3s ease' }}
    >
      {icons[type]}
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 break-words">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 mt-0.5"
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
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg) => toast(msg, 'error'),   [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning'), [toast]);
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" aria-live="polite">
        <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100%); }
            to   { opacity: 1; transform: translateX(0); }
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
