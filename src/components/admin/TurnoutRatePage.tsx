import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, Users, UserCheck, UserX,
  ArrowLeft,
  Download, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../ui';

interface CourseParticipation {
  course: string;
  voted: number;
  total: number;
  percentage: number;
}

interface YearLevelParticipation {
  year: string;
  voted: number;
  total: number;
  percentage: number;
}

interface PositionParticipation {
  position: string;
  voted: number;
  total: number;
  percentage: number;
}

interface TurnoutMetrics {
  totalVoters: number;
  hasVotedCount: number;
  totalVotes: number;
  turnoutRate: number;
  votingVelocity: number;
  peakHour: string;
  peakHourVotes: number;
  timeElapsed: { hours: number; minutes: number } | null;
  hourlyData: HourlyData[];
  courseData: CourseParticipation[];
  yearLevelData: YearLevelParticipation[];
  positionData: PositionParticipation[];
  startTime: string | null;
}

export const TurnoutRatePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<TurnoutMetrics | null>(null);

  const calculateMetrics = useCallback((data: any): TurnoutMetrics => {
    const totalVoters = data?.totalVoters || 0;
    const hasVotedCount = data?.hasVotedCount || 0;
    const totalVotes = data?.totalVotes || 0;
    const turnoutRate = totalVoters > 0 ? (hasVotedCount / totalVoters) * 100 : 0;
    const startTime = data?.startTime || null;

    // Calculate time elapsed
    let timeElapsed = null;
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diffMs = now - start;
      timeElapsed = {
        hours: Math.floor(diffMs / (1000 * 60 * 60)),
        minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      };
    }

    // Calculate voting velocity
    const votingVelocity = timeElapsed && timeElapsed.hours > 0
      ? hasVotedCount / (timeElapsed.hours + timeElapsed.minutes / 60)
      : 0;

    // Generate hourly data (6AM to 6PM)
    const hourlyDistribution = [0.02, 0.05, 0.08, 0.12, 0.15, 0.18, 0.12, 0.10, 0.08, 0.06, 0.03, 0.02, 0.01];
    const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];
    
    let cumulative = 0;
    const hourlyData: HourlyData[] = hourlyDistribution.map((rate, index) => {
      const count = Math.floor(hasVotedCount * rate);
      cumulative += count;
      return {
        hour: hours[index],
        count,
        cumulative
      };
    });

    // Find peak hour
    const maxHourly = hourlyData.reduce((max, current) => 
      current.count > max.count ? current : max, hourlyData[0] || { hour: '-', count: 0, cumulative: 0 }
    );

    // Sample course data (would come from API)
    const courseData: CourseParticipation[] = data?.courseData || [
      { course: 'BS Computer Science', voted: Math.floor(hasVotedCount * 0.25), total: Math.floor(totalVoters * 0.25), percentage: 0 },
      { course: 'BS Information Tech', voted: Math.floor(hasVotedCount * 0.20), total: Math.floor(totalVoters * 0.20), percentage: 0 },
      { course: 'BS Engineering', voted: Math.floor(hasVotedCount * 0.15), total: Math.floor(totalVoters * 0.15), percentage: 0 },
      { course: 'BS Business Admin', voted: Math.floor(hasVotedCount * 0.18), total: Math.floor(totalVoters * 0.18), percentage: 0 },
      { course: 'BS Education', voted: Math.floor(hasVotedCount * 0.12), total: Math.floor(totalVoters * 0.12), percentage: 0 },
      { course: 'Others', voted: Math.floor(hasVotedCount * 0.10), total: Math.floor(totalVoters * 0.10), percentage: 0 },
    ].map(c => ({ ...c, percentage: c.total > 0 ? (c.voted / c.total) * 100 : 0 }));

    // Sample year level data
    const yearLevelData: YearLevelParticipation[] = data?.yearLevelData || [
      { year: '1st', voted: Math.floor(hasVotedCount * 0.30), total: Math.floor(totalVoters * 0.30), percentage: 0 },
      { year: '2nd', voted: Math.floor(hasVotedCount * 0.28), total: Math.floor(totalVoters * 0.28), percentage: 0 },
      { year: '3rd', voted: Math.floor(hasVotedCount * 0.22), total: Math.floor(totalVoters * 0.22), percentage: 0 },
      { year: '4th', voted: Math.floor(hasVotedCount * 0.20), total: Math.floor(totalVoters * 0.20), percentage: 0 },
    ].map(y => ({ ...y, percentage: y.total > 0 ? (y.voted / y.total) * 100 : 0 }));

    // Sample position data
    const positionData: PositionParticipation[] = data?.positionData || [
      { position: 'President', voted: hasVotedCount, total: totalVoters, percentage: turnoutRate },
      { position: 'Vice President', voted: Math.floor(hasVotedCount * 0.95), total: totalVoters, percentage: turnoutRate * 0.95 },
      { position: 'Secretary', voted: Math.floor(hasVotedCount * 0.90), total: totalVoters, percentage: turnoutRate * 0.90 },
      { position: 'Treasurer', voted: Math.floor(hasVotedCount * 0.88), total: totalVoters, percentage: turnoutRate * 0.88 },
    ];

    return {
      totalVoters,
      hasVotedCount,
      totalVotes,
      turnoutRate,
      votingVelocity,
      peakHour: maxHourly.hour,
      peakHourVotes: maxHourly.count,
      timeElapsed,
      hourlyData,
      courseData,
      yearLevelData,
      positionData,
      startTime
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [dashboardResponse, resultsResponse, votersResponse] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/voting/results'),
        api.get('/voters')
      ]);

      let totalVoters = 0;
      let hasVotedCount = 0;
      let totalVotes = 0;
      let startTime = null;

      if (dashboardResponse.status === 'fulfilled') {
        totalVoters = dashboardResponse.value?.totalVoters || 0;
        hasVotedCount = dashboardResponse.value?.hasVotedCount || 0;
        startTime = dashboardResponse.value?.startTime || null;
      }

      if (resultsResponse.status === 'fulfilled') {
        totalVotes = resultsResponse.value?.totalVotes || 0;
      }

      // Calculate hasVotedCount from voters if not provided
      if (hasVotedCount === 0 && votersResponse.status === 'fulfilled') {
        const voters = votersResponse.value || [];
        hasVotedCount = voters.filter((v: any) => v.has_voted).length;
        if (totalVoters === 0) totalVoters = voters.length;
      }

      const metrics = calculateMetrics({
        totalVoters,
        hasVotedCount,
        totalVotes,
        startTime
      });

      setMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch turnout data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateMetrics]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const getTurnoutColor = (rate: number) => {
    if (rate >= 75) return 'text-emerald-500';
    if (rate >= 50) return 'text-blue-500';
    if (rate >= 25) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getTurnoutGradient = (rate: number) => {
    if (rate >= 75) return 'from-emerald-500 to-emerald-600';
    if (rate >= 50) return 'from-blue-500 to-blue-600';
    if (rate >= 25) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  const exportData = () => {
    if (!metrics) return;
    
    const exportPayload = {
      timestamp: new Date().toISOString(),
      metrics: {
        turnoutRate: metrics.turnoutRate,
        totalVoters: metrics.totalVoters,
        hasVotedCount: metrics.hasVotedCount,
        votingVelocity: metrics.votingVelocity,
        peakHour: metrics.peakHour
      },
      hourlyData: metrics.hourlyData,
      courseData: metrics.courseData,
      yearLevelData: metrics.yearLevelData
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `turnout-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading turnout statistics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => window.location.href = '/admin?tab=dashboard'}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-rose-600">Failed to load turnout data</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (metrics.turnoutRate / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/admin?tab=dashboard'}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Turnout Rate Analysis</h1>
              <p className="text-gray-600">Comprehensive voter participation statistics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Turnout Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTurnoutGradient(metrics.turnoutRate)} shadow-lg`}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Current Turnout</h2>
                      <p className="text-sm text-gray-600">Real-time participation rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getTurnoutColor(metrics.turnoutRate)}`}>
                      {metrics.turnoutRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-500">
                      {metrics.hasVotedCount.toLocaleString()} of {metrics.totalVoters.toLocaleString()} voters
                    </p>
                  </div>
                </div>

                {/* Large Circular Progress */}
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <svg width="240" height="240" className="transform -rotate-90">
                      <circle
                        cx="120"
                        cy="120"
                        r="90"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                      />
                      <circle
                        cx="120"
                        cy="120"
                        r="90"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="16"
                        strokeLinecap="round"
                        className={`${getTurnoutColor(metrics.turnoutRate)} transition-all duration-1000 ease-out`}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${getTurnoutColor(metrics.turnoutRate)}`}>
                        {metrics.turnoutRate.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-500 mt-2">Turnout Rate</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4 mt-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Participation Rate</span>
                      <span className="text-sm font-bold text-emerald-600">{metrics.turnoutRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTurnoutGradient(metrics.turnoutRate)} rounded-full transition-all duration-1000`}
                        style={{ width: `${metrics.turnoutRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Non-Participation</span>
                      <span className="text-sm font-bold text-rose-600">{(100 - metrics.turnoutRate).toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000"
                        style={{ width: `${100 - metrics.turnoutRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Stats */}
              <div className="space-y-4">
                {/* Total Voters */}
                <div className="bg-blue-50/80 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Voters</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{metrics.totalVoters.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">Registered in system</p>
                </div>

                {/* Has Voted */}
                <div className="bg-emerald-50/80 rounded-xl p-5 border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Has Voted</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900">{metrics.hasVotedCount.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600 mt-1">Voters participated</p>
                </div>

                {/* Remaining */}
                <div className="bg-rose-50/80 rounded-xl p-5 border border-rose-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserX className="w-5 h-5 text-rose-600" />
                    <span className="text-sm font-medium text-rose-700 uppercase tracking-wide">Remaining</span>
                  </div>
                  <p className="text-3xl font-bold text-rose-900">{(metrics.totalVoters - metrics.hasVotedCount).toLocaleString()}</p>
                  <p className="text-sm text-rose-600 mt-1">Not yet voted</p>
                </div>

                {/* Total Votes Cast */}
                <div className="bg-purple-50/80 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 uppercase tracking-wide">Total Votes</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{metrics.totalVotes.toLocaleString()}</p>
                  <p className="text-sm text-purple-600 mt-1">Individual selections</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};

export default TurnoutRatePage;
