import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PollProvider, usePoll } from './contexts/PollContext';
import { LoginForm } from './components/auth/LoginForm';
import { Toast, useToast } from './components/common/Toast';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { AdminManagement } from './components/admin/AdminManagement';
import { CandidateManagement } from './components/admin/CandidateManagement';
import { VoterManagement } from './components/admin/VoterManagement';
import { PollMonitor } from './components/admin/PollMonitor';
import { CastVote } from './components/voter/CastVote';
import { useSecurity } from './hooks/useSecurity';
import './styles/globals.css';
import './styles/components.css';

// Server status check component
function ServerStatusCheck({ children }: { children: React.ReactNode }) {
  const [serverDown, setServerDown] = useState(false);

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

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/health`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        // Server is responding
        setServerDown(false);
      } catch (error: any) {
        console.error('Server status check failed:', error);
        setServerDown(true);
      }
    };

    checkServerStatus();
  }, []);

  // Show system down message
  if (serverDown) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
        {/* Technical System Design Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          {/* Circuit Board Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Horizontal Lines */}
              <div className="absolute top-10 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-20 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-32 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-44 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-56 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-68 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-80 left-0 right-0 h-px bg-cyan-400"></div>
              <div className="absolute top-92 left-0 right-0 h-px bg-cyan-400"></div>
              
              {/* Vertical Lines */}
              <div className="absolute top-0 bottom-0 left-10 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-20 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-32 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-44 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-56 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-68 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-80 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 left-92 w-px bg-cyan-400"></div>
              
              {/* Right side vertical lines */}
              <div className="absolute top-0 bottom-0 right-10 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-20 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-32 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-44 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-56 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-68 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-80 w-px bg-cyan-400"></div>
              <div className="absolute top-0 bottom-0 right-92 w-px bg-cyan-400"></div>
            </div>
          </div>
          
          {/* Animated Nodes */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
            <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300 shadow-lg shadow-blue-400/50"></div>
            <div className="absolute bottom-32 left-40 w-4 h-4 bg-cyan-400 rounded-full animate-pulse delay-700 shadow-lg shadow-cyan-400/50"></div>
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-1000 shadow-lg shadow-blue-400/50"></div>
            <div className="absolute top-60 left-60 w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-500 shadow-lg shadow-cyan-300/50"></div>
            <div className="absolute top-32 right-60 w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-800 shadow-lg shadow-blue-300/50"></div>
          </div>
          
          {/* Connection Lines */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full">
              <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse"/>
              <line x1="70%" y1="30%" x2="90%" y2="50%" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse delay-300"/>
              <line x1="20%" y1="70%" x2="40%" y2="90%" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse delay-700"/>
              <line x1="80%" y1="60%" x2="60%" y2="80%" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse delay-1000"/>
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Floating Code Elements */}
          <div className="absolute inset-0 opacity-10 font-mono text-xs sm:text-xs text-cyan-400 hidden sm:block">
            <div className="absolute top-10 left-10 animate-pulse text-xs sm:text-xs">{`<System status="offline" />`}</div>
            <div className="absolute top-32 right-16 animate-pulse delay-500 text-xs sm:text-xs">{`{ error: "Connection lost" }`}</div>
            <div className="absolute bottom-20 left-20 animate-pulse delay-1000 text-xs sm:text-xs">{`// Retrying connection...`}</div>
            <div className="absolute bottom-40 right-10 animate-pulse delay-300 text-xs sm:text-xs">{`await reconnect()`}</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full px-4 sm:px-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 text-center">
            {/* Warning Icon with Glow */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 backdrop-blur-sm">
              <div className="relative">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              System Down
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed px-2">
              We're experiencing technical difficulties. Please try again in a few moments.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Server is up, render children
  return <>{children}</>;
}

function AppContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { pollStatus, isLoginEnabled, loading: pollLoading } = usePoll();
  const { showToast } = useToast();
  const { checkDevTools } = useSecurity();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [appInitialized, setAppInitialized] = useState(false);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Check for devtools periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkDevTools();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkDevTools]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true);
    }
  }, []);

  // Set minimum loading time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced loading state management with minimum 2-second loading and transition
  useEffect(() => {
    // Only set initialized to true when both auth and poll have finished loading AND minimum time has passed
    if (!authLoading && !pollLoading && minLoadingTimePassed && !appInitialized) {
      // Trigger transition animation before showing login
      setShowTransition(true);
      
      // After transition completes, set app as initialized
      // The login form will fade in as the transition animation completes
      setTimeout(() => {
        setAppInitialized(true);
        setShowTransition(false);
      }, 2000); // This duration should match the transition animation duration
    }
  }, [authLoading, pollLoading, minLoadingTimePassed, appInitialized]);

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully');
  };

  const handleVoteCast = () => {
    showToast('success', 'Vote successfully recorded on blockchain!');
  };

  // Show loading spinner while initializing
  if (!appInitialized) {
    return (
      <motion.div
        key="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6"
      >
        <div className="text-center max-w-md w-full">
          {/* Logo with continuous animation - pulse then zoom and fade */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={showTransition ? 
              { 
                scale: 15,
                opacity: 0
              } : { scale: 1, opacity: 1 }}
            transition={showTransition ? 
              { 
                duration: 2,
                ease: [0.4, 0, 0.2, 1], // Smooth cubic bezier for continuous zoom
                opacity: { duration: 1.5, ease: "easeOut" }
              } : { duration: 0.5 }}
            className="relative mx-auto mb-6 sm:mb-8"
          >
            <img 
              src="/logo.png" 
              alt="VoteChain Logo" 
              className={`w-40 h-40 sm:w-28 sm:h-28 md:w-30 md:h-30 mx-auto ${!showTransition ? 'animate-pulse' : ''}`}
            />
          </motion.div>

          {/* System Title and Subtext - fade out during transition */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={showTransition ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1.5, delay: showTransition ? 0.3 : 0 }}
            className="mb-4"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              SSC Voting System
            </h1>
            <p className="text-base sm:text-lg md:text-s text-black-600 mb-2">
              with Geth-Ethereum Blockchain Technology
            </p>
            <p className="text-sm sm:text-base text-gray-400">
              Developed by: Servando S. Tio III
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <LoginForm
          isAdmin={showAdminLogin}
          onToggleAdmin={() => setShowAdminLogin(!showAdminLogin)}
        />
      </motion.div>
    );
  }

  // Admin Interface
  if (user?.email && user?.type !== 'voter' && user?.role !== 'voter') {
    return (
      <AdminLayout
        activeTab={activeAdminTab}
        onTabChange={setActiveAdminTab}
        onLogout={handleLogout}
      >
        {activeAdminTab === 'dashboard' && <Dashboard />}
        {activeAdminTab === 'admins' && <AdminManagement />}
        {activeAdminTab === 'candidates' && <CandidateManagement />}
        {activeAdminTab === 'voters' && <VoterManagement />}
        {activeAdminTab === 'monitor' && <PollMonitor />}
      </AdminLayout>
    );
  }

  // Voter has already voted
  if (user?.hasVoted) {
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
        
        {/* Subtle animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-green-100 flex items-center justify-center border border-green-300">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vote Successfully Cast
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Thank you for participating in the election. Your vote has been securely recorded on the blockchain.
            </p>
            
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-green-800 text-sm font-medium">Blockchain Verified</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if voting is allowed
  if (!isLoginEnabled) {
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
        
        {/* Subtle animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h1 className="text-xl font-bold text-gray-900">SSC Voting System</h1>
              </div>
              <p className="text-gray-600 text-sm text-center mt-2">
                Secure Blockchain Voting • Developed by Servando S. Tio III
              </p>
            </div>

            <div className="p-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-300">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Voting Status
              </h2>
              <p className="text-gray-600 text-sm text-center mb-6">
                Real-time Blockchain Status: Connected
              </p>
              
              {pollStatus === 'paused' && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-5 rounded-xl mb-6">
                  <div className="flex items-center justify-center space-x-4">
                    <svg className="w-10 h-10 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold text-lg">Voting is Paused</p>
                      <p className="text-sm mt-1">Please wait for voting to resume</p>
                      <p className="text-xs mt-2 text-yellow-700">
                        Admin has temporarily paused voting
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pollStatus === 'finished' && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-5 rounded-xl mb-6">
                  <div className="flex items-center justify-center space-x-4">
                    <svg className="w-10 h-10 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold text-lg">Voting Has Ended</p>
                      <p className="text-sm mt-1">Thank you for your participation</p>
                      <p className="text-xs mt-2 text-green-700">
                        The voting period has concluded
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pollStatus === 'not_started' && (
                <div className="bg-gray-100 border border-gray-300 text-gray-800 px-6 py-5 rounded-xl mb-6">
                  <div className="flex items-center justify-center space-x-4">
                    <svg className="w-10 h-10 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold text-lg">Voting Not Started</p>
                      <p className="text-sm mt-1">Please wait for voting to begin</p>
                      <p className="text-xs mt-2 text-gray-700">
                        Admin will start voting soon!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main voting interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <CastVote
        onVoteCast={handleVoteCast}
        onLogout={handleLogout}
      />
    </div>
  );
}

function App() {
  const { toast, hideToast } = useToast();

  return (
    <ServerStatusCheck>
      <PollProvider>
        <AuthProvider>
          <AppContent />
          <Toast
            type={toast.type}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={hideToast}
          />
        </AuthProvider>
      </PollProvider>
    </ServerStatusCheck>
  );
}

export default App;