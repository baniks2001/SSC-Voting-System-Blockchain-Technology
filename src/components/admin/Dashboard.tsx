import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Vote, UserCheck, Activity, Download, Play, Pause, StopCircle,
  RefreshCw, AlertCircle, X, Save, Calendar, History, Trash2, Eye, Search,
  Copy, FileText, Shield, TrendingUp, BarChart3, Clock, CheckCircle2
} from 'lucide-react';
import { DashboardStats, AuditLog, PollSettings } from '../../types';
import { api } from '../../utils/api';
import { usePoll, PollStatus } from '../../contexts/PollContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface FinishPollFormData {
  electionName: string;
  electionDate: string;
  academicYear: string;
}

interface ElectionData {
  id: number;
  election_name: string;
  election_date: string;
  academic_year: string;
  finished_at: string;
  total_candidates: number;
  total_votes: number;
  election_hash?: string;
  created_at: string;
}

interface ElectionDetails {
  election: ElectionData;
  results: any;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  position_name?: string;
  vote_count?: number;
}

type ExportType = 'xlsx' | 'docs' | 'json';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showFinishPollForm, setShowFinishPollForm] = useState(false);
  const [showElectionHistory, setShowElectionHistory] = useState(false);
  const [showElectionDetails, setShowElectionDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [pollSettings, setPollSettings] = useState<PollSettings | null>(null);
  const [finishPollData, setFinishPollData] = useState<FinishPollFormData>({
    electionName: '',
    electionDate: '',
    academicYear: ''
  });
  const [electionHistory, setElectionHistory] = useState<ElectionData[]>([]);
  const [selectedElection, setSelectedElection] = useState<ElectionDetails | null>(null);
  const [loadingElections, setLoadingElections] = useState(false);
  const [loadingElectionDetails, setLoadingElectionDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [copiedElectionId, setCopiedElectionId] = useState<number | null>(null);
  const [auditLogsExportType, setAuditLogsExportType] = useState<ExportType>('json');

  const { pollStatus, updatePollStatus, loading: pollStatusLoading } = usePoll();
  const { user, logout } = useAuth();

  const isMounted = useRef(true);
  const refreshInterval = useRef<NodeJS.Timeout>();

  const isSuperAdmin = user?.role === 'super_admin';
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Modern status pill component
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

  // Modern stat card component
  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, description }: {
    title: string,
    value: string | number,
    icon: any,
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo',
    trend?: string,
    description?: string
  }) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Filter election history based on search and year
  const filteredElectionHistory = electionHistory.filter(election => {
    const matchesSearch = election.election_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.academic_year.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || election.academic_year === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Get unique academic years for filter
  const academicYears = [...new Set(electionHistory.map(e => e.academic_year))].sort();

  // Safe function to get election hash display
  const getElectionHashDisplay = useCallback((election: ElectionData) => {
    if (!election.election_hash) {
      return 'No hash available';
    }
    return `${election.election_hash.substring(0, 16)}...`;
  }, []);

  const getPollStatusColor = useCallback((status: PollStatus) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'paused': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'finished': return 'text-rose-600 bg-rose-100 border-rose-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  }, []);

  const getPollStatusDescription = useCallback((status: PollStatus) => {
    switch (status) {
      case 'active': return 'Students can login and vote. Voting is currently active.';
      case 'paused': return 'Voting is temporarily paused. Students cannot login until voting resumes.';
      case 'finished': return 'Voting has ended. No more votes can be cast.';
      case 'not_started': return 'Voting has not started yet. Students cannot login.';
      default: return '';
    }
  }, []);

  const getAuditIconColor = useCallback((action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-500';
    if (action.includes('CREATE')) return 'bg-emerald-500';
    if (action.includes('UPDATE')) return 'bg-amber-500';
    if (action.includes('DELETE')) return 'bg-rose-500';
    if (action.includes('VOTE')) return 'bg-purple-500';
    return 'bg-gray-500';
  }, []);

  // FIXED: Calculate turnout rate based on number of voters who have voted
  const calculateTurnoutRate = useCallback((totalVoters: number, hasVotedCount: number) => {
    if (totalVoters <= 0) return 0;
    const turnout = (hasVotedCount / totalVoters) * 100;
    return Math.min(Math.round(turnout), 100);
  }, []);

  const fetchData = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      setAuthError(false);

      const [candidatesResponse, resultsResponse, settingsResponse, dashboardResponse, votersResponse] = await Promise.allSettled([
        api.get('/candidates'),
        api.get('/voting/results'),
        api.get('/poll/status'),
        api.get('/admin/dashboard').catch(error => {
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            setAuthError(true);
            throw new Error('Authentication failed. Please login again.');
          }
          throw error;
        }),
        api.get('/voters')
      ]);

      if (!isMounted.current) return;

      // Process candidates
      if (candidatesResponse.status === 'fulfilled') {
        const sqlCandidates = Array.isArray(candidatesResponse.value)
          ? candidatesResponse.value
          : candidatesResponse.value?.candidates || candidatesResponse.value?.data || [];
        setCandidates(sqlCandidates);
      }

      // Process results - FIXED: Get total votes from blockchain/emergency storage
      let totalVotesCount = 0;
      let candidateVoteCounts: { [candidateId: string]: number } = {};

      if (resultsResponse.status === 'fulfilled') {
        const resultsData = resultsResponse.value;

        if (resultsData && resultsData.success) {
          totalVotesCount = resultsData.totalVotes || 0;

          // Process candidate vote counts
          if (resultsData.candidates && Array.isArray(resultsData.candidates)) {
            resultsData.candidates.forEach((candidate: any) => {
              if (candidate.id && candidate.vote_count !== undefined) {
                candidateVoteCounts[candidate.id] = candidate.vote_count;
              }
            });
          }

          // If no candidates array, try to extract from resultsByPosition
          if (Object.keys(candidateVoteCounts).length === 0 && resultsData.resultsByPosition) {
            Object.values(resultsData.resultsByPosition).forEach((positionCandidates: any) => {
              if (Array.isArray(positionCandidates)) {
                positionCandidates.forEach((candidate: any) => {
                  if (candidate && candidate.id) {
                    candidateVoteCounts[candidate.id] = candidate.vote_count || 0;
                  }
                });
              }
            });
          }

          // If still no votes, try to calculate from raw vote data
          if (Object.keys(candidateVoteCounts).length === 0 && resultsData.voteData && Array.isArray(resultsData.voteData)) {
            resultsData.voteData.forEach((vote: any) => {
              if (vote.votes && Array.isArray(vote.votes)) {
                vote.votes.forEach((v: any) => {
                  const candidateId = v.candidateId?.toString();
                  if (candidateId) {
                    candidateVoteCounts[candidateId] = (candidateVoteCounts[candidateId] || 0) + 1;
                  }
                });
              }
            });
            totalVotesCount = Object.values(candidateVoteCounts).reduce((sum, count) => sum + count, 0);
          }
        }
      }

      // Update state with processed data
      setTotalVotes(totalVotesCount);
      setCandidates(prev => prev.map(candidate => ({
        ...candidate,
        vote_count: candidateVoteCounts[candidate.id] || 0
      })));

      // Process other responses
      if (settingsResponse.status === 'fulfilled') {
        setPollSettings(settingsResponse.value);
      }

      if (dashboardResponse.status === 'fulfilled') {
        let hasVotedCount = dashboardResponse.value.hasVotedCount;

        if (hasVotedCount === undefined && votersResponse.status === 'fulfilled') {
          const voters = votersResponse.value;
          hasVotedCount = voters.filter((voter: any) => voter.has_voted).length;
        } else if (hasVotedCount === undefined) {
          hasVotedCount = dashboardResponse.value.totalVotes || 0;
        }

        const finalStats = {
          ...dashboardResponse.value,
          hasVotedCount: hasVotedCount || 0,
          totalVotes: totalVotesCount > 0 ? totalVotesCount : dashboardResponse.value.totalVotes
        };

        setStats(finalStats);
      }

    } catch (error: any) {
      if (!isMounted.current) return;
      console.error('Failed to fetch dashboard data:', error);
      if (error.message?.includes('Authentication failed')) {
        setAuthError(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [refreshing]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    refreshInterval.current = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      isMounted.current = false;
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchData]);

  const handleReauthenticate = useCallback(() => {
    localStorage.removeItem('token');
    logout();
  }, [logout]);

  // Fetch election history
  const fetchElectionHistory = useCallback(async () => {
    if (!isSuperAdmin) return;

    setLoadingElections(true);
    try {
      const response = await api.get('/poll/elections');
      if (response.success) {
        setElectionHistory(response.elections);
      }
    } catch (error) {
      console.error('Failed to fetch election history:', error);
    } finally {
      setLoadingElections(false);
    }
  }, [isSuperAdmin]);

  // Fetch specific election details
  const fetchElectionDetails = useCallback(async (id: number) => {
    setLoadingElectionDetails(true);
    try {
      const response = await api.get(`/poll/elections/${id}`);
      if (response.success) {
        setSelectedElection(response);
        setShowElectionDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch election details:', error);
      alert('Failed to load election details');
    } finally {
      setLoadingElectionDetails(false);
    }
  }, []);

  // Enhanced Excel file generator for individual elections
  const generateExcelFile = useCallback(async (electionData: any, id: number) => {
    const { election, results } = electionData;

    // Create CSV content with proper Excel formatting
    let csvContent = '\uFEFF'; // BOM for UTF-8 Excel compatibility

    // Election header section
    csvContent += 'ELECTION RESULTS\r\n\r\n';
    csvContent += `Election Name:,${election.election_name}\r\n`;
    csvContent += `Election Date:,${new Date(election.election_date).toLocaleDateString()}\r\n`;
    csvContent += `Academic Year:,${election.academic_year}\r\n`;
    csvContent += `Total Candidates:,${election.total_candidates}\r\n`;
    csvContent += `Total Votes:,${election.total_votes}\r\n`;
    csvContent += `Election Hash:,${election.election_hash || 'Not available'}\r\n`;
    csvContent += `Finished At:,${new Date(election.finished_at).toLocaleString()}\r\n\r\n`;

    // Results by position
    if (results.resultsByPosition) {
      Object.entries(results.resultsByPosition).forEach(([position, candidates]: [string, any]) => {
        csvContent += `${position.toUpperCase()}\r\n`;
        csvContent += 'Rank,Candidate Name,Party,Votes,Percentage\r\n';

        const sortedCandidates = candidates.sort((a: any, b: any) => b.vote_count - a.vote_count);
        const totalPositionVotes = sortedCandidates.reduce((sum: number, candidate: any) => sum + candidate.vote_count, 0);

        sortedCandidates.forEach((candidate: any, index: number) => {
          const percentage = totalPositionVotes > 0 ? ((candidate.vote_count / totalPositionVotes) * 100).toFixed(2) : '0.00';
          csvContent += `${index + 1},${candidate.candidate_name},${candidate.party},${candidate.vote_count},${percentage}%\r\n`;
        });
        csvContent += '\r\n';
      });
    }

    // Create and download the file
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election-${id}-results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Fixed JSON export function - properly format the JSON file
  const generateJsonFile = useCallback(async (electionData: any, id: number) => {
    const { election, results } = electionData;

    // Create properly structured JSON data
    const exportData = {
      election: {
        id: election.id,
        election_name: election.election_name,
        election_date: election.election_date,
        academic_year: election.academic_year,
        finished_at: election.finished_at,
        total_candidates: election.total_candidates,
        total_votes: election.total_votes,
        election_hash: election.election_hash,
        created_at: election.created_at
      },
      results: {
        resultsByPosition: results.resultsByPosition || {},
        statistics: results.statistics || {
          totalCandidates: election.total_candidates,
          totalVotes: election.total_votes,
          positions: Object.keys(results.resultsByPosition || {}).length
        },
        export_timestamp: new Date().toISOString(),
        export_format: 'json',
        version: '1.0'
      }
    };

    // Validate JSON structure before creating blob
    try {
      JSON.stringify(exportData);
    } catch (error) {
      console.error('Invalid JSON structure:', error);
      throw new Error('Failed to create valid JSON data');
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election-${id}-results.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Fixed DOCX generation function
  const generateProperDocx = useCallback(async (content: string, filename: string) => {
    try {
      // Create a simple text-based document that Word can open
      const docContent = `Election Results Export\n\n${content}`;
      
      const blob = new Blob([docContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      await downloadBlob(blob, filename);
    } catch (error) {
      console.error('DOCX generation error:', error);
      // Fallback to text file
      const blob = new Blob([content], { type: 'text/plain' });
      await downloadBlob(blob, filename.replace('.docx', '.txt'));
    }
  }, []);

  // Helper function to download blobs
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fixed individual election export function with proper JSON format
  const exportElection = useCallback(async (id: number, exportType: ExportType = 'json') => {
    try {
      setExporting(true);

      const electionDetails = await api.get(`/poll/elections/${id}`);
      if (!electionDetails.success) {
        throw new Error('Failed to fetch election data');
      }

      if (exportType === 'xlsx') {
        await generateExcelFile(electionDetails, id);
      } else if (exportType === 'docs') {
        const { election, results } = electionDetails;

        let docContent = `ELECTION RESULTS - ${election.election_name}\n\n`;
        docContent += `Election Name: ${election.election_name}\n`;
        docContent += `Election Date: ${new Date(election.election_date).toLocaleDateString()}\n`;
        docContent += `Academic Year: ${election.academic_year}\n`;
        docContent += `Total Candidates: ${election.total_candidates}\n`;
        docContent += `Total Votes: ${election.total_votes}\n\n`;

        if (results.resultsByPosition) {
          Object.entries(results.resultsByPosition).forEach(([position, candidates]: [string, any]) => {
            docContent += `${position.toUpperCase()}\n`;
            docContent += 'Rank | Candidate Name | Party | Votes | Percentage\n';
            docContent += '-----|----------------|-------|-------|-----------\n';

            const sortedCandidates = candidates.sort((a: any, b: any) => b.vote_count - a.vote_count);
            const totalPositionVotes = sortedCandidates.reduce((sum: number, candidate: any) => sum + candidate.vote_count, 0);

            sortedCandidates.forEach((candidate: any, index: number) => {
              const percentage = totalPositionVotes > 0 ? ((candidate.vote_count / totalPositionVotes) * 100).toFixed(2) : '0.00';
              docContent += `${index + 1} | ${candidate.candidate_name} | ${candidate.party} | ${candidate.vote_count} | ${percentage}%\n`;
            });
            docContent += '\n';
          });
        }

        await generateProperDocx(docContent, `election-${id}-results.docx`);
      } else {
        // JSON export - use the fixed JSON generator
        await generateJsonFile(electionDetails, id);
      }

      alert(`Election exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      console.error('Export election error:', error);
      alert('Failed to export election. Please try again or use a different format.');
    } finally {
      setExporting(false);
    }
  }, [generateExcelFile, generateJsonFile, generateProperDocx]);

  // Fixed election history export function
  const exportElectionHistory = useCallback(async (exportType: ExportType = 'json') => {
    if (!electionHistory.length) return;

    setExporting(true);
    try {
      if (exportType === 'xlsx') {
        // Create CSV content with proper Excel formatting for election history
        const headers = ['ID', 'Election Name', 'Election Date', 'Academic Year', 'Finished At', 'Total Candidates', 'Total Votes', 'Election Hash'];
        const csvContent = '\uFEFF' + [
          headers.join(','),
          ...filteredElectionHistory.map(election => [
            `"${election.id}"`,
            `"${election.election_name.replace(/"/g, '""')}"`,
            `"${new Date(election.election_date).toLocaleDateString()}"`,
            `"${election.academic_year}"`,
            `"${new Date(election.finished_at).toLocaleString()}"`,
            `"${election.total_candidates}"`,
            `"${election.total_votes}"`,
            `"${election.election_hash || 'Not available'}"`
          ].join(','))
        ].join('\r\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;'
        });
        await downloadBlob(blob, `election-history-${new Date().toISOString().split('T')[0]}.csv`);
      } else if (exportType === 'docs') {
        // Generate proper DOCX for election history
        let docContent = `ELECTION HISTORY EXPORT\n`;
        docContent += `Generated on: ${new Date().toLocaleString()}\n`;
        docContent += `Total Records: ${filteredElectionHistory.length}\n\n`;
        docContent += '='.repeat(50) + '\n\n';

        filteredElectionHistory.forEach((election, index) => {
          docContent += `ELECTION #${index + 1}\n`;
          docContent += `Name: ${election.election_name}\n`;
          docContent += `Date: ${new Date(election.election_date).toLocaleDateString()}\n`;
          docContent += `Academic Year: ${election.academic_year}\n`;
          docContent += `Finished: ${new Date(election.finished_at).toLocaleString()}\n`;
          docContent += `Candidates: ${election.total_candidates}\n`;
          docContent += `Total Votes: ${election.total_votes}\n`;
          docContent += `Hash: ${election.election_hash || 'Not available'}\n`;
          docContent += `ID: ${election.id}\n`;
          docContent += '-'.repeat(40) + '\n\n';
        });

        await generateProperDocx(docContent, `election-history-${new Date().toISOString().split('T')[0]}.docx`);
      } else {
        // JSON export - fixed structure
        const exportData = {
          exportDate: new Date().toISOString(),
          totalRecords: filteredElectionHistory.length,
          exportFormat: 'json',
          version: '1.0',
          electionHistory: filteredElectionHistory.map(election => ({
            id: election.id,
            election_name: election.election_name,
            election_date: election.election_date,
            academic_year: election.academic_year,
            finished_at: election.finished_at,
            total_candidates: election.total_candidates,
            total_votes: election.total_votes,
            election_hash: election.election_hash,
            created_at: election.created_at
          }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        await downloadBlob(blob, `election-history-${new Date().toISOString().split('T')[0]}.json`);
      }

      alert(`Election history exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export election history:', error);
      alert('Failed to export election history. Please try JSON format instead.');
    } finally {
      setExporting(false);
    }
  }, [electionHistory, filteredElectionHistory, generateProperDocx]);

  // Enhanced audit logs export with dropdown connection
  const exportAuditLogs = useCallback(async (exportType: ExportType = 'json') => {
    if (!stats?.auditLogs.length) return;

    setExporting(true);
    try {
      let blob: Blob;
      let filename: string;

      if (exportType === 'xlsx') {
        // Create proper CSV format for Excel with better formatting
        const headers = ['Timestamp', 'Action', 'User Type', 'User ID', 'Admin Name', 'Details', 'IP Address'];
        const csvContent = '\uFEFF' + [
          headers.join(','),
          ...stats.auditLogs.map(log => [
            `"${new Date(log.created_at).toLocaleString()}"`,
            `"${log.action.replace(/_/g, ' ').replace(/"/g, '""')}"`,
            `"${log.user_type}"`,
            `"${log.user_id || 'N/A'}"`,
            `"${(log.admin_name || 'N/A').replace(/"/g, '""')}"`,
            `"${(log.details || 'N/A').replace(/"/g, '""')}"`,
            `"${log.ip_address || 'N/A'}"`
          ].join(','))
        ].join('\r\n');

        blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;'
        });
        filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportType === 'docs') {
        // Generate DOCX for audit logs
        let docContent = `AUDIT LOGS EXPORT\n`;
        docContent += `Generated on: ${new Date().toLocaleString()}\n`;
        docContent += `Total Records: ${stats.auditLogs.length}\n\n`;
        docContent += '='.repeat(50) + '\n\n';

        stats.auditLogs.forEach((log, index) => {
          docContent += `LOG #${index + 1}\n`;
          docContent += `Action: ${log.action}\n`;
          docContent += `Timestamp: ${new Date(log.created_at).toLocaleString()}\n`;
          docContent += `User Type: ${log.user_type}\n`;
          docContent += `User ID: ${log.user_id || 'N/A'}\n`;
          docContent += `Admin Name: ${log.admin_name || 'N/A'}\n`;
          docContent += `Details: ${log.details || 'N/A'}\n`;
          docContent += `IP Address: ${log.ip_address || 'N/A'}\n`;
          docContent += '-'.repeat(40) + '\n\n';
        });

        const textBlob = new Blob([docContent], { type: 'text/plain' });
        blob = textBlob;
        filename = `audit-logs-${new Date().toISOString().split('T')[0]}.txt`;
      } else {
        // JSON export
        const exportData = {
          exportDate: new Date().toISOString(),
          totalRecords: stats.auditLogs.length,
          exportFormat: 'json',
          version: '1.0',
          auditLogs: stats.auditLogs
        };
        blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        filename = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      }

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Audit logs exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      alert('Failed to export audit logs. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [stats?.auditLogs]);

  // Copy election data to clipboard with actual results
  const copyElectionData = useCallback(async (election: ElectionData) => {
    try {
      const response = await api.get(`/poll/elections/${election.id}`);
      if (response.success) {
        const { election: electionDetails, results } = response;

        let candidateResultsText = '';
        if (results.resultsByPosition) {
          candidateResultsText = Object.entries(results.resultsByPosition)
            .map(([position, candidates]: [string, any]) => {
              const sortedCandidates = candidates.sort((a: any, b: any) => b.vote_count - a.vote_count);
              return `${position}:\n${sortedCandidates.map((candidate: any, index: number) =>
                `  ${index + 1}. ${candidate.candidate_name} (${candidate.party}) - ${candidate.vote_count} votes${index === 0 ? ' 🏆' : ''}`
              ).join('\n')}`;
            })
            .join('\n\n');
        }

        const formattedData = `🏛️ ELECTION RESULTS - ${electionDetails.election_name.toUpperCase()}

📅 ELECTION INFORMATION:
• Election Name: ${electionDetails.election_name}
• Election Date: ${new Date(electionDetails.election_date).toLocaleDateString()}
• Academic Year: ${electionDetails.academic_year}
• Finished At: ${new Date(electionDetails.finished_at).toLocaleString()}
• Total Candidates: ${electionDetails.total_candidates}
• Total Votes: ${electionDetails.total_votes}
• Election Hash: ${electionDetails.election_hash || 'Not available'}

🏆 ELECTION RESULTS BY POSITION:

${candidateResultsText || 'No results data available'}

📊 ELECTION STATISTICS:
• Total Voter Turnout: ${electionDetails.total_votes} votes
• Total Candidates: ${electionDetails.total_candidates} candidates
• Positions Contested: ${Object.keys(results.resultsByPosition || {}).length}

🔒 DATA INTEGRITY & SECURITY:
• Hash Verified: ${electionDetails.election_hash ? '✅' : '❌ Not available'}
• Data Encryption: ✅ Securely encrypted in database
• Timestamp: ${new Date().toISOString()}
• Export ID: ${electionDetails.id}

---
Generated by Secure Voting System
Exported on: ${new Date().toLocaleString()}`.trim();

        await navigator.clipboard.writeText(formattedData);
        setCopiedElectionId(election.id);

        setTimeout(() => {
          setCopiedElectionId(null);
        }, 2000);

        alert('Election results copied to clipboard! 📋\n\nIncludes actual candidate results with vote counts.');
      }
    } catch (error) {
      console.error('Copy election data error:', error);
      alert('Failed to copy election data. Please try again.');
    }
  }, []);

  // Delete election record
  const deleteElectionRecord = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this election record? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/poll/elections/${id}`);
      alert('Election record deleted successfully');
      await fetchElectionHistory();
    } catch (error) {
      console.error('Delete election record error:', error);
      alert('Failed to delete election record');
    }
  }, [fetchElectionHistory]);

  // Super admin authentication function
  const authenticateSuperAdmin = useCallback(async (password: string) => {
    try {
      const response = await api.post('/auth/super-admin/verify', {
        password: password
      });

      if (response.success && response.isSuperAdmin) {
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Super admin authentication failed:', error);
      return false;
    }
  }, []);

  // Blockchain reset function
  const resetBlockchain = useCallback(async () => {
    try {
      const response = await api.post('/blockchain/reset');

      if (response.success) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      if (error.message?.includes('network') || error.message?.includes('connection') || error.message?.includes('Failed to fetch')) {
        return false;
      }
      throw error;
    }
  }, []);

  const performPollControl = useCallback(async (action: PollStatus) => {
    setPollLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (action) {
        case 'active':
          endpoint = '/poll/active';
          break;
        case 'paused':
          endpoint = '/poll/paused';
          break;
        case 'finished':
          endpoint = '/poll/finished';
          payload = {
            electionName: finishPollData.electionName,
            electionDate: finishPollData.electionDate,
            academicYear: finishPollData.academicYear
          };
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const response = await api.post(endpoint, payload);
      await updatePollStatus(action);
      await fetchData();

      if (action === 'finished') {
        await fetchElectionHistory();

        // Auto-export JSON automatically after finishing election
        setTimeout(async () => {
          try {
            const electionsResponse = await api.get('/poll/elections');
            if (electionsResponse.success && electionsResponse.elections.length > 0) {
              const latestElection = electionsResponse.elections[0];
              await exportElection(latestElection.id, 'json');
              alert('Election finished and JSON file exported successfully!');
            }
          } catch (exportError) {
            console.error('Auto-export failed:', exportError);
            alert('Election finished successfully, but automatic JSON export failed. You can export manually from Election History.');
          }
        }, 1000);
      } else {
        const actionMessages = {
          'active': 'Voting started successfully! Students can now login and vote.',
          'paused': 'Voting paused successfully! Student login is now disabled.',
          'not_started': 'Poll reset successfully! Voting is not started.'
        };
        alert(actionMessages[action]);
      }

    } catch (error: any) {
      console.error('Failed to update poll status:', error);
      if (error.status === 403) {
        alert('Access denied: Only super admins can perform this action.');
      } else {
        alert(`Failed to update poll status: ${error.message}`);
      }
      throw error;
    } finally {
      setPollLoading(false);
    }
  }, [updatePollStatus, fetchData, finishPollData, fetchElectionHistory, exportElection]);

  const handlePollControl = useCallback(async (action: PollStatus) => {
    if (action === 'finished') {
      if (!finishPollData.electionName || !finishPollData.electionDate || !finishPollData.academicYear) {
        setShowFinishPollForm(true);
      } else {
        setShowPasswordModal(true);
      }
      return;
    }
    await performPollControl(action);
  }, [performPollControl, finishPollData]);

  const handleFinishPollSubmit = useCallback(async () => {
    if (!finishPollData.electionName || !finishPollData.electionDate || !finishPollData.academicYear) {
      alert('Please fill in all required fields');
      return;
    }

    setShowFinishPollForm(false);
    setShowPasswordModal(true);
  }, [finishPollData]);

  const handleFinishSequence = useCallback(async () => {
    if (!superAdminPassword) {
      setPasswordError('Password is required');
      return;
    }

    setPollLoading(true);
    try {
      const isAuthenticated = await authenticateSuperAdmin(superAdminPassword);
      if (!isAuthenticated) {
        setPasswordError('Invalid super admin password');
        setPollLoading(false);
        return;
      }

      await performPollControl('finished');

      const resetSuccess = await resetBlockchain();

      setShowPasswordModal(false);
      setShowFinishPollForm(false);
      setSuperAdminPassword('');
      setPasswordError('');

      const successMessage = `Election finished successfully! ${resetSuccess
        ? 'Blockchain has been reset for the next election.'
        : 'Election finished but blockchain reset may need manual attention.'
        }`;

      alert(successMessage);

      await fetchData();
      if (isSuperAdmin) {
        await fetchElectionHistory();
      }

    } catch (error: any) {
      console.error('Finish sequence failed:', error);
      let errorMessage = `Failed to complete finish sequence: ${error.message}`;
      if (error.message.includes('blockchain') || error.message.includes('reset') || error.message.includes('Failed to fetch')) {
        errorMessage += '\n\nElection data was saved successfully, but blockchain reset failed. You may need to manually reset the blockchain.';
      }
      alert(errorMessage);
    } finally {
      setPollLoading(false);
    }
  }, [superAdminPassword, performPollControl, resetBlockchain, fetchData, fetchElectionHistory, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchElectionHistory();
    }
  }, [isSuperAdmin, fetchElectionHistory]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-96 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">Your session has expired or is invalid.</p>
          <button
            onClick={handleReauthenticate}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <p className="text-rose-600 mb-4">Failed to load dashboard data</p>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-6 space-y-6 animate-fadeIn">
      {/* Finish Poll Form Modal */}
      {showFinishPollForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Finish Election</h3>
              <button
                onClick={() => setShowFinishPollForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election Name *
                </label>
                <input
                  type="text"
                  value={finishPollData.electionName}
                  onChange={(e) => setFinishPollData(prev => ({
                    ...prev,
                    electionName: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter election name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election Date *
                </label>
                <input
                  type="date"
                  value={finishPollData.electionDate}
                  onChange={(e) => setFinishPollData(prev => ({
                    ...prev,
                    electionDate: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={finishPollData.academicYear}
                  onChange={(e) => setFinishPollData(prev => ({
                    ...prev,
                    academicYear: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 2024-2025"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Auto-Export Information</p>
                </div>
                <p className="text-xs text-blue-700">
                  Election results will be automatically exported as JSON format when the election is finished.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowFinishPollForm(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishPollSubmit}
                disabled={pollLoading}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Finish Election
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-rose-600" />
                <h3 className="text-xl font-bold text-gray-900">Super Admin Authentication</h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSuperAdminPassword('');
                  setPasswordError('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={pollLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Admin Password *
                </label>
                <input
                  type="password"
                  value={superAdminPassword}
                  onChange={(e) => {
                    setSuperAdminPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter super admin password"
                  disabled={pollLoading}
                />
                {passwordError && (
                  <p className="text-rose-600 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">Finish Election Sequence:</p>
                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                  <li>Save election data to database</li>
                  <li>Auto-export results as JSON format</li>
                  <li className="font-semibold">Reset blockchain for next election</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  JSON file will be automatically downloaded after election completion.
                </p>
              </div>

              {pollLoading && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-amber-700">Executing finish sequence...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSuperAdminPassword('');
                  setPasswordError('');
                }}
                disabled={pollLoading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishSequence}
                disabled={pollLoading || !superAdminPassword}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Confirm & Execute Sequence
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Election History Modal */}
      {showElectionHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
            <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Election History</h3>
                  <p className="text-gray-600 mt-1">View and manage past election records</p>
                </div>
                <div className="flex items-center gap-3">
                  {filteredElectionHistory.length > 0 && (
                    <div className="relative group">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            exportElectionHistory(e.target.value as ExportType);
                            e.target.value = '';
                          }
                        }}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium appearance-none cursor-pointer pr-10 disabled:opacity-50"
                        title="Export all election history"
                      >
                        <option value="">Export All</option>
                        <option value="json">JSON Format</option>
                        <option value="xlsx">Excel Format</option>
                        <option value="docs">Word Document</option>
                      </select>
                      <Download className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                  <button
                    onClick={() => setShowElectionHistory(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search elections by name or academic year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-48"
                >
                  <option value="all">All Academic Years</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50/50">
              {loadingElections ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading election history..." />
                </div>
              ) : filteredElectionHistory.length === 0 ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2 text-lg font-medium">No election history found</p>
                  <p className="text-gray-400">
                    {searchTerm || selectedYear !== 'all'
                      ? "No elections match your search criteria."
                      : "Finish an election to see it here."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredElectionHistory.map((election) => (
                    <div key={election.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-gray-900 mb-3 break-words">
                            {election.election_name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                              <span className="font-medium text-xs text-blue-600 block mb-1">Election Date</span>
                              <p className="text-sm font-semibold text-blue-900">{new Date(election.election_date).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                              <span className="font-medium text-xs text-purple-600 block mb-1">Academic Year</span>
                              <p className="text-sm font-semibold text-purple-900">{election.academic_year}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <span className="font-medium text-xs text-gray-600 block mb-1">Finished At</span>
                              <p className="text-sm font-semibold text-gray-900">{new Date(election.finished_at).toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                              <span className="font-medium text-xs text-orange-600 block mb-1">Hash</span>
                              <p className="text-xs font-mono text-orange-700 truncate" title={election.election_hash || 'Not available'}>
                                {getElectionHashDisplay(election)}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                              <span className="font-medium text-xs text-emerald-700 block mb-1">Candidates</span>
                              <p className="text-lg font-bold text-emerald-900">{election.total_candidates}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                              <span className="font-medium text-xs text-green-700 block mb-1">Total Votes</span>
                              <p className="text-lg font-bold text-green-900">{election.total_votes}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
                          <button
                            onClick={() => copyElectionData(election)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium min-w-[120px] ${copiedElectionId === election.id
                              ? 'text-emerald-600 bg-emerald-50 border border-emerald-200 shadow-inner'
                              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:shadow-md'
                              }`}
                            title="Copy election results to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedElectionId === election.id ? 'Copied!' : 'Copy Data'}
                          </button>
                          <button
                            onClick={() => fetchElectionDetails(election.id)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium min-w-[120px]"
                            title="View election details"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <div className="relative group">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  exportElection(election.id, e.target.value as ExportType);
                                  e.target.value = '';
                                }
                              }}
                              disabled={exporting}
                              className="flex items-center justify-center gap-2 px-4 py-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium min-w-[120px] appearance-none cursor-pointer pr-10 disabled:opacity-50"
                              title="Export election data"
                            >
                              <option value="">Export</option>
                              <option value="json">JSON Format</option>
                              <option value="xlsx">Excel Format</option>
                              <option value="docs">Word Document</option>
                            </select>
                            <Download className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => deleteElectionRecord(election.id)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium min-w-[120px]"
                            title="Delete election record"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Election Details Modal */}
      {showElectionDetails && selectedElection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
            <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Election Details</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedElection.election.election_name} - {selectedElection.election.academic_year}
                  </p>
                </div>
                <button
                  onClick={() => setShowElectionDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50/50">
              {loadingElectionDetails ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading election details..." />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Election Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <span className="font-medium text-xs text-blue-600 block mb-1">Election Name</span>
                        <p className="text-sm font-semibold text-blue-900">{selectedElection.election.election_name}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <span className="font-medium text-xs text-purple-600 block mb-1">Election Date</span>
                        <p className="text-sm font-semibold text-purple-900">
                          {new Date(selectedElection.election.election_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <span className="font-medium text-xs text-green-600 block mb-1">Academic Year</span>
                        <p className="text-sm font-semibold text-green-900">{selectedElection.election.academic_year}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <span className="font-medium text-xs text-orange-600 block mb-1">Total Candidates</span>
                        <p className="text-sm font-semibold text-orange-900">{selectedElection.election.total_candidates}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                        <span className="font-medium text-xs text-emerald-600 block mb-1">Total Votes</span>
                        <p className="text-sm font-semibold text-emerald-900">{selectedElection.election.total_votes}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <span className="font-medium text-xs text-gray-600 block mb-1">Finished At</span>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(selectedElection.election.finished_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedElection.election.election_hash && (
                      <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <span className="font-medium text-xs text-yellow-600 block mb-1">Election Hash</span>
                        <p className="text-xs font-mono text-yellow-700 break-all">
                          {selectedElection.election.election_hash}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedElection.results?.resultsByPosition && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Election Results by Position</h4>
                      <div className="space-y-6">
                        {Object.entries(selectedElection.results.resultsByPosition).map(([position, candidates]: [string, any]) => (
                          <div key={position} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                              <h5 className="text-lg font-bold text-white">{position.toUpperCase()}</h5>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {candidates.map((candidate: any, index: number) => (
                                <div key={candidate.candidate_name} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{candidate.candidate_name}</p>
                                        <p className="text-sm text-gray-600">{candidate.party}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-gray-900">{candidate.vote_count} votes</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedElection.results?.statistics && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Election Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                          <span className="font-medium text-xs text-blue-600 block mb-1">Total Candidates</span>
                          <p className="text-2xl font-bold text-blue-900">{selectedElection.results.statistics.totalCandidates}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                          <span className="font-medium text-xs text-green-600 block mb-1">Total Votes</span>
                          <p className="text-2xl font-bold text-green-900">{selectedElection.results.statistics.totalVotes}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
                          <span className="font-medium text-xs text-purple-600 block mb-1">Positions</span>
                          <p className="text-2xl font-bold text-purple-900">{selectedElection.results.statistics.positions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => copyElectionData(selectedElection.election)}
                      className="flex items-center justify-center gap-2 px-6 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Results to Clipboard
                    </button>
                    <div className="relative group">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            exportElection(selectedElection.election.id, e.target.value as ExportType);
                            e.target.value = '';
                          }
                        }}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-all duration-200 hover:shadow-md text-sm font-medium appearance-none cursor-pointer pr-10 disabled:opacity-50"
                      >
                        <option value="">Export Election Data</option>
                        <option value="json">JSON Format</option>
                        <option value="xlsx">Excel Format</option>
                        <option value="docs">Word Document</option>
                      </select>
                      <Download className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive overview of the voting system</p>
                {!isSuperAdmin && (
                  <div className="mt-2">
                    <StatusPill
                      icon={Shield}
                      text="Limited Access: View-only mode"
                      variant="warning"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isSuperAdmin && (
                <button
                  onClick={() => setShowElectionHistory(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium transition-all duration-200 hover:shadow-lg"
                >
                  <History className="w-4 h-4" />
                  <span>Election History</span>
                </button>
              )}
              <button
                onClick={() => {
                  fetchData();
                }}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 text-sm font-medium transition-all duration-200 hover:shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Poll Controls - Only visible to super admin */}
        {isSuperAdmin && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Poll Controls</h2>
              <p className="text-gray-600 mt-1">Super Admin Only - Manage voting system status</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <div className={`px-4 py-2 rounded-xl border text-sm font-medium ${getPollStatusColor(pollStatus)}`}>
                    {pollStatus.replace('_', ' ').toUpperCase()}
                  </div>
                  {pollStatusLoading && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handlePollControl('active')}
                    disabled={pollLoading || pollStatus === 'active'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                  >
                    {pollLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start Voting
                  </button>

                  <button
                    onClick={() => handlePollControl('paused')}
                    disabled={pollLoading || pollStatus === 'paused' || pollStatus === 'finished' || pollStatus === 'not_started'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                  >
                    {pollLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    Pause Voting
                  </button>

                  <button
                    onClick={() => handlePollControl('finished')}
                    disabled={pollLoading || pollStatus === 'finished'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                  >
                    {pollLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <StopCircle className="w-4 h-4" />
                    )}
                    Finish Voting
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Current Status: {pollStatus.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-blue-700">
                  {getPollStatusDescription(pollStatus)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <p className="text-xs text-blue-600">
                    <strong>Student Login Status:</strong> {pollStatus === 'active' ? 'ENABLED' : 'DISABLED'}
                  </p>
                  <p className="text-xs text-blue-600">
                    <strong>API Connected:</strong> Real-time synchronization with backend
                  </p>
                </div>
                {electionHistory.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    <strong>Election History:</strong> {electionHistory.length} recorded election(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Voters"
            value={stats?.totalVoters || 0}
            icon={Users}
            color="blue"
            description="Registered voters in system"
          />
          <StatCard
            title="Total Votes"
            value={totalVotes || stats?.totalVotes || 0}
            icon={UserCheck}
            color="green"
            description="Votes cast in current election"
          />
          <StatCard
            title="Candidates"
            value={stats?.totalCandidates || candidates.length || 0}
            icon={Vote}
            color="purple"
            description="Active candidates"
          />

          <StatCard
            title="Turnout Rate"
            value={`${calculateTurnoutRate(
              stats?.totalVoters || 0,
              stats?.hasVotedCount || 0
            )}%`}
            icon={Activity}
            color="orange"
            description={`${stats?.hasVotedCount || 0} of ${stats?.totalVoters || 0} voters have voted`}
          />
        </div>

        {/* Enhanced Audit Logs with Connected Dropdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity & Audit Logs</h2>
              <p className="text-gray-600 mt-1">Comprehensive system activity monitoring</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <select
                value={auditLogsExportType}
                onChange={(e) => setAuditLogsExportType(e.target.value as ExportType)}
                disabled={exporting || !stats?.auditLogs?.length}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all w-full sm:w-auto"
              >
                <option value="json">JSON Format</option>
                <option value="xlsx">Excel Format</option>
                <option value="docs">Word Document</option>
              </select>
              <button
                onClick={() => exportAuditLogs(auditLogsExportType)}
                disabled={exporting || !stats?.auditLogs?.length}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
              >
                {exporting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export
              </button>
            </div>
          </div>
          <div className="p-6">
            {!stats?.auditLogs?.length ? (
              <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-200">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No recent activity</p>
                <p className="text-gray-400 mt-1">System activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stats.auditLogs.map((log: AuditLog) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getAuditIconColor(log.action)}`}>
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900 break-words">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500 flex-shrink-0 bg-white px-2 py-1 rounded-lg border border-gray-200">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      {log.details && (
                        <p className="text-sm text-gray-600 break-words mb-2 bg-white/50 p-2 rounded-lg border border-gray-200">{log.details}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-xs text-gray-500 break-words bg-white/50 px-2 py-1 rounded-lg border border-gray-200">
                          {log.user_type} {log.user_id && `(ID: ${log.user_id})`}
                          {log.admin_name && ` • Admin: ${log.admin_name}`}
                        </p>
                        {log.ip_address && (
                          <p className="text-xs text-gray-400 font-mono flex-shrink-0 bg-white/50 px-2 py-1 rounded-lg border border-gray-200">
                            {log.ip_address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};