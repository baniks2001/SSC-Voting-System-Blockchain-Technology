import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User, ArrowLeft, ShieldCheck, Hash, CheckCircle, XCircle, Loader, Smartphone, Monitor, AlertTriangle, Clock } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { api } from '../../utils/api';

interface ReviewVoteProps {
  selectedVotes: { [position: string]: number[] };
  candidates: Candidate[];
  positions: Position[];
  onBack: () => void;
  onVoteCast: (receipt: any) => void;
  onLogout: () => void;
  loading?: boolean;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const ReviewVote: React.FC<ReviewVoteProps> = ({
  selectedVotes,
  candidates,
  positions,
  onBack,
  onVoteCast,
  onLogout,
  loading = false
}) => {
  const { user } = useAuth();
  const [ballotId, setBallotId] = useState<string>('');
  const [hashedBallotId, setHashedBallotId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string>('');
  const [blockchainReceipt, setBlockchainReceipt] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAlreadyVotedModal, setShowAlreadyVotedModal] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState<number>(30);
  
  // Use refs to track state without triggering re-renders
  const hasVotedRef = useRef(false);
  const submissionInProgressRef = useRef(false);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Auto-logout after 30 seconds when success state is shown
  useEffect(() => {
    if (submissionStatus === 'success') {
      // Start countdown
      setLogoutCountdown(30);
      
      // Start countdown interval for UI
      countdownIntervalRef.current = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set logout timer
      logoutTimerRef.current = setTimeout(() => {
        console.log('Auto-logout after 30 seconds');
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        onLogout();
      }, 30000); // 30 seconds

      return () => {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    } else {
      // Clear timers if not in success state
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
  }, [submissionStatus, onLogout]);

  const generateSecureRandom = (length: number): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const generateSecureBallotId = useCallback(async (): Promise<{ ballotId: string; hashedBallotId: string }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now().toString(36);
    const randomPart1 = generateSecureRandom(8);
    const randomPart2 = generateSecureRandom(4);
    const voterSalt = generateSecureRandom(2);

    const uniqueBallotId = `vote_${timestamp}_${randomPart1}_${randomPart2}_${voterSalt}`;

    const hashData = `${user.studentId}-${user.fullName}-${timestamp}-${randomPart1}-${randomPart2}-${voterSalt}-${Date.now()}-${Math.random()}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(hashData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const secureHashedBallotId = `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;

    return {
      ballotId: uniqueBallotId,
      hashedBallotId: secureHashedBallotId
    };
  }, [user]);

  React.useEffect(() => {
    let isMounted = true;

    const initSecureBallotId = async () => {
      try {
        const { ballotId: newBallotId, hashedBallotId: newHashedBallotId } = await generateSecureBallotId();

        if (isMounted) {
          setBallotId(newBallotId);
          setHashedBallotId(newHashedBallotId);
        }
      } catch (error) {
        console.error('Failed to generate secure ballot ID:', error);
        const timestamp = Date.now().toString(36);
        const fallbackRandom1 = Math.random().toString(36).substring(2, 15);
        const fallbackRandom2 = Math.random().toString(36).substring(2, 15);
        const fallbackSalt = Math.random().toString(36).substring(2, 6);

        const fallbackBallotId = `vote_${timestamp}_${fallbackRandom1}_${fallbackRandom2}_${fallbackSalt}`;
        const fallbackHashedId = `0x${Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0')).join('')}_fallback`;

        setBallotId(fallbackBallotId);
        setHashedBallotId(fallbackHashedId);
      }
    };

    initSecureBallotId();

    return () => {
      isMounted = false;
    };
  }, [generateSecureBallotId]);

  // Get all selected candidates across all positions
  const getAllSelectedCandidates = () => {
    const allCandidateIds = Object.values(selectedVotes).flat();
    return allCandidateIds.map(candidateId =>
      candidates.find(c => c.id === candidateId)
    ).filter(Boolean) as Candidate[];
  };

  // Get selected candidates for a specific position
  const getSelectedCandidates = (position: string) => {
    const candidateIds = selectedVotes[position] || [];
    return candidateIds.map(candidateId =>
      candidates.find(c => c.id === candidateId)
    ).filter(Boolean) as Candidate[];
  };

  // Get positions that have selected candidates
  const getSelectedPositions = () => {
    return positions.filter(position => {
      const selectedCandidates = getSelectedCandidates(position.name);
      return selectedCandidates.length > 0;
    });
  };

  // STEP 1: Check voter status for duplicate vote prevention
  const checkVoterStatus = async (): Promise<boolean> => {
    if (!user?.studentId) return false;
    
    try {
      // Use the voters endpoint to check if user has already voted
      const response = await api.get(`/voters/status/${user.studentId}`);
      return response.has_voted || response.status === 'voted';
    } catch (error) {
      console.error('Error checking voter status:', error);
      return false;
    }
  };

  const submitVoteToBlockchain = async (votes: any[]) => {
    try {
      const voteData = {
        voterId: user?.studentId,
        votes: votes,
        ballotId: hashedBallotId,
        timestamp: new Date().toISOString()
      };

      const result = await api.post('/voting/cast-blockchain', voteData);

      if (result && (result.success === true || result.transactionHash || result.receipt)) {
        const receiptSource = result.receipt || result.voteReceipt || result;

        const receiptData = {
          transactionHash: receiptSource.transactionHash ||
            result.transactionHash ||
            `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          blockNumber: receiptSource.blockNumber ? parseInt(receiptSource.blockNumber) : undefined,
          timestamp: receiptSource.timestamp || result.timestamp || new Date().toISOString(),
          status: 'confirmed',
          voterId: user?.studentId,
          ballotId: hashedBallotId
        };

        return receiptData;
      } else {
        throw new Error(`Invalid response structure: ${JSON.stringify(result)}`);
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to submit vote to blockchain';

      if (err && typeof err === 'object' && 'response' in err) {
        const errorWithResponse = err as { response?: { data?: { message?: string; error?: string }; status?: number } };
        errorMessage = errorWithResponse.response?.data?.message ||
          errorWithResponse.response?.data?.error ||
          `Server error: ${errorWithResponse.response?.status}`;
      } else if (err && typeof err === 'object' && 'request' in err) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      throw new Error(errorMessage);
    }
  };

  const markVoterAsVoted = async () => {
    try {
      const markVotedData = {
        voterId: user?.studentId,
        ballotId: ballotId,
        voteHash: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const markVotedResponse = await api.post('/voting/mark-voted', markVotedData);

      if (!markVotedResponse.success) {
        throw new Error(markVotedResponse.error || 'Failed to update voter status');
      }

      return markVotedResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update your voting status. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleSubmitVote = async () => {
    try {
      // Prevent duplicate submissions
      if (submissionInProgressRef.current) {
        console.log('Submission already in progress');
        return;
      }

      if (!hashedBallotId || !ballotId) {
        throw new Error('Secure ballot IDs not properly generated');
      }

      if (!ballotId.includes('_') || ballotId.split('_').length < 4) {
        throw new Error('Invalid ballot ID format');
      }

      // Set submission state
      submissionInProgressRef.current = true;
      setIsSubmitting(true);
      setSubmissionStatus('submitting');
      setSubmissionError('');
      setShowConfirmationModal(false);

      // STEP 1: Check voter status for duplicate vote prevention
      const hasVoted = await checkVoterStatus();
      if (hasVoted || hasVotedRef.current) {
        console.log('User has already voted, stopping submission');
        hasVotedRef.current = true;
        setSubmissionStatus('error');
        setSubmissionError('You have already voted. Each voter can only vote once.');
        setIsSubmitting(false);
        submissionInProgressRef.current = false;
        setShowAlreadyVotedModal(true);
        return;
      }

      // STEP 2: Prepare votes for blockchain submission
      const votes = Object.entries(selectedVotes).flatMap(([position, candidateIds]) => {
        return candidateIds.map(candidateId => {
          const candidate = candidates.find(c => c.id === candidateId);
          return {
            candidateId,
            position,
            candidateName: candidate?.name || 'Unknown Candidate',
            candidateParty: candidate?.party || 'No Party',
            ballotId: hashedBallotId
          };
        });
      });

      // STEP 2: Submit to blockchain
      const receipt = await submitVoteToBlockchain(votes);

      // STEP 2: Mark voter as voted only after successful blockchain submission
      await markVoterAsVoted();
      
      // Update ref to prevent duplicate votes
      hasVotedRef.current = true;

      setBlockchainReceipt(receipt);
      setSubmissionStatus('success');
      setIsSubmitting(false);
      submissionInProgressRef.current = false;

      // STEP 3: Show transaction receipt via callback (no additional API calls)
      onVoteCast(receipt);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting your vote. Please try again.';
      setSubmissionStatus('error');
      setSubmissionError(errorMessage);
      setIsSubmitting(false);
      submissionInProgressRef.current = false;
    }
  };

  const handleConfirmClick = () => {
    setShowConfirmationModal(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirmationModal(false);
  };

  const handleRetry = () => {
    setSubmissionStatus('idle');
    setSubmissionError('');
  };

  const handleAlreadyVotedAction = () => {
    setShowAlreadyVotedModal(false);
    onLogout(); // Navigate to login
  };

  // Manual logout with timer cleanup
  const handleManualLogout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    onLogout();
  };

  const formatBallotId = (id: string) => {
    if (!id) return 'Generating...';
    if (window.innerWidth < 768) {
      return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
    }
    return `${id.substring(0, 12)}...${id.substring(id.length - 8)}`;
  };

  const formatHashedBallotId = (hash: string) => {
    if (!hash) return 'Generating...';
    if (hash.startsWith('0x')) {
      if (window.innerWidth < 768) {
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
      }
      return `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
    }
    return formatBallotId(hash);
  };

  const isConfirmDisabled = loading || isSubmitting || !ballotId || !hashedBallotId || ballotId === 'Generating...';

  // Calculate total selected positions and candidates
  const selectedPositions = getSelectedPositions();
  const allSelectedCandidates = getAllSelectedCandidates();
  const totalSelectedPositions = selectedPositions.length;
  const totalSelectedCandidates = allSelectedCandidates.length;

  // Confirmation Modal
  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Confirm Your Vote Submission
          </h2>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Do you confirm to submit your vote?</strong>
            </p>
            <p className="text-xs text-gray-600">
              Your votes will be submitted to the blockchain and cannot be edited or changed once submitted. This action is permanent and irreversible.
            </p>
            
            {/* Summary of selected votes */}
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-2">Vote Summary:</p>
              <div className="text-xs text-gray-700 space-y-1">
                <p>• {totalSelectedPositions} position{totalSelectedPositions !== 1 ? 's' : ''} selected</p>
                <p>• {totalSelectedCandidates} candidate{totalSelectedCandidates !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSubmitVote}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Yes, Submit My Vote</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancelConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

          {isSubmitting && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center">
                <Loader className="w-3 h-3 animate-spin mr-2" />
                Submitting to blockchain...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Already Voted Modal
  const AlreadyVotedModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Already Voted
          </h2>

          <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-3">
              <strong>You have already cast your vote.</strong>
            </p>
            <p className="text-xs text-gray-600">
              Each voter is allowed to vote only once. Your vote has already been recorded on the blockchain and cannot be changed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleAlreadyVotedAction}
              className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show submission status message box
  if (submissionStatus === 'submitting' || submissionStatus === 'success' || submissionStatus === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 max-w-md w-full text-center">
          {submissionStatus === 'submitting' && (
            <>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Submitting Your Vote
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Please wait while we record your vote on the blockchain...
              </p>
              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                <Loader className="w-3 h-3 sm:w-4 h-4 animate-spin mr-2" />
                This may take a few moments
              </div>
            </>
          )}

          {submissionStatus === 'success' && (
            <>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Vote Submitted Successfully!
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-2">
                Your vote has been securely recorded on the blockchain.
              </p>
              
              {/* Auto-logout countdown */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-yellow-700">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    Auto-logout in: <span className="font-bold">{logoutCountdown}</span> seconds
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  You will be automatically logged out for security.
                </p>
              </div>
              
              {blockchainReceipt && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Transaction Details:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    Hash: {blockchainReceipt.transactionHash}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Time: {blockchainReceipt.timestamp ?
                      new Date(blockchainReceipt.timestamp).toLocaleString() :
                      'Timestamp not available'}
                  </p>
                  {blockchainReceipt.node && (
                    <p className="text-xs text-gray-600 mt-1">
                      Node: {blockchainReceipt.node}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={handleManualLogout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Log Out Now</span>
              </button>
            </>
          )}

          {submissionStatus === 'error' && (
            <>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Submission Failed
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                {submissionError}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Go Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-gray-800 py-8">
            <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-blue-800" />
            <p className="text-base sm:text-lg font-semibold">User not authenticated</p>
            <p className="text-sm text-gray-600 mt-2">Please log in again to continue voting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      {showConfirmationModal && <ConfirmationModal />}
      {showAlreadyVotedModal && <AlreadyVotedModal />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-800" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Review Your Vote
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  Please verify your selections before submitting
                </p>
              </div>
              <div className="lg:hidden text-xs text-gray-500 flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile View
              </div>
              <div className="hidden lg:flex text-xs text-gray-500 items-center bg-gray-100 px-3 py-1 rounded-full">
                <Monitor className="w-3 h-3 mr-1" />
                Desktop View
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Voter Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Voter Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-800" />
                Voter Information
              </h2>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Student ID</p>
                  <p className="font-semibold text-gray-900 text-base">
                    {user.studentId}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900 text-base">
                    {user.fullName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Course & Section</p>
                  <p className="font-semibold text-gray-900 text-base">
                    {user.course} - {user.section}
                  </p>
                </div>
              </div>

              {/* Ballot Information */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Hash className="w-4 h-4 text-blue-800 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Ballot ID</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm text-gray-900 break-all bg-gray-50 rounded-lg px-3 py-2 flex-1">
                          {formatBallotId(ballotId)}
                        </p>
                        {!ballotId && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Secure Hash</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm text-gray-900 break-all bg-green-50 rounded-lg px-3 py-2 flex-1">
                          {formatHashedBallotId(hashedBallotId)}
                        </p>
                        {!hashedBallotId && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-xl px-4 py-2 inline-block">
                    <p className="text-sm font-semibold text-gray-800">
                      {totalSelectedPositions} position{totalSelectedPositions !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {totalSelectedCandidates} candidate{totalSelectedCandidates !== 1 ? 's' : ''} total
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleConfirmClick}
                    disabled={isConfirmDisabled}
                    className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center space-x-2 shadow-sm"
                  >
                    {(loading || isSubmitting) ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Submit Vote</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onBack}
                    disabled={loading || isSubmitting}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 hover:text-gray-800 py-3 px-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-blue-800" />
                    <span>Back to Voting</span>
                  </button>
                </div>

                {isConfirmDisabled && ballotId && hashedBallotId && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 bg-green-50 rounded-xl p-3">
                      ✓ Secure ballot IDs generated
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Vote Selections */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-800" />
                Your Selections ({totalSelectedCandidates} candidate{totalSelectedCandidates !== 1 ? 's' : ''} across {totalSelectedPositions} position{totalSelectedPositions !== 1 ? 's' : ''})
              </h2>

              <div className="space-y-4">
                {selectedPositions.map((position) => {
                  const selectedCandidates = getSelectedCandidates(position.name);
                  const maxVotes = position.maxVotes || 1;

                  return (
                    <div key={position.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-base bg-gray-100 rounded-lg px-3 py-2">
                          {position.name}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {selectedCandidates.length}/{maxVotes} selected
                        </span>
                      </div>

                      {selectedCandidates.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCandidates.map((candidate) => (
                            <div key={candidate.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 bg-white rounded-xl border border-gray-200">
                              <div className="flex items-center space-x-3 w-full sm:w-auto">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1 sm:hidden">
                                  <h4 className="font-semibold text-gray-900 text-base">
                                    {candidate.name}
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {candidate.party}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 w-full">
                                <div className="hidden sm:block">
                                  <h4 className="font-semibold text-gray-900 text-base">
                                    {candidate.name}
                                  </h4>
                                  <p className="text-gray-600 text-sm">{candidate.party}</p>
                                </div>
                              </div>

                              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm border border-red-200">
                          No candidate selected for this position
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Show message if no positions have selections */}
                {selectedPositions.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Selections Made</h3>
                    <p className="text-gray-500 text-sm">
                      You haven't selected any candidates yet. Go back to make your selections.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};