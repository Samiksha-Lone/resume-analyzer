import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1C1C1C] w-full max-w-2xl max-h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-stone-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-8 border-b border-stone-100 dark:border-white/5">
                <h3 className="text-2xl font-bold tracking-tighter dark:text-white">{title}</h3>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
