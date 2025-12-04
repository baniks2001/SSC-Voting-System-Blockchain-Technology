import React, { useState, useEffect } from 'react';
import { Vote, Users, CheckCircle, ArrowRight, User, LogOut, AlertCircle, Menu, X } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
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
  const [submitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();
  useAuth();

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

      setPositions(sortedPositions);
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
    // REMOVED: No longer check if all required positions are selected
    // Voters can now leave positions empty if they want
    
    const exceededPositions = positions.filter(position => {
      const selectedForPosition = selectedVotes[position.name] || [];
      const maxVotes = position.maxVotes || 1;
      return selectedForPosition.length > maxVotes;
    });

    if (exceededPositions.length > 0) {
      showToast('error', 'Some positions have exceeded the selection limit. Please adjust your selections.');
      return;
    }

    setShowReview(true);
  };

  const handleBackToVoting = () => {
    setShowReview(false);
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
          <LoadingSpinner size="lg" text="Loading voting data..." />
        </div>
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
        loading={submitting}
      />
    );
  }

  const totalSelected = Object.values(selectedVotes).reduce((sum, votes) => sum + votes.length, 0);
  const totalPossible = positions.reduce((sum, position) => sum + (position.maxVotes || 1), 0);
  
  // All positions are optional now, so review is always enabled
  const canReviewVote = true;

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cast Your Vote</h1>
                <p className="text-sm text-gray-600">{totalSelected} of {totalPossible} selected</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {positionsWithVotes === 0 ? (
                      <span className="text-orange-600 font-medium flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        No positions selected
                      </span>
                    ) : positionsWithVotes === totalPositions ? (
                      <span className="text-green-600 font-medium flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        All positions selected
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {positionsWithVotes} of {totalPositions} positions selected
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleReviewVote}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!canReviewVote}
                >
                  <span>Review Vote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Cast Your Vote</h1>
                  <p className="text-gray-600">Select candidates for each position (optional)</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 rounded-xl px-4 py-2">
                  <span className="text-sm font-semibold text-blue-800">
                    {totalSelected} of {totalPossible} selected
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Action Panel for Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="bg-blue-50 rounded-xl px-4 py-2 inline-block mb-3">
                  <p className="text-sm font-semibold text-blue-800">
                    {totalSelected} of {totalPossible} selected
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {positionsWithVotes === 0 ? (
                    <span className="text-orange-600 font-medium flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      No positions selected
                    </span>
                  ) : positionsWithVotes === totalPositions ? (
                    <span className="text-green-600 font-medium flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      All positions selected
                    </span>
                  ) : (
                    <span className="text-blue-600 font-medium flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {positionsWithVotes} of {totalPositions} positions selected
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleReviewVote}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  disabled={!canReviewVote}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Review & Cast Your Vote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Positions selected:</span>
                      <span className="font-semibold">
                        {positionsWithVotes} of {totalPositions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(positionsWithVotes / totalPositions) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-900 text-sm mb-2">Note</h3>
                  <p className="text-xs text-yellow-700">
                    You can leave positions empty if you prefer not to vote for that position.
                    Your vote will be submitted with empty selections for those positions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="lg:col-span-3 space-y-6">
            {positions.map((position) => {
              const positionCandidates = candidates.filter(candidate => candidate.position === position.name);
              const selectedCount = getSelectedCountForPosition(position.name);
              const maxVotes = getMaxVotesForPosition(position.name);
              const voteStatus = getVoteStatusForPosition(position.name);
              const canSelectMore = canSelectCandidate(position.name);

              return (
                <div key={position.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Position Header - Updated to dark blue with white text */}
                  <div className="bg-blue-800 border-b border-blue-700 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-white" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{position.name}</h2>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                          voteStatus.status === 'empty' ? 'bg-blue-200 text-blue-800' :
                          voteStatus.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedCount}/{maxVotes} selected
                        </span>
                        {voteStatus.status === 'full' && (
                          <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 space-y-1 sm:space-y-0">
                      <p className="text-base text-blue-100">
                        {maxVotes > 1
                          ? `You can select up to ${maxVotes} candidate(s) for this position`
                          : 'Select one candidate for this position'
                        }
                        <span className="ml-2 text-blue-200 italic">(Optional - can be left empty)</span>
                      </p>
                      {voteStatus.status !== 'full' && voteStatus.status !== 'empty' && (
                        <p className="text-base text-blue-200 font-medium">
                          {voteStatus.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="p-4 sm:p-6">
                    {positionCandidates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                        <p className="text-base">No candidates available for this position</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {positionCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            onClick={() => handleCandidateSelect(position.name, candidate.id, maxVotes)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                              isCandidateSelected(position.name, candidate.id)
                                ? 'border-blue-800 bg-blue-100 shadow-md'
                                : !canSelectMore && !isCandidateSelected(position.name, candidate.id)
                                  ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-7 h-7 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 truncate">
                                  {candidate.name}
                                </h3>
                                <p className="text-gray-600 text-base truncate">
                                  {candidate.party}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {isCandidateSelected(position.name, candidate.id) && (
                                  <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                )}
                                {!canSelectMore && !isCandidateSelected(position.name, candidate.id) && (
                                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Empty vote option */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700">No Selection Option</h4>
                          <p className="text-sm text-gray-500">
                            You can leave this position empty if you prefer not to vote for any candidate.
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCount === 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {selectedCount === 0 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Action Section */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 rounded-xl px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {totalSelected}/{totalPossible}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {positionsWithVotes === 0 ? 'No positions selected' : 
                     positionsWithVotes === totalPositions ? 'All positions selected' : 
                     `${positionsWithVotes} of ${totalPositions} positions selected`}
                  </p>
                  <p className="text-xs text-gray-600">
                    You can leave positions empty
                  </p>
                </div>
              </div>
              <button
                onClick={handleReviewVote}
                className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm flex-shrink-0"
                disabled={!canReviewVote}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Review</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to logout? Your vote selections will be lost.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};