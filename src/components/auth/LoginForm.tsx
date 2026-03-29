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

  // Enhanced Error Screen - Updated to match login page colors
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
        
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          {/* Enhanced Error Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-7 text-center relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full blur-2xl" />
            
            {/* Enhanced Error Icon */}
            <div className="relative mx-auto mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-red-500/25 transform hover:scale-105 transition-transform duration-300">
                <AlertCircle className="w-8 h-8 text-white animate-pulse" />
              </div>
              
              {/* Floating Warning Badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Enhanced Typography */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {errorDetails.title}
            </h2>
            <p className="text-gray-600 text-base mb-4 leading-relaxed">
              {errorDetails.message}
            </p>
            
            {/* Enhanced Lock Warning */}
            {isLocked && (
              <div className="mb-4 px-3 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 text-orange-800 rounded-xl shadow-orange-100/50 transition-all duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-xs">Security Lock Active</p>
                    <p className="text-xs text-orange-700">Please wait {lockTimeRemaining} seconds</p>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {lockTimeRemaining}s
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Try Again Button */}
            <button
              onClick={handleTryAgain}
              disabled={isLocked}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 mb-3 relative overflow-hidden group"
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Button Content */}
              {isLocked ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Please wait... ({lockTimeRemaining}s)</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </>
              )}
            </button>

            {/* Enhanced Admin Toggle */}
            {isAdmin && (
              <button
                onClick={() => {
                  setShowErrorScreen(false);
                  onToggleAdmin();
                }}
                disabled={isLocked}
                className={`w-full text-center text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-2 py-2 px-4 rounded-lg ${
                  isLocked 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Student Login</span>
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
        {/* Enhanced Card with Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-7 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-600/10 rounded-full blur-2xl" />
          
          {/* Logo Section with Enhanced Design */}
          <div className="text-center mb-5 relative">
            {/* Logo Container with Enhanced Styling */}
            <div className="relative mx-auto mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25 transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="SSC Voting Logo" 
                    className="w-14 h-14 rounded-xl transition-all duration-300 hover:scale-105"
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
              
              {/* Floating Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Enhanced Typography */}
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 leading-tight">
              {isAdmin ? 'Admin Portal' : 'Student Voting Portal'}
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-2">
              {isAdmin 
                ? 'Secure admin access with advanced controls' 
                : isPollFinished 
                  ? 'Voting period has concluded' 
                  : isPollPaused
                    ? 'Voting temporarily paused'
                    : 'Cast your vote securely with Blockchain Technology'
              }
            </p>
            
            {/* Subtitle with Icon */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Secure • Blockchain-Powered • Transparent</span>
            </div>
          </div>

          {/* Enhanced Status Indicator */}
          {!isAdmin && (
            <div className={`mb-4 px-3 py-2.5 rounded-xl text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
              isPollFinished 
                ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-300 shadow-red-100/50'
                : isPollPaused
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-300 shadow-yellow-100/50'
                  : isVotingAccessible
                    ? 'bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border-green-300 shadow-green-100/50'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-300 shadow-gray-100/50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isPollFinished 
                    ? 'bg-red-500 text-white' 
                    : isPollPaused
                      ? 'bg-yellow-500 text-white'
                      : isVotingAccessible
                        ? 'bg-green-500 text-white animate-pulse'
                        : 'bg-gray-500 text-white'
                }`}>
                  {isPollFinished ? (
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : isPollPaused ? (
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : isVotingAccessible ? (
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">
                    {isPollFinished 
                      ? 'Voting Has Ended'
                      : isPollPaused
                        ? 'Voting Is Paused'
                        : isVotingAccessible
                          ? 'Voting Is Active'
                          : 'Voting Not Started'
                    }
                  </span>
                  <div className="text-xs opacity-75">
                    {isPollFinished 
                      ? 'The voting period has concluded'
                      : isPollPaused
                        ? 'Administrator has paused voting temporarily'
                        : isVotingAccessible
                          ? 'You can now cast your vote securely'
                          : 'Waiting for administrator to start voting'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Lock Warning */}
          {isLocked && (
            <div className="mb-4 px-3 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 text-orange-800 rounded-xl shadow-orange-100/50 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-xs">Account Temporarily Locked</p>
                  <p className="text-xs text-orange-700">For security, please wait {lockTimeRemaining} seconds</p>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {lockTimeRemaining}s
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Student ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                {isAdmin ? (
                  <>
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                      <Mail className="w-2.5 h-2.5 text-white" />
                    </div>
                    Email Address
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                      <User className="w-2.5 h-2.5 text-white" />
                    </div>
                    Student ID
                  </>
                )}
              </label>
              <div className="relative group">
                <input
                  type={isAdmin ? 'email' : 'text'}
                  value={emailOrStudentId}
                  onChange={handleEmailChange}
                  className={`w-full px-3.5 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={isAdmin ? 'admin@example.com' : 'Enter your Student ID'}
                  required
                  disabled={isFormDisabled}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <div className="mt-1.5 flex items-center text-red-600 text-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <Lock className="w-2.5 h-2.5 text-white" />
                </div>
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3.5 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 pr-11 text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md ${
                    fieldErrors.password 
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                  required
                  disabled={isFormDisabled}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 p-1 rounded-lg hover:bg-blue-50"
                  disabled={isFormDisabled}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-1.5 flex items-center text-red-600 text-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group">
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Button Content */}
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Securing Access...</span>
                </>
              ) : isLocked ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Please wait... ({lockTimeRemaining}s)</span>
                </>
              ) : (
                <span>
                  {!isAdmin && !isVotingAccessible 
                    ? isPollFinished 
                      ? 'Voting Ended' 
                      : 'Voting Not Available'
                    : isAdmin 
                      ? 'Access Admin Panel'
                      : 'Start Voting'
                  }
                </span>
              )}
              
              {/* Button Icon */}
              {!loading && !isLocked && (
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>

          {/* Enhanced Admin Toggle */}
          {isAdmin && (
            <div className="mt-6 pt-5 border-t border-gray-200/50">
              <button
                type="button"
                onClick={isLocked ? undefined : onToggleAdmin}
                className="w-full text-center text-sm text-gray-600 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-blue-50/50"
                disabled={isLocked}
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Student Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};