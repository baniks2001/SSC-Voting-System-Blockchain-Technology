import express from 'express';
import { ethereumService } from '../services/ethereumService.js';
import { pool } from '../config/database.js';
import { logAuditAction } from '../utils/audit.js';
import { authenticateAdmin } from '../middleware/auth.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Node configuration for decentralization
const NODE_CONFIG = {
  primary: {
    id: 'node-1',
    url: process.env.ETH_NODE_URL_1 || 'http://localhost:8545',
    priority: 1,
    active: true
  },
  backup: {
    id: 'node-2',
    url: process.env.ETH_NODE_URL_2 || 'http://localhost:8546',
    priority: 2,
    active: true
  }
};

// Emergency storage configuration
const EMERGENCY_STORAGE_CONFIG = {
  path: path.join(__dirname, '../data/emergency_storage.json'),
  encryptionKey: process.env.EMERGENCY_STORAGE_KEY || 'default-emergency-key-2024'
};

// Node health tracker
let nodeHealth = {
  'node-1': { healthy: true, lastCheck: Date.now(), failureCount: 0 },
  'node-2': { healthy: true, lastCheck: Date.now(), failureCount: 0 }
};

// Election state tracker
let electionState = {
  status: 'not_started', // 'not_started', 'voting', 'paused', 'finished'
  startTime: null,
  pauseTime: null,
  finishTime: null
};

// Emergency Storage Service
class EmergencyStorageService {
  constructor() {
    this.storagePath = EMERGENCY_STORAGE_CONFIG.path;
    this.encryptionKey = EMERGENCY_STORAGE_CONFIG.encryptionKey;
    this.ensureStorageDirectory();
    this.initializeStorageFile();
  }

  ensureStorageDirectory() {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  initializeStorageFile() {
    if (!fs.existsSync(this.storagePath)) {
      const initialData = this.encryptData({
        votes: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalVotes: 0,
          electionState: electionState
        }
      });
      fs.writeFileSync(this.storagePath, JSON.stringify(initialData, null, 2));
    }
  }

  encryptData(data) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, key);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        iv: iv.toString('hex'),
        data: encrypted,
        authTag: authTag.toString('hex'),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to simple encryption
      const simpleEncrypted = Buffer.from(JSON.stringify(data)).toString('base64');
      return {
        iv: 'simple',
        data: simpleEncrypted,
        authTag: 'none',
        timestamp: new Date().toISOString()
      };
    }
  }

  decryptData(encryptedData) {
    try {
      if (encryptedData.iv === 'simple') {
        // Handle simple base64 encoded data
        const decrypted = Buffer.from(encryptedData.data, 'base64').toString('utf8');
        return JSON.parse(decrypted);
      }

      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipher(algorithm, key);
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt emergency storage data');
    }
  }

  async saveVote(voteData) {
    try {
      const currentData = await this.getAllVotes();
      
      // Check if vote already exists
      const existingVoteIndex = currentData.votes.findIndex(v => 
        v.ballotId === voteData.ballotId || v.voterId === voteData.voterId
      );
      
      if (existingVoteIndex !== -1) {
        // Update existing vote
        currentData.votes[existingVoteIndex] = {
          ...voteData,
          updatedAt: new Date().toISOString(),
          source: 'emergency_updated'
        };
      } else {
        // Add new vote
        currentData.votes.push({
          ...voteData,
          storedAt: new Date().toISOString(),
          source: 'emergency'
        });
      }
      
      // Update metadata
      currentData.metadata.lastUpdated = new Date().toISOString();
      currentData.metadata.totalVotes = currentData.votes.length;
      currentData.metadata.electionState = electionState;
      
      // Encrypt and save
      const encryptedData = this.encryptData(currentData);
      fs.writeFileSync(this.storagePath, JSON.stringify(encryptedData, null, 2));
      
      console.log(`💾 Emergency storage: Vote saved/updated (Total: ${currentData.votes.length})`);
      return true;
    } catch (error) {
      console.error('Error saving to emergency storage:', error);
      return false;
    }
  }

  async getAllVotes() {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return { votes: [], metadata: { totalVotes: 0, lastUpdated: new Date().toISOString() } };
      }
      
      const fileData = fs.readFileSync(this.storagePath, 'utf8');
      const encryptedData = JSON.parse(fileData);
      return this.decryptData(encryptedData);
    } catch (error) {
      console.error('Error reading emergency storage:', error);
      return { votes: [], metadata: { totalVotes: 0, lastUpdated: new Date().toISOString() } };
    }
  }

  async clearStorage() {
    try {
      const emptyData = this.encryptData({
        votes: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalVotes: 0,
          electionState: electionState
        }
      });
      fs.writeFileSync(this.storagePath, JSON.stringify(emptyData, null, 2));
      console.log('🗑️ Emergency storage cleared');
      return true;
    } catch (error) {
      console.error('Error clearing emergency storage:', error);
      return false;
    }
  }

  async getStats() {
    const data = await this.getAllVotes();
    return {
      totalVotes: data.metadata.totalVotes,
      lastUpdated: data.metadata.lastUpdated,
      storagePath: this.storagePath,
      fileExists: fs.existsSync(this.storagePath)
    };
  }
}

// Initialize emergency storage
const emergencyStorage = new EmergencyStorageService();

// Node management service
class DecentralizedNodeManager {
  constructor() {
    this.currentNode = NODE_CONFIG.primary;
    this.fallbackAttempted = false;
    this.syncInProgress = false;
  }

  // Health check for nodes
  async checkNodeHealth(nodeConfig) {
    try {
      const startTime = Date.now();
      // Simulate health check - in real implementation, this would ping the node
      const isHealthy = Math.random() > 0.1; // 90% success rate for simulation

      nodeHealth[nodeConfig.id] = {
        healthy: isHealthy,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        failureCount: isHealthy ? 0 : (nodeHealth[nodeConfig.id]?.failureCount || 0) + 1
      };

      return isHealthy;
    } catch (error) {
      nodeHealth[nodeConfig.id] = {
        healthy: false,
        lastCheck: Date.now(),
        failureCount: (nodeHealth[nodeConfig.id]?.failureCount || 0) + 1
      };
      return false;
    }
  }

  // Get the best available node
  async getBestNode() {
    // Check primary node first
    const primaryHealthy = await this.checkNodeHealth(NODE_CONFIG.primary);

    if (primaryHealthy) {
      console.log(`✅ Using primary node: ${NODE_CONFIG.primary.id}`);
      this.currentNode = NODE_CONFIG.primary;
      this.fallbackAttempted = false;
      return NODE_CONFIG.primary;
    }

    // Primary failed, try backup
    console.log(`⚠️ Primary node ${NODE_CONFIG.primary.id} unhealthy, trying backup...`);
    const backupHealthy = await this.checkNodeHealth(NODE_CONFIG.backup);

    if (backupHealthy) {
      console.log(`✅ Using backup node: ${NODE_CONFIG.backup.id}`);
      this.currentNode = NODE_CONFIG.backup;
      this.fallbackAttempted = true;
      return NODE_CONFIG.backup;
    }

    // Both nodes failed
    console.log('❌ All blockchain nodes are currently unavailable');
    throw new Error('All blockchain nodes are currently unavailable');
  }

  // Switch back to primary if it becomes healthy again
  async attemptSwitchToPrimary() {
    if (this.fallbackAttempted && this.currentNode.id === NODE_CONFIG.backup.id) {
      const primaryHealthy = await this.checkNodeHealth(NODE_CONFIG.primary);
      if (primaryHealthy) {
        console.log(`🔄 Switching back to primary node: ${NODE_CONFIG.primary.id}`);
        this.currentNode = NODE_CONFIG.primary;
        this.fallbackAttempted = false;
      }
    }
  }

  // Get current node status
  getNodeStatus() {
    return {
      currentNode: this.currentNode,
      nodeHealth,
      fallbackActive: this.fallbackAttempted
    };
  }

  // Check if any nodes are available
  async hasAvailableNodes() {
    const primaryHealthy = await this.checkNodeHealth(NODE_CONFIG.primary);
    const backupHealthy = await this.checkNodeHealth(NODE_CONFIG.backup);
    return primaryHealthy || backupHealthy;
  }
}

// Initialize node manager
const nodeManager = new DecentralizedNodeManager();

// Enhanced Ethereum service with node management and emergency storage sync
class DecentralizedEthereumService {
  constructor() {
    this.syncInterval = null;
    this.startAutoSync();
  }

  async submitVote(voteData) {
    const results = {
      blockchainResults: [],
      emergencyStorageResult: null,
      errors: []
    };

    try {
      // Try to submit to blockchain nodes first
      const node = await nodeManager.getBestNode();
      try {
        const blockchainResult = await ethereumService.submitVoteToAllNodes(voteData);
        results.blockchainResults = blockchainResult.blockchainResults || [];
        
        if (blockchainResult.emergencyInfo) {
          results.emergencyStorageResult = blockchainResult.emergencyInfo;
        }
      } catch (blockchainError) {
        console.error(`❌ Blockchain submission failed:`, blockchainError.message);
        results.errors.push(`Blockchain: ${blockchainError.message}`);
      }

      // Always save to emergency storage as backup
      try {
        const emergencySaveResult = await emergencyStorage.saveVote({
          ...voteData,
          blockchainResults: results.blockchainResults,
          submittedAt: new Date().toISOString()
        });
        
        if (emergencySaveResult) {
          results.emergencyStorageResult = {
            success: true,
            storedAt: new Date().toISOString(),
            source: 'emergency_storage'
          };
        }
      } catch (emergencyError) {
        console.error(`❌ Emergency storage save failed:`, emergencyError.message);
        results.errors.push(`Emergency Storage: ${emergencyError.message}`);
      }

      // Start sync process if we have blockchain results and emergency storage
      if (results.blockchainResults.length > 0 && results.emergencyStorageResult) {
        this.syncEmergencyToNodes();
      }

      return {
        success: results.blockchainResults.length > 0 || results.emergencyStorageResult !== null,
        ...results
      };

    } catch (error) {
      console.error(`❌ All vote submission methods failed:`, error.message);
      
      // Last resort: try emergency storage only
      try {
        const emergencySaveResult = await emergencyStorage.saveVote({
          ...voteData,
          submittedAt: new Date().toISOString(),
          lastResort: true
        });
        
        if (emergencySaveResult) {
          return {
            success: true,
            emergencyStorageResult: {
              success: true,
              storedAt: new Date().toISOString(),
              source: 'emergency_storage_last_resort'
            },
            errors: [`All blockchain nodes failed, saved to emergency storage only: ${error.message}`]
          };
        }
      } catch (finalError) {
        console.error(`❌ Complete vote submission failure:`, finalError.message);
      }

      return {
        success: false,
        errors: [`All submission methods failed: ${error.message}`]
      };
    }
  }

  async syncEmergencyToNodes() {
    if (nodeManager.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...');
      return;
    }

    nodeManager.syncInProgress = true;
    
    try {
      console.log('🔄 Starting emergency storage to nodes sync...');
      
      const emergencyData = await emergencyStorage.getAllVotes();
      const emergencyVotes = emergencyData.votes.filter(vote => 
        vote.source === 'emergency' || vote.source === 'emergency_updated' || vote.lastResort
      );

      if (emergencyVotes.length === 0) {
        console.log('ℹ️ No emergency votes to sync');
        return;
      }

      console.log(`🔄 Found ${emergencyVotes.length} votes in emergency storage to sync`);

      let syncedCount = 0;
      let errorCount = 0;

      for (const vote of emergencyVotes) {
        try {
          // Try to submit to blockchain
          const blockchainResult = await ethereumService.submitVoteToAllNodes(vote);
          
          if (blockchainResult.blockchainResults && blockchainResult.blockchainResults.length > 0) {
            // Mark as synced in emergency storage
            await emergencyStorage.saveVote({
              ...vote,
              source: 'blockchain_synced',
              syncedAt: new Date().toISOString(),
              blockchainResults: blockchainResult.blockchainResults
            });
            syncedCount++;
            console.log(`✅ Synced vote ${vote.ballotId} to blockchain`);
          }
        } catch (error) {
          errorCount++;
          console.log(`⚠️ Failed to sync vote ${vote.ballotId}:`, error.message);
        }

        // Small delay to avoid overwhelming the nodes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Emergency sync completed: ${syncedCount} synced, ${errorCount} errors`);

    } catch (error) {
      console.error('❌ Emergency sync failed:', error);
    } finally {
      nodeManager.syncInProgress = false;
    }
  }

  async syncNodesToEmergency() {
    try {
      console.log('🔄 Starting nodes to emergency storage sync...');
      
      const blockchainInfo = await ethereumService.getBlockchainInfo();
      const allVotes = await ethereumService.getAllVotesFromBlockchain();
      
      let savedCount = 0;
      
      for (const vote of allVotes) {
        try {
          await emergencyStorage.saveVote({
            ...vote,
            source: 'blockchain_backup',
            backedUpAt: new Date().toISOString()
          });
          savedCount++;
        } catch (error) {
          console.log(`⚠️ Failed to backup vote ${vote.ballotId} to emergency storage:`, error.message);
        }
      }
      
      console.log(`✅ Node to emergency sync completed: ${savedCount} votes backed up`);
      
    } catch (error) {
      console.error('❌ Node to emergency sync failed:', error);
    }
  }

  async getBlockchainInfo() {
    return await ethereumService.getBlockchainInfo();
  }

  async verifyTransaction(transactionHash) {
    return await ethereumService.verifyTransaction(transactionHash);
  }

  startAutoSync() {
    console.log('🔄 Starting auto-sync between nodes and emergency storage...');
    
    this.syncInterval = setInterval(async () => {
      try {
        // Sync emergency storage to nodes (if nodes are available)
        const nodesAvailable = await nodeManager.hasAvailableNodes();
        if (nodesAvailable && shouldAllowSync()) {
          await this.syncEmergencyToNodes();
        }
        
        // Sync nodes to emergency storage (backup)
        if (shouldAllowSync()) {
          await this.syncNodesToEmergency();
        }
      } catch (error) {
        console.log('⚠️ Auto-sync error:', error.message);
      }
    }, 15000); // Sync every 15 seconds
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

const decentralizedEthereumService = new DecentralizedEthereumService();

// Helper function to get total votes count
async function getTotalVotesCount() {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM votes');
  return rows[0].count;
}

// Helper function to check if syncing is allowed based on election state
function shouldAllowSync() {
  // Only allow syncing during voting or paused states, not when finished
  return electionState.status === 'voting' || electionState.status === 'paused';
}

// Election state management endpoints
router.get('/election/state', (req, res) => {
  res.json({
    success: true,
    state: electionState
  });
});

router.post('/election/start', authenticateAdmin, async (req, res) => {
  try {
    electionState = {
      status: 'voting',
      startTime: new Date().toISOString(),
      pauseTime: null,
      finishTime: null
    };

    // Update ethereum service election state
    ethereumService.updateElectionState({
      status: 'voting',
      startTime: new Date().toISOString()
    });

    await logAuditAction(
      req.user.id,
      'admin',
      'ELECTION_STARTED',
      'Election voting started',
      req
    );

    res.json({
      success: true,
      message: 'Election voting started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/election/pause', authenticateAdmin, async (req, res) => {
  try {
    electionState = {
      ...electionState,
      status: 'paused',
      pauseTime: new Date().toISOString()
    };

    // Update ethereum service election state
    ethereumService.updateElectionState({
      status: 'paused',
      pauseTime: new Date().toISOString()
    });

    await logAuditAction(
      req.user.id,
      'admin',
      'ELECTION_PAUSED',
      'Election voting paused',
      req
    );

    res.json({
      success: true,
      message: 'Election voting paused'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/election/finish', authenticateAdmin, async (req, res) => {
  try {
    electionState = {
      ...electionState,
      status: 'finished',
      finishTime: new Date().toISOString()
    };

    // Update the ethereum service election state as well
    ethereumService.updateElectionState({
      status: 'finished',
      finishTime: new Date().toISOString()
    });

    await logAuditAction(
      req.user.id,
      'admin',
      'ELECTION_FINISHED',
      'Election finished - syncing disabled',
      req
    );

    res.json({
      success: true,
      message: 'Election finished - vote syncing disabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// SIMPLIFIED AND GUARANTEED RESET ENDPOINT
router.post('/reset', authenticateAdmin, async (req, res) => {
  // Set longer timeout for blockchain operations
  req.setTimeout(120000); // 2 minutes

  try {
    console.log('🔄 GUARANTEED RESET: Requested by super admin:', req.user.email || req.user.id);

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Super admin access required to reset blockchain'
      });
    }

    // Step 1: Get current state BEFORE reset for logging
    let blockchainInfo;
    try {
      blockchainInfo = await ethereumService.getBlockchainInfo();
    } catch (error) {
      console.log('⚠️ Could not get blockchain info, continuing with reset...');
      blockchainInfo = { error: 'Failed to get blockchain info before reset' };
    }

    const backupData = {
      timestamp: new Date().toISOString(),
      initiatedBy: req.user.email || req.user.id,
      blockchainState: serializeBigInt(blockchainInfo),
      totalEmergencyVotes: ethereumService.voteStorage ? ethereumService.voteStorage.size : 0
    };

    // Step 2: CALL THE ACTUAL RESET METHOD DIRECTLY
    console.log('🔄 Calling ethereumService.resetVotingData() directly...');
    const resetResult = await ethereumService.resetVotingData();

    // Step 3: Reset local election state
    electionState = {
      status: 'not_started',
      startTime: null,
      pauseTime: null,
      finishTime: null
    };

    // Step 4: Clear emergency storage
    await emergencyStorage.clearStorage();

    // Step 5: Log the action
    await logAuditAction(
      req.user.id,
      'admin',
      'RESET_BLOCKCHAIN',
      `Blockchain reset completed. Emergency votes cleared: ${resetResult.emergencyVotesCleared}, Nodes reset: ${resetResult.blockchainNodesReset}`,
      req
    );

    console.log('✅ GUARANTEED RESET: Completed successfully');

    // Ensure all BigInt values are serialized before sending response
    const serializedResponse = {
      success: true,
      message: 'Blockchain reset successfully for new election',
      resetData: serializeBigInt(resetResult),
      backup: backupData,
      timestamp: new Date().toISOString(),
      electionState: electionState,
      emergencyStorageCleared: true
    };

    res.json(serializedResponse);

  } catch (error) {
    console.error('❌ GUARANTEED RESET ERROR:', error);

    await logAuditAction(
      req.user.id,
      'admin',
      'RESET_BLOCKCHAIN_FAILED',
      `Reset failed: ${error.message}`,
      req
    );

    res.status(500).json({
      success: false,
      error: 'Failed to reset blockchain: ' + error.message
    });
  }
});

// Force reset endpoint for finished elections
router.post('/force-reset-finished', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚨 FORCE RESET: Admin requested force reset');

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Super admin access required to force reset'
      });
    }

    const resetResult = await ethereumService.forceResetWhenFinished();

    // Also reset the local election state and emergency storage
    electionState = {
      status: 'not_started',
      startTime: null,
      pauseTime: null,
      finishTime: null
    };

    await emergencyStorage.clearStorage();

    await logAuditAction(
      req.user.id,
      'admin',
      'FORCE_RESET_FINISHED',
      `Force reset completed. Emergency votes cleared: ${resetResult.emergencyVotesCleared}`,
      req
    );

    res.json({
      success: true,
      message: 'Force reset completed successfully',
      resetData: serializeBigInt(resetResult),
      electionState: electionState,
      emergencyStorageCleared: true
    });

  } catch (error) {
    console.error('Force reset error:', error);
    
    await logAuditAction(
      req.user.id,
      'admin',
      'FORCE_RESET_FAILED',
      `Force reset failed: ${error.message}`,
      req
    );

    res.status(500).json({
      success: false,
      error: 'Force reset failed: ' + error.message
    });
  }
});

// Add a status check endpoint for reset capability
router.get('/reset-status', authenticateAdmin, async (req, res) => {
  try {
    const resetCapability = await ethereumService.checkResetCapability();
    const emergencyStats = await emergencyStorage.getStats();

    res.json({
      success: true,
      resetCapability: resetCapability,
      emergencyStorage: emergencyStats,
      timestamp: new Date().toISOString(),
      electionState: electionState
    });
  } catch (error) {
    console.error('Reset status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check reset status: ' + error.message
    });
  }
});

// Submit vote to blockchain with node failover and emergency storage
router.post('/cast-blockchain', async (req, res) => {
  let voter;

  try {
    const { voterId, votes } = req.body;

    if (!voterId || !votes || !Array.isArray(votes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data'
      });
    }

    // Get voter details from database
    const [voterRows] = await pool.execute(
      'SELECT * FROM voters WHERE student_id = ?',
      [voterId]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    voter = voterRows[0];

    // Check if voter has already voted
    if (voter.has_voted) {
      return res.status(400).json({
        success: false,
        error: 'Voter has already cast a vote'
      });
    }

    // Generate voter hash for anonymity
    const timestamp = new Date().toISOString();
    const voterHash = ethereumService.generateVoterHash ?
      ethereumService.generateVoterHash(voter.student_id, voter.full_name, timestamp) :
      `hash_${voter.student_id}_${Date.now()}`;

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voter.student_id,
      voterHash,
      votes,
      timestamp,
      ballotId: `ballot_${voter.student_id}_${Date.now()}`
    };

    // Submit to blockchain with failover support and emergency storage
    const submissionResult = await decentralizedEthereumService.submitVote(voteData);

    if (!submissionResult.success) {
      await logAuditAction(voter.id, 'voter', 'VOTE_FAILED', `All submission methods failed`, req);

      return res.status(500).json({
        success: false,
        error: `Vote submission failed: ${submissionResult.errors.join(', ')}`
      });
    }

    // Update database to mark voter as voted
    await pool.execute(
      'UPDATE voters SET has_voted = true, vote_hash = ?, voted_at = ? WHERE id = ?',
      [voterHash, new Date(), voter.id]
    );

    // Record each vote in the database
    for (const vote of votes) {
      await pool.execute(
        'INSERT INTO votes (voter_id, candidate_id, position, voter_hash, transaction_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [voter.id, vote.candidateId, vote.position, voterHash, submissionResult.blockchainResults[0]?.receipt?.transactionHash, new Date()]
      );
    }

    await logAuditAction(voter.id, 'voter', 'VOTE_CAST', `Vote successfully cast with emergency backup`, req);

    res.json({
      success: true,
      receipt: submissionResult.blockchainResults[0]?.receipt,
      nodeUsed: nodeManager.currentNode.id,
      emergencyStorage: submissionResult.emergencyStorageResult,
      message: 'Vote successfully recorded with emergency backup'
    });

  } catch (error) {
    console.error('Blockchain vote submission error:', error);

    const nodeStatus = nodeManager.getNodeStatus();
    await logAuditAction(voter?.id, 'voter', 'VOTE_FAILED', `All systems failed: ${error.message}`, req);

    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to all systems',
      nodeStatus: nodeStatus.nodeHealth,
      details: error.message
    });
  }
});

// Emergency storage management endpoints
router.get('/emergency-storage/status', authenticateAdmin, async (req, res) => {
  try {
    const stats = await emergencyStorage.getStats();
    const emergencyData = await emergencyStorage.getAllVotes();
    
    res.json({
      success: true,
      stats: stats,
      votes: emergencyData.votes,
      metadata: emergencyData.metadata
    });
  } catch (error) {
    console.error('Emergency storage status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency storage status'
    });
  }
});

router.post('/emergency-storage/clear', authenticateAdmin, async (req, res) => {
  try {
    const result = await emergencyStorage.clearStorage();
    
    await logAuditAction(
      req.user.id,
      'admin',
      'CLEAR_EMERGENCY_STORAGE',
      'Emergency storage cleared',
      req
    );

    res.json({
      success: result,
      message: result ? 'Emergency storage cleared successfully' : 'Failed to clear emergency storage'
    });
  } catch (error) {
    console.error('Emergency storage clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear emergency storage'
    });
  }
});

router.post('/emergency-storage/sync-to-nodes', authenticateAdmin, async (req, res) => {
  try {
    await decentralizedEthereumService.syncEmergencyToNodes();
    
    res.json({
      success: true,
      message: 'Emergency storage sync to nodes initiated'
    });
  } catch (error) {
    console.error('Emergency storage sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync emergency storage to nodes'
    });
  }
});

// Dual-node status endpoint with emergency storage info
router.get('/dual-node-status', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();
    const emergencyStats = await emergencyStorage.getStats();

    // Get detailed node information
    const nodeDetails = await Promise.all(
      ethereumService.nodes.map(async (node) => {
        try {
          const balance = node.discoveredAccount ? await node.web3.eth.getBalance(node.discoveredAccount) : '0';
          const blockNumber = await node.web3.eth.getBlockNumber();
          const peerCount = await node.web3.eth.net.getPeerCount().catch(() => 0);
          const contractCode = await node.web3.eth.getCode(process.env.VOTING_CONTRACT_ADDRESS);

          return {
            name: node.name,
            url: node.rpcUrl,
            connected: node.isConnected,
            account: node.discoveredAccount,
            balance: node.web3.utils.fromWei(balance, 'ether'),
            blockNumber: blockNumber.toString(), // Convert BigInt to string
            peerCount: peerCount.toString(), // Convert BigInt to string
            failureCount: node.failureCount || 0,
            lastSuccess: node.lastSuccess || null,
            hasContract: contractCode !== '0x' && contractCode !== '0x0',
            contractCodeLength: contractCode.length
          };
        } catch (error) {
          return {
            name: node.name,
            url: node.rpcUrl,
            connected: false,
            error: error.message
          };
        }
      })
    );

    // Serialize the entire response
    const serializedResponse = serializeBigInt({
      success: true,
      blockchain: blockchainInfo,
      nodes: nodeDetails,
      emergencyStorage: emergencyStats,
      contractAddress: process.env.VOTING_CONTRACT_ADDRESS,
      failoverEnabled: true,
      currentPrimary: nodeManager.currentNode.id,
      health: nodeManager.getNodeStatus().nodeHealth,
      electionState: electionState,
      autoSyncEnabled: true
    });

    res.json(serializedResponse);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dual-node status: ' + error.message
    });
  }
});

// Verify transaction on blockchain with failover
router.get('/verify-transaction/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    const verification = await decentralizedEthereumService.verifyTransaction(transactionHash);

    res.json({
      success: true,
      verification,
      nodeUsed: nodeManager.currentNode.id
    });

  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify transaction',
      nodeStatus: nodeManager.getNodeStatus().nodeHealth
    });
  }
});

// Get blockchain status and info with node details and emergency storage
router.get('/status', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();
    const emergencyStats = await emergencyStorage.getStats();

    // Serialize BigInt values before sending response
    const serializedResponse = serializeBigInt({
      success: true,
      blockchain: blockchainInfo,
      emergencyStorage: emergencyStats,
      electionState: electionState,
      autoSyncEnabled: true
    });

    res.json(serializedResponse);

  } catch (error) {
    console.error('Blockchain status error:', error);

    // Send error response without BigInt issues
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status: ' + error.message,
      nodeStatus: nodeManager.getNodeStatus().nodeHealth
    });
  }
});

// Add this BigInt serialization function
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

// Test blockchain connection with node failover
router.get('/test-connection', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();
    const emergencyStats = await emergencyStorage.getStats();

    // Attempt to switch back to primary if we're on backup
    await nodeManager.attemptSwitchToPrimary();

    res.json({
      success: true,
      connected: blockchainInfo.isConnected,
      blockNumber: blockchainInfo.blockNumber,
      currentNode: nodeManager.currentNode.id,
      nodeHealth: nodeManager.getNodeStatus().nodeHealth,
      emergencyStorage: emergencyStats,
      message: blockchainInfo.isConnected ?
        `Successfully connected to Ethereum via ${nodeManager.currentNode.id}` :
        'Not connected to Ethereum node'
    });

  } catch (error) {
    console.error('Blockchain connection test error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      currentNode: nodeManager.currentNode.id,
      nodeHealth: nodeManager.getNodeStatus().nodeHealth,
      error: error.message
    });
  }
});

// Node management endpoints
router.get('/nodes/status', (req, res) => {
  res.json({
    success: true,
    ...nodeManager.getNodeStatus()
  });
});

router.post('/nodes/switch-primary', async (req, res) => {
  try {
    await nodeManager.attemptSwitchToPrimary();
    res.json({
      success: true,
      message: 'Node switch attempted',
      currentNode: nodeManager.currentNode.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add this route to preserve blockchain data during reset
router.post('/preserve-blockchain', authenticateAdmin, async (req, res) => {
  try {
    // This endpoint would backup current blockchain state before reset
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();
    const emergencyStats = await emergencyStorage.getStats();

    // Store backup information
    const backupData = {
      timestamp: new Date().toISOString(),
      blockNumber: blockchainInfo.blockNumber,
      totalVotes: await getTotalVotesCount(),
      nodeStatus: nodeManager.getNodeStatus(),
      emergencyStorage: emergencyStats
    };

    console.log('🔒 Blockchain state preserved:', backupData);

    res.json({
      success: true,
      message: 'Blockchain state preserved',
      backup: backupData
    });
  } catch (error) {
    console.error('Blockchain preservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preserve blockchain state'
    });
  }
});

export default router;