import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalRoot = document.getElementById('root');

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeOnOverlayClick ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal content panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative z-10 w-full rounded-2xl border border-border-base bg-bg-card shadow-2xl p-6 text-left ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-base mb-4">
            <h3 className="text-lg font-bold text-text-main leading-none">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-border-base/50 hover:text-text-main transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="text-sm text-text-muted leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(content, modalRoot || document.body);
};

export default Modal;
