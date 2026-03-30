import React, { useState } from 'react';
import { Shield, X, AlertTriangle, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  action: string;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getActionDescription = () => {
    switch (action) {
      case 'reset':
        return 'reset the poll and clear all votes';
      case 'finished':
        return 'finish the voting process';
      case 'not_started':
        return 'reset the poll status';
      default:
        return 'perform this action';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      await onConfirm(password);
      setPassword('');
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
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
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10"
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-md opacity-30" />
                  <Shield className="relative w-6 h-6 text-red-500" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Super Admin Required
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Elevated privileges needed</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="group relative p-2 rounded-xl transition-all duration-200 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <X className="relative w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
              </motion.button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="relative p-6 space-y-6">
              {/* Warning Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-red-50/50 to-orange-50/50 border border-red-200/50"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    This action requires super administrator privileges.
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    You are attempting to <span className="font-semibold text-red-600">{getActionDescription()}</span>.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Please enter the super admin password to continue.
                  </p>
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <label 
                  htmlFor="superAdminPassword" 
                  className="flex items-center space-x-2 text-sm font-semibold text-gray-700"
                >
                  <Key className="w-4 h-4 text-red-500" />
                  <span>Super Admin Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-sm" />
                  <input
                    type="password"
                    id="superAdminPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "relative w-full px-4 py-3 rounded-xl border border-gray-200/50",
                      "bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500",
                      "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50",
                      "transition-all duration-200 hover:border-gray-300/70"
                    )}
                    placeholder="Enter super admin password"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end space-x-3 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white/80 border border-gray-300/50 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!password.trim() || loading}
                  className={cn(
                    "px-5 py-2.5 text-sm font-semibold text-white rounded-xl",
                    "bg-gradient-to-r from-red-600 to-orange-600",
                    "hover:from-red-700 hover:to-orange-700",
                    "focus:outline-none focus:ring-2 focus:ring-red-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 shadow-lg shadow-red-500/25",
                    "relative overflow-hidden"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative">
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      'Confirm Action'
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
            
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};