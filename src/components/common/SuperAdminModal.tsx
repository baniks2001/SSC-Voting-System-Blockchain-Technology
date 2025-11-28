import React, { useState } from 'react';
import { Shield, X, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Super Admin Required</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                This action requires super administrator privileges. 
                You are attempting to <strong>{getActionDescription()}</strong>.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Please enter the super admin password to continue.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="superAdminPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Super Admin Password
            </label>
            <input
              type="password"
              id="superAdminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter super admin password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};