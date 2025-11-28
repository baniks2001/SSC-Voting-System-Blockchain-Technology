export interface User {
  type: string | undefined;
  id: number;
  email?: string;
  studentId?: string;
  fullName: string;
  course?: string;
  yearLevel?: number;
  section?: string;
  role?: string;
  hasVoted?: boolean;
  voteHash?: string;
  votedAt?: string;
  isSuperAdmin?: boolean;
  blockchainReceiptId?: string;
  blockchainTxHash?: string;
  blockchainVerified?: boolean;
  blockchainNode?: string;
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  position: string;
  image_url?: string;
  vote_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Position {
  id: number;
  name: string;
  maxVotes: number;
  order: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
}

export interface Voter {
  id: number;
  student_id: string;
  full_name: string;
  course: string;
  year_level: number;
  section: string;
  has_voted: boolean;
  vote_hash?: string;
  voted_at?: string;
  created_at: string;
  blockchain_receipt_id?: string;
  blockchain_tx_hash?: string;
  blockchain_verified?: boolean;
  blockchain_node?: string;
  last_verified_at?: string;
  is_active: boolean;
}

export interface Admin {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'auditor' | 'poll_monitor' | 'super_admin';
  created_at: string;
  is_active: boolean;
}

export interface Vote {
  candidateId: number;
  candidateName: string;
  party: string;
  position: string;
}

export interface VoteReceipt {
  voteHash: string;
  votedAt: string;
  votes: Vote[];
  timestamp: string;
  blockchainVerified: boolean;
  blockchainReceiptId?: string;
  blockchainTxHash?: string;
  blockchainNode?: string;
  blockNumber?: number;
  gasUsed?: string;
  positions?: Position[];
}

export interface VoteSelection {
  [position: string]: number[];
}

export interface BlockchainVote {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  transactionHash: string;
  blockNumber?: number;
  node: string;
  gasUsed?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface VoteVerification {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  verified: boolean;
  blockNumber?: number;
  transactionHash?: string;
  node?: string;
  confirmations?: number;
}

// ENHANCED: Comprehensive Audit Log with full admin details
export interface AuditLog {
  id: number;
  user_id?: number;
  user_type: 'admin' | 'voter' | 'system';
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  blockchain_tx_hash?: string;

  // NEW: Enhanced fields for comprehensive logging
  admin_id?: number;
  admin_name?: string;
  admin_email?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'warning';
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'authentication' | 'voting' | 'system' | 'admin' | 'blockchain' | 'security';
  session_id?: string;
  resource_affected?: string;
  before_state?: any;
  after_state?: any;
}

export interface DashboardStats {
  totalVoters: number;
  totalCandidates: number;
  totalVotes: number;
  hasVotedCount: number;
  totalPositions?: number;
  auditLogs: AuditLog[];
  blockchainStats?: {
    totalBlockchainVotes: number;
    connectedNodes: number;
    totalNodes: number;
    lastBlockNumber: number;
    simulationMode: boolean;
  };
  activeVoters?: number;
}

export interface PollSettings {
  id: number;
  is_active: boolean;
  is_paused: boolean;
  start_time?: string;
  end_time?: string;
  paused_at?: string;
  blockchain_enabled?: boolean;
  max_votes_per_position?: number;
}

export interface PollResults {
  candidates: Candidate[];
  totalVotes: number;
  lastUpdated: string;
  positions?: Position[];
  blockchainInfo?: {
    isConnected: boolean;
    node: string;
    blockNumber: string;
    simulationMode: boolean;
    connectedNodes: number;
    totalNodes: number;
    networkId?: number;
    accountStatus?: {
      address: string;
      balance: string;
      unlocked: boolean;
    };
    contractDeployed?: boolean;
  };
}

export interface BlockchainNode {
  name: string;
  url: string;
  connected: boolean;
  account: string;
  lastBlock: number;
  chainId?: number;
  balance?: string;
  peerCount?: number;
  isSyncing?: boolean;
}

export interface ExportOptions {
  studentId: boolean;
  fullName: boolean;
  course: boolean;
  yearLevel: boolean;
  section: boolean;
  hasVoted: boolean;
  votedAt: boolean;
  createdAt: boolean;
  password: boolean;
  blockchainVerified?: boolean;
  blockchainTxHash?: boolean;
  blockchainNode?: boolean;
  blockchainReceiptId?: boolean;
}

export interface BlockchainNetworkStatus {
  isConnected: boolean;
  networkId: number;
  blockNumber: string;
  accounts: string[];
  accountStatus: {
    unlocked: boolean;
    balance: string;
    address: string;
  };
  node: string;
  contractDeployed: boolean;
  simulationMode: boolean;
  storageType: 'fully_decentralized' | 'hybrid' | 'centralized';
  nodes: BlockchainNode[];
  totalNodes: number;
  connectedNodes: number;
}

export interface BlockchainReceipt {
  transactionHash: string;
  blockNumber: string;
  voterHash: string;
  gasUsed: string;
  timestamp: string;
  node: string;
  simulated: boolean;
  ballotId?: string;
  status?: 'success' | 'failed' | 'pending';
  voteData?: VoteSelection;
}

export interface BlockchainVoteResult {
  success: boolean;
  receipt: BlockchainReceipt;
  node?: string;
  simulated?: boolean;
  message?: string;
  voteReceipt?: {
    ballotId: string;
    transactionHash: string;
    blockNumber: string;
    timestamp: string;
    voterHash: string;
  };
}

export interface BlockchainVoteData {
  voterId: string;
  votes: VoteSelection;
  timestamp: string;
  ballotId: string;
  voterHash: string;
  positions?: Position[];
}

export interface BlockchainError {
  code: string;
  message: string;
  node?: string;
  transactionHash?: string;
}

export interface BlockchainElectionResults {
  results: {
    [position: string]: {
      [candidateId: string]: {
        candidateId: string;
        candidateName: string;
        party: string;
        voteCount: number;
      };
    };
  };
  totalVotes: number;
  voteData: BlockchainVote[];
  lastBlockNumber: number;
  positions?: Position[];
}

export interface VerificationResult {
  exists: boolean;
  details: BlockchainVote | null;
  confirmations: number;
  verified: boolean;
  node?: string;
  voteData?: VoteSelection;
}

export interface NodeStatus {
  name: string;
  url: string;
  connected: boolean;
  account: string;
  lastBlock: number;
  chainId?: number;
  balance?: string;
  peerCount?: number;
  isSyncing?: boolean;
  responseTime?: number;
  lastError?: string;
}

export interface MultiNodeStatus {
  nodes: NodeStatus[];
  totalNodes: number;
  connectedNodes: number;
  primaryNode?: string;
  loadBalancing: 'round-robin' | 'priority' | 'fallback';
}

// UPDATED: Added currentNode property to BlockchainStatus interface
export interface BlockchainStatus {
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
  };
  // ADDED: Missing currentNode property
  currentNode: string;
}

export interface PositionFormData {
  name: string;
  maxVotes: number;
  order: number;
}

export interface CandidateFormData {
  name: string;
  party: string;
  position: string;
}

export interface VotingProgress {
  totalPositions: number;
  completedPositions: number;
  totalSelections: number;
  maxSelections: number;
  positions: {
    [positionName: string]: {
      selected: number;
      max: number;
      completed: boolean;
    };
  };
}

export interface ReviewVoteData {
  selectedVotes: VoteSelection;
  candidates: Candidate[];
  positions: Position[];
  timestamp: string;
  voterInfo: {
    studentId: string;
    fullName: string;
    course: string;
  };
}

// NEW: Enhanced types for Dashboard and System Monitoring

export interface PollStats {
  totalVoters: number;
  votedCount: number;
  remainingVoters: number;
  votePercentage: number;
  positionsCount?: number;
  activeCandidates?: number;
  voteDistribution?: {
    [position: string]: {
      total: number;
      voted: number;
      percentage: number;
    };
  };
}

export interface SystemStatus {
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastChecked: string;
  uptime: string;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage?: {
    usage: number;
    cores: number;
  };
  databaseStatus?: 'connected' | 'disconnected' | 'degraded';
  lastBackup?: string;
  errorsLast24h?: number;
}

export interface NetworkMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  connectionStability: number;
  packetLoss?: number;
  bandwidth?: {
    upload: number;
    download: number;
  };
  requestsPerMinute?: number;
  averageResponseTime?: number;
  peakLoad?: number;
}

export interface SecurityMetrics {
  failedLoginAttempts: number;
  blockedIPs: number;
  suspiciousActivities: number;
  lastSecurityScan?: string;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  sslStatus?: 'valid' | 'expired' | 'invalid';
  firewallStatus?: 'active' | 'inactive';
}

export interface BlockchainMetrics {
  totalTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageGasPrice: number;
  averageBlockTime: number;
  networkHashrate?: string;
  difficulty?: string;
  syncStatus?: 'synced' | 'syncing' | 'behind';
  lastBlockTime?: string;
  contractCalls?: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  concurrentUsers: number;
  requestsPerSecond: number;
  errorRate: number;
  uptimePercentage: number;
}

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  userType?: string[];
  status?: string[];
  category?: string[];
  severity?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogSummary {
  totalLogs: number;
  byCategory: {
    [category: string]: number;
  };
  byStatus: {
    success: number;
    failed: number;
    warning: number;
  };
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  activitiesLast24h: number;
  uniqueUsers: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  votesPerMinute: number;
  systemLoad: number;
  memoryUsage: number;
  networkTraffic: number;
  blockchainTransactions: number;
  errorRate: number;
  responseTime: number;
  timestamp: string;
}

export interface Alert {
  id: number;
  type: 'security' | 'performance' | 'system' | 'blockchain';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  metadata?: any;
  actionRequired?: boolean;
}

export interface DashboardOverview {
  pollStats: PollStats;
  systemStatus: SystemStatus;
  networkMetrics: NetworkMetrics;
  securityMetrics: SecurityMetrics;
  blockchainMetrics: BlockchainMetrics;
  performanceMetrics: PerformanceMetrics;
  recentAuditLogs: AuditLog[];
  activeAlerts: Alert[];
  realTimeMetrics: RealTimeMetrics;
  lastUpdated: string;
}

// NEW: Types for enhanced voting system monitoring

export interface VoteAnalysis {
  hourlyDistribution: {
    [hour: string]: number;
  };
  positionBreakdown: {
    [position: string]: number;
  };
  courseDistribution: {
    [course: string]: number;
  };
  yearLevelDistribution: {
    [yearLevel: string]: number;
  };
  votingPatterns: {
    peakHours: string[];
    averageVotingTime: number;
    completionRate: number;
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: ComponentHealth;
    api: ComponentHealth;
    blockchain: ComponentHealth;
    cache: ComponentHealth;
    storage: ComponentHealth;
  };
  lastIncident?: string;
  recommendations?: string[];
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  details?: string;
}

export interface BackupStatus {
  lastBackup: string;
  backupSize: number;
  backupLocation: string;
  status: 'success' | 'failed' | 'running';
  nextBackup?: string;
  retentionDays: number;
}

// NEW: Types for admin activity monitoring

export interface AdminActivity {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  last_activity: string;
  activity_count: number;
  ip_address: string;
  session_duration?: number;
  actions: string[];
}

export interface UserSession {
  session_id: string;
  user_id: number;
  user_type: 'admin' | 'voter';
  ip_address: string;
  user_agent: string;
  login_time: string;
  last_activity: string;
  is_active: boolean;
  country?: string;
  city?: string;
}

// NEW: Types for voting integrity monitoring

export interface VoteIntegrityCheck {
  check_id: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
}

export interface BlockchainConsistencyCheck {
  check_id: string;
  localCount: number;
  blockchainCount: number;
  discrepancies: number;
  status: 'consistent' | 'inconsistent';
  details: {
    missingOnBlockchain: string[];
    missingLocally: string[];
    hashMismatches: string[];
  };
}

// NEW: Response types for API endpoints

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// NEW: Real-time event types

export interface RealTimeEvent {
  type: 'vote_cast' | 'admin_action' | 'system_alert' | 'blockchain_transaction';
  data: any;
  timestamp: string;
  source: string;
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
  userId?: number;
}

// NEW: Export and report types

export interface ReportRequest {
  type: 'audit_logs' | 'voting_stats' | 'system_metrics' | 'blockchain_activity';
  format: 'csv' | 'pdf' | 'json';
  filters?: any;
  startDate?: string;
  endDate?: string;
}

export interface ReportStatus {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  estimatedCompletion?: string;
  error?: string;
}

// NEW: Election data types for dashboard
export interface ElectionData {
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

export interface ElectionDetails {
  election: ElectionData;
  results: any;
}

export interface FinishPollFormData {
  electionName: string;
  electionDate: string;
  academicYear: string;
  exportType: 'xlsx' | 'docs' | 'json';
}

export type PollStatus = 'active' | 'paused' | 'finished' | 'not_started';
export type ExportType = 'xlsx' | 'docs' | 'json';