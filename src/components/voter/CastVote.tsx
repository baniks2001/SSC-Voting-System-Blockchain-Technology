import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, Users, Shield, LogOut, ArrowRight, CheckCircle, AlertCircle, Info, ChevronRight, User } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../common/Toast';
import { ReviewVote } from './ReviewVote';
import { useAuth } from '../../contexts/AuthContext';

interface CastVoteProps {
  onVoteCast: () => void;
  onLogout: () => void;
}

export const CastVote: React.FC<CastVoteProps> = ({ onVoteCast, onLogout }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Check for receipt persistence on component mount
  useEffect(() => {
    const savedReceipt = sessionStorage.getItem('votingReceipt');
    const savedTimestamp = sessionStorage.getItem('receiptTimestamp');
    const savedReviewState = sessionStorage.getItem('reviewVoteState');
    
    // If there's a saved review state (before submission), show review page
    if (savedReviewState) {
      try {
        const reviewData = JSON.parse(savedReviewState);
        const timestamp = parseInt(reviewData.timestamp);
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - timestamp) / 1000);
        
        // Only show review if less than 30 seconds have passed
        if (elapsedSeconds < 30) {
          setShowReview(true);
          // Restore selected votes if available
          if (reviewData.selectedVotes) {
            setSelectedVotes(reviewData.selectedVotes);
          }
        } else {
          // Clear expired session data
          sessionStorage.removeItem('reviewVoteState');
        }
      } catch (error) {
        console.error('Error restoring review state:', error);
        sessionStorage.removeItem('reviewVoteState');
      }
    }
    // If there's a saved receipt (after submission), show review page
    else if (savedReceipt && savedTimestamp) {
      try {
        const timestamp = parseInt(savedTimestamp);
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - timestamp) / 1000);
        
        // Only show review if less than 30 seconds have passed
        if (elapsedSeconds < 30) {
          setShowReview(true);
        } else {
          // Clear expired session data
          sessionStorage.removeItem('votingReceipt');
          sessionStorage.removeItem('logoutCountdown');
          sessionStorage.removeItem('receiptTimestamp');
        }
      } catch (error) {
        console.error('Error checking receipt persistence:', error);
        // Clear corrupted data
        sessionStorage.removeItem('votingReceipt');
        sessionStorage.removeItem('logoutCountdown');
        sessionStorage.removeItem('receiptTimestamp');
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [candidatesResponse, positionsResponse] = await Promise.all([
        api.get('/candidates'),
        api.get('/positions')
      ]);

      setCandidates(candidatesResponse);

      // FIXED: Properly handle maxVotes from backend (it returns max_votes)
      const positionsWithValidMaxVotes = positionsResponse.map((position: any) => {
        // Use max_votes from backend response, fallback to maxVotes, then default to 1
        const maxVotesValue = position.max_votes ?? position.maxVotes ?? 1;
        return {
          ...position,
          maxVotes: !isNaN(Number(maxVotesValue)) ? Number(maxVotesValue) : 1,
          // Ensure display_order is properly handled too
          display_order: position.display_order ?? position.order ?? 0,
          // Add optional field to allow empty votes
          isOptional: position.is_optional ?? position.isOptional ?? false
        };
      });

      const sortedPositions = positionsWithValidMaxVotes.sort((a: Position, b: Position) => {
        // Handle undefined display_order values
        const aOrder = a.display_order ?? 0;
        const bOrder = b.display_order ?? 0;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.name.localeCompare(b.name);
      });

      // Filter positions based on user's course and year level
      const filteredPositions = sortedPositions.filter((position: Position) => {
        // Check course restrictions
        const courseMatch = !position.allowed_courses || position.allowed_courses.length === 0 || 
                           position.allowed_courses.includes(user?.course || '');
        
        // Check year level restrictions
        const yearMatch = !position.allowed_years || position.allowed_years.length === 0 || 
                        position.allowed_years.includes(user?.yearLevel || 0);
        
        // Position must match both course and year level restrictions
        return courseMatch && yearMatch;
      });

      setPositions(filteredPositions);
    } catch (error: any) {
      showToast('error', 'Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (position: string, candidateId: number, maxVotes: number) => {
    setSelectedVotes(prev => {
      const currentSelected = prev[position] || [];

      if (currentSelected.includes(candidateId)) {
        return {
          ...prev,
          [position]: currentSelected.filter(id => id !== candidateId)
        };
      }

      if (currentSelected.length >= maxVotes) {
        showToast('warning', `Limit reached! You can only select up to ${maxVotes} candidate(s) for ${position}`);
        return prev;
      }

      return {
        ...prev,
        [position]: [...currentSelected, candidateId]
      };
    });
  };

  const handleReviewVote = async () => {
    // Save review state to sessionStorage before showing review
    const reviewData = {
      selectedVotes: selectedVotes,
      timestamp: Date.now().toString()
    };
    sessionStorage.setItem('reviewVoteState', JSON.stringify(reviewData));

    // Validate selections
    const exceededPositions = positions.filter(position => {
      const selectedCount = (selectedVotes[position.name] || []).length;
      const maxVotes = position.maxVotes || 1;
      return selectedCount > maxVotes;
    });

    if (exceededPositions.length > 0) {
      showToast('error', 'Some positions have exceeded the selection limit. Please adjust your selections.');
      return;
    }

    setShowReview(true);
  };

  const handleBackToVoting = () => {
    setShowReview(false);
    // Clear session data when going back to voting
    sessionStorage.removeItem('votingReceipt');
    sessionStorage.removeItem('logoutCountdown');
    sessionStorage.removeItem('receiptTimestamp');
    sessionStorage.removeItem('reviewVoteState');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getSelectedCountForPosition = (positionName: string) => {
    return (selectedVotes[positionName] || []).length;
  };

  const getMaxVotesForPosition = (positionName: string) => {
    const position = positions.find(p => p.name === positionName);
    return (position?.maxVotes && !isNaN(Number(position.maxVotes))) ? Number(position.maxVotes) : 1;
  };

  const isCandidateSelected = (position: string, candidateId: number) => {
    return (selectedVotes[position] || []).includes(candidateId);
  };

  const canSelectCandidate = (positionName: string) => {
    const selectedCount = getSelectedCountForPosition(positionName);
    const maxVotes = getMaxVotesForPosition(positionName);
    return selectedCount < maxVotes;
  };

  // Helper function to format eligible years for display
  const formatEligibleYears = (years?: number[]): string => {
    if (!years || years.length === 0) return 'All Years';
    
    const yearLabels = years.map(year => {
      if (year === 1) return '1st Year';
      if (year === 2) return '2nd Year';
      if (year === 3) return '3rd Year';
      return `${year}th Year`;
    });
    
    if (yearLabels.length === 1) return yearLabels[0];
    if (yearLabels.length === 2) return yearLabels.join(' and ');
    return yearLabels.slice(0, -1).join(', ') + ' and ' + yearLabels[yearLabels.length - 1];
  };

  const getVoteStatusForPosition = (positionName: string) => {
    const selectedCount = getSelectedCountForPosition(positionName);
    const maxVotes = getMaxVotesForPosition(positionName);

    if (selectedCount === 0) {
      return { status: 'empty', message: 'No selection (optional)' };
    } else if (selectedCount < maxVotes) {
      return { status: 'partial', message: `${maxVotes - selectedCount} more can be selected` };
    } else {
      return { status: 'full', message: 'Limit reached' };
    }
  };

  // Calculate positions with votes
  const getPositionsWithVotes = () => {
    return positions.filter(position => {
      const selected = selectedVotes[position.name] || [];
      return selected.length > 0;
    });
  };

  const positionsWithVotes = getPositionsWithVotes().length;
  const totalPositions = positions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center max-w-md w-full"
        >
          <LoadingSpinner size="xl" variant="pulse" color="primary" text="Loading voting data..." />
        </motion.div>
      </div>
    );
  }

  if (showReview) {
    return (
      <ReviewVote
        selectedVotes={selectedVotes}
        candidates={candidates}
        positions={positions}
        onBack={handleBackToVoting}
        onVoteCast={onVoteCast}
        onLogout={onLogout}
        loading={false}
      />
    );
  }

  const totalSelected = Object.values(selectedVotes).reduce((sum, votes) => sum + votes.length, 0);
  const totalPossible = positions.reduce((sum, position) => sum + (position.maxVotes || 1), 0);
  
  // All positions are optional now, so review is always enabled
  const canReviewVote = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 mb-4 sm:mb-6 overflow-hidden"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 sm:w-14 sm:h-16 lg:w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Vote className="w-6 h-6 sm:w-7 sm:h-8 lg:w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                    Cast Your Vote
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base flex items-center space-x-2">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-center">Select candidates for each position (optional)</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center space-y-3 lg:space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-blue-200"
                >
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{totalSelected}</p>
                    <p className="text-xs sm:text-sm lg:text-xs text-blue-700">of {totalPossible} selected</p>
                  </div>
                </motion.div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-white/30 p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Voting Progress</span>
            <span className="text-xs sm:text-sm font-bold text-blue-600">{positionsWithVotes} of {totalPositions} positions</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(positionsWithVotes / totalPositions) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-green-500" />
              {positionsWithVotes} completed
            </span>
            <span className="flex items-center">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-yellow-500" />
              {totalPositions - positionsWithVotes} remaining
            </span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Action Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Vote?</h3>
                <p className="text-sm text-gray-600">
                  {positionsWithVotes === 0 ? (
                    <span className="text-orange-600 font-medium">No positions selected</span>
                  ) : positionsWithVotes === totalPositions ? (
                    <span className="text-green-600 font-medium">All positions selected</span>
                  ) : (
                    <span className="text-blue-600 font-medium">{positionsWithVotes} of {totalPositions} positions</span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  onClick={handleReviewVote}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  disabled={!canReviewVote}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Review & Submit Vote</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-600" />
                    Voting Guidelines
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start">
                      <ChevronRight className="w-3 h-3 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>All positions are optional</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-3 h-3 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>You can leave positions empty</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-3 h-3 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>Your vote is secure on blockchain</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Candidates Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 space-y-6"
          >
            {positions.map((position, index) => {
              const positionCandidates = candidates.filter(candidate => candidate.position === position.name);
              const selectedCount = getSelectedCountForPosition(position.name);
              const maxVotes = getMaxVotesForPosition(position.name);
              const voteStatus = getVoteStatusForPosition(position.name);
              const canSelectMore = canSelectCandidate(position.name);

              return (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden"
                >
                  {/* Modern Position Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 border-b border-blue-500/30 p-6 relative overflow-hidden">
                    {/* Subtle background elements */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{position.name}</h2>
                            <p className="text-blue-100 text-sm mt-1">
                              {maxVotes > 1
                                ? `Select up to ${maxVotes} candidates`
                                : 'Select one candidate'
                              }
                              <span className="ml-2 text-blue-200 italic">(Optional)</span>
                            </p>
                            <p className="text-blue-200 text-xs mt-1">
                              Eligible: {formatEligibleYears(position.allowed_years)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className={`px-4 py-2 rounded-full font-semibold text-sm backdrop-blur-sm border ${
                              voteStatus.status === 'empty' ? 'bg-blue-200/30 text-blue-100 border-blue-400/30' :
                              voteStatus.status === 'partial' ? 'bg-yellow-200/30 text-yellow-100 border-yellow-400/30' :
                              'bg-green-200/30 text-green-100 border-green-400/30'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {selectedCount}/{maxVotes} selected
                          </motion.div>
                          {voteStatus.status === 'full' && (
                            <motion.div
                              className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 px-3 py-2 rounded-full flex items-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1 text-green-100" />
                              <span className="text-green-100 text-sm font-medium">Complete</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      
                      {voteStatus.status !== 'full' && voteStatus.status !== 'empty' && (
                        <motion.div
                          className="mt-3 flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <AlertCircle className="w-4 h-4 text-yellow-300 mr-2" />
                          <p className="text-yellow-100 text-sm font-medium">
                            {voteStatus.message}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="p-6">
                    {positionCandidates.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No candidates available</p>
                        <p className="text-sm mt-2">Check back later for updates</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {positionCandidates.map((candidate, candidateIndex) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * candidateIndex }}
                            whileHover={{ y: -5 }}
                            onClick={() => handleCandidateSelect(position.name, candidate.id, maxVotes)}
                            className={`group relative overflow-hidden rounded-3xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                              isCandidateSelected(position.name, candidate.id)
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl'
                                : !canSelectMore && !isCandidateSelected(position.name, candidate.id)
                                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                            }`}
                          >
                            {/* Selection Indicator */}
                            <div className="absolute top-4 right-4 z-10">
                              {isCandidateSelected(position.name, candidate.id) && (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                              )}
                              {!canSelectMore && !isCandidateSelected(position.name, candidate.id) && (
                                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                                  <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Candidate Image */}
                            <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                              {candidate.image_url ? (
                                <img
                                  src={candidate.image_url}
                                  alt={candidate.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&size=200`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                  <User className="w-20 h-20 text-blue-400" />
                                </div>
                              )}
                              
                              {/* Overlay with party name */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white text-sm font-semibold truncate">
                                  {candidate.party}
                                </p>
                              </div>
                            </div>

                            {/* Candidate Info */}
                            <div className="p-6">
                              <h3 className="font-bold text-xl text-gray-900 truncate mb-3 group-hover:text-blue-700 transition-colors">
                                {candidate.name}
                              </h3>
                              
                              <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                                  <span className="font-medium">{candidate.party}</span>
                                </div>
                                
                                {/* Selection status */}
                                <div className="flex items-center justify-between">
                                  <motion.span
                                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                                      isCandidateSelected(position.name, candidate.id)
                                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {isCandidateSelected(position.name, candidate.id) ? '✓ Selected' : 'Click to select'}
                                  </motion.span>
                                  
                                  {maxVotes > 1 && (
                                    <span className="text-xs text-gray-500 font-medium">
                                      {selectedCount}/{maxVotes} slots
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Empty vote option */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 pt-6 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                            <Info className="w-4 h-4 mr-2 text-blue-500" />
                            No Selection Option
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            You can leave this position empty if you prefer not to vote.
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedCount === 0 ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {selectedCount === 0 ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout? Your vote selections will be lost.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-2xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-2xl transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};