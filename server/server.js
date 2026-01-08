import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
            console.log(`✅ Loaded .env from: ${envPath}`);
            envLoaded = true;
            break;
        }
    } catch (error) {
        continue;
    }
}

if (!envLoaded) {
    console.log('⚠️ No .env file found, using process environment');
}

// DEBUG: Verify critical environment variables
console.log('🔧 Environment Verification:');
console.log('📝 Contract address:', process.env.VOTING_CONTRACT_ADDRESS || 'NOT SET');
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('🔗 Node1 URL:', process.env.ETHEREUM_NODE1_URL || 'NOT SET');
console.log('🔗 Node2 URL:', process.env.ETHEREUM_NODE2_URL || 'NOT SET');

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

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

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

// Rate limiting with optimized settings
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased for better performance
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests from counting toward rate limit
    skipSuccessfulRequests: true
});

app.use('/api/', limiter);


// Body parser with optimized settings
app.use(express.json({
    limit: '5mb', // Reduced from 10mb to prevent memory issues
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
    limit: '5mb', // Reduced from 10mb
    parameterLimit: 50 // Limit number of parameters
}));

// Optimized request timeout middleware
app.use((req, res, next) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout' });
        }
    }, 25000); // Reduced from 30s to 25s

    // Clean up timeout on response completion
    const originalEnd = res.end;
    res.end = function(...args) {
        clearTimeout(timeout);
        originalEnd.apply(this, args);
    };

    next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Enhanced health check with database status
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        const memoryUsage = process.memoryUsage();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'connected' : 'disconnected',
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                rss: Math.round(memoryUsage.rss / 1024 / 1024)
            },
            uptime: Math.round(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            contractAddress: process.env.VOTING_CONTRACT_ADDRESS,
            serverPort: PORT,
            nodeEnv: process.env.NODE_ENV || 'development'
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
        message: 'Decentralized Voting System API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
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
            blockchain: blockchainInfo,
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);

    if (err.message && err.message.includes('heap')) {
        console.error('Memory error detected, consider increasing Node.js memory limit');
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        return res.status(500).json({
            error: 'Server is experiencing high load. Please try again later.'
        });
    }

    res.status(500).json({
        error: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
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

        // Force shutdown after 15 seconds (reduced from 30s)
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

// Memory leak prevention and monitoring
let memoryCheckInterval;

const setupMemoryMonitoring = () => {
    if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
    }

    memoryCheckInterval = setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        
        console.log(`💾 Memory usage: ${usedMB}MB / ${totalMB}MB`);
        
        // Warning threshold
        if (usedMB > 500) {
            console.warn('🚨 High memory usage detected');
            if (global.gc) {
                console.log('🔄 Forcing garbage collection');
                global.gc();
            }
        }
        
        // Check for memory leaks (continuously increasing memory)
        if (usedMB > 800) {
            console.error('🚨 CRITICAL: Very high memory usage, possible memory leak');
        }
    }, 60000); // Check every minute
};

// Start server
let server;
const startServer = async () => {
    try {
        console.log('🔧 Starting Decentralized Voting System Server...');

        // Initialize memory monitoring
        setupMemoryMonitoring();

        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your database configuration.');
            console.log('🔄 Retrying in 5 seconds...');
            setTimeout(startServer, 5000);
            return;
        }

        console.log('✅ Database connection established');

        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Access the server: http://localhost:${PORT}`);
            console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
            console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗳️ Voting API: http://localhost:${PORT}/api/voting`);
            console.log(`⛓️ Blockchain API: http://localhost:${PORT}/api/blockchain`);
            console.log(`📝 Contract Address: ${process.env.VOTING_CONTRACT_ADDRESS || 'Not configured'}`);
            console.log(`🔗 Node 1: ${process.env.ETHEREUM_NODE1_URL || 'http://localhost:8545'}`);
            console.log(`🔗 Node 2: ${process.env.ETHEREUM_NODE2_URL || 'http://localhost:8547'}`);

            // Initialize blockchain service
            import('./services/ethereumService.js')
                .then(({ ethereumService }) => {
                    console.log('🔗 Blockchain service initialized');
                })
                .catch(error => {
                    console.error('❌ Failed to initialize blockchain service:', error);
                });
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                console.log('💡 Try using a different port or stop the existing process');
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });

        server.on('close', () => {
            console.log('🛑 Server closed');
            if (memoryCheckInterval) {
                clearInterval(memoryCheckInterval);
            }
        });

        server.on('connection', (socket) => {
            socket.setTimeout(30000);
            socket.setKeepAlive(true, 60000);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.log('🔄 Retrying in 5 seconds...');
        setTimeout(startServer, 5000);
    }
};


startServer();

export default app;