import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLocked, lockTimeRemaining]);

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
        lockForm(10); // Add 10-second countdown for account not found
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

  // Error Screen - Updated to match login page colors
  if (showErrorScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Image - More Visible */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/background.jpg)',
            filter: 'brightness(0.8) contrast(1.1)'
          }}
        />
        
        {/* Light overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Subtle animated background elements - Updated to match login page */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center border border-red-300">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {errorDetails.title}
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {errorDetails.message}
            </p>
            
            {isLocked && (
              <div className="mb-6 px-4 py-3 bg-orange-100 border border-orange-300 text-orange-800 rounded-xl">
                <div className="flex items-center justify-center space-x-3">
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
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
            >
              {isLocked ? (
                <span>Please wait... ({lockTimeRemaining}s)</span>
              ) : (
                <span>Try Again</span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setShowErrorScreen(false);
                  onToggleAdmin();
                }}
                disabled={isLocked}
                className={`w-full text-center text-sm transition-colors duration-200 ${
                  isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ← Back to Student Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isFormDisabled = loading || (!isAdmin && !isVotingAccessible) || isLocked;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image - More Visible */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.jpg)',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      />
      
      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Admin Login Hidden Button - Preserved */}
      {!isAdmin && (
        <div
          className="admin-secret-btn fixed top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 cursor-pointer hover:bg-white/30 transition-all duration-300 z-50 flex items-center justify-center"
          onClick={isLocked ? undefined : onToggleAdmin}
          title="Admin Login (Hidden)"
        >
          <div className="w-2 h-2 bg-white/80 rounded-full" />
        </div>
      )}

      {/* Main Login Container */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              {/* Logo Container - No outer shape */}
              <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="SSC Voting Logo" 
                  className="w-16 h-16 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-10 h-10 text-blue-600">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {isAdmin ? 'Admin Portal' : 'Student Voting Portal'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isAdmin 
                ? 'Secure admin access' 
                : isPollFinished 
                  ? 'Voting has ended' 
                  : isPollPaused
                    ? 'Voting is paused'
                    : 'Cast your vote securely with Blockchain Technology'
              }
            </p>
          </div>

          {/* Status Indicator */}
          {!isAdmin && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm border ${
              isPollFinished 
                ? 'bg-red-100 text-red-800 border-red-300'
                : isPollPaused
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : isVotingAccessible
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {isPollFinished ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : isPollPaused ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : isVotingAccessible ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                )}
                <span>
                  {isPollFinished 
                    ? 'Voting has ended'
                    : isPollPaused
                      ? 'Voting is paused'
                      : isVotingAccessible
                        ? 'Voting Active'
                        : 'Voting Not Started'
                  }
                </span>
              </div>
            </div>
          )}

          {/* Lock Warning */}
          {isLocked && (
            <div className="mb-6 px-4 py-3 bg-orange-100 border border-orange-300 text-orange-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="font-semibold text-sm">Account Locked</p>
                  <p className="text-xs text-orange-700">Wait {lockTimeRemaining}s to try again</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Student ID Field */}
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
                className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                  fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={isAdmin ? 'admin@example.com' : 'Enter your Student ID'}
                required
                disabled={isFormDisabled}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
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
                  className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                  } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                  required
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                  disabled={isFormDisabled}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

          {/* Admin Toggle */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={isLocked ? undefined : onToggleAdmin}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
                disabled={isLocked}
              >
                ← Back to Student Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};