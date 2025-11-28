// config/database.js - Optimized for High Performance
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

// Calculate optimal connection limit based on CPU cores
const cpuCores = os.cpus().length;
const optimalConnectionLimit = Math.min(50, cpuCores * 10); // Max 50 connections

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_voting_system',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // Performance-optimized connection pool
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || optimalConnectionLimit,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 100,
  idleTimeout: 60000, // 1 minute
  maxIdle: parseInt(process.env.DB_MAX_IDLE) || 15, // Keep more idle connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  
  // MySQL-specific performance optimizations
  acquireTimeout: 30000, // Valid in mysql2
  timeout: 60000, // Valid in mysql2
  decimalNumbers: true, // Better decimal handling
  typeCast: true, // Better type casting
  
  // Connection string for better performance
  stringifyObjects: false,
  dateStrings: true // Return dates as strings instead of Date objects
};

export const pool = mysql.createPool(dbConfig);

// Enhanced connection tracking
let activeConnections = 0;
let totalQueries = 0;
const maxConnectionsWarning = Math.floor(dbConfig.connectionLimit * 0.8); // 80% of max

console.log(`🔧 Database pool configured: ${dbConfig.connectionLimit} max connections`);

pool.on('acquire', (connection) => {
  activeConnections++;
  totalQueries++;
  
  if (activeConnections >= maxConnectionsWarning) {
    console.warn(`⚠️ High database connections: ${activeConnections}/${dbConfig.connectionLimit}`);
  }
});

pool.on('release', (connection) => {
  activeConnections--;
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

// Enhanced connection test
export const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Test with performance measurement
    const startTime = Date.now();
    await connection.execute('SELECT 1');
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Database connected (${queryTime}ms response)`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// High-performance query function with connection reuse
export const query = async (sql, params = []) => {
  let connection;
  const startTime = Date.now();
  
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    const queryTime = Date.now() - startTime;
    
    // Log slow queries
    if (queryTime > 1000) {
      console.warn(`🐌 Slow query (${queryTime}ms): ${sql.substring(0, 100)}...`);
    }
    
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    
    // Enhanced error handling with automatic retry for transient errors
    if (isTransientError(error)) {
      console.log('🔄 Retrying query due to transient error...');
      return await retryQuery(sql, params, 2); // Retry up to 2 times
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Check if error is transient (can be retried)
const isTransientError = (error) => {
  const transientErrors = [
    'ER_LOCK_DEADLOCK',
    'ER_LOCK_WAIT_TIMEOUT',
    'ER_QUERY_INTERRUPTED',
    'ETIMEDOUT',
    'ECONNRESET'
  ];
  return transientErrors.includes(error.code);
};

// Retry logic for transient errors
const retryQuery = async (sql, params, maxRetries) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      const [results] = await connection.execute(sql, params);
      connection.release();
      
      console.log(`✅ Query succeeded on retry attempt ${attempt}`);
      return results;
    } catch (error) {
      lastError = error;
      console.log(`❌ Retry attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

// Batch query for better performance with multiple operations
export const batchQuery = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Cleanup function for graceful shutdown
export const cleanupPool = async () => {
  try {
    console.log('🔄 Closing database connection pool...');
    await pool.end();
    console.log('✅ Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
};

// Enhanced health check with performance metrics
export const healthCheck = async () => {
  try {
    const connection = await pool.getConnection();
    const startTime = Date.now();
    await connection.execute('SELECT 1');
    const responseTime = Date.now() - startTime;
    connection.release();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      connections: {
        active: activeConnections,
        total: pool._allConnections?.length || 0,
        idle: pool._freeConnections?.length || 0,
        queue: pool._connectionQueue?.length || 0
      },
      totalQueries
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Export enhanced connection stats
export const getConnectionStats = () => {
  return {
    active: activeConnections,
    total: pool._allConnections?.length || 0,
    idle: pool._freeConnections?.length || 0,
    queue: pool._connectionQueue?.length || 0,
    totalQueries,
    config: {
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit
    }
  };
};

// Performance monitoring
setInterval(async () => {
  try {
    const stats = getConnectionStats();
    
    if (stats.active > 0 || stats.queue > 0) {
      console.log(`📊 DB Stats - Active: ${stats.active}, Idle: ${stats.idle}, Queue: ${stats.queue}, Total Queries: ${stats.totalQueries}`);
    }
    
    // Health check every 30 seconds
    const health = await healthCheck();
    if (health.status === 'unhealthy') {
      console.error('🚨 Database health check failed:', health.error);
    }
  } catch (error) {
    console.error('Performance monitoring error:', error.message);
  }
}, 30000);