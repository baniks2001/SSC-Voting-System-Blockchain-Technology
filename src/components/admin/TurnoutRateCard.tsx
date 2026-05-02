import React from 'react';
import { 
  Activity, Users, UserCheck, UserX, TrendingUp, Clock, BarChart3, 
  Zap, Target, ArrowUp, ArrowDown, Calendar, Award
} from 'lucide-react';

interface TurnoutRateCardProps {
  totalVoters: number;
  hasVotedCount: number;
  totalVotes?: number;
  hourlyData?: { hour: string; count: number }[];
  courseData?: { course: string; voted: number; total: number }[];
  yearLevelData?: { year: string; voted: number; total: number }[];
  className?: string;
  startTime?: string; // ISO timestamp when poll started
  quorumRequired?: number; // Percentage required for quorum (e.g., 50 for 50%)
  historicalAverage?: number; // Historical average turnout rate for comparison
}

export const TurnoutRateCard: React.FC<TurnoutRateCardProps> = ({
  totalVoters,
  hasVotedCount,
  totalVotes = 0,
  hourlyData = [],
  courseData = [],
  yearLevelData = [],
  className = '',
  startTime,
  quorumRequired,
  historicalAverage
}) => {
  const calculateTurnoutRate = () => {
    if (totalVoters <= 0) return 0;
    const turnout = (hasVotedCount / totalVoters) * 100;
    return Math.min(Math.round(turnout * 10) / 10, 100);
  };

  const turnoutRate = calculateTurnoutRate();
  const remainingVoters = totalVoters - hasVotedCount;

  // Calculate time elapsed since poll started
  const getTimeElapsed = () => {
    if (!startTime) return null;
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: diffHours, minutes: diffMinutes, totalMs: diffMs };
  };

  const timeElapsed = getTimeElapsed();

  // Calculate voting velocity (votes per hour)
  const votingVelocity = timeElapsed && timeElapsed.totalMs > 0
    ? (hasVotedCount / (timeElapsed.totalMs / (1000 * 60 * 60)))
    : 0;

  // Projected final turnout based on current velocity (assuming 12-hour voting period)
  const votingPeriodHours = 12;
  const projectedTurnout = timeElapsed && timeElapsed.totalMs > 0
    ? Math.min((votingVelocity * votingPeriodHours / totalVoters) * 100, 100)
    : turnoutRate;

  // Determine color based on turnout rate
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

  // Circular progress calculations
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (turnoutRate / 100) * circumference;

  // Generate sample hourly data if not provided (6AM to 6PM)
  const displayHourlyData = hourlyData.length > 0 ? hourlyData : [
    { hour: '6AM', count: Math.floor(hasVotedCount * 0.02) },
    { hour: '7AM', count: Math.floor(hasVotedCount * 0.05) },
    { hour: '8AM', count: Math.floor(hasVotedCount * 0.08) },
    { hour: '9AM', count: Math.floor(hasVotedCount * 0.12) },
    { hour: '10AM', count: Math.floor(hasVotedCount * 0.15) },
    { hour: '11AM', count: Math.floor(hasVotedCount * 0.18) },
    { hour: '12PM', count: Math.floor(hasVotedCount * 0.12) },
    { hour: '1PM', count: Math.floor(hasVotedCount * 0.10) },
    { hour: '2PM', count: Math.floor(hasVotedCount * 0.08) },
    { hour: '3PM', count: Math.floor(hasVotedCount * 0.06) },
    { hour: '4PM', count: Math.floor(hasVotedCount * 0.03) },
    { hour: '5PM', count: Math.floor(hasVotedCount * 0.02) },
    { hour: '6PM', count: Math.floor(hasVotedCount * 0.01) },
  ];

  const maxHourlyCount = Math.max(...displayHourlyData.map(d => d.count), 1);

  // Identify peak hour
  const peakHour = displayHourlyData.reduce((max, current) => 
    current.count > max.count ? current : max, displayHourlyData[0] || { hour: '-', count: 0 }
  );

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getTurnoutGradient(turnoutRate)} shadow-lg`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Turnout Rate</h3>
              <p className="text-sm text-gray-600">Voter participation statistics</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getTurnoutColor(turnoutRate)}`}>
              {turnoutRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {hasVotedCount.toLocaleString()} of {totalVoters.toLocaleString()} voters
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Progress Section */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Circular Progress Background */}
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                className={`${getTurnoutColor(turnoutRate)} transition-all duration-1000 ease-out`}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getTurnoutColor(turnoutRate)}`}>
                {turnoutRate.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500 mt-1">Turnout</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalVoters.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Registered voters</p>
          </div>

          <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Voted</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{hasVotedCount.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1">Has cast vote</p>
          </div>

          <div className="bg-rose-50/80 rounded-xl p-4 border border-rose-100">
            <div className="flex items-center space-x-2 mb-2">
              <UserX className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-700 uppercase tracking-wide">Pending</span>
            </div>
            <p className="text-2xl font-bold text-rose-900">{remainingVoters.toLocaleString()}</p>
            <p className="text-xs text-rose-600 mt-1">Not yet voted</p>
          </div>
        </div>

        {/* Linear Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-emerald-500" />
                Participation Rate
              </span>
              <span className="text-sm font-bold text-emerald-600">{turnoutRate.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getTurnoutGradient(turnoutRate)} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${turnoutRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <UserX className="w-4 h-4 mr-2 text-rose-500" />
                Non-Participation
              </span>
              <span className="text-sm font-bold text-rose-600">{(100 - turnoutRate).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${100 - turnoutRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Voting Velocity */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 border border-cyan-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-medium text-cyan-700 uppercase tracking-wide">Velocity</span>
            </div>
            <p className="text-lg font-bold text-cyan-900">{votingVelocity.toFixed(1)}</p>
            <p className="text-xs text-cyan-600">votes/hour</p>
          </div>

          {/* Projected Turnout */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Projected</span>
            </div>
            <p className="text-lg font-bold text-indigo-900">{projectedTurnout.toFixed(1)}%</p>
            <p className="text-xs text-indigo-600">final turnout</p>
          </div>

          {/* Time Elapsed */}
          {timeElapsed && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center space-x-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Elapsed</span>
              </div>
              <p className="text-lg font-bold text-amber-900">{timeElapsed.hours}h {timeElapsed.minutes}m</p>
              <p className="text-xs text-amber-600">since start</p>
            </div>
          )}

          {/* Peak Hour */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border border-rose-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-medium text-rose-700 uppercase tracking-wide">Peak Hour</span>
            </div>
            <p className="text-lg font-bold text-rose-900">{peakHour.hour}</p>
            <p className="text-xs text-rose-600">{peakHour.count} votes</p>
          </div>
        </div>

        {/* Historical Comparison & Quorum Status */}
        {(historicalAverage || quorumRequired) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Historical Comparison */}
            {historicalAverage && (
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Historical Comparison</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className={`text-xl font-bold ${getTurnoutColor(turnoutRate)}`}>{turnoutRate.toFixed(1)}%</p>
                  </div>
                  <div className="flex items-center">
                    {turnoutRate > historicalAverage ? (
                      <ArrowUp className="w-5 h-5 text-emerald-500" />
                    ) : turnoutRate < historicalAverage ? (
                      <ArrowDown className="w-5 h-5 text-rose-500" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Historical Avg</p>
                    <p className="text-xl font-bold text-gray-700">{historicalAverage.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {turnoutRate > historicalAverage
                    ? `+${(turnoutRate - historicalAverage).toFixed(1)}% above average`
                    : turnoutRate < historicalAverage
                    ? `${(turnoutRate - historicalAverage).toFixed(1)}% below average`
                    : 'Matching historical average'}
                </p>
              </div>
            )}

            {/* Quorum Status */}
            {quorumRequired && (
              <div className={`rounded-xl p-4 border ${
                turnoutRate >= quorumRequired
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Award className={`w-4 h-4 ${
                    turnoutRate >= quorumRequired ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    turnoutRate >= quorumRequired ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    Quorum Status
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className={`text-xl font-bold ${
                      turnoutRate >= quorumRequired ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {turnoutRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Required</p>
                    <p className="text-xl font-bold text-gray-700">{quorumRequired}%</p>
                  </div>
                </div>
                <p className={`text-xs mt-2 ${
                  turnoutRate >= quorumRequired ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {turnoutRate >= quorumRequired
                    ? '✓ Quorum achieved!'
                    : `Need ${(quorumRequired - turnoutRate).toFixed(1)}% more for quorum`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hourly Voting Trend */}
        {displayHourlyData.length > 0 && (
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Hourly Voting Activity</span>
            </div>
            <div className="flex items-end justify-between h-24 space-x-2">
              {displayHourlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 relative group"
                    style={{ height: `${(data.count / maxHourlyCount) * 100}%`, minHeight: '4px' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {data.count} votes
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{data.hour}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Distribution */}
        {courseData.length > 0 && (
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Participation by Course</span>
            </div>
            <div className="space-y-3">
              {courseData.slice(0, 5).map((course, index) => {
                const percentage = course.total > 0 ? (course.voted / course.total) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{course.course}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {course.voted}/{course.total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Year Level Distribution */}
        {yearLevelData.length > 0 && (
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Participation by Year Level</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {yearLevelData.map((year, index) => {
                const percentage = year.total > 0 ? (year.voted / year.total) * 100 : 0;
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">{year.year} Year</p>
                    <p className="text-lg font-bold text-gray-900">{percentage.toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">{year.voted}/{year.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Avg Votes/Position</p>
            <p className="text-xl font-bold text-blue-900">
              {hasVotedCount > 0 && totalVotes > 0 ? (totalVotes / hasVotedCount).toFixed(1) : '0.0'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Completion Target</p>
            <p className="text-xl font-bold text-purple-900">
              {turnoutRate >= 75 ? 'Excellent' : turnoutRate >= 50 ? 'Good' : turnoutRate >= 25 ? 'Fair' : 'Low'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnoutRateCard;
