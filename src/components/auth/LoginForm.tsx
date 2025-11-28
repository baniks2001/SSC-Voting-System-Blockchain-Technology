import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoll } from '../../contexts/PollContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginFormProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isAdmin, onToggleAdmin }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [errorDetails, setErrorDetails] = useState({ title: '', message: '' });

  const { login } = useAuth();
  const { pollStatus } = usePoll();

  const isVotingAccessible = pollStatus === 'active';
  const isPollFinished = pollStatus === 'finished';
  const isPollPaused = pollStatus === 'paused';

  const lockTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();

  // Get API URL with auto-detection
  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return `${import.meta.env.VITE_API_URL}/api`;
    }
    const currentHost = window.location.hostname;
    return currentHost === 'localhost' || currentHost === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : `http://${currentHost}:5000/api`;
  };

  // Lock form for 10 seconds
  const lockForm = (seconds: number = 10) => {
    setIsLocked(true);
    setLockTimeRemaining(seconds);

    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    lockTimeoutRef.current = setTimeout(() => {
      setIsLocked(false);
      setLockTimeRemaining(0);
    }, seconds * 1000);

    countdownIntervalRef.current = setInterval(() => {
      setLockTimeRemaining(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const showLoginErrorScreen = (title: string, message: string) => {
    setErrorDetails({ title, message });
    setShowErrorScreen(true);
    setLoading(false);
  };

  const handleTryAgain = () => {
    setShowErrorScreen(false);
    setEmailOrStudentId('');
    setPassword('');
    setFieldErrors({ email: '', password: '' });
    
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsLocked(false);
    setLockTimeRemaining(0);
  };

  // Fast validation
  const validateForm = (): boolean => {
    if (!isAdmin) {
      if (isPollFinished) {
        showLoginErrorScreen('Voting Has Ended', 'The voting period has concluded. No more votes can be cast.');
        return false;
      }
      if (isPollPaused) {
        showLoginErrorScreen('Voting is Paused', 'Please wait for the administrator to resume voting.');
        return false;
      }
      if (!isVotingAccessible) {
        showLoginErrorScreen('Voting Not Available', 'Voting is not currently active. Please try again later.');
        return false;
      }
    }

    const newFieldErrors = { email: '', password: '' };
    let hasErrors = false;

    if (!emailOrStudentId.trim()) {
      newFieldErrors.email = isAdmin ? 'Email is required' : 'Student ID is required';
      hasErrors = true;
    }

    if (!password.trim()) {
      newFieldErrors.password = 'Password is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return false;
    }

    // Admin email validation remains the same
    if (isAdmin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrStudentId.trim())) {
        showLoginErrorScreen('Invalid Email Address', 'Please enter a valid email address (e.g., admin@example.com)');
        return false;
      }
    }

    // REMOVED: Student ID format validation - now accepts any format
    // The backend will handle the actual validation of student IDs

    return true;
  };

  // Fixed login function
  const performLogin = async (): Promise<void> => {
    const loginData = isAdmin 
      ? { email: emailOrStudentId.trim(), password }
      : { emailOrStudentId: emailOrStudentId.trim(), password };

    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/voter/login';
    const API_BASE_URL = getApiBaseUrl();

    try {
      console.log('🔐 Attempting login:', { endpoint, isAdmin, emailOrStudentId });
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Login failed (${response.status})`;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (!data.token) {
        throw new Error('No authentication token received from server');
      }

      // Check if voter is inactive - FIXED: Check the proper field
      if (!isAdmin && data.user && data.user.is_active === false) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAdmin', isAdmin.toString());

      console.log('✅ Login successful, stored data:', {
        token: data.token ? 'present' : 'missing',
        user: data.user,
        isAdmin
      });

    } catch (error: any) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('failed to fetch') || errorMsg.includes('network error') || errorMsg.includes('connection')) {
        throw new Error(`Cannot connect to server. Using: ${API_BASE_URL}`);
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      await performLogin();
      
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setIsLocked(false);
      setLockTimeRemaining(0);
      setFieldErrors({ email: '', password: '' });
      
      // Use the AuthContext login to complete the process
      await login(emailOrStudentId.trim(), password, isAdmin);
      
    } catch (error: any) {
      let errorTitle = 'Login Error';
      let errorMessage = 'Login failed. Please try again.';
      const errorMsg = error.message.toLowerCase();

      if (errorMsg.includes('account not found') || errorMsg.includes('not found') || errorMsg.includes('404')) {
        errorTitle = 'Account Not Found';
        errorMessage = `No ${isAdmin ? 'admin account' : 'student account'} found. Please check your credentials.`;
      } else if (errorMsg.includes('invalid password') || errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        errorTitle = 'Invalid Password';
        errorMessage = 'The password you entered is incorrect. Please try again.';
        lockForm(10);
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
        errorTitle = 'Connection Error';
        errorMessage = `Cannot connect to voting server. Using: ${getApiBaseUrl()}`;
      } else if (errorMsg.includes('inactive')) {
        errorTitle = 'Account Inactive';
        errorMessage = 'Your account is currently inactive. Please contact an administrator.';
      } else if (errorMsg.includes('invalid student id') || errorMsg.includes('student id')) {
        errorTitle = 'Invalid Student ID';
        errorMessage = 'The student ID format is not recognized. Please check your student ID.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      // Clear stored data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');

      showLoginErrorScreen(errorTitle, errorMessage);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrStudentId(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  };

  // Error Screen
  if (showErrorScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            {errorDetails.title}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
            {errorDetails.message}
          </p>
          
          {isLocked && (
            <div className="mb-4 px-4 py-3 bg-orange-500/10 border border-orange-200 text-orange-800 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Try again in: {lockTimeRemaining}s</span>
              </div>
            </div>
          )}

          <button
            onClick={handleTryAgain}
            disabled={isLocked}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg ${
              isLocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLocked ? `Try Again in ${lockTimeRemaining}s` : 'Try Again'}
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                setShowErrorScreen(false);
                onToggleAdmin();
              }}
              disabled={isLocked}
              className={`w-full mt-4 text-center text-sm transition-colors duration-200 ${
                isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ← Back to Student Login
            </button>
          )}
        </div>
      </div>
    );
  }

  const isFormDisabled = loading || (!isAdmin && !isVotingAccessible) || isLocked;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {!isAdmin && (
        <div
          className="admin-secret-btn"
          onClick={isLocked ? undefined : onToggleAdmin}
          title="Admin Login"
        />
      )}

      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img src="../../src/assets/logo.png" alt="Logo" className="w-15 h-15 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Login' : 'Student Voting Login'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin 
              ? 'Access the admin dashboard' 
              : isPollFinished 
                ? 'Voting has ended' 
                : isPollPaused
                  ? 'Voting is currently paused'
                  : 'Cast your vote securely'
            }
          </p>
          
          {!isAdmin && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium ${
              isPollFinished 
                ? 'bg-red-100 text-red-800 border border-red-300'
                : isPollPaused
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : isVotingAccessible
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
            }`}>
              {isPollFinished 
                ? '🗳️ Voting has ended'
                : isPollPaused
                  ? 'Please stand by. The administrator will reopen the poll momentarily'
                  : isVotingAccessible
                    ? '✅ Voting Active'
                    : '⏳ Voting Not Started'
              }
            </div>
          )}

          {isLocked && (
            <div className="mt-3 px-4 py-3 bg-orange-500/10 border border-orange-200 text-orange-800 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-left">
                  <p className="font-semibold text-sm">Account Temporarily Locked</p>
                  <p className="text-xs mt-1 text-orange-700">
                    Please wait {lockTimeRemaining} seconds before trying again
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isAdmin ? (
                <>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </>
              ) : (
                <>
                  <User className="w-4 h-4 inline mr-2" />
                  Student ID
                </>
              )}
            </label>
            <input
              type={isAdmin ? 'email' : 'text'}
              value={emailOrStudentId}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''
              } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={isAdmin ? 'admin@example.com' : 'Enter your Student ID'}
              required
              disabled={isFormDisabled}
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {fieldErrors.email}
              </p>
            )}
            {!isAdmin && !fieldErrors.email && (
              <p className="text-xs text-gray-500 mt-1">
                Enter your student ID in any format
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12 ${
                  fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your password"
                required
                disabled={isFormDisabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isFormDisabled}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Signing In...</span>
              </>
            ) : isLocked ? (
              <span>Please wait... ({lockTimeRemaining}s)</span>
            ) : (
              <span>
                {!isAdmin && !isVotingAccessible 
                  ? isPollFinished 
                    ? 'Voting Ended' 
                    : 'Voting Not Available'
                  : 'Sign In'
                }
              </span>
            )}
          </button>
        </form>

        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={isLocked ? undefined : onToggleAdmin}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLocked}
            >
              ← Back to Student Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};