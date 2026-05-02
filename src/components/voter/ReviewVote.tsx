import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowLeft, ShieldCheck, Hash, CheckCircle, XCircle, Smartphone, Monitor, AlertTriangle, Clock, Users, MinusCircle, Download, Info, ChevronRight } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { api } from '../../utils/api';
import html2canvas from 'html2canvas';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
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
      // Clear review state since vote is now submitted
      sessionStorage.removeItem('reviewVoteState');
      
      // Save receipt to sessionStorage when success state is achieved
      if (blockchainReceipt) {
        sessionStorage.setItem('votingReceipt', JSON.stringify(blockchainReceipt));
        sessionStorage.setItem('receiptTimestamp', Date.now().toString());
      }
      
      // Start countdown
      setLogoutCountdown(30);
      
      // Start countdown interval for UI
      countdownIntervalRef.current = setInterval(() => {
        setLogoutCountdown((prev) => {
          const newCountdown = prev > 0 ? prev - 1 : 0;
          
          // Save countdown to sessionStorage
          sessionStorage.setItem('logoutCountdown', newCountdown.toString());
          
          if (newCountdown <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            // Clear session data on countdown completion
            sessionStorage.removeItem('votingReceipt');
            sessionStorage.removeItem('logoutCountdown');
            sessionStorage.removeItem('receiptTimestamp');
          }
          
          return newCountdown;
        });
      }, 1000);
      
      // Set logout timer
      logoutTimerRef.current = setTimeout(() => {
        console.log('Auto-logout after 30 seconds');
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        // Clear session data on logout
        sessionStorage.removeItem('votingReceipt');
        sessionStorage.removeItem('logoutCountdown');
        sessionStorage.removeItem('receiptTimestamp');
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
      // Clear timers and session data if not in success state
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      // Clear session data when leaving success state
      sessionStorage.removeItem('votingReceipt');
      sessionStorage.removeItem('logoutCountdown');
      sessionStorage.removeItem('receiptTimestamp');
    }
  }, [submissionStatus, onLogout, blockchainReceipt]);

  const generateSecureBallotId = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now().toString(36);
    const randomPart1 = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    const voterSalt = Math.random().toString(36).substring(2, 6);

    const uniqueBallotId = `vote_${timestamp}_${randomPart1}_${randomPart2}_${voterSalt}`;

    const hashData = `${user.studentId}-${user.fullName}-${timestamp}-${randomPart1}-${randomPart2}-${voterSalt}-${Date.now()}-${Math.random()}`;

    let secureHashedBallotId: string;

    try {
      // Try to use crypto.subtle if available (HTTPS context)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(hashData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        secureHashedBallotId = `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else {
        // Fallback to simple hash method
        let hash = 0;
        for (let i = 0; i < hashData.length; i++) {
          const char = hashData.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        secureHashedBallotId = `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
      }
    } catch (error) {
      console.warn('Crypto hash failed, using fallback:', error);
      // Ultimate fallback
      const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(8)));
      secureHashedBallotId = `0x${randomBytes.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }

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

  // Get positions with no selections (empty votes)
  const getEmptyPositions = () => {
    return positions.filter(position => {
      const selectedCandidates = getSelectedCandidates(position.name);
      return selectedCandidates.length === 0;
    });
  };

  // Calculate total positions with votes and empty positions
  const positionsWithVotes = getSelectedPositions().length;
  const emptyPositions = getEmptyPositions().length;
  const allSelectedCandidates = getAllSelectedCandidates();
  const totalSelectedCandidates = allSelectedCandidates.length;

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
        timestamp: new Date().toISOString(),
        // Include empty positions information
        emptyPositions: emptyPositions > 0 ? getEmptyPositions().map(p => p.name) : []
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
          ballotId: hashedBallotId,
          emptyPositions: emptyPositions,
          // Enhanced dual-node information
          nodesSubmitted: result.nodesSubmitted || 1,
          totalNodes: result.totalNodes || 1,
          blockchainResults: result.blockchainResults || [],
          blockchainStorage: true
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
    // Clear session data on manual logout
    sessionStorage.removeItem('votingReceipt');
    sessionStorage.removeItem('logoutCountdown');
    sessionStorage.removeItem('receiptTimestamp');
    onLogout();
  };

  // Download receipt as image
  const downloadReceiptAsImage = async () => {
    if (!receiptRef.current || !blockchainReceipt || !user) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `voting-receipt-${user.studentId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    } finally {
      setIsDownloading(false);
    }
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

  // Confirmation Modal
  const ConfirmationModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/30"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
          >
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Confirm Your Vote Submission
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 text-left border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Do you confirm to submit your vote?
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Your votes will be submitted to the blockchain and cannot be edited or changed once submitted. This action is permanent and irreversible.
            </p>
            
            {/* Summary of selected votes */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Vote Summary:
              </p>
              <div className="text-xs text-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span>• {positionsWithVotes} position{positionsWithVotes !== 1 ? 's' : ''} with selection{positionsWithVotes !== 1 ? 's' : ''}</span>
                  <span className="font-medium">{positionsWithVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• {emptyPositions} position{emptyPositions !== 1 ? 's' : ''} left empty</span>
                  <span className="font-medium">{emptyPositions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• {totalSelectedCandidates} candidate{totalSelectedCandidates !== 1 ? 's' : ''} selected total</span>
                  <span className="font-medium">{totalSelectedCandidates}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={handleSubmitVote}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" variant="pulse" color="primary" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Yes, Submit My Vote</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleCancelConfirm}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-semibold text-sm transition-colors"
            >
              Cancel
            </motion.button>
          </div>

          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-500 flex items-center justify-center">
                <LoadingSpinner size="sm" variant="rotate" color="primary" />
                Submitting to blockchain...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  // Already Voted Modal
  const AlreadyVotedModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/30"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg"
          >
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Already Voted
          </h2>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-6 text-left border border-red-100">
            <p className="text-sm font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              You have already cast your vote.
            </p>
            <p className="text-xs text-red-700">
              Each voter is allowed to vote only once. Your vote has already been recorded on the blockchain and cannot be changed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={handleAlreadyVotedAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <User className="w-4 h-4" />
              <span>Return to Login</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Show submission status message box
  if (submissionStatus === 'submitting' || submissionStatus === 'success' || submissionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-8 max-w-md w-full text-center"
        >
          {submissionStatus === 'submitting' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <LoadingSpinner size="md" variant="rotate" color="secondary" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Submitting Your Vote
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Please wait while we record your vote on the blockchain...
              </p>
              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                <LoadingSpinner size="sm" variant="rotate" color="primary" />
                This may take a few moments
              </div>
            </>
          )}

          {submissionStatus === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Vote Submitted Successfully!
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Your vote has been securely recorded on the blockchain.
              </p>
              
              {/* Auto-logout countdown */}
              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
                <div className="flex items-center justify-center space-x-2 text-yellow-700">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    Auto-logout in: <span className="font-bold text-lg">{logoutCountdown}</span> seconds
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  You will be automatically logged out for security.
                </p>
              </div>
              
              {/* Transaction Receipt with Download */}
              <div ref={receiptRef} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 text-left border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700 flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-blue-600" />
                    Transaction Receipt
                  </p>
                  <motion.button
                    onClick={downloadReceiptAsImage}
                    disabled={isDownloading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors text-sm"
                  >
                    {isDownloading ? (
                      <>
                        <LoadingSpinner size="sm" variant="rotate" color="primary" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Voter Information */}
                <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-300">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3">VOTER INFORMATION</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Student ID:</span>
                      <span className="text-xs font-medium text-gray-900">{user?.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Name:</span>
                      <span className="text-xs font-medium text-gray-900">{user?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Course & Section:</span>
                      <span className="text-xs font-medium text-gray-900">{user?.course} - {user?.section}</span>
                    </div>
                  </div>
                </div>
                
                {/* Transaction Details */}
                <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-300">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3">TRANSACTION DETAILS</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Vote ID:</span>
                      <span className="text-xs font-mono text-gray-900 break-all max-w-[200px]">{ballotId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Timestamp:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {blockchainReceipt.timestamp ?
                          new Date(blockchainReceipt.timestamp).toLocaleString() :
                          'Timestamp not available'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Status:</span>
                      <span className="text-xs font-medium text-green-600">Confirmed</span>
                    </div>
                  </div>
                </div>
                
                {/* Vote Summary */}
                <div className="bg-white rounded-2xl p-4 border border-gray-300">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3">VOTE SUMMARY</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Total Voted Candidates:</span>
                      <span className="text-xs font-medium text-gray-900">{totalSelectedCandidates}</span>
                    </div>
                    {blockchainReceipt.emptyPositions > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-blue-600">
                          Note: {blockchainReceipt.emptyPositions} position(s) were left empty
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-300 text-center">
                  <p className="text-xs text-gray-400">SSC Voting System - Blockchain Secured</p>
                  <p className="text-xs text-gray-400">Generated on {new Date().toLocaleString()}</p>
                </div>
              </div>
              <motion.button
                onClick={handleManualLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <User className="w-4 h-4" />
                <span>Log Out Now</span>
              </motion.button>
            </>
          )}

          {submissionStatus === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg"
              >
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Submission Failed
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                {submissionError}
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={handleRetry}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Go Back
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 text-center"
        >
          <div className="text-gray-800 py-8">
            <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-blue-800" />
            <p className="text-lg sm:text-xl font-semibold">User not authenticated</p>
            <p className="text-sm text-gray-600 mt-2">Please log in again to continue voting</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-3 sm:py-4 px-3 sm:px-4 lg:px-8">
      {showConfirmationModal && <ConfirmationModal />}
      {showAlreadyVotedModal && <AlreadyVotedModal />}

      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 mb-4 sm:mb-6 overflow-hidden"
        >
          <div className="p-4 sm:p-6 lg:p-8 relative">
            {/* Subtle background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 sm:w-14 sm:h-16 lg:w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-8 lg:w-8 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                    Review Your Vote
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base flex items-center space-x-2">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-center">Please verify your selections before submitting</span>
                  </p>
                </div>
                <div className="lg:hidden bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl px-3 py-2 border border-blue-200">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile View
                  </div>
                </div>
                <div className="hidden lg:flex bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl px-4 py-2 border border-blue-200">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop View
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Voter Info & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Combined Voter Info & Actions - Sticky */}
            <div className="lg:sticky lg:top-6 space-y-4 sm:space-y-6">
              {/* Voter Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-white/30 p-4 sm:p-6"
              >
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-800" />
                  Voter Information
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Student ID</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">{user.studentId}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">{user.fullName}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Course & Section</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">{user.course} - {user.section}</p>
                  </div>
                </div>

                {/* Ballot Information */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3">
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-blue-800 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Ballot ID</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-xs sm:text-sm text-gray-900 break-all bg-gray-50 rounded-lg px-3 py-2 flex-1">
                            {formatBallotId(ballotId)}
                          </p>
                          {!ballotId && (
                            <LoadingSpinner size="sm" variant="pulse" color="primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Secure Hash</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-xs sm:text-sm text-gray-900 break-all bg-green-50 rounded-lg px-3 py-2 flex-1">
                            {formatHashedBallotId(hashedBallotId)}
                          </p>
                          {!hashedBallotId && (
                            <LoadingSpinner size="sm" variant="pulse" color="primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons - Part of the same sticky container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-white/30 p-4 sm:p-6"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 inline-block">
                      <p className="text-xs sm:text-sm font-bold text-blue-800">
                        {positionsWithVotes} position{positionsWithVotes !== 1 ? 's' : ''} with selection{positionsWithVotes !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {emptyPositions} position{emptyPositions !== 1 ? 's' : ''} left empty • {totalSelectedCandidates} total candidate{totalSelectedCandidates !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <motion.button
                      onClick={handleConfirmClick}
                      disabled={isConfirmDisabled}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      {(loading || isSubmitting) ? (
                        <LoadingSpinner size="sm" variant="pulse" color="primary" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm">Submit Vote</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={onBack}
                      disabled={loading || isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 hover:text-gray-800 py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-800" />
                      <span className="text-xs sm:text-sm">Back to Voting</span>
                    </motion.button>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs text-yellow-700 flex items-start">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">You can submit your vote with empty positions. This will be recorded as a null/empty vote for those positions.</span>
                    </p>
                  </div>

                  {isConfirmDisabled && ballotId && hashedBallotId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-xs sm:text-sm text-green-600 bg-green-50 rounded-xl sm:rounded-2xl p-3 flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        ✓ Secure ballot IDs generated
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Vote Selections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden">
              {/* Selections Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-blue-700" />
                  Your Selections
                </h2>
                <p className="text-blue-700 text-xs sm:text-sm">
                  {totalSelectedCandidates} candidate{totalSelectedCandidates !== 1 ? 's' : ''} across {positionsWithVotes} of {positions.length} position{positions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {positions.map((position, index) => {
                  const selectedCandidates = getSelectedCandidates(position.name);
                  const maxVotes = position.maxVotes || 1;
                  const isEmpty = selectedCandidates.length === 0;

                  return (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Position Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-base sm:text-lg text-white">
                              {position.name}
                            </h3>
                            {isEmpty && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-yellow-400/30 backdrop-blur-sm text-yellow-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center border border-yellow-400/30"
                              >
                                <MinusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Empty
                              </motion.span>
                            )}
                          </div>
                          <motion.div
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm border ${
                              isEmpty 
                                ? 'bg-yellow-400/30 text-yellow-100 border-yellow-400/30' 
                                : 'bg-green-400/30 text-green-100 border-green-400/30'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {selectedCandidates.length}/{maxVotes} selected
                          </motion.div>
                        </div>
                      </div>

                      {/* Candidates */}
                      {selectedCandidates.length > 0 ? (
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          {selectedCandidates.map((candidate, candidateIndex) => (
                            <motion.div
                              key={candidate.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * candidateIndex }}
                              className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row">
                                {/* Candidate Image */}
                                <div className="w-full sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                                  {candidate.image_url ? (
                                    <img
                                      src={candidate.image_url}
                                      alt={candidate.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&size=128`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Candidate Info */}
                                <div className="flex-1 p-3 sm:p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                        {candidate.name}
                                      </h4>
                                      <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
                                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" />
                                        <span className="text-xs sm:text-sm font-medium">{candidate.party}</span>
                                      </div>
                                      
                                      {/* Selection indicator */}
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="flex items-center"
                                      >
                                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                          Selected
                                        </div>
                                      </motion.div>
                                    </div>
                                    
                                    {/* Hover indicator */}
                                    <div className="ml-2 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center"
                                      >
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 sm:p-6 text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                          >
                            <MinusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </motion.div>
                          <p className="text-gray-500 font-medium text-sm sm:text-base">No candidates selected</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">This position will be left empty</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};