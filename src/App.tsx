import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PollProvider, usePoll } from './contexts/PollContext';
import { LoginForm } from './components/auth/LoginForm';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toast, useToast } from './components/common/Toast';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { AdminManagement } from './components/admin/AdminManagement';
import { CandidateManagement } from './components/admin/CandidateManagement';
import { VoterManagement } from './components/admin/VoterManagement';
import { PollMonitor } from './components/admin/PollMonitor';
import { CastVote } from './components/voter/CastVote';
import './styles/globals.css';
import './styles/components.css';

function AppContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { pollStatus, isLoginEnabled, loading: pollLoading } = usePoll();
  const { showToast } = useToast();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true);
    }
  }, []);

  // Track when both auth and poll have finished initial loading
  useEffect(() => {
    if (!authLoading && !pollLoading) {
      setAppInitialized(true);
    }
  }, [authLoading, pollLoading]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
  };

  const handleVoteCast = (receipt: any) => {
    showToast('Vote successfully recorded on blockchain!', 'success');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginForm
        isAdmin={showAdminLogin}
        onToggleAdmin={() => setShowAdminLogin(!showAdminLogin)}
      />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
             Voter Has Already Cast a Ballot
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
            Thank you for participating in the election.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Check if voting is allowed
  if (!isLoginEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Voting Status
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Real-time API Status: Connected
            </p>
          </div>
          
          <div className="p-4 sm:p-6">
            {pollStatus === 'paused' && (
              <div className="bg-yellow-500/10 border border-yellow-200 text-yellow-800 px-4 sm:px-6 py-5 sm:py-6 rounded-xl mb-4 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-base sm:text-lg">Voting is Paused</p>
                    <p className="text-sm sm:text-base mt-1">Please wait for voting to resume</p>
                    <p className="text-xs sm:text-sm mt-2 text-yellow-700">
                      Admin has temporarily paused voting
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pollStatus === 'finished' && (
              <div className="bg-green-500/10 border border-green-200 text-green-800 px-4 sm:px-6 py-5 sm:py-6 rounded-xl mb-4 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-base sm:text-lg">Voting Has Ended</p>
                    <p className="text-sm sm:text-base mt-1">Thank you for your participation</p>
                    <p className="text-xs sm:text-sm mt-2 text-green-700">
                      The voting period has concluded
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pollStatus === 'not_started' && (
              <div className="bg-gray-500/10 border border-gray-200 text-gray-800 px-4 sm:px-6 py-5 sm:py-6 rounded-xl mb-4 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-base sm:text-lg">Voting Not Started</p>
                    <p className="text-sm sm:text-base mt-1">Please wait for voting to begin</p>
                    <p className="text-xs sm:text-sm mt-2 text-gray-700">
                      Admin will start voting soon
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main voting interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4 sm:px-6">
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
  );
}

export default App;