import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const iconVariants = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgGradient: 'from-green-500 to-emerald-600',
      bgLight: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200/50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500'
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bgGradient: 'from-red-500 to-rose-600',
      bgLight: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200/50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgGradient: 'from-yellow-500 to-amber-600',
      bgLight: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200/50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgGradient: 'from-blue-500 to-indigo-600',
      bgLight: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    }
  };

  const variant = iconVariants[type];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }}
          className="fixed top-4 right-4 z-[100] max-w-sm w-full"
        >
          <div className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-white/95 backdrop-blur-xl border border-white/20",
            "shadow-2xl shadow-black/10",
            "p-4"
          )}>
            {/* Glass effect overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br pointer-events-none",
              variant.bgGradient,
              "opacity-5"
            )} />
            
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={cn(
                "absolute top-0 left-0 h-1 origin-left",
                "bg-gradient-to-r",
                variant.bgGradient
              )}
            />
            
            <div className="relative flex items-start space-x-3">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br",
                  variant.bgLight,
                  "border",
                  variant.borderColor
                )}
              >
                <div className={variant.iconColor}>
                  {variant.icon}
                </div>
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "text-sm font-medium break-words",
                    variant.textColor
                  )}
                >
                  {message}
                </motion.p>
              </div>
              
              {/* Close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              </motion.button>
            </div>
            
            {/* Subtle border glow */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              "bg-gradient-to-r",
              variant.bgGradient,
              "opacity-10"
            )} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast hook
export const useToast = () => {
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ type, message, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
};