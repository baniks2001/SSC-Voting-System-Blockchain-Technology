import express from 'express';
import crypto from 'crypto';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';
import { ethereumService } from '../services/ethereumService.js';

const router = express.Router();

// Helper function to hash data
function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Improved encryption function with better error handling
function encryptData(data) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  } catch (error) {
    console.error('Encryption error:', error);
    // Return plain data as fallback
    return {
      iv: 'plain',
      data: JSON.stringify(data)
    };
  }
}

// Add this route to your poll.js file to get voter stats including hasVotedCount
router.get('/voter-stats', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching voter stats by admin:', req.user.email || req.user.id);

    const [voterStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalVoters,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as activeVoters,
        COUNT(CASE WHEN has_voted = 1 AND is_active = 1 THEN 1 END) as hasVotedCount
      FROM voters
    `);

    console.log('✅ Voter stats fetched successfully:', voterStats[0]);

    res.json({
      success: true,
      totalVoters: voterStats[0].totalVoters,
      activeVoters: voterStats[0].activeVoters,
      hasVotedCount: voterStats[0].hasVotedCount
    });
  } catch (error) {
    console.error('Voter stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch voter stats: ' + error.message 
    });
  }
});

// Improved decryption function
function decryptData(encryptedData) {
  try {
    // If data is stored as plain JSON (encryption failed previously)
    if (encryptedData.iv === 'plain' || encryptedData.iv === 'none') {
      return JSON.parse(encryptedData.data);
    }

    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Get poll status
router.get('/status', async (req, res) => {
  try {
    console.log('📊 Fetching poll status');
    const [settings] = await pool.execute('SELECT * FROM poll_settings WHERE id = 1');

    const pollStatus = settings[0] || {
      is_active: false,
      is_paused: false,
      start_time: null,
      end_time: null,
      paused_at: null
    };

    console.log('✅ Poll status fetched successfully');
    res.json(pollStatus);
  } catch (error) {
    console.error('Get poll status error:', error);
    res.status(500).json({ error: 'Failed to get poll status' });
  }
});


// Update poll status - only start/pause controls
router.put('/status', authenticateAdmin, async (req, res) => {
  try {
    console.log('⚙️ Updating poll status by admin:', req.user.email || req.user.id, req.body);
    const { isActive, isPaused } = req.body;

    // Update blockchain service election state
    if (ethereumService && ethereumService.updateElectionState) {
      const newState = {
        status: isPaused ? 'paused' : (isActive ? 'voting' : 'not_started'),
        [isPaused ? 'pauseTime' : (isActive ? 'startTime' : '')]: new Date().toISOString()
      };
      ethereumService.updateElectionState(newState);
    }

    // Only allow start and pause operations
    await pool.execute(
      'UPDATE poll_settings SET is_active = ?, is_paused = ?, paused_at = ? WHERE id = 1',
      [isActive, isPaused, isPaused ? new Date() : null]
    );

    const action = isPaused ? 'PAUSE_POLL' : isActive ? 'START_POLL' : 'STOP_POLL';
    await logAuditAction(req.user.id, 'admin', action, 'Poll status updated', req);

    console.log('✅ Poll status updated successfully:', action);
    res.json({
      success: true,
      message: 'Poll status updated successfully'
    });
  } catch (error) {
    console.error('Update poll status error:', error);
    res.status(500).json({ error: 'Failed to update poll status' });
  }
});

// Finish poll - requires super admin but NO password - FIXED VERSION
router.post('/finished', authenticateAdmin, async (req, res) => {
  let connection;
  let latestElectionId = null;
  
  try {
    const { electionName, electionDate, academicYear, exportType = 'json' } = req.body;
    
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required to finish poll' });
    }

    if (!electionName || !electionDate || !academicYear) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: electionName, electionDate, academicYear' 
      });
    }

    // Update blockchain service election state to finished
    if (ethereumService && ethereumService.updateElectionState) {
      ethereumService.updateElectionState({
        status: 'finished',
        finishTime: new Date().toISOString()
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [candidates] = await connection.execute(`
        SELECT id, name, party, position, vote_count, is_active 
        FROM candidates 
        WHERE is_active = 1
      `);

      let blockchainResults;
      try {
        const blockchainResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/voting/results`, {
          headers: { 'Authorization': req.headers.authorization }
        });
        
        if (blockchainResponse.ok) {
          blockchainResults = await blockchainResponse.json();
        } else {
          throw new Error(`Blockchain API returned ${blockchainResponse.status}`);
        }
      } catch (blockchainError) {
        const [mysqlVotes] = await connection.execute(`
          SELECT v.*, vt.student_id, vt.full_name as voter_name
          FROM votes v
          JOIN voters vt ON v.voter_id = vt.id
        `);
        blockchainResults = {
          totalVotes: mysqlVotes.length,
          source: 'mysql_fallback',
          candidates: candidates.map(candidate => ({
            id: candidate.id,
            vote_count: candidate.vote_count || 0
          }))
        };
      }

      let voteResults = [];
      let totalVotesCount = blockchainResults.totalVotes || 0;

      if (blockchainResults.candidates && Array.isArray(blockchainResults.candidates)) {
        voteResults = blockchainResults.candidates
          .filter((candidate) => candidate && candidate.id)
          .map((candidate) => ({
            candidateId: candidate.id.toString(),
            voteCount: candidate.vote_count || 0
          }));
      }

      const mergedCandidates = candidates.map(candidate => {
        const voteResult = voteResults.find(vr => vr.candidateId === candidate.id.toString());
        return {
          ...candidate,
          vote_count: voteResult ? voteResult.voteCount : (candidate.vote_count || 0)
        };
      });

      const resultsByPosition = mergedCandidates.reduce((acc, candidate) => {
        const position = candidate.position;
        if (!acc[position]) {
          acc[position] = [];
        }
        acc[position].push({
          candidate_name: candidate.name,
          party: candidate.party,
          vote_count: candidate.vote_count || 0
        });
        return acc;
      }, {});

      Object.keys(resultsByPosition).forEach(position => {
        resultsByPosition[position].sort((a, b) => b.vote_count - a.vote_count);
      });

      const electionResults = {
        electionInfo: {
          name: electionName,
          date: electionDate,
          academicYear: academicYear,
          finishedAt: new Date().toISOString()
        },
        blockchainData: {
          source: blockchainResults.source,
          totalVotes: totalVotesCount,
          simulationVoteCount: blockchainResults.simulationVoteCount,
          connected: blockchainResults.blockchainStatus?.isConnected,
          simulationMode: blockchainResults.blockchainStatus?.simulationMode,
          failoverActive: blockchainResults.blockchainStatus?.failoverActive,
          electionState: blockchainResults.blockchainStatus?.electionState,
          syncAllowed: blockchainResults.blockchainStatus?.syncAllowed
        },
        candidates: mergedCandidates,
        resultsByPosition: resultsByPosition,
        statistics: {
          totalCandidates: mergedCandidates.length,
          totalVotes: totalVotesCount,
          positions: Object.keys(resultsByPosition).length,
          timestamp: new Date().toISOString()
        }
      };

      const electionHash = hashData(electionResults);
      let encryptedResults;
      
      try {
        encryptedResults = encryptData(electionResults);
      } catch (encryptError) {
        encryptedResults = {
          iv: 'none',
          data: JSON.stringify(electionResults)
        };
      }

      await connection.execute(
        'UPDATE poll_settings SET is_active = false, is_paused = false WHERE id = 1'
      );

      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'election_data'
      `);

      if (tables.length === 0) {
        await connection.execute(`
          CREATE TABLE election_data (
            id INT PRIMARY KEY AUTO_INCREMENT,
            election_name VARCHAR(255) NOT NULL,
            election_date DATE NOT NULL,
            academic_year VARCHAR(50) NOT NULL,
            finished_at DATETIME NOT NULL,
            total_candidates INT NOT NULL,
            total_votes INT NOT NULL,
            election_hash VARCHAR(64) NOT NULL,
            encrypted_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_election (election_name, academic_year)
          )
        `);
      }

      const [insertResult] = await connection.execute(
        `INSERT INTO election_data 
         (election_name, election_date, academic_year, finished_at, total_candidates, total_votes, election_hash, encrypted_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          electionName,
          electionDate,
          academicYear,
          new Date(),
          mergedCandidates.length,
          totalVotesCount,
          electionHash,
          JSON.stringify(encryptedResults)
        ]
      );
      
      latestElectionId = insertResult.insertId;
      await connection.commit();

      await logAuditAction(req.user.id, 'admin', 'FINISH_POLL', 
        `Poll finished: ${electionName} (${academicYear}) with ${mergedCandidates.length} candidates and ${totalVotesCount} votes from ${blockchainResults.source}`, req);

      res.json({ 
        success: true,
        message: 'Poll finished successfully',
        data: {
          electionName,
          electionDate,
          academicYear,
          totalCandidates: mergedCandidates.length,
          totalVotes: totalVotesCount,
          electionHash,
          dataSource: blockchainResults.source,
          finishedAt: new Date().toISOString(),
          exportedAs: exportType,
          electionId: latestElectionId,
          electionState: 'finished',
          syncDisabled: true
        }
      });

    } catch (innerError) {
      await connection.rollback();
      throw innerError;
    }

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      } finally {
        connection.release();
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to finish poll: ' + error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start poll
router.post('/active', authenticateAdmin, async (req, res) => {
  try {
    console.log('▶️ Starting poll by admin:', req.user.email || req.user.id);

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required to start poll' });
    }

    // Update blockchain service election state
    if (ethereumService && ethereumService.updateElectionState) {
      ethereumService.updateElectionState({
        status: 'voting',
        startTime: new Date().toISOString()
      });
    }

    await pool.execute(
      'UPDATE poll_settings SET is_active = true, is_paused = false, paused_at = NULL WHERE id = 1'
    );

    await logAuditAction(req.user.id, 'admin', 'START_POLL', 'Poll started by super admin', req);

    console.log('✅ Poll started successfully');
    res.json({
      success: true,
      message: 'Poll started successfully'
    });
  } catch (error) {
    console.error('Start poll error:', error);
    res.status(500).json({ error: 'Failed to start poll: ' + error.message });
  }
});

// Pause poll
router.post('/paused', authenticateAdmin, async (req, res) => {
  try {
    console.log('⏸️ Pausing poll by admin:', req.user.email || req.user.id);

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required to pause poll' });
    }

    // Update blockchain service election state
    if (ethereumService && ethereumService.updateElectionState) {
      ethereumService.updateElectionState({
        status: 'paused',
        pauseTime: new Date().toISOString()
      });
    }

    await pool.execute(
      'UPDATE poll_settings SET is_paused = true, paused_at = ? WHERE id = 1',
      [new Date()]
    );

    await logAuditAction(req.user.id, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', req);

    console.log('✅ Poll paused successfully');
    res.json({
      success: true,
      message: 'Poll paused successfully'
    });
  } catch (error) {
    console.error('Pause poll error:', error);
    res.status(500).json({ error: 'Failed to pause poll: ' + error.message });
  }
});

// Get all election data (for admin only)
router.get('/elections', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching election data by admin:', req.user.email || req.user.id);

    const [elections] = await pool.execute(`
      SELECT id, election_name, election_date, academic_year, finished_at, total_candidates, total_votes, election_hash, created_at
      FROM election_data 
      ORDER BY finished_at DESC
    `);

    console.log('✅ Election data fetched successfully, count:', elections.length);

    res.json({
      success: true,
      elections: elections
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch election data: ' + error.message
    });
  }
});

// Get specific election data with decrypted results
router.get('/elections/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching specific election data:', id, 'by admin:', req.user.email || req.user.id);

    const [elections] = await pool.execute(`
      SELECT * FROM election_data WHERE id = ?
    `, [id]);

    if (elections.length === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const election = elections[0];

    // Decrypt the election data to get unhashed results
    try {
      const encryptedData = JSON.parse(election.encrypted_data);
      const decryptedResults = decryptData(encryptedData);

      console.log('✅ Election data decrypted successfully');

      res.json({
        success: true,
        election: {
          id: election.id,
          election_name: election.election_name,
          election_date: election.election_date,
          academic_year: election.academic_year,
          finished_at: election.finished_at,
          total_candidates: election.total_candidates,
          total_votes: election.total_votes,
          election_hash: election.election_hash,
          created_at: election.created_at
        },
        results: decryptedResults // Return unhashed/decrypted data
      });
    } catch (decryptError) {
      console.error('❌ Decryption error:', decryptError);
      res.status(500).json({
        success: false,
        error: 'Failed to decrypt election data'
      });
    }

  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch election data: ' + error.message
    });
  }
});

// Export election data (unhashed/decrypted)
router.get('/elections/export/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { exportType = 'json' } = req.query;

    console.log('📤 Exporting election data:', id, 'by admin:', req.user.email || req.user.id);

    // Get the specific election data (this returns decrypted data)
    const electionResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/poll/elections/${id}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    if (!electionResponse.ok) {
      throw new Error('Failed to fetch election data');
    }

    const electionData = await electionResponse.json();

    if (!electionData.success) {
      throw new Error(electionData.error);
    }

    const { election, results } = electionData;

    let data, filename, contentType;

    switch (exportType) {
      case 'xlsx':
        // CSV format for Excel with unhashed data
        const headers = ['Position', 'Candidate Name', 'Party', 'Votes', 'Data Source'];
        const csvRows = [];

        // Flatten results by position
        Object.entries(results.resultsByPosition || {}).forEach(([position, candidates]) => {
          candidates.forEach(candidate => {
            csvRows.push([
              position,
              `"${candidate.candidate_name}"`,
              `"${candidate.party}"`,
              candidate.vote_count,
              `"${results.blockchainData?.source || 'unknown'}"`
            ]);
          });
        });

        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        data = csvContent;
        filename = `election-${election.election_name.replace(/\s+/g, '-')}-${election.academic_year}.csv`;
        contentType = 'text/csv';
        break;

      case 'docs':
        // Text document format with unhashed data
        const docContent = `ELECTION RESULTS REPORT - UNHASHED DATA\n
Election: ${election.election_name}
Date: ${election.election_date}
Academic Year: ${election.academic_year}
Finished: ${new Date(election.finished_at).toLocaleString()}
Total Candidates: ${election.total_candidates}
Total Votes: ${election.total_votes}
Data Source: ${results.blockchainData?.source || 'unknown'}
Blockchain Connected: ${results.blockchainData?.connected ? 'Yes' : 'No'}
Simulation Mode: ${results.blockchainData?.simulationMode ? 'Yes' : 'No'}
Failover Active: ${results.blockchainData?.failoverActive ? 'Yes' : 'No'}
Election State: ${results.blockchainData?.electionState?.status || 'unknown'}
Sync Allowed: ${results.blockchainData?.syncAllowed ? 'Yes' : 'No'}
Election Hash: ${election.election_hash}

CANDIDATE RESULTS:\n${Object.entries(results.resultsByPosition || {})
            .map(([position, candidates]) =>
              `${position}:\n${candidates.map(candidate =>
                `  • ${candidate.candidate_name} (${candidate.party}) - ${candidate.vote_count} votes`
              ).join('\n')}`
            ).join('\n\n')
          }

BLOCKCHAIN DATA:
• Source: ${results.blockchainData?.source || 'unknown'}
• Total Votes: ${results.blockchainData?.totalVotes || 0}
• Simulation Votes: ${results.blockchainData?.simulationVoteCount || 0}
• Connected: ${results.blockchainData?.connected ? 'Yes' : 'No'}
• Failover: ${results.blockchainData?.failoverActive ? 'Active' : 'Inactive'}
• Election State: ${results.blockchainData?.electionState?.status || 'unknown'}
• Sync Allowed: ${results.blockchainData?.syncAllowed ? 'Yes' : 'No'}

EXPORT NOTES:
• Data exported in unhashed/decrypted format for verification
• Original data is stored encrypted in database
• Hash verification available: ${election.election_hash}
• Export timestamp: ${new Date().toISOString()}
`;

        data = docContent;
        filename = `election-${election.election_name.replace(/\s+/g, '-')}-${election.academic_year}.txt`;
        contentType = 'text/plain';
        break;

      case 'json':
      default:
        // JSON format with unhashed data
        data = JSON.stringify({
          exportDate: new Date().toISOString(),
          exportNote: "Data exported in unhashed/decrypted format for verification. Original data is stored encrypted in database.",
          election: election,
          results: results, // Unhashed/decrypted results
          verification: {
            hash: election.election_hash,
            verified: true,
            timestamp: new Date().toISOString()
          }
        }, null, 2);
        filename = `election-${election.election_name.replace(/\s+/g, '-')}-${election.academic_year}.json`;
        contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);

    console.log('✅ Election data exported successfully as', exportType, '(unhashed)');

  } catch (error) {
    console.error('Export election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export election data: ' + error.message
    });
  }
});

// Export election history (bulk export of all elections with their full data)
router.get('/elections/export/history', authenticateAdmin, async (req, res) => {
  try {
    const { exportType = 'json' } = req.query;

    console.log('📤 Exporting election history with full data by admin:', req.user.email || req.user.id);

    // Get all elections with their full decrypted data
    const [elections] = await pool.execute(`
      SELECT id, election_name, election_date, academic_year, finished_at, total_candidates, total_votes, election_hash, encrypted_data, created_at
      FROM election_data 
      ORDER BY finished_at DESC
    `);

    if (elections.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No election history found to export'
      });
    }

    // Decrypt all election data
    const electionsWithResults = [];
    for (const election of elections) {
      try {
        const encryptedData = JSON.parse(election.encrypted_data);
        const decryptedResults = decryptData(encryptedData);

        electionsWithResults.push({
          election: {
            id: election.id,
            election_name: election.election_name,
            election_date: election.election_date,
            academic_year: election.academic_year,
            finished_at: election.finished_at,
            total_candidates: election.total_candidates,
            total_votes: election.total_votes,
            election_hash: election.election_hash,
            created_at: election.created_at
          },
          results: decryptedResults
        });
      } catch (decryptError) {
        console.error(`❌ Failed to decrypt election ${election.id}:`, decryptError);
        // Skip this election or include with error
        electionsWithResults.push({
          election: {
            id: election.id,
            election_name: election.election_name,
            election_date: election.election_date,
            academic_year: election.academic_year,
            finished_at: election.finished_at,
            total_candidates: election.total_candidates,
            total_votes: election.total_votes,
            election_hash: election.election_hash,
            created_at: election.created_at
          },
          error: 'Failed to decrypt election data'
        });
      }
    }

    let data, filename, contentType;

    switch (exportType) {
      case 'xlsx':
        // Create comprehensive CSV with all election data
        const headers = ['Election ID', 'Election Name', 'Election Date', 'Academic Year', 'Finished At', 'Total Candidates', 'Total Votes', 'Position', 'Candidate Name', 'Party', 'Votes', 'Data Source'];
        const csvRows = [];

        electionsWithResults.forEach(electionData => {
          const { election, results } = electionData;

          if (results && results.resultsByPosition) {
            Object.entries(results.resultsByPosition).forEach(([position, candidates]) => {
              candidates.forEach(candidate => {
                csvRows.push([
                  election.id,
                  `"${election.election_name}"`,
                  `"${election.election_date}"`,
                  `"${election.academic_year}"`,
                  `"${new Date(election.finished_at).toLocaleString()}"`,
                  election.total_candidates,
                  election.total_votes,
                  `"${position}"`,
                  `"${candidate.candidate_name}"`,
                  `"${candidate.party}"`,
                  candidate.vote_count,
                  `"${results.blockchainData?.source || 'unknown'}"`
                ]);
              });
            });
          } else {
            // Add election without candidate details if decryption failed
            csvRows.push([
              election.id,
              `"${election.election_name}"`,
              `"${election.election_date}"`,
              `"${election.academic_year}"`,
              `"${new Date(election.finished_at).toLocaleString()}"`,
              election.total_candidates,
              election.total_votes,
              'N/A',
              'N/A',
              'N/A',
              'N/A',
              'unknown'
            ]);
          }
        });

        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        data = csvContent;
        filename = `election-history-${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
        break;

      case 'docs':
        // Text document format with all election data
        let docContent = `ELECTION HISTORY REPORT - FULL DATA\n`;
        docContent += `Generated: ${new Date().toLocaleString()}\n`;
        docContent += `Total Elections: ${electionsWithResults.length}\n\n`;

        electionsWithResults.forEach((electionData, index) => {
          const { election, results, error } = electionData;

          docContent += `ELECTION ${index + 1}:\n`;
          docContent += `Name: ${election.election_name}\n`;
          docContent += `Date: ${election.election_date}\n`;
          docContent += `Academic Year: ${election.academic_year}\n`;
          docContent += `Finished: ${new Date(election.finished_at).toLocaleString()}\n`;
          docContent += `Candidates: ${election.total_candidates}\n`;
          docContent += `Total Votes: ${election.total_votes}\n`;
          docContent += `Hash: ${election.election_hash}\n`;
          docContent += `ID: ${election.id}\n`;

          if (error) {
            docContent += `Status: ❌ ${error}\n`;
          } else if (results && results.resultsByPosition) {
            docContent += `Data Source: ${results.blockchainData?.source || 'unknown'}\n`;
            docContent += `Election State: ${results.blockchainData?.electionState?.status || 'unknown'}\n`;
            docContent += `Sync Allowed: ${results.blockchainData?.syncAllowed ? 'Yes' : 'No'}\n`;
            docContent += `RESULTS:\n`;

            Object.entries(results.resultsByPosition).forEach(([position, candidates]) => {
              docContent += `  ${position}:\n`;
              candidates.forEach(candidate => {
                docContent += `    • ${candidate.candidate_name} (${candidate.party}) - ${candidate.vote_count} votes\n`;
              });
            });
          }

          docContent += '-'.repeat(50) + '\n\n';
        });

        data = docContent;
        filename = `election-history-${new Date().toISOString().split('T')[0]}.txt`;
        contentType = 'text/plain';
        break;

      case 'json':
      default:
        // JSON format with all election data
        data = JSON.stringify({
          exportDate: new Date().toISOString(),
          totalElections: electionsWithResults.length,
          exportNote: "Full election history exported with decrypted results for verification",
          elections: electionsWithResults,
          summary: {
            totalRecords: electionsWithResults.length,
            successfulDecryptions: electionsWithResults.filter(e => !e.error).length,
            failedDecryptions: electionsWithResults.filter(e => e.error).length,
            totalCandidates: electionsWithResults.reduce((sum, e) => sum + (e.election.total_candidates || 0), 0),
            totalVotes: electionsWithResults.reduce((sum, e) => sum + (e.election.total_votes || 0), 0)
          }
        }, null, 2);
        filename = `election-history-${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);

    console.log('✅ Election history exported successfully as', exportType);

  } catch (error) {
    console.error('Export election history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export election history: ' + error.message
    });
  }
});

// Export all elections summary
router.get('/elections/export-all', authenticateAdmin, async (req, res) => {
  try {
    const { exportType = 'json' } = req.query;

    console.log('📤 Exporting all elections summary by admin:', req.user.email || req.user.id);

    const [elections] = await pool.execute(`
      SELECT id, election_name, election_date, academic_year, finished_at, total_candidates, total_votes, election_hash, created_at
      FROM election_data 
      ORDER BY finished_at DESC
    `);

    let data, filename, contentType;

    switch (exportType) {
      case 'xlsx':
        const headers = ['Election Name', 'Election Date', 'Academic Year', 'Finished At', 'Total Candidates', 'Total Votes', 'Election Hash'];
        const csvRows = elections.map(election => [
          `"${election.election_name}"`,
          `"${election.election_date}"`,
          `"${election.academic_year}"`,
          `"${new Date(election.finished_at).toLocaleString()}"`,
          election.total_candidates,
          election.total_votes,
          `"${election.election_hash}"`
        ]);
        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        data = csvContent;
        filename = `all-elections-summary-${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
        break;

      case 'docs':
        const docContent = `ALL ELECTIONS SUMMARY REPORT\nGenerated: ${new Date().toLocaleString()}\n\nTotal Elections: ${elections.length}\n\nELECTIONS:\n${elections.map(election =>
          `${election.election_name} (${election.academic_year}) - Date: ${election.election_date} - Candidates: ${election.total_candidates} - Votes: ${election.total_votes} - Hash: ${election.election_hash}`
        ).join('\n')}`;

        data = docContent;
        filename = `all-elections-summary-${new Date().toISOString().split('T')[0]}.txt`;
        contentType = 'text/plain';
        break;

      case 'json':
      default:
        data = JSON.stringify({
          exportDate: new Date().toISOString(),
          totalElections: elections.length,
          elections: elections
        }, null, 2);
        filename = `all-elections-summary-${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);

    console.log('✅ All elections summary exported successfully as', exportType);

  } catch (error) {
    console.error('Export all elections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export elections summary: ' + error.message
    });
  }
});

// Delete election record (super admin only)
router.delete('/elections/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting election record:', id, 'by admin:', req.user.email || req.user.id);

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required to delete election records' });
    }

    const [result] = await pool.execute(
      'DELETE FROM election_data WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Election record not found' });
    }

    await logAuditAction(req.user.id, 'admin', 'DELETE_ELECTION', `Deleted election record ID: ${id}`, req);

    console.log('✅ Election record deleted successfully');
    res.json({
      success: true,
      message: 'Election record deleted successfully'
    });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ error: 'Failed to delete election record: ' + error.message });
  }
});

// Reset poll - requires super admin (preserves blockchain data)
router.post('/reset', authenticateAdmin, async (req, res) => {
  let connection;
  try {
    console.log('🔄 Resetting poll by admin:', req.user.email || req.user.id);

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required to reset poll' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Preserve blockchain data - don't touch blockchain tables
    console.log('🔒 Preserving blockchain data...');

    // Reset voters but preserve blockchain-related data
    await connection.execute('UPDATE voters SET has_voted = false, voted_at = NULL, vote_hash = NULL WHERE has_voted = true');
    console.log('✅ Voters reset');

    // Reset candidate vote counts
    await connection.execute('UPDATE candidates SET vote_count = 0');
    console.log('✅ Candidate votes reset');

    // Clear votes table but keep blockchain transaction references
    await connection.execute('DELETE FROM votes');
    console.log('✅ Votes table cleared');

    // Reset poll settings to default state
    await connection.execute('UPDATE poll_settings SET is_active = false, is_paused = false, start_time = NULL, end_time = NULL, paused_at = NULL WHERE id = 1');
    console.log('✅ Poll settings reset');

    await connection.commit();

    await logAuditAction(req.user.id, 'admin', 'RESET_POLL', 'Poll data reset with blockchain preservation', req);

    console.log('✅ Poll reset successfully - Blockchain data preserved');
    res.json({
      success: true,
      message: 'Poll reset successfully. Blockchain data preserved.'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      } finally {
        connection.release();
      }
    }
    console.error('Reset poll error:', error);
    res.status(500).json({ error: 'Failed to reset poll: ' + error.message });
  }
});

export default router;