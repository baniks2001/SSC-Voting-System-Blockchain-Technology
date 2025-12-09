import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Monitor,
  Maximize,
  Minimize,
  Users,
  Vote,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  Server,
  Shield,
  Menu,
  X,
  HardDrive,
  Cloud,
  RotateCw, 
  PauseCircle,
} from 'lucide-react';
import { PollSettings, Position } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';

interface PollMonitorProps {
  isReadOnly?: boolean;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  position_name?: string;
  vote_count?: number;
  display_order?: number;
}

interface VoteResult {
  candidateId: string;
  voteCount: number;
}

interface NodeStatus {
  name: string;
  connected: boolean;
  url: string;
  account: string;
  blockNumber: number;
  isPrimary: boolean;
  syncStatus: string;
  lastSync: string | null;
  lastDataReceived: string | null;
}

interface BlockchainStatus {
  isConnected: boolean;
  emergencyMode: boolean;
  contractDeployed: boolean;
  contractAddress: string;
  node: string;
  blockNumber: number;
  totalNodes: number;
  connectedNodes: number;
  autoSyncEnabled: boolean;
  syncStatus: string;
  nodes: NodeStatus[];
  emergencyVoteCount: number;
  failoverActive: boolean;
  robustMode: boolean;
  nodeHierarchy: {
    primary: string;
    secondary: string;
    emergency: 'emergency_storage'
  };
  currentNode: string;
  electionState: {
    status: string;
    startTime: string | null;
    pauseTime: string | null;
    finishTime: string | null;
    lastDataTimestamp: string | null;
  };
  syncAllowed: boolean;
  noDataSincePause: boolean;
  syncDataUpdated: boolean;
}

export const PollMonitor: React.FC<PollMonitorProps> = ({ isReadOnly = false }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [pollSettings, setPollSettings] = useState<PollSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentNode, setCurrentNode] = useState<string>('node1');
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const checkBlockchainStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking enhanced blockchain status with auto-sync...');
      const response = await api.get('/voting/enhanced-blockchain-status');

      if (response.success) {
        // Filter to only include node1 and node2 (not emergency storage)
        const filteredNodes = response.nodes.filter((node: any) =>
          node.name === 'node1' || node.name === 'node2'
        );

        // Determine if both nodes are down
        const bothNodesDown = filteredNodes.every((node: any) => !node.connected);
        
        // Check if we should update poll status to paused
        if (bothNodesDown && pollSettings?.is_active && !pollSettings?.is_paused) {
          console.log('🚨 Both nodes down, attempting to auto-pause poll...');
          try {
            // Call the poll pause endpoint
            await api.post('/poll/paused', {}, {
              successMessage: 'Poll auto-paused due to node failure',
              errorMessage: 'Failed to auto-pause poll'
            });
            
            // Refresh poll settings after pausing
            const settingsResponse = await api.get('/poll/status');
            setPollSettings(settingsResponse);
            
            showToast('warning', 'Poll auto-paused because both blockchain nodes are down');
          } catch (pauseError) {
            console.error('Failed to auto-pause poll:', pauseError);
          }
        }

        // Update current node based on actual connection status
        let actualCurrentNode = 'none';
        const connectedNode = filteredNodes.find((node: any) => node.connected && node.name !== 'emergency_storage');
        if (connectedNode) {
          actualCurrentNode = connectedNode.name;
        } else if (response.currentNode) {
          actualCurrentNode = response.currentNode;
        }
        setCurrentNode(actualCurrentNode);

        // Update the blockchain status with enhanced data
        const updatedBlockchainStatus: BlockchainStatus = {
          ...response,
          nodes: filteredNodes,
          totalNodes: 2, // Only node1 and node2 now
          connectedNodes: filteredNodes.filter((node: any) => node.connected).length,
          // Ensure currentNode is set based on actual connection
          currentNode: actualCurrentNode,
          syncAllowed: response.syncAllowed || false,
          noDataSincePause: response.noDataSincePause || false,
          syncDataUpdated: response.syncDataUpdated || false
        };

        setBlockchainStatus(updatedBlockchainStatus);

        console.log('✅ Enhanced blockchain status:', {
          connected: updatedBlockchainStatus.isConnected,
          contractDeployed: updatedBlockchainStatus.contractDeployed,
          connectedNodes: `${updatedBlockchainStatus.connectedNodes}/${updatedBlockchainStatus.totalNodes}`,
          syncStatus: updatedBlockchainStatus.syncStatus,
          autoSyncEnabled: updatedBlockchainStatus.autoSyncEnabled,
          failoverActive: updatedBlockchainStatus.failoverActive,
          emergencyVoteCount: updatedBlockchainStatus.emergencyVoteCount,
          nodeHierarchy: updatedBlockchainStatus.nodeHierarchy,
          currentNode: updatedBlockchainStatus.currentNode,
          electionState: updatedBlockchainStatus.electionState,
          syncAllowed: updatedBlockchainStatus.syncAllowed,
          noDataSincePause: updatedBlockchainStatus.noDataSincePause,
          syncDataUpdated: updatedBlockchainStatus.syncDataUpdated
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Blockchain status check failed:', error);
      // If blockchain status check fails, both nodes might be down
      setCurrentNode('none');
      return false;
    }
  }, [pollSettings, showToast]);

  const fetchCandidatesFromMySQL = useCallback(async (): Promise<Candidate[]> => {
    try {
      console.log('🗳️ Fetching candidates from MySQL database...');
      const response = await api.get('/candidates');

      let sqlCandidates: Candidate[] = [];

      if (Array.isArray(response)) {
        sqlCandidates = response;
      } else if (response && Array.isArray(response.candidates)) {
        sqlCandidates = response.candidates;
      } else if (response && Array.isArray(response.data)) {
        sqlCandidates = response.data;
      } else {
        console.warn('Unexpected candidates response format:', response);
        sqlCandidates = [];
      }

      console.log(`✅ Loaded ${sqlCandidates.length} candidates from MySQL`);
      return sqlCandidates;
    } catch (error) {
      console.error('Failed to fetch candidates from MySQL:', error);
      showToast('error', 'Failed to fetch candidates');
      return [];
    }
  }, [showToast]);

  const fetchPositions = useCallback(async (): Promise<Position[]> => {
    try {
      console.log('📋 Fetching positions...');
      const response = await api.get('/positions');

      let positionsData: Position[] = [];

      if (Array.isArray(response)) {
        positionsData = response;
      } else if (response && Array.isArray(response.positions)) {
        positionsData = response.positions;
      } else if (response && Array.isArray(response.data)) {
        positionsData = response.data;
      } else {
        console.warn('Unexpected positions response format:', response);
        positionsData = [];
      }

      // FIXED: Added null checks for display_order
      const sortedPositions = positionsData.sort((a: Position, b: Position) => {
        const orderA = a.display_order ?? 0;
        const orderB = b.display_order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
      });

      console.log(`✅ Loaded ${sortedPositions.length} positions sorted by display order`);
      return sortedPositions;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      showToast('error', 'Failed to fetch positions');
      return [];
    }
  }, [showToast]);

  const fetchVotesFromBlockchain = useCallback(async (): Promise<{ voteResults: VoteResult[], totalVotes: number }> => {
    try {
      console.log('⛓️ Fetching vote counts from blockchain/emergency storage...');
      const response = await api.get('/voting/results');

      let voteResults: VoteResult[] = [];
      let totalVotesCount = 0;

      if (response && response.success) {
        // Get total votes from blockchain/emergency storage response (same as dashboard)
        totalVotesCount = response.totalVotes || 0;

        console.log('📊 Vote results from blockchain/emergency:', {
          totalVotes: totalVotesCount,
          source: response.source,
          emergencyMode: response.emergencyMode,
          hasCandidates: !!response.candidates,
          candidatesCount: response.candidates?.length
        });

        // Process candidate vote counts
        if (response.candidates && Array.isArray(response.candidates)) {
          response.candidates.forEach((candidate: any) => {
            if (candidate.id && candidate.vote_count !== undefined) {
              voteResults.push({
                candidateId: candidate.id.toString(),
                voteCount: candidate.vote_count
              });
            }
          });
          console.log(`✅ Loaded ${voteResults.length} votes from ${response.source}`);
        }

        // If no candidates array, try to extract from resultsByPosition
        if (voteResults.length === 0 && response.resultsByPosition) {
          console.log('🔍 Extracting votes from resultsByPosition...');
          Object.values(response.resultsByPosition).forEach((positionCandidates: any) => {
            if (Array.isArray(positionCandidates)) {
              positionCandidates.forEach((candidate: any) => {
                if (candidate && candidate.id) {
                  voteResults.push({
                    candidateId: candidate.id.toString(),
                    voteCount: candidate.vote_count || 0
                  });
                }
              });
            }
          });
          console.log(`✅ Loaded ${voteResults.length} votes from resultsByPosition`);
        }

        // If still no votes, try to calculate from raw vote data
        if (voteResults.length === 0 && response.voteData && Array.isArray(response.voteData)) {
          console.log('🔍 Calculating votes from raw vote data...');
          const voteCounts: { [candidateId: string]: number } = {};

          response.voteData.forEach((vote: any) => {
            if (vote.votes && Array.isArray(vote.votes)) {
              vote.votes.forEach((v: any) => {
                const candidateId = v.candidateId?.toString();
                if (candidateId) {
                  voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
                }
              });
            }
          });

          voteResults = Object.entries(voteCounts).map(([candidateId, voteCount]) => ({
            candidateId,
            voteCount
          }));
          
          // Recalculate total votes from raw data
          totalVotesCount = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
          console.log(`✅ Calculated ${voteResults.length} votes from raw data`);
        }

        console.log(`✅ Final vote processing:`, {
          totalVotes: totalVotesCount,
          candidatesWithVotes: voteResults.length,
          source: response.source
        });
      }

      return { voteResults, totalVotes: totalVotesCount };
    } catch (error) {
      console.error('❌ Failed to fetch votes:', error);
      showToast('error', 'Failed to fetch vote counts');
      return { voteResults: [], totalVotes: 0 };
    }
  }, [showToast]);

  const fetchData = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);

      const blockchainHealthy = await checkBlockchainStatus();

      console.log('📡 Fetching data from enhanced DUAL-NODE system...', {
        blockchainHealthy,
        currentNode,
        failoverActive: blockchainStatus?.failoverActive,
        nodeHierarchy: blockchainStatus?.nodeHierarchy,
        autoSyncEnabled: blockchainStatus?.autoSyncEnabled,
        syncAllowed: blockchainStatus?.syncAllowed
      });

      const [candidatesPromise, votesPromise, settingsResponse, positionsPromise] = await Promise.allSettled([
        fetchCandidatesFromMySQL(),
        fetchVotesFromBlockchain(), // Now uses the same method as dashboard
        api.get('/poll/status'),
        fetchPositions()
      ]);

      let sqlCandidates: Candidate[] = [];
      let voteResults: VoteResult[] = [];
      let totalVotesCount = 0;
      let positionsData: Position[] = [];

      if (candidatesPromise.status === 'fulfilled') {
        sqlCandidates = candidatesPromise.value;
      } else {
        console.error('Candidates fetch failed:', candidatesPromise.reason);
      }

      if (positionsPromise.status === 'fulfilled') {
        positionsData = positionsPromise.value;
      } else {
        console.error('Positions fetch failed:', positionsPromise.reason);
      }

      if (votesPromise.status === 'fulfilled') {
        voteResults = votesPromise.value.voteResults;
        totalVotesCount = votesPromise.value.totalVotes; // Use the blockchain total votes
      } else {
        console.error('Votes fetch failed:', votesPromise.reason);
      }

      // Merge candidates with their vote counts
      const mergedCandidates = sqlCandidates.map(candidate => {
        const voteResult = voteResults.find(vr => vr.candidateId === candidate.id.toString());
        return {
          ...candidate,
          vote_count: voteResult ? voteResult.voteCount : 0
        };
      });

      setCandidates(mergedCandidates);
      setPositions(positionsData);
      setTotalVotes(totalVotesCount); // Set total votes from blockchain

      if (settingsResponse.status === 'fulfilled') {
        setPollSettings(settingsResponse.value);
      }

      console.log(`✅ Data fetched successfully from enhanced DUAL-NODE system`, {
        candidates: mergedCandidates.length,
        positions: positionsData.length,
        totalVotes: totalVotesCount,
        sources: {
          mysql: sqlCandidates.length,
          blockchain: voteResults.length
        },
        blockchainStatus: blockchainStatus,
        failoverActive: blockchainStatus?.failoverActive,
        nodeHierarchy: blockchainStatus?.nodeHierarchy,
        autoSyncEnabled: blockchainStatus?.autoSyncEnabled,
        syncAllowed: blockchainStatus?.syncAllowed,
        noDataSincePause: blockchainStatus?.noDataSincePause,
        syncDataUpdated: blockchainStatus?.syncDataUpdated
      });

    } catch (error: any) {
      console.error('Failed to fetch poll data:', error);
      showToast('error', 'Failed to fetch poll data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, currentNode, blockchainStatus, checkBlockchainStatus, fetchCandidatesFromMySQL, fetchVotesFromBlockchain, fetchPositions, showToast]);

  useEffect(() => {
    if (candidates.length > 0) {
      console.log('📊 PollMonitor - Enhanced DUAL-NODE data:', {
        totalVotes,
        candidatesCount: candidates.length,
        positionsCount: positions.length,
        candidatesWithVotes: candidates.filter(c => (c.vote_count || 0) > 0).length,
        currentNode,
        blockchainStatus: {
          connected: blockchainStatus?.isConnected,
          contract: blockchainStatus?.contractDeployed,
          syncStatus: blockchainStatus?.syncStatus,
          autoSyncEnabled: blockchainStatus?.autoSyncEnabled,
          failover: blockchainStatus?.failoverActive,
          emergencyVotes: blockchainStatus?.emergencyVoteCount,
          nodeHierarchy: blockchainStatus?.nodeHierarchy,
          currentNode: blockchainStatus?.currentNode,
          electionState: blockchainStatus?.electionState,
          syncAllowed: blockchainStatus?.syncAllowed,
          noDataSincePause: blockchainStatus?.noDataSincePause,
          syncDataUpdated: blockchainStatus?.syncDataUpdated
        }
      });
    }
  }, [candidates, positions, totalVotes, currentNode, blockchainStatus, loading, refreshing]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchData]);

  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh requested');
    await checkBlockchainStatus();
    await fetchData();
  }, [checkBlockchainStatus, fetchData]);

  const exportVotes = useCallback(() => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalVotes,
        candidates: candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          position: candidate.position_name || candidate.position,
          votes: candidate.vote_count || 0,
          percentage: totalVotes > 0 ? ((candidate.vote_count || 0) / totalVotes * 100).toFixed(2) : '0.00'
        })),
        pollStatus: {
          isActive: pollSettings?.is_active,
          isPaused: pollSettings?.is_paused,
          startTime: pollSettings?.start_time,
          endTime: pollSettings?.end_time
        },
        blockchainStatus: {
          connected: blockchainStatus?.isConnected,
          contractDeployed: blockchainStatus?.contractDeployed,
          contractAddress: blockchainStatus?.contractAddress,
          connectedNodes: blockchainStatus?.connectedNodes,
          totalNodes: blockchainStatus?.totalNodes,
          currentNode: blockchainStatus?.currentNode,
          syncStatus: blockchainStatus?.syncStatus,
          autoSyncEnabled: blockchainStatus?.autoSyncEnabled,
          failoverActive: blockchainStatus?.failoverActive,
          emergencyVoteCount: blockchainStatus?.emergencyVoteCount,
          robustMode: blockchainStatus?.robustMode,
          nodeHierarchy: blockchainStatus?.nodeHierarchy,
          electionState: blockchainStatus?.electionState,
          syncAllowed: blockchainStatus?.syncAllowed,
          noDataSincePause: blockchainStatus?.noDataSincePause,
          syncDataUpdated: blockchainStatus?.syncDataUpdated
        },
        dataSources: {
          candidates: 'MySQL Database',
          votes: 'ENHANCED DUAL-NODE BLOCKCHAIN (Auto-sync enabled)',
          timestamp: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poll-results-enhanced-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('success', 'Votes exported successfully with enhanced blockchain data');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Failed to export votes');
    }
  }, [candidates, totalVotes, pollSettings, blockchainStatus, showToast]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const getVotePercentage = useCallback((voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  }, []);

  const groupedCandidates = useMemo(() => {
    const grouped = candidates.reduce((acc, candidate) => {
      const position = candidate.position_name || candidate.position || 'Unknown Position';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {} as Record<string, Candidate[]>);

    const sortedPositions = positions.map(position => position.name);

    const sortedGrouped: Record<string, Candidate[]> = {};
    sortedPositions.forEach(position => {
      if (grouped[position]) {
        sortedGrouped[position] = grouped[position];
      }
    });

    Object.keys(grouped).forEach(position => {
      if (!sortedGrouped[position]) {
        sortedGrouped[position] = grouped[position];
      }
    });

    return sortedGrouped;
  }, [candidates, positions]);

  // Enhanced status indicators for auto-sync
  const StatusPill = ({ icon: Icon, text, variant = 'default' }: { icon: any, text: string, variant?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
    const variants = {
      success: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-500/10 text-amber-700 border-amber-200',
      error: 'bg-rose-500/10 text-rose-700 border-rose-200',
      info: 'bg-blue-500/10 text-blue-700 border-blue-200',
      default: 'bg-gray-500/10 text-gray-700 border-gray-200'
    };

    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${variants[variant]} backdrop-blur-sm`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }: { title: string, value: string | number, icon: any, color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo', trend?: string }) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Get sync status text
  const getSyncStatusText = () => {
    if (!blockchainStatus?.syncAllowed) {
      return blockchainStatus?.electionState?.status === 'finished' ? 'Sync Disabled (Election Finished)' : 'Sync Not Allowed';
    }
    if (blockchainStatus?.syncDataUpdated) return 'Auto-sync: Data Updated';
    if (blockchainStatus?.noDataSincePause) return 'Auto-sync: No Data Since Pause';
    if (blockchainStatus?.autoSyncEnabled) return 'Auto-sync: Active';
    return 'Auto-sync: Inactive';
  };

  // Get election state indicator
  const getElectionStateIcon = () => {
    const status = blockchainStatus?.electionState?.status;
    switch (status) {
      case 'voting': return { icon: Cloud, color: 'text-emerald-500', text: 'Voting Active' };
      case 'paused': return { icon: PauseCircle, color: 'text-amber-500', text: 'Paused' };
      case 'finished': return { icon: Shield, color: 'text-rose-500', text: 'Finished' };
      default: return { icon: AlertTriangle, color: 'text-gray-500', text: 'Not Started' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading enhanced DUAL-NODE poll monitor...</p>
        </div>
      </div>
    );
  }

  const electionStateInfo = getElectionStateIcon();

  // Get sync status variant for StatusPill
  const getSyncStatusVariant = () => {
    if (!blockchainStatus?.syncAllowed) {
      return 'warning';
    }
    if (blockchainStatus?.syncDataUpdated) return 'success';
    if (blockchainStatus?.noDataSincePause) return 'default';
    if (blockchainStatus?.autoSyncEnabled) return 'info';
    return 'default';
  };

  // Mobile-optimized ControlButtons component
  const ControlButtons = () => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
      >
        {refreshing ? (
          <LoadingSpinner size="sm" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {isSuperAdmin && (
        <button
          onClick={exportVotes}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors min-w-[100px] justify-center"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] justify-center">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="rounded text-blue-500 focus:ring-blue-500"
          disabled={isReadOnly}
        />
        <span className="hidden sm:inline">Auto-refresh</span>
      </label>

      <button
        onClick={toggleFullscreen}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-[100px] justify-center"
      >
        {isFullscreen ? (
          <>
            <Minimize className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </>
        ) : (
          <>
            <Maximize className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </>
        )}
      </button>
    </div>
  );

  // Modern candidate card - mobile optimized
  const CandidateCard = ({ candidate, totalVotes }: {
    candidate: Candidate,
    totalVotes: number
  }) => {
    const voteCount = candidate.vote_count || 0;
    const percentage = getVotePercentage(voteCount, totalVotes || 0);

    return (
      <div className="bg-white rounded-xl p-3 border-2 border-gray-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {candidate.name}
              </h4>
              <p className="text-gray-600 text-xs truncate">{candidate.party}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Votes</span>
            <span className="font-bold text-gray-900">{voteCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Percentage</span>
            <span className="font-bold text-gray-900">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-3 lg:p-6">
      {/* Modern Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                  {isReadOnly ? (
                    <Eye className="w-5 h-5 lg:w-6 lg:h-6" />
                  ) : (
                    <Monitor className="w-5 h-5 lg:w-6 lg:h-6" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                    {isReadOnly ? 'Poll Monitor' : 'Poll Monitor'}
                  </h1>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                      Enhanced Dual-Node Blockchain
                    </span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      Auto-sync: {blockchainStatus?.autoSyncEnabled ? 'ON' : 'OFF'}
                    </span>
                    {isReadOnly && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        View Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <StatusPill
                  icon={electionStateInfo.icon}
                  text={electionStateInfo.text}
                  variant={blockchainStatus?.electionState?.status === 'voting' ? 'success' : 
                         blockchainStatus?.electionState?.status === 'paused' ? 'warning' : 
                         blockchainStatus?.electionState?.status === 'finished' ? 'error' : 'default'}
                />
                <StatusPill
                  icon={Shield}
                  text={blockchainStatus?.isConnected ? 'Blockchain Online' : 'Blockchain Offline'}
                  variant={blockchainStatus?.isConnected ? 'success' : 'error'}
                />
                <StatusPill
                  icon={RotateCw}
                  text={getSyncStatusText()}
                  variant={getSyncStatusVariant()}
                />
                <StatusPill
                  icon={Server}
                  text={`${blockchainStatus?.connectedNodes || 0}/${blockchainStatus?.totalNodes || 0} Nodes Connected`}
                  variant={blockchainStatus?.connectedNodes === blockchainStatus?.totalNodes ? 'success' : 
                         blockchainStatus?.connectedNodes === 0 ? 'error' : 'warning'}
                />
              </div>
              <ControlButtons />
            </div>

            {/* Mobile Controls Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill
                      icon={electionStateInfo.icon}
                      text={electionStateInfo.text}
                      variant={blockchainStatus?.electionState?.status === 'voting' ? 'success' : 
                             blockchainStatus?.electionState?.status === 'paused' ? 'warning' : 
                             blockchainStatus?.electionState?.status === 'finished' ? 'error' : 'default'}
                    />
                    <StatusPill
                      icon={Shield}
                      text={blockchainStatus?.isConnected ? 'Online' : 'Offline'}
                      variant={blockchainStatus?.isConnected ? 'success' : 'error'}
                    />
                    <StatusPill
                      icon={RotateCw}
                      text={getSyncStatusText()}
                      variant={getSyncStatusVariant()}
                    />
                    <StatusPill
                      icon={Server}
                      text={`${blockchainStatus?.connectedNodes || 0}/${blockchainStatus?.totalNodes || 0} Nodes Connected`}
                      variant={blockchainStatus?.connectedNodes === blockchainStatus?.totalNodes ? 'success' : 
                             blockchainStatus?.connectedNodes === 0 ? 'error' : 'warning'}
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <ControlButtons />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <StatCard
            title="Total Votes"
            value={totalVotes || 0}
            icon={Vote}
            color="blue"
            trend="Blockchain"
          />
          <StatCard
            title="Candidates"
            value={candidates.length || 0}
            icon={Users}
            color="green"
            trend="MySQL"
          />
          <StatCard
            title="Active Storage"
            value={blockchainStatus?.emergencyVoteCount || 0}
            icon={HardDrive}
            color="purple"
            trend="Encrypted"
          />
          <StatCard
            title="Current Node"
            value={currentNode || 'none'}
            icon={Server}
            color="indigo"
            trend={`${blockchainStatus?.connectedNodes || 0} connected`}
          />
        </div>

        {/* Results by Position */}
        <div className="space-y-4 lg:space-y-6">
          {Object.entries(groupedCandidates).map(([position, positionCandidates]) => {
            const sortedCandidates = positionCandidates.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

            return (
              <div key={position} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">{position}</h2>
                </div>

                {/* Responsive candidate grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
                  {sortedCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      totalVotes={totalVotes}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {candidates.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-12 text-center border border-gray-200 shadow-sm">
            <AlertTriangle className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">
              No active candidates are available in the database. Please check if candidates exist and are marked as active.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4 lg:py-6">
          <div className="text-xs lg:text-sm text-gray-500 space-y-2">
            <div>Last updated: {new Date().toLocaleString()}</div>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${blockchainStatus?.isConnected ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'}`}>
                {blockchainStatus?.isConnected ? 'Connected' : 'Offline'}
              </span>
              <span className="bg-gray-500/10 text-gray-600 px-2 py-1 rounded-full">
                Node: {currentNode || 'none'}
              </span>
              <span className={`px-2 py-1 rounded-full ${blockchainStatus?.autoSyncEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-600'}`}>
                Auto-sync: {blockchainStatus?.autoSyncEnabled ? 'ON' : 'OFF'}
              </span>
              <span className={`px-2 py-1 rounded-full ${blockchainStatus?.syncAllowed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                Sync: {blockchainStatus?.syncAllowed ? 'Allowed' : 'Blocked'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 z-50 overflow-auto">
        {/* Fullscreen Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3 lg:p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                  <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <h1 className="text-base lg:text-lg font-bold text-gray-900">
                    {isReadOnly ? 'Poll Monitor' : 'Poll Monitor'} - Fullscreen
                  </h1>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-700 rounded-full text-xs">
                      Auto-sync: {blockchainStatus?.autoSyncEnabled ? 'ON' : 'OFF'}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs">
                      Node: {currentNode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex items-center space-x-2">
                  <StatusPill
                    icon={electionStateInfo.icon}
                    text={electionStateInfo.text}
                    variant={blockchainStatus?.electionState?.status === 'voting' ? 'success' : 
                           blockchainStatus?.electionState?.status === 'paused' ? 'warning' : 
                           blockchainStatus?.electionState?.status === 'finished' ? 'error' : 'default'}
                  />
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={exportVotes}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Minimize className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div className="p-3 lg:p-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default PollMonitor;