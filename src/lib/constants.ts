export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

export const COLORS = {
  PRIMARY: '#2563eb',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },
  VOTING: {
    CAST: '/voting/cast-blockchain',
    RESULTS: '/voting/results',
    MARK_VOTED: '/voting/mark-voted',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CANDIDATES: '/candidates',
    VOTERS: '/voters',
    POLL_STATUS: '/poll/status',
  },
  BLOCKCHAIN: {
    STATUS: '/blockchain-status',
    SYNC: '/blockchain/sync',
  },
} as const

export const TOAST_DURATION = 5000

export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  POLL_STATUS: 15000, // 15 seconds
  BLOCKCHAIN: 10000, // 10 seconds
} as const
