import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 Exporting voting data before cleanup...');

// Function to export candidate and vote data
function exportVotingData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        exportedAt: new Date().toLocaleString(),
        candidates: [],
        votes: []
    };

    const pathsToCheck = [
        path.join(__dirname, '../blockchain/node1'),
        path.join(__dirname, '../blockchain/node2')
    ];

    pathsToCheck.forEach((nodePath, index) => {
        const nodeName = `node${index + 1}`;
        const chainDataPath = path.join(nodePath, 'chain.json');
        const candidatesPath = path.join(nodePath, 'candidates.json');
        const votesPath = path.join(nodePath, 'votes.json');

        // Export chain data (contains blocks with transactions/votes)
        if (fs.existsSync(chainDataPath)) {
            try {
                const chainData = JSON.parse(fs.readFileSync(chainDataPath, 'utf8'));
                exportData[`${nodeName}_chain`] = {
                    blockCount: chainData.length,
                    lastBlock: chainData[chainData.length - 1] || null
                };

                // Extract votes from blocks
                chainData.forEach((block, blockIndex) => {
                    if (block.transactions && block.transactions.length > 0) {
                        block.transactions.forEach((tx, txIndex) => {
                            if (tx.type === 'vote' || tx.candidateId) {
                                exportData.votes.push({
                                    node: nodeName,
                                    block: blockIndex,
                                    transaction: txIndex,
                                    timestamp: block.timestamp,
                                    ...tx
                                });
                            }
                        });
                    }
                });
            } catch (error) {
                console.log(`❌ Error reading chain data from ${nodeName}:`, error.message);
            }
        }

        // Export candidates data
        if (fs.existsSync(candidatesPath)) {
            try {
                const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
                exportData.candidates = [...exportData.candidates, ...candidatesData.map(candidate => ({
                    node: nodeName,
                    ...candidate
                }))];
            } catch (error) {
                console.log(`❌ Error reading candidates from ${nodeName}:`, error.message);
            }
        }

        // Export separate votes data if exists
        if (fs.existsSync(votesPath)) {
            try {
                const votesData = JSON.parse(fs.readFileSync(votesPath, 'utf8'));
                exportData[`${nodeName}_votes`] = votesData;
            } catch (error) {
                console.log(`❌ Error reading votes from ${nodeName}:`, error.message);
            }
        }
    });

    return exportData;
}

// Function to save exported data
function saveExportedData(data) {
    const exportDir = path.join(__dirname, '../exports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `voting-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Voting data exported to: ${filepath}`);
        console.log(`📈 Summary:`);
        console.log(`   - Candidates: ${data.candidates.length}`);
        console.log(`   - Votes: ${data.votes.length}`);
        console.log(`   - Timestamp: ${data.exportedAt}`);
        return filepath;
    } catch (error) {
        console.log('❌ Error exporting voting data:', error.message);
        return null;
    }
}

// Main cleanup function
function cleanup() {
    console.log('🧹 Cleaning up previous deployments...');

    const pathsToClean = [
        path.join(__dirname, '../blockchain/node1'),
        path.join(__dirname, '../blockchain/node2'),
        path.join(__dirname, '../artifacts'),
    ];

    pathsToClean.forEach(dirPath => {
        if (fs.existsSync(dirPath)) {
            console.log(`Removing: ${dirPath}`);
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    });

    console.log('✅ Cleanup complete!');
    console.log('🚀 Ready for fresh deployment');
}

// Execute the process
try {
    // First export the data
    const votingData = exportVotingData();
    
    if (votingData.candidates.length > 0 || votingData.votes.length > 0) {
        const exportPath = saveExportedData(votingData);
        if (exportPath) {
            console.log('💾 Data preservation completed successfully');
        }
    } else {
        console.log('ℹ️  No voting data found to export');
    }

    // Then cleanup
    cleanup();
} catch (error) {
    console.log('❌ Error during cleanup process:', error);
    process.exit(1);
}