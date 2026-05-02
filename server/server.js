import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cluster from 'cluster';
import os from 'os';

// Debug logging utility - silent in production for performance with 50+ PCs
const DEBUG = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGS === 'true';
const debug = {
  log: (...args) => DEBUG && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args)
};

// FIXED: Load environment variables FIRST and properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from multiple possible locations
const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '..', '.env'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
    try {
        const result = dotenv.config({ path: envPath });
        if (!result.error) {
            debug.log(`✅ Loaded .env from: ${envPath}`);
            envLoaded = true;
            break;
        }
    } catch (error) {
        continue;
    }
}

if (!envLoaded) {
    debug.warn('⚠️ No .env file found, using process environment');
}

// DEBUG: Verify critical environment variables (silent in production)
if (DEBUG) {
    console.log('🔧 Environment Verification:');
    console.log('📝 Contract address:', process.env.VOTING_CONTRACT_ADDRESS || 'NOT SET');
    console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    console.log('🔗 Node1 URL:', process.env.ETHEREUM_NODE1_URL || 'NOT SET');
    console.log('🔗 Node2 URL:', process.env.ETHEREUM_NODE2_URL || 'NOT SET');
}

// NOW import routes after environment is loaded
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import candidatesRoutes from './routes/candidates.js';
import votersRoutes from './routes/voters.js';
import votingRoutes from './routes/voting.js';
import pollRoutes from './routes/poll.js';
import coursesRoutes from './routes/courses.js';
import blockchainRoutes from './routes/blockchain.js';
import positionsRoutes from './routes/positions.js';

// Import database configuration
import { testConnection, cleanupPool } from './config/database.js';

// Import database pool configuration
import { pool } from './config/database.js';

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Database connection limits
const optimalConnectionLimit = pool.options?.connectionLimit || 10;
const optimalQueueLimit = pool.options?.queueLimit || 0;

// Utility function for BigInt serialization
function serializeBigInt(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item));
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = serializeBigInt(value);
        }
        return result;
    }
    return obj;
}

// Cluster setup for handling massive load
const numCPUs = os.cpus().length;
const isMaster = cluster.isPrimary || cluster.isMaster;

// Enable cluster mode for maximum performance
const DEBUG_NO_CLUSTER = false;

if (isMaster && !DEBUG_NO_CLUSTER) {
    console.log(`🚀 Master ${process.pid} is running with ${numCPUs} workers for 50+ PCs`);
    
    // Fork workers for high performance
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.error(`⚠️ Worker ${worker.process.pid} died (${code}), restarting...`);
        cluster.fork();
    });
    
    // Monitor cluster performance (silent in production)
    cluster.on('listening', (worker, address) => {
        debug.log(`🔧 Worker ${worker.process.pid} listening on ${address.address}:${address.port}`);
    });
    
} else {
    // Worker process optimized for high performance
    debug.log(`🔧 Worker ${process.pid} started`);
    
    // Performance optimization: Disable x-powered-by
    app.disable('x-powered-by');

    // Security middleware with performance optimizations
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        // Disable non-essential security features for better performance
        contentSecurityPolicy: false,
        hsts: false
    }));

    // CORS with performance optimizations
    app.use(cors({
        origin: true,
        credentials: true,
        // Cache preflight requests for 1 hour
        maxAge: 3600
    }));

    // Rate limiting optimized for 50+ desktop PCs on network
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 15000, // 15,000 requests per window for 50+ PCs (300 req/PC)
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip rate limiting for health checks and blockchain status
        skip: (req) => {
            return req.path === '/api/health' || 
                   req.path === '/api/blockchain-status' ||
                   req.path === '/' ||
                   req.method === 'OPTIONS';
        }
    });

    app.use(globalLimiter);

    // Voting-specific rate limiting for 50+ PCs
    const votingLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 3000, // 3,000 votes per minute per IP for network deployment
        message: {
            error: 'Too many vote attempts, please try again later.',
            retryAfter: '1 minute'
        },
        standardHeaders: true,
        legacyHeaders: false
    });

    // Apply voting limiter only to vote submission endpoints
    app.use('/api/voting/cast', votingLimiter);
    app.use('/api/voting/cast-blockchain', votingLimiter);

    // Body parser with optimized settings for high load
    app.use(express.json({
        limit: '10mb', // Increased for handling larger vote batches
        verify: (req, res, buf) => {
            try {
                if (buf && buf.length > 0) {
                    JSON.parse(buf);
                }
            } catch (e) {
                res.status(400).json({ error: 'Invalid JSON' });
                throw new Error('Invalid JSON');
            }
        }
    }));

    app.use(express.urlencoded({
        extended: true,
        limit: '10mb', // Increased for high load
        parameterLimit: 100 // Increased for complex forms
    }));

    // Optimized request timeout middleware for 50+ PCs
    app.use((req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({ error: 'Request timeout' });
            }
        }, 45000); // 45 seconds timeout for network latency

        // Clean up timeout on response completion
        const originalEnd = res.end;
        res.end = function(...args) {
            clearTimeout(timeout);
            originalEnd.apply(this, args);
        };

        next();
    });

    // Simple in-memory cache for frequently accessed endpoints
    const cache = new Map();
    const CACHE_TTL = 5000; // 5 seconds for dynamic data
    const STATIC_CACHE_TTL = 30000; // 30 seconds for semi-static data

    const getCachedResponse = (key) => {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        cache.delete(key);
        return null;
    };

    const setCachedResponse = (key, data, ttl = CACHE_TTL) => {
        cache.set(key, { data, timestamp: Date.now(), ttl });
    };

    // Cache middleware for poll and results endpoints
    const cacheMiddleware = (ttl = CACHE_TTL) => (req, res, next) => {
        if (req.method !== 'GET') return next();
        
        const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;
        const cached = getCachedResponse(cacheKey);
        
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
        
        const originalJson = res.json;
        res.json = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                setCachedResponse(cacheKey, data, ttl);
            }
            return originalJson.call(this, data);
        };
        
        next();
    };

    // Apply caching to frequently accessed endpoints
    app.use('/api/poll/status', cacheMiddleware(2000)); // 2s for poll status
    app.use('/api/voting/results', cacheMiddleware(5000)); // 5s for results
    app.use('/api/candidates', cacheMiddleware(STATIC_CACHE_TTL)); // 30s for candidates
    app.use('/api/positions', cacheMiddleware(STATIC_CACHE_TTL)); // 30s for positions
    app.use('/api/blockchain-status', cacheMiddleware(3000)); // 3s for blockchain status

    // Cache invalidation endpoint for admin use
    app.post('/api/admin/clear-cache', async (req, res) => {
      try {
        const { pattern } = req.body;
        let cleared = 0;
        
        if (pattern) {
          // Clear specific pattern
          for (const key of cache.keys()) {
            if (key.includes(pattern)) {
              cache.delete(key);
              cleared++;
            }
          }
        } else {
          // Clear all cache
          cleared = cache.size;
          cache.clear();
        }
        
        res.json({
          success: true,
          message: `Cache cleared successfully`,
          clearedEntries: cleared,
          pattern: pattern || 'all'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to clear cache: ' + error.message
        });
      }
    });

    // Expose cache stats endpoint
    app.get('/api/admin/cache-stats', async (req, res) => {
      res.json({
        cacheSize: cache.size,
        cacheKeys: Array.from(cache.keys()).slice(0, 100), // Limit output
        timestamp: new Date().toISOString()
      });
    });

    // Enhanced connection handling for 50+ desktop PCs on network
    app.use((req, res, next) => {
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', 'timeout=120, max=5000'); // Increased for 50+ concurrent clients
        next();
    });

    // Static files with caching
    app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
        maxAge: '1d', // Cache for 1 day
        etag: true,
        lastModified: true
    }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/candidates', candidatesRoutes);
    app.use('/api/voters', votersRoutes);
    app.use('/api/voting', votingRoutes);
    app.use('/api/poll', pollRoutes);
    app.use('/api/courses', coursesRoutes);
    app.use('/api/blockchain', blockchainRoutes);
    app.use('/api/positions', positionsRoutes);

    // Error handling middleware (required for Express 5)
    app.use((err, req, res, next) => {
        console.error('❌ Server Error:', err);
        
        if (res.headersSent) {
            return next(err);
        }
        
        res.status(err.status || 500).json({
            status: 'ERROR',
            message: err.message || 'Internal Server Error',
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    });

    // Enhanced health check with database status and performance metrics
    app.get('/api/health', async (req, res) => {
        try {
            const dbStatus = await testConnection();
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                database: dbStatus ? 'connected' : 'disconnected',
                performance: {
                    memory: {
                        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                        rss: Math.round(memoryUsage.rss / 1024 / 1024)
                    },
                    cpu: {
                        user: cpuUsage.user,
                        system: cpuUsage.system
                    },
                    uptime: Math.round(process.uptime()),
                    loadAverage: os.loadavg()
                },
                server: {
                    workerId: process.pid,
                    environment: process.env.NODE_ENV || 'development',
                    contractAddress: process.env.VOTING_CONTRACT_ADDRESS,
                    serverPort: PORT,
                    maxRequests: '5000 per 15 minutes',
                    rateLimitWindow: '15 minutes'
                }
            });
        } catch (error) {
            res.status(503).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message
            });
        }
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'Decentralized Voting System API - High Performance',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            performance: {
                maxRequests: '5000 per 15 minutes',
                rateLimitWindow: '15 minutes',
                clusterMode: true,
                workers: numCPUs
            },
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                admin: '/api/admin',
                voting: '/api/voting',
                blockchain: '/api/blockchain',
                candidates: '/api/candidates',
                voters: '/api/voters'
            }
        });
    });

    // Blockchain status endpoint
    app.get('/api/blockchain-status', async (req, res) => {
        try {
            // Import ethereumService dynamically to avoid circular dependencies
            const { ethereumService } = await import('./services/ethereumService.js');
            const blockchainInfo = await ethereumService.getBlockchainInfo();

            res.json({
                success: true,
                blockchain: serializeBigInt(blockchainInfo),
                contractAddress: process.env.VOTING_CONTRACT_ADDRESS,
                nodes: [
                    {
                        name: 'Node 1',
                        url: process.env.ETHEREUM_NODE1_URL,
                        status: 'active'
                    },
                    {
                        name: 'Node 2',
                        url: process.env.ETHEREUM_NODE2_URL,
                        status: 'active'
                    }
                ]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get blockchain status: ' + error.message
            });
        }
    });

    // Graceful shutdown endpoint
    app.post('/api/graceful-shutdown', (req, res) => {
        res.json({ message: 'Initiating graceful shutdown' });
        console.log('🔄 Manual graceful shutdown initiated');
        process.exit(0);
    });

    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });

    // Global unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Global uncaught exception handler
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        if (error.code && error.code.includes('ECONNREFUSED')) {
            console.log('Database connection error, but keeping server running');
            return;
        }
        // Only exit for critical errors
        if (error.code && (error.code.includes('EACCES') || error.code.includes('EADDRINUSE'))) {
            process.exit(1);
        }
    });

    // Graceful shutdown handler
    let isShuttingDown = false;

    const gracefulShutdown = (signal) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        console.log(`\n${signal} received, starting graceful shutdown...`);

        // Only close server if it exists
        if (server) {
            server.close((err) => {
                if (err) {
                    console.error('Error closing server:', err);
                    process.exit(1);
                }

                console.log('✅ Server closed');

                cleanupPool().then(() => {
                    console.log('✅ Database connections closed');
                    process.exit(0);
                }).catch((error) => {
                    console.error('Error closing database connections:', error);
                    process.exit(1);
                });
            });

            // Force shutdown after 15 seconds
            setTimeout(() => {
                console.log('⚠️ Forcing shutdown after timeout');
                process.exit(1);
            }, 15000);
        } else {
            console.log('❌ Server not running, exiting immediately');
            process.exit(1);
        }
    };

    // Signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Optimized memory monitoring for high load
    let memoryCheckInterval;

    const setupMemoryMonitoring = () => {
        if (memoryCheckInterval) {
            clearInterval(memoryCheckInterval);
        }

        memoryCheckInterval = setInterval(() => {
            const memoryUsage = process.memoryUsage();
            const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
            
            // Only log memory usage in development or when it's high
            if (process.env.NODE_ENV === 'development' || usedMB > 300) {
                console.log(`💾 Worker ${process.pid} Memory: ${usedMB}MB / ${totalMB}MB`);
            }
            
            // Warning threshold increased for high load
            if (usedMB > 800) {
                console.warn('🚨 High memory usage detected in worker', process.pid);
                if (global.gc) {
                    console.log('🔄 Forcing garbage collection');
                    global.gc();
                }
            }
            
            // Check for memory leaks (continuously increasing memory)
            if (usedMB > 1500) {
                console.error('🚨 CRITICAL: Very high memory usage in worker', process.pid, 'possible memory leak');
            }
        }, 30000); // Check every 30 seconds for better performance
    };

    // Start server
    let server;
    const startServer = async () => {
        try {
            debug.log(`🔧 Starting Worker ${process.pid}...`);

            // Initialize memory monitoring
            setupMemoryMonitoring();

            const dbConnected = await testConnection();
            if (!dbConnected) {
                console.error('❌ Database connection failed. Retrying in 5s...');
                setTimeout(startServer, 5000);
                return;
            }

            server = app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Worker ${process.pid} ready on port ${PORT} (50+ PCs config)`);
                debug.log(`� Health: http://localhost:${PORT}/api/health`);
                debug.log(`🔧 DB Pool: ${optimalConnectionLimit} connections`);

                // Initialize blockchain service (silent in production)
                import('./services/ethereumService.js')
                    .then(({ ethereumService }) => {
                        debug.log('🔗 Blockchain service initialized');
                    })
                    .catch(error => {
                        console.error('❌ Blockchain service failed:', error.message);
                    });
            });

            // Handle server errors
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${PORT} already in use`);
                } else {
                    console.error('❌ Server error:', error.message);
                }
                process.exit(1);
            });

            server.on('close', () => {
                debug.log(`🛑 Worker ${process.pid} closed`);
                if (memoryCheckInterval) {
                    clearInterval(memoryCheckInterval);
                }
            });

            // Optimized connection handling for 50+ desktop PCs
            server.on('connection', (socket) => {
                socket.setTimeout(120000); // 2 minute timeout for network clients
                socket.setKeepAlive(true, 60000); // 1 minute keepalive for network stability
                socket.setNoDelay(true); // Disable Nagle's algorithm for better performance
                
                // Increase socket buffer sizes for network throughput
                socket.setKeepAlive(true, 60000);
            });
            
            // Set server-level keepalive timeout
            server.keepAliveTimeout = 120000; // 2 minutes
            server.headersTimeout = 65000; // 65 seconds

        } catch (error) {
            console.error('❌ Server start failed:', error.message);
            setTimeout(startServer, 5000);
        }
    };

    startServer();
}

export default app;