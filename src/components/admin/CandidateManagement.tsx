import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, User, Award, Layers, MoreVertical, Filter, ChevronDown, Check, Users } from 'lucide-react';
import { Candidate, Position, Voter } from '../../types';
import { api } from '../../utils/api';
import { positionApi } from '../../utils/positionApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { usePoll } from '../../contexts/PollContext';

export const CandidateManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [votersLoading, setVotersLoading] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileActions, setShowMobileActions] = useState<number | null>(null);
  const [showPositionFilters, setShowPositionFilters] = useState(false);
  const [voterSearch, setVoterSearch] = useState('');
  const [showVoterDropdown, setShowVoterDropdown] = useState(false);
  const { showToast } = useToast();
  const { pollStatus } = usePoll();
  
  const isVotingActive = pollStatus === 'active';

  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    party: '',
    position: ''
  });

  const [positionFormData, setPositionFormData] = useState({
    name: '',
    maxVotes: 1,
    order: 0,
    is_active: true
  });

  // Add state for duplicate name validation
  const [duplicateNameError, setDuplicateNameError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCandidates(), fetchPositions()]);
    } catch (error: any) {
      showToast('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates/admin');
      setCandidates(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch candidates');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionApi.getPositions();
      setPositions(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch positions');
    }
  };

  const fetchVoters = async (search: string = '') => {
    try {
      setVotersLoading(true);
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      params.append('limit', '50');
      
      const response = await api.get(`/voters?${params.toString()}`);
      const votersData = response.data || response;
      setVoters(Array.isArray(votersData) ? votersData : []);
    } catch (error: any) {
      console.error('Failed to fetch voters:', error);
      setVoters([]);
    } finally {
      setVotersLoading(false);
    }
  };

  // Add function to check for duplicate candidate names
  const checkDuplicateCandidateName = (name: string, excludeId?: number): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return candidates.some(candidate => 
      candidate.name.toLowerCase() === normalizedName && 
      candidate.id !== excludeId
    );
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate candidate name
    const candidateName = candidateFormData.name.trim();
    if (!candidateName) {
      showToast('error', 'Candidate name is required');
      return;
    }

    // Check for duplicate name (only for new candidates, or when name changes during edit)
    if (!editingCandidate || candidateName !== editingCandidate.name) {
      const isDuplicate = checkDuplicateCandidateName(candidateName, editingCandidate?.id);
      if (isDuplicate) {
        setDuplicateNameError(`A candidate with the name "${candidateName}" already exists.`);
        showToast('error', `Candidate "${candidateName}" already exists`);
        return;
      }
    }

    try {
      if (editingCandidate) {
        await api.put(`/candidates/${editingCandidate.id}`, candidateFormData);
        showToast('success', 'Candidate updated successfully');
      } else {
        await api.post('/candidates', candidateFormData);
        showToast('success', 'Candidate created successfully');
      }
      setShowCandidateModal(false);
      resetCandidateForm();
      fetchCandidates();
    } catch (error: any) {
      // Handle duplicate name error from backend as well
      if (error.message && error.message.toLowerCase().includes('duplicate') || 
          error.message && error.message.toLowerCase().includes('already exists')) {
        setDuplicateNameError(`A candidate with the name "${candidateName}" already exists.`);
        showToast('error', `Candidate "${candidateName}" already exists`);
      } else {
        showToast('error', error.message || 'Operation failed');
      }
    }
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        await positionApi.updatePosition(editingPosition.id, {
          name: positionFormData.name,
          maxVotes: positionFormData.maxVotes,
          order: positionFormData.order,
          is_active: positionFormData.is_active
        });
        showToast('success', 'Position updated successfully');
      } else {
        await positionApi.createPosition({
          name: positionFormData.name,
          maxVotes: positionFormData.maxVotes,
          order: positionFormData.order
        });
        showToast('success', 'Position created successfully');
      }
      setShowPositionModal(false);
      resetPositionForm();
      fetchPositions();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setCandidateFormData({
      name: candidate.name,
      party: candidate.party,
      position: candidate.position
    });
    setDuplicateNameError(''); // Clear any previous errors
    setShowCandidateModal(true);
    setShowMobileActions(null);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setPositionFormData({
      name: position.name,
      maxVotes: position.maxVotes,
      order: position.order,
      is_active: position.is_active
    });
    setShowPositionModal(true);
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this candidate? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/candidates/${id}`);
      showToast('success', 'Candidate deleted successfully');
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
      setShowMobileActions(null);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete candidate');
      fetchCandidates();
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this position? This will also delete all associated candidates and cannot be undone.')) return;
    
    try {
      await positionApi.deletePosition(id);
      showToast('success', 'Position deleted successfully');
      setPositions(prev => prev.filter(position => position.id !== id));
      fetchCandidates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete position');
      fetchPositions();
    }
  };

  const resetCandidateForm = () => {
    setCandidateFormData({
      name: '',
      party: '',
      position: ''
    });
    setEditingCandidate(null);
    setVoterSearch('');
    setVoters([]);
    setShowVoterDropdown(false);
    setDuplicateNameError(''); // Clear duplicate error
  };

  const resetPositionForm = () => {
    setPositionFormData({
      name: '',
      maxVotes: 1,
      order: 0,
      is_active: true
    });
    setEditingPosition(null);
  };

  useEffect(() => {
    if (showCandidateModal && !editingCandidate) {
      const timeoutId = setTimeout(() => {
        if (voterSearch.trim()) {
          fetchVoters(voterSearch);
        } else {
          setVoters([]);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [voterSearch, showCandidateModal, editingCandidate]);

  useEffect(() => {
    if (showCandidateModal && !editingCandidate) {
      setVoterSearch('');
      setVoters([]);
    }
  }, [showCandidateModal, editingCandidate]);

  const handleVoterSelect = (voter: Voter) => {
    const selectedName = voter.full_name;
    
    // Check for duplicate when selecting from voter list
    if (checkDuplicateCandidateName(selectedName)) {
      setDuplicateNameError(`A candidate with the name "${selectedName}" already exists.`);
      showToast('error', `Candidate "${selectedName}" already exists`);
      return;
    }
    
    setCandidateFormData(prev => ({
      ...prev,
      name: selectedName
    }));
    setVoterSearch(selectedName);
    setShowVoterDropdown(false);
    setVoters([]);
    setDuplicateNameError(''); // Clear any previous errors
  };

  // Update candidate name change handler to validate duplicates in real-time
  const handleCandidateNameChange = (name: string) => {
    if (editingCandidate) {
      setCandidateFormData({ ...candidateFormData, name });
    } else {
      setVoterSearch(name);
      setShowVoterDropdown(true);
    }
    
    // Clear duplicate error when user starts typing
    if (duplicateNameError) {
      setDuplicateNameError('');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: string) => {
    const colors = {
      'President': 'bg-purple-100 text-purple-800 border-purple-200',
      'Vice President': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Secretary': 'bg-green-100 text-green-800 border-green-200',
      'Senator': 'bg-blue-100 text-blue-800 border-blue-200',
      'Treasurer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Auditor': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 animate-fadeIn p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Candidate Management
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  Manage election positions and candidates
                </p>
              </div>
            </div>
            {isVotingActive && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs font-medium text-amber-800">
                  Voting is active - modifications disabled
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowPositionModal(true)}
              disabled={isVotingActive}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isVotingActive 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Create Position</span>
              <span className="sm:hidden">Position</span>
            </button>
            <button
              onClick={() => setShowCandidateModal(true)}
              disabled={isVotingActive}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isVotingActive 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Candidate</span>
              <span className="sm:hidden">Candidate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Positions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Positions</h2>
              <p className="text-gray-600 text-sm">Manage available positions and voting limits</p>
            </div>
            <button
              onClick={() => setShowPositionFilters(!showPositionFilters)}
              disabled={isVotingActive}
              className={`sm:hidden ${
                isVotingActive 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed px-3 py-1.5 rounded-lg text-sm' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-all duration-200'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {positions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No positions created yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first position to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {positions.map((position) => (
                <div key={position.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{position.name}</h3>
                    <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0 ml-2 border border-blue-200">
                      Limit: {position.maxVotes}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Display Order:</span>
                      <span className="font-medium">{position.order}</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs ${position.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        position.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {position.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPosition(position)}
                      disabled={isVotingActive}
                      className={`flex-1 text-xs px-3 py-2 rounded-lg transition-all duration-200 ${
                        isVotingActive 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      disabled={isVotingActive}
                      className={`flex-1 text-xs px-3 py-2 rounded-lg transition-all duration-200 ${
                        isVotingActive 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates by name, party, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16">
            <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg sm:text-xl font-medium">No candidates found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{candidate.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{candidate.party}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(candidate.position)}`}>
                        {candidate.position}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Actions Menu */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() => setShowMobileActions(showMobileActions === candidate.id ? null : candidate.id)}
                      disabled={isVotingActive}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isVotingActive 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMobileActions === candidate.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-32 overflow-hidden">
                        <button
                          onClick={() => handleEditCandidate(candidate)}
                          disabled={isVotingActive}
                          className={`w-full text-left px-3 py-2.5 text-sm flex items-center space-x-2 transition-colors ${
                            isVotingActive 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          disabled={isVotingActive}
                          className={`w-full text-left px-3 py-2.5 text-sm flex items-center space-x-2 transition-colors ${
                            isVotingActive 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:bg-gray-50'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="hidden sm:block">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      candidate.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {candidate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="mt-4 flex space-x-2 hidden sm:flex">
                  <button
                    onClick={() => handleEditCandidate(candidate)}
                    disabled={isVotingActive}
                    className={`flex-1 flex items-center justify-center space-x-1 text-xs px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isVotingActive 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    disabled={isVotingActive}
                    className={`flex-1 flex items-center justify-center space-x-1 text-xs px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isVotingActive 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Candidate Modal */}
      <Modal
        isOpen={showCandidateModal}
        onClose={() => {
          setShowCandidateModal(false);
          resetCandidateForm();
        }}
        title={editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        size="md"
      >
        <form onSubmit={handleCandidateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={editingCandidate ? candidateFormData.name : voterSearch}
                onChange={(e) => handleCandidateNameChange(e.target.value)}
                onFocus={() => {
                  if (!editingCandidate && voterSearch) {
                    setShowVoterDropdown(true);
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  duplicateNameError ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                placeholder={editingCandidate ? "Enter candidate name" : "Search voters by name or ID"}
              />
              {!editingCandidate && (
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
              
              {/* Duplicate Name Error */}
              {duplicateNameError && (
                <div className="absolute -bottom-6 left-0 text-xs text-red-600 flex items-center">
                  {duplicateNameError}
                </div>
              )}
              
              {/* Voter Dropdown */}
              {!editingCandidate && showVoterDropdown && voters.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {votersLoading ? (
                    <div className="p-3 text-center">
                      <LoadingSpinner size="sm" text="Searching voters..." />
                    </div>
                  ) : (
                    voters.map((voter) => (
                      <button
                        key={voter.id}
                        type="button"
                        onClick={() => handleVoterSelect(voter)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{voter.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {voter.student_id} • {voter.course} • Year {voter.year_level}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {/* No results message */}
              {!editingCandidate && showVoterDropdown && voterSearch && !votersLoading && voters.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-3 text-center text-gray-500">
                    No voters found matching "{voterSearch}"
                  </div>
                </div>
              )}
            </div>
            {!editingCandidate && (
              <p className="text-xs text-gray-500 mt-1">
                Search for registered voters by name or student ID
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-2" />
              Party
            </label>
            <input
              type="text"
              value={candidateFormData.party}
              onChange={(e) => setCandidateFormData({ ...candidateFormData, party: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              placeholder="Enter party or affiliation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={candidateFormData.position}
              onChange={(e) => setCandidateFormData({ ...candidateFormData, position: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select Position</option>
              {positions.map((position) => (
                <option key={position.id} value={position.name}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCandidateModal(false);
                resetCandidateForm();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!!duplicateNameError}
              className={`flex-1 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform shadow-lg ${
                duplicateNameError 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105'
              }`}
            >
              {editingCandidate ? 'Update Candidate' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Position Modal */}
      <Modal
        isOpen={showPositionModal}
        onClose={() => {
          setShowPositionModal(false);
          resetPositionForm();
        }}
        title={editingPosition ? 'Edit Position' : 'Create New Position'}
        size="md"
      >
        <form onSubmit={handlePositionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline mr-2" />
              Position Name
            </label>
            <input
              type="text"
              value={positionFormData.name}
              onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., President, Senator, Board Member, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vote Limit
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={positionFormData.maxVotes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setPositionFormData({ 
                  ...positionFormData, 
                  maxVotes: Math.max(1, Math.min(20, value))
                });
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of candidates a voter can select for this position
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={positionFormData.order}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setPositionFormData({ 
                  ...positionFormData, 
                  order: Math.max(0, value)
                });
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Lower numbers appear first in the voting interface
            </p>
          </div>

          {editingPosition && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={positionFormData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setPositionFormData({ 
                  ...positionFormData, 
                  is_active: e.target.value === 'active'
                })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">
                Active positions are visible in the voting interface
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowPositionModal(false);
                resetPositionForm();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              {editingPosition ? 'Update Position' : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};