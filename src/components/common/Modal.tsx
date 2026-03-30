import React, { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle body scroll lock and event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  // Early return if not open
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-full mx-4 h-[95vh]'
  };

  // Mobile-aware positioning to avoid bottom navigation
  const getPositionClasses = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      // On mobile, position modal to avoid bottom navigation
      return 'items-end justify-center pb-20'; // Add padding for bottom nav
    }
    return 'items-center justify-center';
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-[60] flex ${getPositionClasses()} p-4 bg-black/40 backdrop-blur-md transition-all duration-200`}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl",
              "bg-white/95 backdrop-blur-xl border border-white/20",
              "shadow-2xl shadow-black/10",
              sizeClasses[size],
              typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mb-4' : ''
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                <h2 
                  id="modal-title"
                  className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                >
                  {title}
                </h2>
              </div>
              {showCloseButton && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="group relative p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <X className="relative w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
                </motion.button>
              )}
            </div>
            
            {/* Content */}
            <div className="relative p-6 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
              {/* Scroll indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform origin-left transition-transform duration-300" 
                   style={{ transform: 'scaleX(0)' }} />
              {children}
            </div>
            
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};