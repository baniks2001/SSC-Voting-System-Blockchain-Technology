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

// Submit vote to Ethereum blockchain (UPDATED to handle empty votes)
router.post('/cast-blockchain', async (req, res) => {
  try {
    console.log('🔗 Fully decentralized blockchain vote submission');
    const { voterId, votes, timestamp, ballotId, emptyPositions } = req.body;

    if (!voterId) {
      console.log('❌ Invalid vote data for blockchain submission');
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data: voterId is required'
      });
    }

    // Validate votes if they exist (votes can be empty array or null)
    if (votes && Array.isArray(votes)) {
      for (const vote of votes) {
        if (!vote.candidateId || !vote.position) {
          console.error('❌ Vote missing required fields:', vote);
          return res.status(400).json({
            success: false,
            error: `Vote missing candidateId or position`
          });
        }
      }
    }

    // FIXED: Check if blockchain service is properly initialized
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
        contractDeployed: blockchainInfo.contractDeployed,
        contractAddress: blockchainInfo.contractAddress,
        currentNode: blockchainInfo.currentNode,
        blockNumber: blockchainInfo.blockNumber
      });
    } catch (blockchainError) {
      console.error('❌ Failed to get blockchain info:', blockchainError);
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable. Please try again later.'
      });
    }

    if (!blockchainInfo.isConnected) {
      console.log('❌ No blockchain nodes connected');
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable. Please ensure nodes are running.'
      });
    }

    console.log('✅ Blockchain network status:', {
      currentNode: blockchainInfo.currentNode,
      blockNumber: blockchainInfo.blockNumber,
      connectedNodes: blockchainInfo.connectedNodes,
      totalNodes: blockchainInfo.totalNodes,
      contractDeployed: blockchainInfo.contractDeployed,
      contractAddress: blockchainInfo.contractAddress
    });

    // Log blockchain configuration
    if (blockchainInfo.contractDeployed && blockchainInfo.contractAddress) {
      console.log('🎯 Using blockchain contract at:', blockchainInfo.contractAddress);
    } else {
      console.log('❌ No contract deployed on blockchain nodes');
    }

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voterId,
      votes: votes || [], // Can be empty array
      timestamp: timestamp || new Date().toISOString(),
      ballotId: ballotId,
      emptyPositions: emptyPositions || [], // Track empty positions
      voterHash: crypto.createHash('sha256')
        .update(`${voterId}-${Date.now()}-${Math.random().toString(36)}`)
        .digest('hex')
    };

    console.log('⛓️ Submitting to blockchain storage...');
    
    // Submit to blockchain nodes
    const blockchainResult = await ethereumService.submitVoteToAllNodes(voteData);

    if (!blockchainResult.success) {
      console.log('❌ Blockchain submission failed:', blockchainResult.error);
      return res.status(500).json({
        success: false,
        error: `Blockchain submission failed: ${blockchainResult.error}`
      });
    }

    console.log('✅ Vote successfully recorded in blockchain storage:', {
      results: blockchainResult.results,
      submittedTo: blockchainResult.submittedTo,
      totalNodes: blockchainResult.totalNodes,
      emptyPositions: emptyPositions?.length || 0
    });

    // Get the first successful receipt for response
    const firstReceipt = blockchainResult.results?.find(r => r.success)?.receipt;
    if (!firstReceipt) {
      console.error('❌ No successful receipt found in blockchain results');
      return res.status(500).json({
        success: false,
        error: 'No successful transaction receipt available'
      });
    }

    console.log('✅ Using receipt from node:', firstReceipt.node, {
      transactionHash: firstReceipt.transactionHash,
      blockNumber: firstReceipt.blockNumber
    });

    // If we have a real transaction hash, try to get the receipt
    let receiptDetails = null;
    if (firstReceipt.transactionHash &&
      firstReceipt.transactionHash !== 'unknown' &&
      !firstReceipt.simulated) {
      try {
        console.log('📋 Attempting to fetch transaction receipt...');
        const activeNode = await ethereumService.getActiveNode();
        receiptDetails = await waitForTransactionReceipt(
          activeNode.web3,
          firstReceipt.transactionHash,
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

    await logAuditAction(voterId, 'voter', 'BLOCKCHAIN_VOTE_CAST',
      `Vote cast in blockchain storage. TX: ${firstReceipt.transactionHash} (Node: ${firstReceipt.node}) - Empty positions: ${emptyPositions?.length || 0}`, req);

    console.log('🎉 Blockchain vote process completed successfully for voter:', voterId);

    const response = serializeBigInt({
      success: true,
      receipt: {
        ...firstReceipt,
        receiptDetails: receiptDetails,
        emptyPositions: emptyPositions?.length || 0
      },
      node: firstReceipt.node,
      simulated: firstReceipt.simulated,
      message: `Vote successfully recorded in blockchain storage (Node: ${firstReceipt.node})`,
      voteReceipt: {
        ballotId: voteData.ballotId,
        transactionHash: firstReceipt.transactionHash,
        blockNumber: firstReceipt.blockNumber,
        timestamp: voteData.timestamp,
        voterHash: voteData.voterHash,
        emptyPositions: emptyPositions?.length || 0,
        receiptConfirmed: !!receiptDetails
      },
      // Enhanced dual-node information
      nodesSubmitted: blockchainResult.submittedTo,
      totalNodes: blockchainResult.totalNodes,
      blockchainResults: blockchainResult.results
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Blockchain vote submission error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to blockchain storage: ' + error.message
    });
  }
});

// Get transaction receipt endpoint
router.get('/transaction-receipt/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    console.log('📋 Fetching transaction receipt:', txHash);

    const blockchainInfo = await ethereumService.getBlockchainInfo();

    if (!blockchainInfo.isConnected) {
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
        blockNumber: blockchainInfo.blockNumber,
        currentNode: blockchainInfo.currentNode
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
    if (blockchainInfo.isConnected) {
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

// Get empty votes count for statistics
async function getEmptyVotesStats() {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_votes,
        SUM(CASE WHEN vote_count = 0 THEN 1 ELSE 0 END) as empty_votes,
        position
      FROM candidates 
      WHERE is_active = 1
      GROUP BY position
    `);
    return stats;
  } catch (error) {
    console.error('Error fetching empty votes stats:', error);
    return [];
  }
}

// Poll results from blockchain votes + SQL candidates (UPDATED to handle empty votes)
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
      console.log('⚠️ Blockchain results failed, using fallback:', error.message);
      blockchainResults = {
        totalVotes: 0,
        voteData: [],
        results: {}
      };
    }

    const [sqlCandidates, uniquePositions, emptyVotesStats] = await Promise.all([
      getCandidatesFromSQL(),
      getPositionsFromCandidates(),
      getEmptyVotesStats()
    ]);

    console.log('📋 Data retrieved:', {
      blockchainVotes: blockchainResults.totalVotes,
      sqlCandidates: sqlCandidates.length,
      uniquePositions: uniquePositions.length,
      blockchainVoteData: blockchainResults.voteData?.length || 0,
      emptyVotesStats: emptyVotesStats.length
    });

    // Create candidate map with all SQL candidates
    const candidateMap = new Map();
    sqlCandidates.forEach(candidate => {
      candidateMap.set(candidate.id.toString(), {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        vote_count: 0, // Initialize to 0
        empty_votes: 0 // Track empty votes for this position
      });
    });

    // Create position map for empty votes tracking
    const positionMap = new Map();
    uniquePositions.forEach(position => {
      positionMap.set(position, {
        position: position,
        total_votes: 0,
        candidate_votes: 0,
        empty_votes: 0
      });
    });

    let totalVotes = 0;
    let totalEmptyVotes = 0;

    // Count votes from blockchain results
    if (blockchainResults.results && Object.keys(blockchainResults.results).length > 0) {
      console.log('🔢 Counting votes from blockchain results structure...');

      Object.entries(blockchainResults.results).forEach(([position, candidates]) => {
        Object.entries(candidates).forEach(([candidateId, candidateData]) => {
          if (candidateMap.has(candidateId)) {
            const voteCount = candidateData.voteCount || 0;
            candidateMap.get(candidateId).vote_count += voteCount;
            totalVotes += voteCount;
            
            // Update position stats
            if (positionMap.has(position)) {
              positionMap.get(position).candidate_votes += voteCount;
              positionMap.get(position).total_votes += voteCount;
            }
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
              
              // Update position stats
              const position = v.position;
              if (positionMap.has(position)) {
                positionMap.get(position).candidate_votes++;
                positionMap.get(position).total_votes++;
              }
            }
          });
        }
        
        // Check for empty positions in vote data
        if (vote.emptyPositions && Array.isArray(vote.emptyPositions)) {
          vote.emptyPositions.forEach(position => {
            if (positionMap.has(position)) {
              positionMap.get(position).empty_votes++;
              positionMap.get(position).total_votes++;
              totalEmptyVotes++;
            }
          });
        }
      });
    }

    // Update empty votes count in candidate map (for positions with no selections)
    positionMap.forEach((stats, position) => {
      // Calculate empty votes as difference between total votes and candidate votes
      stats.empty_votes = stats.total_votes - stats.candidate_votes;
      
      // Update candidate map for this position
      candidateMap.forEach(candidate => {
        if (candidate.position === position) {
          candidate.empty_votes = stats.empty_votes;
        }
      });
    });

    // Group candidates by position
    const groupedCandidates = {};
    candidateMap.forEach(candidate => {
      const positionName = candidate.position;
      if (!groupedCandidates[positionName]) {
        groupedCandidates[positionName] = {
          candidates: [],
          stats: positionMap.get(positionName) || {
            position: positionName,
            total_votes: 0,
            candidate_votes: 0,
            empty_votes: 0
          }
        };
      }
      groupedCandidates[positionName].candidates.push(candidate);
    });

    // Sort candidates by vote count within each position
    Object.keys(groupedCandidates).forEach(position => {
      groupedCandidates[position].candidates.sort((a, b) => b.vote_count - a.vote_count);
    });

    console.log('✅ Results calculated successfully:', {
      totalVotes,
      totalEmptyVotes,
      positions: Object.keys(groupedCandidates).length,
      candidates: sqlCandidates.length,
      candidatesWithVotes: Array.from(candidateMap.values()).filter(c => c.vote_count > 0).length
    });

    // Prepare position statistics
    const positionStatistics = Array.from(positionMap.values()).map(stats => ({
      ...stats,
      empty_percentage: stats.total_votes > 0 ? 
        Math.round((stats.empty_votes / stats.total_votes) * 100) : 0
    }));

    const response = serializeBigInt({
      success: true,
      totalVotes: totalVotes,
      totalEmptyVotes: totalEmptyVotes,
      candidates: Array.from(candidateMap.values()),
      positions: Object.keys(groupedCandidates),
      resultsByPosition: groupedCandidates,
      positionStatistics: positionStatistics,
      voteData: blockchainResults.voteData || [],
      source: 'blockchain_votes_sql_candidates',
      lastUpdated: new Date().toISOString(),
      stats: {
        totalCandidates: sqlCandidates.length,
        totalPositions: uniquePositions.length,
        blockchainVotes: blockchainResults.totalVotes,
        calculatedVotes: totalVotes,
        emptyVotesPercentage: totalVotes > 0 ? 
          Math.round((totalEmptyVotes / totalVotes) * 100) : 0
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

// Get detailed empty votes report
router.get('/empty-votes-report', async (req, res) => {
  try {
    console.log('📊 Fetching empty votes report');

    const [results] = await pool.execute(`
      SELECT 
        v.student_id,
        v.full_name,
        v.course,
        v.section,
        v.voted_at,
        COUNT(vv.candidate_id) as voted_count,
        (SELECT COUNT(DISTINCT position) FROM candidates WHERE is_active = 1) as total_positions
      FROM voters v
      LEFT JOIN vote_verification vv ON v.student_id = vv.voter_id
      WHERE v.has_voted = 1
      GROUP BY v.student_id, v.full_name, v.course, v.section, v.voted_at
      HAVING voted_count < total_positions
      ORDER BY v.voted_at DESC
    `);

    const report = results.map(row => ({
      studentId: row.student_id,
      fullName: row.full_name,
      course: row.course,
      section: row.section,
      votedAt: row.voted_at,
      votedCount: row.voted_count,
      totalPositions: row.total_positions,
      emptyPositions: row.total_positions - row.voted_count,
      emptyPercentage: Math.round(((row.total_positions - row.voted_count) / row.total_positions) * 100)
    }));

    res.json({
      success: true,
      report: report,
      totalVotersWithEmptyVotes: report.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get empty votes report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get empty votes report: ' + error.message
    });
  }
});

// Get voter's specific vote details (including empty positions)
router.get('/voter-details/:voterId', async (req, res) => {
  try {
    const { voterId } = req.params;
    console.log('🔍 Fetching voter details:', voterId);

    // Get voter info
    const [voterRows] = await pool.execute(
      `SELECT * FROM voters WHERE student_id = ?`,
      [voterId]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    const voter = voterRows[0];

    // Get vote verification records
    const [voteRecords] = await pool.execute(
      `SELECT vv.*, c.position, c.name as candidate_name, c.party
       FROM vote_verification vv
       LEFT JOIN candidates c ON vv.candidate_id = c.id
       WHERE vv.voter_id = ?
       ORDER BY c.position`,
      [voterId]
    );

    // Get all positions
    const [positionRows] = await pool.execute(
      `SELECT DISTINCT position FROM candidates WHERE is_active = 1 ORDER BY position`
    );

    const allPositions = positionRows.map(p => p.position);
    const votedPositions = [...new Set(voteRecords.map(v => v.position))];
    const emptyPositions = allPositions.filter(p => !votedPositions.includes(p));

    const response = {
      success: true,
      voter: {
        studentId: voter.student_id,
        fullName: voter.full_name,
        course: voter.course,
        section: voter.section,
        hasVoted: voter.has_voted,
        votedAt: voter.voted_at,
        voteHash: voter.vote_hash
      },
      voteDetails: {
        totalPositions: allPositions.length,
        votedPositions: votedPositions.length,
        emptyPositions: emptyPositions.length,
        positions: allPositions.map(position => {
          const vote = voteRecords.find(v => v.position === position);
          return {
            position,
            voted: !!vote,
            candidate: vote ? {
              id: vote.candidate_id,
              name: vote.candidate_name,
              party: vote.party
            } : null,
            timestamp: vote ? vote.timestamp : null
          };
        }),
        emptyPositionsList: emptyPositions
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Get voter details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voter details: ' + error.message
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