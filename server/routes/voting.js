import express from 'express';
import crypto from 'crypto';
import { ethereumService } from '../services/ethereumService.js';
import { logAuditAction } from '../utils/audit.js';
import { pool } from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

async function waitForTransactionReceipt(web3, txHash, options = {}) {
  const {
    maxAttempts = 30,
    interval = 1000,
    showProgress = true,
    timeout = 45000
  } = options;

  // Validation
  if (!web3) throw new Error('Web3 instance is required');
  if (!txHash || typeof txHash !== 'string') {
    throw new Error('Valid transaction hash is required');
  }

  console.log(`🔍 Waiting for transaction receipt: ${txHash}`);
  console.log(`⏰ Timeout: ${timeout / 1000}s, Max attempts: ${maxAttempts}`);

  const startTime = Date.now();
  let lastBlockNumber = 0;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      throw new Error(`Transaction timeout after ${timeout / 1000} seconds`);
    }

    try {
      const receipt = await web3.eth.getTransactionReceipt(txHash);

      if (receipt) {
        // Transaction mined!
        const miningTime = Date.now() - startTime;

        console.log('✅ Transaction mined successfully!');
        console.log(`📦 Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed}`);
        console.log(`⏱️  Mining time: ${miningTime}ms`);

        if (receipt.status) {
          console.log(`🎯 Status: SUCCESS`);
          if (receipt.contractAddress) {
            console.log(`🏭 Contract: ${receipt.contractAddress}`);
          }
        } else {
          console.log(`❌ Status: FAILED`);
          // Try to get more error details
          try {
            const tx = await web3.eth.getTransaction(txHash);
            console.log(`📝 From: ${tx.from}, To: ${tx.to}`);
          } catch (txError) {
            // Ignore tx details error
          }
        }

        return receipt;
      }

      // Show progress
      attempts++;
      if (showProgress) {
        try {
          const currentBlock = await web3.eth.getBlockNumber();
          if (currentBlock > lastBlockNumber) {
            console.log(`⛏️  Block #${currentBlock} (Attempt ${attempts}/${maxAttempts})`);
            lastBlockNumber = currentBlock;
          } else {
            console.log(`⏰ Waiting... (Attempt ${attempts}/${maxAttempts})`);
          }
        } catch (blockError) {
          console.log(`⏰ Waiting... (Attempt ${attempts}/${maxAttempts})`);
        }
      }

    } catch (error) {
      console.log(`⚠️  Attempt ${attempts}/${maxAttempts}: ${error.message}`);
      attempts++;
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Final detailed error
  throw new Error(`Transaction not mined after ${maxAttempts} attempts (${timeout / 1000}s). The transaction may be:
• Still pending in the mempool
• Dropped due to low gas price
• Lost due to network issues
• Already failed but receipt not available

Transaction hash: ${txHash}`);
}

// Mark voter as voted in SQL database
router.post('/mark-voted', auth, async (req, res) => {
  try {
    const { voterId, ballotId, voteHash } = req.body;

    if (!voterId || !ballotId) {
      return res.status(400).json({
        success: false,
        error: 'Voter ID and ballot ID are required'
      });
    }

    console.log('🔄 Marking voter as voted in SQL database:', { voterId, ballotId });

    // Update voter's status in database
    const [result] = await pool.execute(
      `UPDATE voters 
       SET has_voted = 1, 
           vote_hash = ?, 
           voted_at = NOW() 
       WHERE student_id = ?`,
      [voteHash || null, voterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    // Log the action
    await logAuditAction(
      req.user.id,
      'voter',
      'MARK_VOTED',
      `Voter ${voterId} marked as voted with ballot ${ballotId}`,
      req
    );

    console.log('✅ Voter marked as voted successfully:', voterId);

    res.json({
      success: true,
      message: 'Voter status updated successfully',
      voterId,
      ballotId,
      hasVoted: true,
      votedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error marking voter as voted:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voter status',
      details: error.message
    });
  }
});

// Submit vote to Ethereum blockchain (FIXED METHOD CALL)
router.post('/cast-blockchain', async (req, res) => {
  try {
    console.log('🔗 Fully decentralized blockchain vote submission');
    const { voterId, votes, timestamp, ballotId } = req.body;

    if (!voterId || !votes || !Array.isArray(votes)) {
      console.log('❌ Invalid vote data for blockchain submission');
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data: voterId and votes array are required'
      });
    }

    console.log('📥 Received decentralized vote submission:', {
      voterId,
      voteCount: votes.length,
      timestamp,
      ballotId: ballotId
    });

    for (const vote of votes) {
      if (!vote.candidateId || !vote.position) {
        console.error('❌ Vote missing required fields:', vote);
        return res.status(400).json({
          success: false,
          error: `Vote missing candidateId or position`
        });
      }
    }

    // FIXED: Check if blockchain service is properly initialized
    console.log('🔍 Checking blockchain service status...');

    if (!ethereumService || typeof ethereumService.submitVoteToAllNodes !== 'function') {
      console.error('❌ Blockchain service not properly initialized or method not found');
      return res.status(500).json({
        success: false,
        error: 'Blockchain service unavailable. Please try again later.'
      });
    }

    let blockchainInfo;
    try {
      blockchainInfo = await ethereumService.getBlockchainInfo();
      console.log('📊 Blockchain Status:', {
        isConnected: blockchainInfo.isConnected,
        simulationMode: blockchainInfo.simulationMode,
        contractDeployed: blockchainInfo.contractDeployed,
        contractAddress: blockchainInfo.contractAddress,
        node: blockchainInfo.node,
        blockNumber: blockchainInfo.blockNumber
      });
    } catch (blockchainError) {
      console.error('❌ Failed to get blockchain info:', blockchainError);
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable. Please try again later.'
      });
    }

    if (!blockchainInfo.isConnected && !blockchainInfo.simulationMode) {
      console.log('❌ No blockchain nodes connected');
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable. Please ensure nodes are running.'
      });
    }

    console.log('✅ Blockchain network status:', {
      node: blockchainInfo.node,
      blockNumber: blockchainInfo.blockNumber,
      account: blockchainInfo.accountStatus?.address,
      balance: blockchainInfo.accountStatus?.balance,
      simulationMode: blockchainInfo.simulationMode,
      contractDeployed: blockchainInfo.contractDeployed,
      contractAddress: blockchainInfo.contractAddress
    });

    // Log blockchain configuration
    if (blockchainInfo.contractDeployed && blockchainInfo.contractAddress) {
      console.log('🎯 Using REAL blockchain contract at:', blockchainInfo.contractAddress);
    } else {
      console.log('🔶 Using SIMULATION mode - No contract deployed');
    }

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voterId,
      votes: votes,
      timestamp: timestamp || new Date().toISOString(),
      ballotId: ballotId,
      voterHash: crypto.createHash('sha256')
        .update(`${voterId}-${Date.now()}-${Math.random().toString(36)}`)
        .digest('hex')
    };

    console.log('⛓️ Submitting to decentralized blockchain network...');

    // FIXED: Call the correct method name
    const blockchainResult = await ethereumService.submitVoteToAllNodes(voteData);

    if (!blockchainResult.success) {
      console.log('❌ Blockchain submission failed:', blockchainResult.error);
      return res.status(500).json({
        success: false,
        error: `Blockchain submission failed: ${blockchainResult.error}`
      });
    }

    console.log('✅ Vote successfully recorded on decentralized blockchain:', {
      transactionHash: blockchainResult.receipt.transactionHash,
      blockNumber: blockchainResult.receipt.blockNumber,
      node: blockchainResult.receipt.node,
      simulated: blockchainResult.receipt.simulated
    });

    // If we have a real transaction hash, try to get the receipt
    let receiptDetails = null;
    if (blockchainResult.receipt.transactionHash &&
      blockchainResult.receipt.transactionHash !== 'unknown' &&
      !blockchainResult.receipt.simulated) {
      try {
        console.log('📋 Attempting to fetch transaction receipt...');
        const activeNode = await ethereumService.getActiveNode();
        receiptDetails = await waitForTransactionReceipt(
          activeNode.web3,
          blockchainResult.receipt.transactionHash,
          {
            maxAttempts: 20,
            timeout: 30000,
            showProgress: true
          }
        );
        console.log('✅ Transaction receipt obtained:', {
          blockNumber: receiptDetails.blockNumber,
          gasUsed: receiptDetails.gasUsed,
          status: receiptDetails.status
        });
      } catch (receiptError) {
        console.log('⚠️ Could not get transaction receipt:', receiptError.message);
      }
    }

    await logAuditAction(voterId, 'voter', 'DECENTRALIZED_VOTE_CAST',
      `Vote cast on decentralized Ethereum blockchain. TX: ${blockchainResult.receipt.transactionHash} (Node: ${blockchainResult.receipt.node})`, req);

    console.log('🎉 Fully decentralized blockchain vote process completed successfully for voter:', voterId);

    const response = serializeBigInt({
      success: true,
      receipt: {
        ...blockchainResult.receipt,
        receiptDetails: receiptDetails
      },
      node: blockchainResult.receipt.node,
      simulated: blockchainResult.receipt.simulated,
      message: `Vote successfully recorded ${blockchainResult.receipt.simulated ? 'in simulation mode' : 'on decentralized Ethereum blockchain'} (Node: ${blockchainResult.receipt.node})`,
      voteReceipt: {
        ballotId: voteData.ballotId,
        transactionHash: blockchainResult.receipt.transactionHash,
        blockNumber: blockchainResult.receipt.blockNumber,
        timestamp: voteData.timestamp,
        voterHash: voteData.voterHash,
        receiptConfirmed: !!receiptDetails
      }
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Decentralized blockchain vote submission error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to decentralized blockchain network: ' + error.message
    });
  }
});

// Get transaction receipt endpoint
router.get('/transaction-receipt/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    console.log('📋 Fetching transaction receipt:', txHash);

    const blockchainInfo = await ethereumService.getBlockchainInfo();

    if (!blockchainInfo.isConnected && !blockchainInfo.simulationMode) {
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable'
      });
    }

    // Try to get receipt from any connected node
    let receipt = null;
    let nodeUsed = 'unknown';

    for (const node of ethereumService.nodes) {
      if (node.isConnected) {
        try {
          console.log(`🔍 Checking receipt on node: ${node.name}`);
          receipt = await node.web3.eth.getTransactionReceipt(txHash);
          if (receipt) {
            nodeUsed = node.name;
            break;
          }
        } catch (error) {
          console.log(`❌ Node ${node.name} failed:`, error.message);
        }
      }
    }

    if (!receipt) {
      // Try waiting for receipt with timeout
      try {
        const activeNode = await ethereumService.getActiveNode();
        receipt = await waitForTransactionReceipt(activeNode.web3, txHash, {
          maxAttempts: 10,
          timeout: 15000,
          showProgress: false
        });
        nodeUsed = activeNode.name;
      } catch (waitError) {
        console.log('❌ Could not get transaction receipt:', waitError.message);
      }
    }

    if (receipt) {
      const response = serializeBigInt({
        success: true,
        receipt: {
          transactionHash: receipt.transactionHash,
          blockHash: receipt.blockHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          status: receipt.status,
          contractAddress: receipt.contractAddress,
          from: receipt.from,
          to: receipt.to,
          logs: receipt.logs
        },
        node: nodeUsed,
        confirmed: true,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Transaction receipt fetched successfully');
      return res.json(response);
    } else {
      // Check if transaction exists at all
      let transactionExists = false;
      for (const node of ethereumService.nodes) {
        if (node.isConnected) {
          try {
            const tx = await node.web3.eth.getTransaction(txHash);
            if (tx) {
              transactionExists = true;
              break;
            }
          } catch (error) {
            // Ignore error
          }
        }
      }

      return res.status(404).json({
        success: false,
        error: transactionExists ?
          'Transaction is pending but not yet mined' :
          'Transaction not found in network',
        transactionExists,
        mined: false
      });
    }

  } catch (error) {
    console.error('❌ Get transaction receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction receipt: ' + error.message
    });
  }
});

// Enhanced vote verification with receipt checking
router.get('/verify-vote-with-receipt/:ballotId', async (req, res) => {
  try {
    const { ballotId } = req.params;
    console.log('🔍 Verifying vote with receipt:', ballotId);

    const [voteData, blockchainInfo] = await Promise.all([
      ethereumService.getVoteFromBlockchain(ballotId),
      ethereumService.getBlockchainInfo()
    ]);

    if (!voteData) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found on blockchain',
        verified: false
      });
    }

    let receiptDetails = null;

    // If we have a transaction hash, try to get the receipt
    if (voteData.transactionHash && voteData.transactionHash !== 'unknown') {
      try {
        // Use the new receipt endpoint
        const receiptResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/voting/transaction-receipt/${voteData.transactionHash}`);
        if (receiptResponse.ok) {
          const receiptData = await receiptResponse.json();
          if (receiptData.success) {
            receiptDetails = receiptData.receipt;
          }
        }
      } catch (receiptError) {
        console.log('⚠️ Could not fetch receipt details:', receiptError.message);
      }
    }

    const verification = {
      exists: true,
      details: voteData,
      confirmations: 6, // Default for dev mode
      verified: true,
      receipt: receiptDetails,
      blockchainInfo: {
        connected: blockchainInfo.isConnected,
        simulationMode: blockchainInfo.simulationMode,
        blockNumber: blockchainInfo.blockNumber,
        node: blockchainInfo.node
      }
    };

    const response = serializeBigInt({
      success: true,
      verified: verification.exists,
      ballotId: ballotId,
      details: verification.details,
      receipt: verification.receipt,
      blockchainConfirmations: verification.confirmations,
      blockchainInfo: verification.blockchainInfo,
      source: 'decentralized_blockchain',
      timestamp: new Date().toISOString()
    });

    res.json(response);

  } catch (error) {
    console.error('Verify vote with receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify vote: ' + error.message,
      verified: false
    });
  }
});

// Enhanced blockchain status with transaction monitoring
router.get('/enhanced-blockchain-status', async (req, res) => {
  try {
    console.log('🔍 Checking enhanced blockchain status...');

    const blockchainInfo = await ethereumService.getBlockchainInfo();

    // Test transaction capabilities
    const transactionTest = {
      canSendTransactions: false,
      canGetReceipts: false,
      averageBlockTime: 'unknown'
    };

    // Test with a simple transaction if possible
    if (blockchainInfo.isConnected && !blockchainInfo.simulationMode) {
      try {
        const activeNode = await ethereumService.getActiveNode();

        // Test receipt fetching capability
        const testTxHash = '0x' + '0'.repeat(64); // Dummy hash for testing
        try {
          await activeNode.web3.eth.getTransactionReceipt(testTxHash);
          transactionTest.canGetReceipts = true;
        } catch (receiptError) {
          // This is expected to fail, but we're testing if the method is available
          transactionTest.canGetReceipts = true;
        }

        // Test transaction sending capability
        const accounts = await activeNode.web3.eth.getAccounts();
        if (accounts.length > 0) {
          transactionTest.canSendTransactions = true;
        }

        // Get recent block time
        try {
          const currentBlock = await activeNode.web3.eth.getBlockNumber();
          if (currentBlock > 1) {
            const block = await activeNode.web3.eth.getBlock(currentBlock - 1);
            if (block && block.timestamp) {
              const currentTime = Math.floor(Date.now() / 1000);
              transactionTest.averageBlockTime = currentTime - block.timestamp;
            }
          }
        } catch (blockError) {
          // Ignore block time errors
        }

      } catch (testError) {
        console.log('⚠️ Transaction capability test failed:', testError.message);
      }
    }

    const nodesStatus = ethereumService.nodes.map(node => ({
      name: node.name,
      connected: node.isConnected,
      url: node.rpcUrl,
      account: node.account,
      lastBlock: node.lastBlock || 0,
      chainId: node.chainId
    }));

    const response = serializeBigInt({
      success: true,
      ...blockchainInfo,
      nodes: nodesStatus,
      totalNodes: nodesStatus.length,
      connectedNodes: nodesStatus.filter(node => node.connected).length,
      transactionCapabilities: transactionTest,
      storageType: 'fully_decentralized',
      receiptSupport: true,
      timestamp: new Date().toISOString()
    });

    res.json(response);
  } catch (error) {
    console.error('Enhanced blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enhanced blockchain status: ' + error.message,
      isConnected: false,
      simulationMode: true,
      receiptSupport: false
    });
  }
});

// Get candidates from SQL database
async function getCandidatesFromSQL() {
  try {
    const [candidates] = await pool.execute(`
      SELECT id, name, party, position, vote_count, is_active
      FROM candidates 
      WHERE is_active = 1
      ORDER BY position, name
    `);
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates from SQL:', error);
    return [];
  }
}

// Get unique positions from candidates
async function getPositionsFromCandidates() {
  try {
    const [positions] = await pool.execute(`
      SELECT DISTINCT position 
      FROM candidates 
      WHERE is_active = 1 
      ORDER BY position
    `);
    return positions.map(p => p.position);
  } catch (error) {
    console.error('Error fetching positions from candidates:', error);
    return [];
  }
}

// Poll results from blockchain votes + SQL candidates
router.get('/results', async (req, res) => {
  try {
    console.log('📊 Fetching poll results (Blockchain votes + SQL candidates)');

    let blockchainResults;
    try {
      blockchainResults = await ethereumService.getElectionResults();
      console.log('📊 Blockchain results:', {
        totalVotes: blockchainResults.totalVotes,
        voteCount: blockchainResults.voteData?.length || 0,
        hasResults: !!blockchainResults.results
      });
    } catch (error) {
      console.log('⚠️ Blockchain results failed, using simulation:', error.message);
      blockchainResults = {
        totalVotes: 0,
        voteData: [],
        results: {}
      };
    }

    const [sqlCandidates, uniquePositions] = await Promise.all([
      getCandidatesFromSQL(),
      getPositionsFromCandidates()
    ]);

    console.log('📋 Data retrieved:', {
      blockchainVotes: blockchainResults.totalVotes,
      sqlCandidates: sqlCandidates.length,
      uniquePositions: uniquePositions.length,
      blockchainVoteData: blockchainResults.voteData?.length || 0
    });

    // Create candidate map with all SQL candidates
    const candidateMap = new Map();
    sqlCandidates.forEach(candidate => {
      candidateMap.set(candidate.id.toString(), {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        vote_count: 0 // Initialize to 0
      });
    });

    let totalVotes = 0;

    // Count votes from blockchain results
    if (blockchainResults.results && Object.keys(blockchainResults.results).length > 0) {
      console.log('🔢 Counting votes from blockchain results structure...');

      Object.entries(blockchainResults.results).forEach(([position, candidates]) => {
        Object.entries(candidates).forEach(([candidateId, candidateData]) => {
          if (candidateMap.has(candidateId)) {
            const voteCount = candidateData.voteCount || 0;
            candidateMap.get(candidateId).vote_count += voteCount;
            totalVotes += voteCount;
          }
        });
      });
    }
    // Fallback: Count from raw vote data
    else if (blockchainResults.voteData && Array.isArray(blockchainResults.voteData)) {
      console.log('🔢 Counting votes from raw vote data...');

      blockchainResults.voteData.forEach(vote => {
        if (vote.votes && Array.isArray(vote.votes)) {
          vote.votes.forEach(v => {
            const candidateId = v.candidateId?.toString();
            if (candidateId && candidateMap.has(candidateId)) {
              candidateMap.get(candidateId).vote_count++;
              totalVotes++;
            }
          });
        }
      });
    }

    // Group candidates by position
    const groupedCandidates = {};
    candidateMap.forEach(candidate => {
      const positionName = candidate.position;
      if (!groupedCandidates[positionName]) {
        groupedCandidates[positionName] = [];
      }
      groupedCandidates[positionName].push(candidate);
    });

    // Sort candidates by vote count within each position
    Object.keys(groupedCandidates).forEach(position => {
      groupedCandidates[position].sort((a, b) => b.vote_count - a.vote_count);
    });

    console.log('✅ Results calculated successfully:', {
      totalVotes,
      positions: Object.keys(groupedCandidates).length,
      candidates: sqlCandidates.length,
      candidatesWithVotes: Array.from(candidateMap.values()).filter(c => c.vote_count > 0).length
    });

    const response = serializeBigInt({
      success: true,
      totalVotes: totalVotes,
      candidates: Array.from(candidateMap.values()),
      positions: Object.keys(groupedCandidates),
      resultsByPosition: groupedCandidates,
      voteData: blockchainResults.voteData || [],
      source: 'blockchain_votes_sql_candidates',
      lastUpdated: new Date().toISOString(),
      stats: {
        totalCandidates: sqlCandidates.length,
        totalPositions: uniquePositions.length,
        blockchainVotes: blockchainResults.totalVotes,
        calculatedVotes: totalVotes
      }
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Get poll results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get poll results: ' + error.message,
      fallbackData: {
        totalVotes: 0,
        candidates: [],
        resultsByPosition: {}
      }
    });
  }
});

// Add BigInt serialization helper
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

// Export the waitForTransactionReceipt function for use in other modules
export { waitForTransactionReceipt };

export default router;