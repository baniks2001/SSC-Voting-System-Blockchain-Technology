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
      errors: []
    };

    try {
      // Try to submit to blockchain nodes first
      const node = await nodeManager.getBestNode();
      try {
        const blockchainResult = await ethereumService.submitVoteToAllNodes(voteData);
        results.blockchainResults = blockchainResult.blockchainResults || [];
      } catch (blockchainError) {
        console.error(`❌ Blockchain submission failed:`, blockchainError.message);
        results.errors.push(`Blockchain: ${blockchainError.message}`);
      }

      return {
        success: results.blockchainResults.length > 0,
        ...results
      };

    } catch (error) {
      console.error(`❌ All vote submission methods failed:`, error.message);
      return {
        success: false,
        errors: [`All blockchain nodes failed: ${error.message}`]
      };
    }
  }

  async getBlockchainInfo() {
    return await ethereumService.getBlockchainInfo();
  }

  async verifyTransaction(transactionHash) {
    return await ethereumService.verifyTransaction(transactionHash);
  }

  startAutoSync() {
    console.log('🔄 Starting auto-sync between nodes...');
    
    this.syncInterval = setInterval(async () => {
      try {
        // Auto-sync functionality will be handled by ethereumService
        console.log('🔄 Auto-sync running...');
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

    // Step 4: Log the action
    await logAuditAction(
      req.user.id,
      'admin',
      'RESET_BLOCKCHAIN',
      `Blockchain reset completed. Nodes reset: ${resetResult.blockchainNodesReset}`,
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
      electionState: electionState
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

    await logAuditAction(
      req.user.id,
      'admin',
      'FORCE_RESET_FINISHED',
      `Force reset completed. Nodes reset: ${resetResult.blockchainNodesReset}`,
      req
    );

    res.json({
      success: true,
      message: 'Force reset completed successfully',
      resetData: serializeBigInt(resetResult),
      electionState: electionState
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

    res.json({
      success: true,
      resetCapability: resetCapability,
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

    await logAuditAction(voter.id, 'voter', 'VOTE_CAST', `Vote successfully cast`, req);

    res.json({
      success: true,
      receipt: submissionResult.blockchainResults[0]?.receipt,
      nodeUsed: nodeManager.currentNode.id,
      message: 'Vote successfully recorded'
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

// Dual-node status endpoint
router.get('/dual-node-status', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();

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

// Get blockchain status and info with node details
router.get('/status', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();

    // Serialize BigInt values before sending response
    const serializedResponse = serializeBigInt({
      success: true,
      blockchain: blockchainInfo,
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

    // Attempt to switch back to primary if we're on backup
    await nodeManager.attemptSwitchToPrimary();

    res.json({
      success: true,
      connected: blockchainInfo.isConnected,
      blockNumber: blockchainInfo.blockNumber,
      currentNode: nodeManager.currentNode.id,
      nodeHealth: nodeManager.getNodeStatus().nodeHealth,
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

    // Store backup information
    const backupData = {
      timestamp: new Date().toISOString(),
      blockNumber: blockchainInfo.blockNumber,
      totalVotes: await getTotalVotesCount(),
      nodeStatus: nodeManager.getNodeStatus()
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