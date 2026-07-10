import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard = ({ toast, onClose }) => {
  const { message, type } = toast;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50',
      text: 'text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    },
  }[type] || {
    bg: 'bg-bg-card border-border-base',
    text: 'text-text-main',
    icon: <Info className="h-5 w-5 text-primary shrink-0" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${config.bg}`}
    >
      {config.icon}
      <div className={`flex-1 text-sm font-medium leading-relaxed ${config.text}`}>
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-main transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
