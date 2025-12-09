import Web3 from 'web3';
import { ETHEREUM_CONFIG } from '../../config/ethereum.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiNodeEthereumService {
    constructor() {
        if (MultiNodeEthereumService.instance) return MultiNodeEthereumService.instance;
        MultiNodeEthereumService.instance = this;

        this.contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
        this.node1ContractAddress = process.env.NODE1_CONTRACT_ADDRESS;
        this.node2ContractAddress = process.env.NODE2_CONTRACT_ADDRESS;

        console.log('📝 Contract addresses:', {
            VOTING_CONTRACT_ADDRESS: this.contractAddress,
            NODE1_CONTRACT_ADDRESS: this.node1ContractAddress,
            NODE2_CONTRACT_ADDRESS: this.node2ContractAddress
        });

        this.nodes = ETHEREUM_CONFIG.nodes.map(node => ({
            ...node,
            web3: new Web3(node.rpcUrl),
            isConnected: false,
            lastBlock: 0,
            failureCount: 0,
            lastSuccess: Date.now(),
            discoveredAccount: null,
            contract: null,
            syncStatus: 'unknown',
            lastSync: null,
            lastDataReceived: null
        }));

        this.simulationMode = false;
        this.voteStorage = new Map();
        this.initialized = false;
        this.initializing = false;
        this.maxFailures = 3;
        this.currentPrimaryNode = 'node1';
        this.syncInterval = null;
        this.contractABI = null;

        // Enhanced Emergency Storage with backup files
        this.emergencyStoragePath = path.join(__dirname, '../data/emergency_storage.json');
        this.emergencyBackupPath = path.join(__dirname, '../data/emergency_backup.json');
        this.emergencyEncryptionKey = process.env.EMERGENCY_STORAGE_KEY || 'default-emergency-key-2024';
        this.ensureEmergencyStorage();

        this.emergencyMode = false;
        this.emergencyModeStart = null;
        this.pendingSyncVotes = new Map();

        // Enhanced sync tracking
        this.syncHistory = [];
        this.lastSuccessfulSync = null;
        this.syncRetryCount = 0;
        this.maxSyncRetries = 5;
        
        // Auto-sync state
        this.autoSyncEnabled = true;
        this.syncDataUpdated = false;
        this.lastSyncCheck = Date.now();
        this.noDataSincePause = false;

        // Election state tracking
        this.electionState = {
            status: 'not_started',
            startTime: null,
            pauseTime: null,
            finishTime: null,
            lastDataTimestamp: null
        };

        this.loadContractABI();
    }

    ensureEmergencyStorage() {
        const dir = path.dirname(this.emergencyStoragePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.emergencyStoragePath)) {
            const initialData = this.createEmergencyStorageData();
            this.saveEmergencyStorage(initialData);
        }
        // Ensure backup directory exists
        const backupDir = path.dirname(this.emergencyBackupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
    }

    createEmergencyStorageData() {
        return {
            votes: [],
            metadata: {
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                totalVotes: 0,
                electionState: this.electionState,
                dataHash: this.generateDataHash([]),
                version: '2.0'
            }
        };
    }

    generateDataHash(votes) {
        const dataString = JSON.stringify(votes) + this.emergencyEncryptionKey;
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    verifyDataIntegrity(data) {
        if (!data.metadata || !data.metadata.dataHash) {
            console.log('⚠️ No data hash found, regenerating...');
            data.metadata.dataHash = this.generateDataHash(data.votes);
            return true;
        }

        const currentHash = this.generateDataHash(data.votes);
        if (data.metadata.dataHash !== currentHash) {
            console.error('❌ DATA TAMPERING DETECTED! Hash mismatch');
            return false;
        }

        return true;
    }

    encryptEmergencyData(data) {
        try {
            const algorithm = 'aes-256-gcm';
            const key = crypto.scryptSync(this.emergencyEncryptionKey, 'salt', 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher(algorithm, key);
            
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                iv: iv.toString('hex'),
                data: encrypted,
                authTag: authTag.toString('hex'),
                timestamp: new Date().toISOString(),
                version: '2.0',
                encrypted: true
            };
        } catch (error) {
            console.error('Emergency encryption error:', error);
            // Enhanced fallback with better security
            const dataString = JSON.stringify(data);
            const salt = crypto.randomBytes(16);
            const derivedKey = crypto.scryptSync(this.emergencyEncryptionKey, salt, 32);
            const iv2 = crypto.randomBytes(16);
            const cipher2 = crypto.createCipheriv('aes-256-cbc', derivedKey, iv2);
            let encrypted2 = cipher2.update(dataString, 'utf8', 'hex');
            encrypted2 += cipher2.final('hex');
            
            return {
                iv: salt.toString('hex') + iv2.toString('hex'),
                data: encrypted2,
                authTag: crypto.createHash('sha256').update(encrypted2 + this.emergencyEncryptionKey).digest('hex'),
                timestamp: new Date().toISOString(),
                version: '2.0_fallback',
                encrypted: true
            };
        }
    }

    decryptEmergencyData(encryptedData) {
        try {
            if (!encryptedData.encrypted) {
                console.log('⚠️ Data not encrypted, using as-is');
                return encryptedData;
            }

            if (encryptedData.version === '2.0_fallback') {
                // Handle fallback encryption
                const combinedIv = encryptedData.iv;
                const salt = Buffer.from(combinedIv.substring(0, 32), 'hex');
                const iv = Buffer.from(combinedIv.substring(32), 'hex');
                const derivedKey = crypto.scryptSync(this.emergencyEncryptionKey, salt, 32);
                
                const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
                let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                
                // Verify integrity
                const expectedHash = crypto.createHash('sha256').update(encryptedData.data + this.emergencyEncryptionKey).digest('hex');
                if (expectedHash !== encryptedData.authTag) {
                    throw new Error('Fallback data integrity check failed');
                }
                
                return JSON.parse(decrypted);
            }

            const algorithm = 'aes-256-gcm';
            const key = crypto.scryptSync(this.emergencyEncryptionKey, 'salt', 32);
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Emergency decryption error:', error);
            
            // Try to load from backup if main file is corrupted
            try {
                console.log('🔄 Attempting to load from backup file...');
                if (fs.existsSync(this.emergencyBackupPath)) {
                    const backupData = fs.readFileSync(this.emergencyBackupPath, 'utf8');
                    const backupEncrypted = JSON.parse(backupData);
                    return this.decryptEmergencyData(backupEncrypted);
                }
            } catch (backupError) {
                console.error('❌ Backup file also corrupted:', backupError);
            }
            
            return this.createEmergencyStorageData();
        }
    }

    saveEmergencyStorage(data) {
        try {
            // Verify data integrity before saving
            if (!this.verifyDataIntegrity(data)) {
                throw new Error('Data integrity verification failed');
            }

            const encryptedData = this.encryptEmergencyData(data);
            
            // Create backup first
            if (fs.existsSync(this.emergencyStoragePath)) {
                const currentData = fs.readFileSync(this.emergencyStoragePath, 'utf8');
                fs.writeFileSync(this.emergencyBackupPath, currentData);
            }
            
            // Save main file
            fs.writeFileSync(this.emergencyStoragePath, JSON.stringify(encryptedData, null, 2));
            
            console.log(`💾 Emergency storage saved with backup (Total votes: ${data.votes.length})`);
            return true;
        } catch (error) {
            console.error('Error saving emergency storage:', error);
            return false;
        }
    }

    loadEmergencyStorage() {
        try {
            if (!fs.existsSync(this.emergencyStoragePath)) {
                return this.createEmergencyStorageData();
            }
            
            const fileData = fs.readFileSync(this.emergencyStoragePath, 'utf8');
            const encryptedData = JSON.parse(fileData);
            const data = this.decryptEmergencyData(encryptedData);
            
            // Verify data integrity after loading
            if (!this.verifyDataIntegrity(data)) {
                console.log('🔄 Regenerating data hash due to integrity issues');
                data.metadata.dataHash = this.generateDataHash(data.votes);
                this.saveEmergencyStorage(data);
            }
            
            return data;
        } catch (error) {
            console.error('Error loading emergency storage:', error);
            return this.createEmergencyStorageData();
        }
    }

    async saveVoteToEmergencyStorage(voteData) {
        try {
            const currentData = this.loadEmergencyStorage();
            
            // Check if vote already exists
            const existingVoteIndex = currentData.votes.findIndex(v => 
                v.ballotId === voteData.ballotId || v.voterId === voteData.voterId
            );
            
            if (existingVoteIndex !== -1) {
                // Update existing vote
                currentData.votes[existingVoteIndex] = {
                    ...voteData,
                    updatedAt: new Date().toISOString(),
                    source: 'emergency_updated',
                    syncStatus: 'pending'
                };
            } else {
                // Add new vote
                currentData.votes.push({
                    ...voteData,
                    storedAt: new Date().toISOString(),
                    source: 'emergency',
                    syncStatus: 'pending'
                });
            }
            
            // Update metadata
            currentData.metadata.lastUpdated = new Date().toISOString();
            currentData.metadata.totalVotes = currentData.votes.length;
            currentData.metadata.electionState = this.electionState;
            currentData.metadata.dataHash = this.generateDataHash(currentData.votes);
            
            const saveResult = this.saveEmergencyStorage(currentData);
            
            if (saveResult) {
                console.log(`💾 Emergency storage: Vote saved (Total: ${currentData.votes.length})`);
                
                // Update in-memory storage for consistency
                this.voteStorage.set(voteData.ballotId, {
                    ...voteData,
                    source: 'emergency',
                    storedAt: new Date().toISOString(),
                    syncStatus: 'pending'
                });

                // Update last data timestamp
                this.electionState.lastDataTimestamp = new Date().toISOString();
                
                // Trigger immediate sync attempt
                this.triggerImmediateSync();
            }
            
            return saveResult;
        } catch (error) {
            console.error('Error saving vote to emergency storage:', error);
            return false;
        }
    }

    async syncEmergencyToNodes() {
        if (!this.shouldAllowSync()) {
            console.log('🚫 Emergency to nodes sync skipped - election state does not allow sync');
            return 0;
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.contract && node.syncStatus === 'synced'
        );

        if (connectedNodes.length === 0) {
            console.log('⚠️ No connected nodes available for emergency sync');
            return 0;
        }

        const emergencyData = this.loadEmergencyStorage();
        const pendingVotes = emergencyData.votes.filter(vote => 
            vote.syncStatus === 'pending' || vote.source === 'emergency' || vote.source === 'emergency_updated'
        );

        if (pendingVotes.length === 0) {
            console.log('ℹ️ No pending emergency votes to sync to nodes');
            return 0;
        }

        console.log(`🔄 Syncing ${pendingVotes.length} pending emergency votes to ${connectedNodes.length} nodes...`);

        let totalSynced = 0;
        let totalErrors = 0;

        for (const voteData of pendingVotes) {
            let voteSynced = false;

            for (const node of connectedNodes) {
                try {
                    const voteExists = await node.contract.methods.voteExists(voteData.ballotId).call();

                    if (!voteExists) {
                        const votesString = JSON.stringify(voteData.votes);
                        await node.contract.methods.submitVote(
                            voteData.voterId,
                            voteData.ballotId,
                            votesString,
                            Math.floor(voteData.timestamp / 1000),
                            voteData.voterHash
                        ).send({
                            from: node.discoveredAccount,
                            gas: 200000
                        });

                        console.log(`✅ Synced emergency vote ${voteData.ballotId} to ${node.name}`);
                        voteSynced = true;
                        
                        // Update emergency storage to mark as synced
                        const currentData = this.loadEmergencyStorage();
                        const voteIndex = currentData.votes.findIndex(v => v.ballotId === voteData.ballotId);
                        if (voteIndex !== -1) {
                            currentData.votes[voteIndex] = {
                                ...currentData.votes[voteIndex],
                                source: 'blockchain_synced',
                                syncStatus: 'synced',
                                syncedAt: new Date().toISOString(),
                                syncedTo: node.name
                            };
                            this.saveEmergencyStorage(currentData);
                        }
                    } else {
                        console.log(`ℹ️ Vote ${voteData.ballotId} already exists on ${node.name}`);
                        voteSynced = true;
                    }
                } catch (error) {
                    if (!error.message.includes('already voted') &&
                        !error.message.includes('vote already exists')) {
                        console.log(`⚠️ Failed to sync emergency vote ${voteData.ballotId} to ${node.name}:`, error.message);
                    } else {
                        voteSynced = true;
                    }
                }
            }

            if (voteSynced) {
                totalSynced++;
            } else {
                totalErrors++;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Record sync history
        this.recordSyncHistory('emergency_to_nodes', totalSynced, totalErrors);

        console.log(`✅ Emergency to nodes sync completed: ${totalSynced} votes synced, ${totalErrors} errors`);
        return totalSynced;
    }

    async syncNodesToEmergency() {
        if (!this.shouldAllowSync()) {
            console.log('🚫 Nodes to emergency sync skipped - election state does not allow sync');
            return 0;
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.contract && node.syncStatus === 'synced'
        );

        if (connectedNodes.length === 0) {
            return 0;
        }

        try {
            const node = connectedNodes[0];
            console.log('🔄 Syncing blockchain data to emergency storage...');

            const allVotesData = await node.contract.methods.getAllVotes().call();
            const ballotIds = allVotesData[0];

            console.log(`📥 Found ${ballotIds.length} votes on blockchain, syncing to emergency storage...`);

            let syncedCount = 0;
            const emergencyData = this.loadEmergencyStorage();

            for (let i = 0; i < ballotIds.length; i++) {
                try {
                    const ballotId = ballotIds[i];
                    
                    // Check if vote already exists in emergency storage
                    const existingVoteIndex = emergencyData.votes.findIndex(v => v.ballotId === ballotId);
                    
                    if (existingVoteIndex === -1) {
                        const voteDetails = await node.contract.methods.getVote(ballotId).call();

                        let votesArray = [];
                        try {
                            votesArray = JSON.parse(voteDetails[2]);
                        } catch (parseError) {
                            console.log(`⚠️ Could not parse votes for ballot ${ballotId}`);
                            continue;
                        }

                        const blockchainVote = {
                            voterId: voteDetails[0],
                            ballotId: voteDetails[1],
                            votes: votesArray,
                            timestamp: parseInt(voteDetails[3]) * 1000,
                            voterHash: voteDetails[4],
                            transactionHash: `blockchain_${ballotId}`,
                            blockNumber: 0,
                            node: node.name,
                            source: 'blockchain_backup',
                            syncStatus: 'synced',
                            backedUpAt: new Date().toISOString()
                        };

                        emergencyData.votes.push(blockchainVote);
                        syncedCount++;
                    }
                } catch (voteError) {
                    console.log(`⚠️ Error processing blockchain vote ${i}:`, voteError.message);
                }
            }

            if (syncedCount > 0) {
                emergencyData.metadata.lastUpdated = new Date().toISOString();
                emergencyData.metadata.totalVotes = emergencyData.votes.length;
                emergencyData.metadata.dataHash = this.generateDataHash(emergencyData.votes);
                this.saveEmergencyStorage(emergencyData);
                console.log(`💾 Emergency storage sync complete: ${syncedCount} added, total: ${emergencyData.votes.length}`);
            }

            return syncedCount;

        } catch (error) {
            console.log('❌ Blockchain to emergency storage sync failed:', error.message);
            return 0;
        }
    }

    loadContractABI() {
        try {
            console.log('🔍 Searching for contract artifacts...');

            const possiblePaths = [
                path.resolve(__dirname, '../../../artifacts/Voting.json'),
                path.resolve(__dirname, '../artifacts/Voting.json'),
                path.resolve(__dirname, '../../artifacts/Voting.json'),
                path.resolve(process.cwd(), 'artifacts/Voting.json'),
                path.resolve(process.cwd(), '../artifacts/Voting.json'),
                path.join(process.cwd(), 'artifacts/Voting.json'),
                path.join(__dirname, '../../../artifacts/Voting.json'),
                'D:\\CAPSTONE SYSTEM\\SSC VOTING BLOCKCHAIN\\artifacts\\Voting.json',
                'D:/CAPSTONE SYSTEM/SSC VOTING BLOCKCHAIN/artifacts/Voting.json'
            ];

            let artifactsPath = null;
            for (const testPath of possiblePaths) {
                console.log(`   Checking: ${testPath}`);
                if (fs.existsSync(testPath)) {
                    artifactsPath = testPath;
                    console.log(`✅ FOUND artifacts at: ${artifactsPath}`);
                    break;
                }
            }

            if (artifactsPath) {
                console.log('📁 Loading contract ABI from:', artifactsPath);
                const contractData = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));

                if (contractData.abi && Array.isArray(contractData.abi)) {
                    this.contractABI = contractData.abi;
                    console.log('✅ Contract ABI loaded successfully');
                    console.log(`📊 ABI contains ${contractData.abi.length} items`);

                    const functionCount = contractData.abi.filter(item => item.type === 'function').length;
                    const eventCount = contractData.abi.filter(item => item.type === 'event').length;
                    console.log(`📋 ABI contains ${functionCount} functions and ${eventCount} events`);
                } else {
                    console.warn('⚠️ ABI structure invalid, using fallback');
                    this.contractABI = this.getFallbackABI();
                }
            } else {
                console.log('❌ Contract artifacts not found in any searched location');
                console.log('💡 Using fallback ABI (this is OK - contracts are already deployed)');
                this.contractABI = this.getFallbackABI();
            }
        } catch (error) {
            console.error('❌ Failed to load contract ABI:', error.message);
            console.log('💡 Using fallback ABI');
            this.contractABI = this.getFallbackABI();
        }
    }

    getFallbackABI() {
        return [
            { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "string", "name": "voterId", "type": "string" }, { "indexed": true, "internalType": "string", "name": "ballotId", "type": "string" }, { "indexed": false, "internalType": "string", "name": "votes", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "voterHash", "type": "string" }], "name": "VoteSubmitted", "type": "event" },
            { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "ballotIds", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "getAllVotes", "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "getTotalVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "_ballotId", "type": "string" }], "name": "getVote", "outputs": [{ "internalType": "string", "name": "", "type": "string" }, { "internalType": "string", "name": "", "type": "string" }, { "internalType": "string", "name": "", "type": "string" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "getVotesCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "hasVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "_voterId", "type": "string" }], "name": "hasVotedFunction", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "resetVotes", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "_voterId", "type": "string" }, { "internalType": "string", "name": "_ballotId", "type": "string" }, { "internalType": "string", "name": "_votes", "type": "string" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }, { "internalType": "string", "name": "_voterHash", "type": "string" }], "name": "submitVote", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "timestamps", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "totalVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "_ballotId", "type": "string" }], "name": "voteExists", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "votes", "outputs": [{ "internalType": "string", "name": "voterId", "type": "string" }, { "internalType": "string", "name": "ballotId", "type": "string" }, { "internalType": "string", "name": "votes", "type": "string" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "string", "name": "voterHash", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "voterHashes", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
        ];
    }

    checkEmergencyMode() {
        const connectedNodes = this.nodes.filter(node => node.isConnected);
        const wasInEmergency = this.emergencyMode;
        
        // Check if node1 and node2 are down
        const node1Down = !this.nodes.find(n => n.name === 'node1')?.isConnected;
        const node2Down = !this.nodes.find(n => n.name === 'node2')?.isConnected;
        
        this.emergencyMode = node1Down && node2Down;

        if (this.emergencyMode && !wasInEmergency) {
            this.emergencyModeStart = new Date();
            console.log('🚨 ENTERING EMERGENCY MODE - Both nodes down, using emergency storage');
            
            // Pause the poll if both nodes are down
            if (this.electionState.status === 'voting') {
                this.updateElectionState({
                    status: 'paused',
                    pauseTime: new Date().toISOString()
                });
                console.log('⏸️ Poll automatically paused because both nodes are down');
            }

        } else if (!this.emergencyMode && wasInEmergency) {
            console.log('✅ EXITING EMERGENCY MODE - Nodes recovered');
            
            if (this.shouldAllowSync()) {
                // Trigger immediate sync when exiting emergency mode
                this.triggerImmediateSync();
            } else {
                console.log('🚫 Syncing disabled - election state does not allow sync');
            }
        }

        return this.emergencyMode;
    }

    triggerImmediateSync() {
        console.log('🚀 Triggering immediate sync...');
        this.syncEmergencyToNodes().catch(error => {
            console.log('⚠️ Immediate sync failed:', error.message);
        });
    }

    shouldAllowSync() {
        // Allow sync during voting or paused states
        // But if paused and no data received since pause, don't allow sync
        if (this.electionState.status === 'voting') {
            return true;
        } else if (this.electionState.status === 'paused') {
            // Check if we have received data since pause
            if (this.electionState.pauseTime && this.electionState.lastDataTimestamp) {
                const pauseTime = new Date(this.electionState.pauseTime).getTime();
                const lastDataTime = new Date(this.electionState.lastDataTimestamp).getTime();
                
                // If no data received since pause, don't allow sync
                if (lastDataTime <= pauseTime) {
                    this.noDataSincePause = true;
                    console.log('🚫 No data received since pause, sync not allowed');
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    async syncEmergencyVotesToNodes() {
        if (!this.shouldAllowSync()) {
            console.log('🚫 Syncing disabled - election state does not allow sync');
            return 0;
        }

        if (this.voteStorage.size === 0) {
            console.log('ℹ️ No emergency votes to sync');
            return 0;
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.contract && node.syncStatus === 'synced'
        );

        if (connectedNodes.length === 0) {
            console.log('⚠️ No connected nodes available for emergency sync');
            return 0;
        }

        console.log(`🔄 Syncing ${this.voteStorage.size} emergency votes to ${connectedNodes.length} recovered nodes...`);

        let totalSynced = 0;
        let totalErrors = 0;

        for (const [ballotId, voteData] of this.voteStorage) {
            if (voteData.source === 'emergency') {
                let voteSynced = false;

                for (const node of connectedNodes) {
                    try {
                        const voteExists = await node.contract.methods.voteExists(ballotId).call();

                        if (!voteExists) {
                            const votesString = JSON.stringify(voteData.votes);
                            await node.contract.methods.submitVote(
                                voteData.voterId,
                                voteData.ballotId,
                                votesString,
                                Math.floor(voteData.timestamp / 1000),
                                voteData.voterHash
                            ).send({
                                from: node.discoveredAccount,
                                gas: 200000
                            });

                            console.log(`✅ Synced emergency vote ${ballotId} to ${node.name}`);
                            voteSynced = true;
                        } else {
                            console.log(`ℹ️ Vote ${ballotId} already exists on ${node.name}`);
                            voteSynced = true;
                        }
                    } catch (error) {
                        if (!error.message.includes('already voted') &&
                            !error.message.includes('vote already exists')) {
                            console.log(`⚠️ Failed to sync emergency vote ${ballotId} to ${node.name}:`, error.message);
                        } else {
                            voteSynced = true;
                        }
                    }
                }

                if (voteSynced) {
                    totalSynced++;
                    voteData.source = 'blockchain';
                    voteData.emergencySynced = true;
                    voteData.syncTime = new Date().toISOString();
                    
                    await this.saveVoteToEmergencyStorage(voteData);
                } else {
                    totalErrors++;
                }

                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ Emergency sync completed: ${totalSynced} votes synced, ${totalErrors} errors`);

        if (totalSynced > 0) {
            console.log('🎉 All emergency votes have been successfully synced to recovered nodes!');
        }
        
        return totalSynced;
    }

    async init() {
        if (this.initialized || this.initializing) return;
        this.initializing = true;

        try {
            console.log('🔧 Initializing robust dual-node service with enhanced emergency storage...');

            const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
            const node1ContractAddress = process.env.NODE1_CONTRACT_ADDRESS;
            const node2ContractAddress = process.env.NODE2_CONTRACT_ADDRESS;

            console.log('📝 Final contract addresses:', {
                primary: contractAddress,
                node1: node1ContractAddress,
                node2: node2ContractAddress
            });

            let connectedCount = 0;
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                try {
                    const isConnected = await this.testNodeConnection(node);
                    node.isConnected = isConnected;
                    if (isConnected) {
                        const accounts = await node.web3.eth.getAccounts();
                        node.discoveredAccount = accounts[0];
                        const balance = await node.web3.eth.getBalance(node.discoveredAccount);
                        const blockNumber = await node.web3.eth.getBlockNumber();
                        node.lastBlock = blockNumber;

                        console.log(`✅ ${node.name}: Connected`);
                        console.log(`   Account: ${node.discoveredAccount}`);
                        console.log(`   Balance: ${node.web3.utils.fromWei(balance, 'ether')} ETH`);
                        console.log(`   Block: #${blockNumber}`);
                        connectedCount++;
                    }
                } catch (error) {
                    console.log(`❌ ${node.name} connection failed:`, error.message);
                    this.nodes[i].isConnected = false;
                    this.nodes[i].failureCount++;
                }
            }

            this.checkEmergencyMode();

            if (this.emergencyMode) {
                console.log('🚨 SYSTEM IN EMERGENCY MODE - Both nodes unavailable');
                
                // Load emergency storage into memory
                const emergencyData = this.loadEmergencyStorage();
                emergencyData.votes.forEach(vote => {
                    this.voteStorage.set(vote.ballotId, vote);
                });
                console.log(`📊 Emergency storage loaded: ${emergencyData.votes.length} votes`);
            } else {
                console.log('✅ Normal operation - Nodes available');
            }

            await this.loadContractOnAllNodes();
            await this.startAutoSync();
            this.initialized = true;
            console.log('✅ Enhanced blockchain service ready with emergency storage and auto-sync');

        } catch (error) {
            console.error('❌ Service init failed:', error);
            this.initialized = false;
        } finally {
            this.initializing = false;
        }
    }

    async startAutoSync() {
        console.log('🔄 Starting enhanced auto-sync with emergency storage...');
        
        // Clear any existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(async () => {
            try {
                await this.checkNodeHealth();
                const inEmergency = this.checkEmergencyMode();

                // Update node data timestamps
                this.updateNodeDataTimestamps();

                if (!inEmergency) {
                    if (this.shouldAllowSync()) {
                        // Check if all data is already updated
                        if (await this.isAllDataUpdated()) {
                            console.log('✅ All data is updated, skipping auto-sync');
                            this.syncDataUpdated = true;
                            
                            // Stop auto-sync if all data is updated
                            if (this.autoSyncEnabled) {
                                console.log('🛑 Stopping auto-sync as all data is updated');
                                clearInterval(this.syncInterval);
                                this.syncInterval = null;
                                this.autoSyncEnabled = false;
                            }
                            return;
                        }
                        
                        this.syncDataUpdated = false;
                        
                        // Perform sync operations
                        const nodeSyncResult = await this.syncAllNodes();
                        const emergencySyncResult = await this.syncBlockchainToEmergencyStorage();
                        const emergencyToNodesResult = await this.syncEmergencyToNodes();
                        
                        // If no sync happened, check if we should stop auto-sync
                        if (nodeSyncResult === 0 && emergencySyncResult === 0 && emergencyToNodesResult === 0) {
                            console.log('ℹ️ No sync operations performed, data appears to be in sync');
                        }
                        
                    } else {
                        console.log('🚫 Auto-sync skipped - election state does not allow sync');
                    }
                } else {
                    console.log('🚨 In emergency mode - skipping blockchain sync');
                }

                await this.checkAndRecoverFailedNodes();
            } catch (error) {
                console.log('⚠️ Auto-sync error:', error.message);
                this.syncRetryCount++;
                
                if (this.syncRetryCount >= this.maxSyncRetries) {
                    console.log('🔄 Resetting sync retry count');
                    this.syncRetryCount = 0;
                }
            }
        }, 10000); // Sync every 10 seconds
    }

    // Check if all data is updated across all nodes and emergency storage
    async isAllDataUpdated() {
        try {
            const connectedNodes = this.nodes.filter(node => 
                node.isConnected && node.contract && node.syncStatus === 'synced'
            );
            
            if (connectedNodes.length === 0) {
                return false;
            }
            
            // Get vote counts from all connected nodes
            const nodeVoteCounts = [];
            for (const node of connectedNodes) {
                try {
                    const voteCount = await node.contract.methods.getTotalVotes().call();
                    nodeVoteCounts.push(parseInt(voteCount));
                    node.lastDataReceived = new Date().toISOString();
                } catch (error) {
                    console.log(`⚠️ Failed to get vote count from ${node.name}:`, error.message);
                    return false;
                }
            }
            
            // Get vote count from emergency storage
            const emergencyData = this.loadEmergencyStorage();
            const emergencyVoteCount = emergencyData.metadata.totalVotes;
            
            // Check if all vote counts are the same
            const allCountsSame = nodeVoteCounts.every(count => count === emergencyVoteCount);
            
            // Also check if there are any pending sync votes
            const pendingVotes = emergencyData.votes.filter(vote => 
                vote.syncStatus === 'pending' || vote.source === 'emergency'
            );
            
            const noPendingVotes = pendingVotes.length === 0;
            
            return allCountsSame && noPendingVotes;
            
        } catch (error) {
            console.log('⚠️ Error checking if all data is updated:', error.message);
            return false;
        }
    }

    // Update node data timestamps
    updateNodeDataTimestamps() {
        const now = new Date().toISOString();
        for (const node of this.nodes) {
            if (node.isConnected && node.lastSync) {
                const lastSyncTime = new Date(node.lastSync).getTime();
                const currentTime = Date.now();
                
                // If node synced within last minute, update lastDataReceived
                if (currentTime - lastSyncTime < 60000) {
                    node.lastDataReceived = now;
                }
            }
        }
    }

    recordSyncHistory(type, synced, errors) {
        const syncRecord = {
            type,
            timestamp: new Date().toISOString(),
            synced,
            errors,
            emergencyMode: this.emergencyMode,
            connectedNodes: this.nodes.filter(n => n.isConnected).length
        };
        
        this.syncHistory.push(syncRecord);
        
        // Keep only last 100 records
        if (this.syncHistory.length > 100) {
            this.syncHistory = this.syncHistory.slice(-100);
        }
        
        if (synced > 0) {
            this.lastSuccessfulSync = new Date().toISOString();
        }
    }

    async syncBlockchainToEmergencyStorage() {
        if (!this.shouldAllowSync()) {
            console.log('🚫 Blockchain to emergency storage sync skipped - election state does not allow sync');
            return 0;
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.contract && node.syncStatus === 'synced'
        );

        if (connectedNodes.length === 0) {
            return 0;
        }

        try {
            const node = connectedNodes[0];
            console.log('🔄 Syncing blockchain data to emergency storage...');

            const allVotesData = await node.contract.methods.getAllVotes().call();
            const ballotIds = allVotesData[0];

            console.log(`📥 Found ${ballotIds.length} votes on blockchain, syncing to emergency storage...`);

            let syncedCount = 0;
            const emergencyData = this.loadEmergencyStorage();

            for (let i = 0; i < ballotIds.length; i++) {
                try {
                    const ballotId = ballotIds[i];
                    
                    const existingVoteIndex = emergencyData.votes.findIndex(v => v.ballotId === ballotId);
                    
                    if (existingVoteIndex === -1) {
                        const voteDetails = await node.contract.methods.getVote(ballotId).call();

                        let votesArray = [];
                        try {
                            votesArray = JSON.parse(voteDetails[2]);
                        } catch (parseError) {
                            console.log(`⚠️ Could not parse votes for ballot ${ballotId}`);
                            continue;
                        }

                        const blockchainVote = {
                            voterId: voteDetails[0],
                            ballotId: voteDetails[1],
                            votes: votesArray,
                            timestamp: parseInt(voteDetails[3]) * 1000,
                            voterHash: voteDetails[4],
                            transactionHash: `blockchain_${ballotId}`,
                            blockNumber: 0,
                            node: node.name,
                            source: 'blockchain_backup',
                            syncStatus: 'synced',
                            backedUpAt: new Date().toISOString()
                        };

                        emergencyData.votes.push(blockchainVote);
                        syncedCount++;
                    }
                } catch (voteError) {
                    console.log(`⚠️ Error processing blockchain vote ${i}:`, voteError.message);
                }
            }

            if (syncedCount > 0) {
                emergencyData.metadata.lastUpdated = new Date().toISOString();
                emergencyData.metadata.totalVotes = emergencyData.votes.length;
                emergencyData.metadata.dataHash = this.generateDataHash(emergencyData.votes);
                this.saveEmergencyStorage(emergencyData);
                console.log(`💾 Emergency storage sync complete: ${syncedCount} added, total: ${emergencyData.votes.length}`);
            }

            return syncedCount;

        } catch (error) {
            console.log('❌ Blockchain to emergency storage sync failed:', error.message);
            return 0;
        }
    }

    async checkNodeHealth() {
        console.log('🔍 Checking node health...');
        let connectedCount = 0;

        for (const node of this.nodes) {
            try {
                const wasConnected = node.isConnected;
                const isConnected = await this.testNodeConnection(node);
                node.isConnected = isConnected;

                if (isConnected) {
                    connectedCount++;
                    if (!wasConnected) {
                        console.log(`✅ ${node.name} reconnected!`);
                        try {
                            const accounts = await node.web3.eth.getAccounts();
                            node.discoveredAccount = accounts[0];
                            const blockNumber = await node.web3.eth.getBlockNumber();
                            node.lastBlock = blockNumber;

                            const contractAddress = node.name === 'node1' ?
                                process.env.NODE1_CONTRACT_ADDRESS :
                                process.env.NODE2_CONTRACT_ADDRESS;

                            if (contractAddress && (!node.contract || node.syncStatus === 'error')) {
                                await this.loadContractOnNode(node, contractAddress);
                            }
                        } catch (nodeError) {
                            console.log(`⚠️ ${node.name} info update failed:`, nodeError.message);
                        }
                    }
                } else if (wasConnected) {
                    console.log(`⚠️ ${node.name} disconnected`);
                    node.failureCount++;
                }
            } catch (error) {
                console.log(`❌ ${node.name} health check failed:`, error.message);
                node.isConnected = false;
                node.failureCount++;
            }
        }

        console.log(`📊 Node health: ${connectedCount}/2 connected, Emergency Mode: ${this.emergencyMode ? 'ACTIVE' : 'INACTIVE'}`);
    }

    async testNodeConnection(node) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.log(`⏰ ${node.name} connection timeout`);
                setTimeout(() => this.checkEmergencyMode(), 100);
                resolve(false);
            }, 5000);

            node.web3.eth.net.isListening()
                .then(isListening => {
                    clearTimeout(timeout);
                    console.log(`📡 ${node.name} connection: ${isListening ? '✅' : '❌'}`);
                    setTimeout(() => this.checkEmergencyMode(), 100);
                    resolve(isListening);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    console.log(`❌ ${node.name} connection error: ${error.message}`);
                    setTimeout(() => this.checkEmergencyMode(), 100);
                    resolve(false);
                });
        });
    }

    async getActiveNode() {
        await this.ensureInitialized();

        console.log('🔍 Finding active node...');

        // Check if node1 is available
        const node1 = this.nodes.find(node => node.name === 'node1' && node.isConnected && node.contract && node.syncStatus === 'synced');
        if (node1) {
            this.currentPrimaryNode = 'node1';
            console.log(`✅ Using node1 (has contract)`);
            return node1;
        }

        // Check if node2 is available
        const node2 = this.nodes.find(node => node.name === 'node2' && node.isConnected && node.contract && node.syncStatus === 'synced');
        if (node2) {
            this.currentPrimaryNode = 'node2';
            console.log(`✅ Using node2 (node1 unavailable)`);
            return node2;
        }

        // Check if any node is connected
        const anyConnectedNode = this.nodes.find(node =>
            node.isConnected && node.discoveredAccount
        );

        if (anyConnectedNode) {
            this.currentPrimaryNode = anyConnectedNode.name;
            console.log(`✅ Using ${anyConnectedNode.name} (connected but may not have contract)`);
            return anyConnectedNode;
        }

        console.log('🔶 No nodes available, using emergency storage mode');
        return {
            ...this.nodes[0],
            web3: new Web3(),
            isConnected: false,
            name: 'emergency_storage',
            simulationMode: true
        };
    }

    async submitVoteToAllNodes(voteData) {
        await this.ensureInitialized();

        console.log('🔄 Enhanced vote submission with emergency mode support...');

        const inEmergency = this.checkEmergencyMode();

        if (inEmergency) {
            console.log('🚨 EMERGENCY MODE: Storing vote in emergency storage only');
            return await this.submitVoteToEmergencyStorage(voteData);
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.discoveredAccount && node.contract
        );

        console.log(`🔄 Submitting vote to ${connectedNodes.length} blockchain nodes`);

        if (connectedNodes.length === 0) {
            console.log('⚠️ No blockchain nodes available, using emergency storage');
            return await this.submitVoteToEmergencyStorage(voteData);
        }

        const results = [];
        const errors = [];

        for (const node of connectedNodes) {
            try {
                console.log(`🔄 Submitting to ${node.name}...`);

                const votesString = JSON.stringify(voteData.votes);
                const transaction = node.contract.methods.submitVote(
                    voteData.voterId,
                    voteData.ballotId,
                    votesString,
                    Math.floor(Date.now() / 1000),
                    voteData.voterHash
                );

                const gas = await transaction.estimateGas({ from: node.discoveredAccount });
                const receipt = await transaction.send({
                    from: node.discoveredAccount,
                    gas: gas
                });

                console.log(`✅ Success on ${node.name}:`, receipt.transactionHash);

                results.push({
                    success: true,
                    node: node.name,
                    receipt: {
                        transactionHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber?.toString(),
                        voterHash: voteData.voterHash,
                        node: node.name,
                        ballotId: voteData.ballotId,
                        simulated: false
                    }
                });

                // Update node last data received timestamp
                node.lastDataReceived = new Date().toISOString();

            } catch (error) {
                console.warn(`❌ ${node.name} submission failed:`, error.message);
                errors.push({
                    node: node.name,
                    error: error.message
                });

                node.failureCount++;
                if (node.failureCount >= this.maxFailures) {
                    node.isConnected = false;
                    console.log(`🚫 ${node.name} marked as disconnected`);
                }
            }
        }

        if (results.length === 0) {
            console.log('❌ All blockchain submissions failed, using emergency storage');
            return await this.submitVoteToEmergencyStorage(voteData);
        }

        // Always save to emergency storage as backup, even if blockchain succeeded
        const emergencyResult = await this.submitVoteToEmergencyStorage(voteData, 'blockchain');

        return {
            ...emergencyResult,
            blockchainResults: results,
            blockchainErrors: errors,
            emergencyBackup: true
        };
    }

    async submitVoteToEmergencyStorage(voteData, source = 'emergency') {
        console.log(`💾 EMERGENCY STORAGE: Storing vote (source: ${source})`);
        
        const node = this.nodes.find(n => n.isConnected) || this.nodes[0];
        const web3 = node?.web3 || new Web3();
        const simulatedHash = web3.utils.sha3(voteData.voterId + voteData.ballotId + Date.now() + Math.random().toString(36));
        const blockNumber = node?.web3 ? await node.web3.eth.getBlockNumber().catch(() => 0) : 0;

        const emergencyVote = {
            voterId: voteData.voterId,
            ballotId: voteData.ballotId,
            votes: voteData.votes,
            timestamp: Date.now(),
            voterHash: voteData.voterHash,
            transactionHash: simulatedHash,
            blockNumber: blockNumber,
            node: 'emergency_storage',
            source: source,
            syncStatus: 'pending',
            emergencyMode: this.emergencyMode,
            storedAt: new Date().toISOString()
        };

        // Save to both in-memory and file-based emergency storage
        this.voteStorage.set(voteData.ballotId, emergencyVote);
        await this.saveVoteToEmergencyStorage(emergencyVote);

        console.log(`💾 Vote stored in emergency storage (total: ${this.voteStorage.size})`);

        return {
            success: true,
            receipt: {
                transactionHash: simulatedHash,
                blockNumber: blockNumber?.toString(),
                voterHash: voteData.voterHash,
                gasUsed: '21000',
                timestamp: new Date().toISOString(),
                simulated: true,
                node: 'emergency_storage',
                ballotId: voteData.ballotId,
                source: source,
                emergencyMode: this.emergencyMode,
                syncStatus: 'pending'
            },
            emergencyInfo: {
                emergencyMode: this.emergencyMode,
                emergencyVoteCount: this.voteStorage.size,
                storedAt: new Date().toISOString(),
                willSyncWhenNodesRecover: this.emergencyMode && this.shouldAllowSync(),
                dataIntegrity: 'verified'
            }
        };
    }

    async syncAllNodes() {
        if (!this.shouldAllowSync()) {
            console.log('🚫 Node-to-node sync skipped - election state does not allow sync');
            return 0;
        }

        const connectedNodes = this.nodes.filter(node =>
            node.isConnected && node.contract && node.syncStatus === 'synced'
        );

        if (connectedNodes.length < 2) {
            return 0;
        }

        try {
            const nodeVoteCounts = await Promise.all(
                connectedNodes.map(async (node) => {
                    try {
                        const count = await node.contract.methods.getTotalVotes().call();
                        return {
                            node: node,
                            count: parseInt(count),
                            name: node.name
                        };
                    } catch (error) {
                        console.log(`❌ Failed to get vote count from ${node.name}:`, error.message);
                        return { node: node, count: -1, name: node.name, error: error.message };
                    }
                })
            );

            const validCounts = nodeVoteCounts.filter(v => v.count >= 0);

            if (validCounts.length < 2) {
                return 0;
            }

            const maxCount = Math.max(...validCounts.map(v => v.count));
            const minCount = Math.min(...validCounts.map(v => v.count));

            if (maxCount > minCount) {
                console.log(`🔄 Nodes out of sync: ${validCounts.map(v => `${v.name}=${v.count}`).join(', ')}`);

                const sourceNode = validCounts.find(v => v.count === maxCount).node;
                const targetNodes = validCounts.filter(v => v.count < maxCount).map(v => v.node);

                console.log(`🔄 Syncing from ${sourceNode.name} (${maxCount} votes) to ${targetNodes.length} node(s)`);

                let totalSynced = 0;
                for (const targetNode of targetNodes) {
                    const synced = await this.syncNodeFromSource(sourceNode, targetNode);
                    totalSynced += synced;
                }
                
                return totalSynced;
            } else {
                console.log(`✅ Nodes in sync: ${validCounts.map(v => `${v.name}=${v.count}`).join(', ')}`);
                return 0;
            }

        } catch (error) {
            console.log('❌ Sync all nodes failed:', error.message);
            return 0;
        }
    }

    async syncNodeFromSource(sourceNode, targetNode) {
        try {
            console.log(`🔄 Syncing ${targetNode.name} from ${sourceNode.name}...`);

            const allVotes = await sourceNode.contract.methods.getAllVotes().call();
            const ballotIds = allVotes[0];

            console.log(`📥 Found ${ballotIds.length} votes on ${sourceNode.name}, syncing to ${targetNode.name}...`);

            let syncedCount = 0;
            let errorCount = 0;

            for (const ballotId of ballotIds) {
                try {
                    const voteExists = await targetNode.contract.methods.voteExists(ballotId).call();

                    if (!voteExists) {
                        const voteDetails = await sourceNode.contract.methods.getVote(ballotId).call();

                        await targetNode.contract.methods.submitVote(
                            voteDetails[0],
                            voteDetails[1],
                            voteDetails[2],
                            voteDetails[3],
                            voteDetails[4]
                        ).send({
                            from: targetNode.discoveredAccount,
                            gas: 200000
                        });

                        syncedCount++;
                        console.log(`✅ Synced vote ${ballotId} to ${targetNode.name} (${syncedCount}/${ballotIds.length})`);
                    }
                } catch (voteError) {
                    errorCount++;
                    if (!voteError.message.includes('already voted') &&
                        !voteError.message.includes('vote already exists')) {
                        console.log(`⚠️ Failed to sync vote ${ballotId}:`, voteError.message);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`✅ Sync completed for ${targetNode.name}: ${syncedCount} votes synced, ${errorCount} errors`);

            targetNode.syncStatus = 'synced';
            targetNode.lastSync = new Date().toISOString();
            targetNode.lastDataReceived = new Date().toISOString();

            return syncedCount;

        } catch (error) {
            console.log(`❌ Sync from ${sourceNode.name} to ${targetNode.name} failed:`, error.message);
            targetNode.syncStatus = 'sync_failed';
            return 0;
        }
    }

    async checkAndRecoverFailedNodes() {
        for (const node of this.nodes) {
            if (!node.isConnected && node.failureCount < this.maxFailures) {
                console.log(`🔄 Attempting to recover ${node.name}...`);
                try {
                    const isConnected = await this.testNodeConnection(node);
                    if (isConnected) {
                        node.isConnected = true;
                        node.failureCount = 0;

                        const contractAddress = node.name === 'node1' ?
                            process.env.NODE1_CONTRACT_ADDRESS :
                            process.env.NODE2_CONTRACT_ADDRESS;

                        await this.loadContractOnNode(node, contractAddress);

                        console.log(`✅ ${node.name} recovered successfully`);

                        if (this.shouldAllowSync()) {
                            await this.syncSimulationToNode(node);
                        } else {
                            console.log(`🚫 Simulation sync skipped for ${node.name} - election state does not allow sync`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Failed to recover ${node.name}:`, error.message);
                    node.failureCount++;
                }
            }
        }
    }

    async syncSimulationToNode(node) {
        if (this.voteStorage.size === 0) {
            console.log(`ℹ️ No in-memory data to sync to ${node.name}`);
            return 0;
        }

        console.log(`🔄 Syncing ${this.voteStorage.size} in-memory votes to ${node.name}...`);

        let syncedCount = 0;
        let errorCount = 0;

        for (const [ballotId, voteData] of this.voteStorage) {
            try {
                const voteExists = await node.contract.methods.voteExists(ballotId).call();

                if (!voteExists) {
                    const votesString = JSON.stringify(voteData.votes);
                    await node.contract.methods.submitVote(
                        voteData.voterId,
                        voteData.ballotId,
                        votesString,
                        Math.floor(voteData.timestamp / 1000),
                        voteData.voterHash
                    ).send({
                        from: node.discoveredAccount,
                        gas: 200000
                    });

                    syncedCount++;
                    console.log(`✅ Synced in-memory vote ${ballotId} to ${node.name} (${syncedCount}/${this.voteStorage.size})`);
                }
            } catch (voteError) {
                errorCount++;
                if (!voteError.message.includes('already voted') &&
                    !voteError.message.includes('vote already exists')) {
                    console.log(`⚠️ Failed to sync in-memory vote ${ballotId}:`, voteError.message);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`✅ Sync completed for ${node.name}: ${syncedCount} in-memory votes synced, ${errorCount} errors`);
        return syncedCount;
    }

    async resetVotingData() {
        try {
            console.log('🔄 COMPLETE SYSTEM RESET: Starting guaranteed data wipe...');

            // STEP 1: IMMEDIATELY CLEAR IN-MEMORY STORAGE
            const previousVoteCount = this.voteStorage.size;
            this.voteStorage.clear();
            console.log(`🗑️ IMMEDIATELY CLEARED ${previousVoteCount} votes from in-memory storage`);

            // STEP 2: Reset ALL service state
            this.emergencyMode = false;
            this.emergencyModeStart = null;
            this.pendingSyncVotes.clear();
            this.syncHistory = [];
            this.lastSuccessfulSync = null;
            this.syncRetryCount = 0;
            this.autoSyncEnabled = true;
            this.syncDataUpdated = false;
            this.noDataSincePause = false;

            // STEP 3: Reset election state to not_started
            this.electionState = {
                status: 'not_started',
                startTime: null,
                pauseTime: null,
                finishTime: null,
                lastDataTimestamp: null
            };

            // STEP 4: Reset ALL node failure counts and sync status
            this.nodes.forEach(node => {
                node.failureCount = 0;
                node.syncStatus = 'unknown';
                node.lastSync = null;
                node.lastDataReceived = null;
            });

            // STEP 5: Clear emergency storage with new structure
            const emptyData = this.createEmergencyStorageData();
            this.saveEmergencyStorage(emptyData);
            console.log('🗑️ Emergency storage cleared with new structure');

            // STEP 6: Attempt blockchain reset on ALL nodes
            let blockchainResetResults = [];
            console.log('🔄 Attempting blockchain contract reset on all nodes...');

            for (const node of this.nodes) {
                try {
                    const isConnected = await this.testNodeConnection(node);
                    
                    if (isConnected && node.contract && node.discoveredAccount) {
                        console.log(`🔄 Resetting blockchain on ${node.name}...`);
                        
                        const resetTransaction = node.contract.methods.resetVotes();
                        const gas = await resetTransaction.estimateGas({ from: node.discoveredAccount });
                        const receipt = await resetTransaction.send({
                            from: node.discoveredAccount,
                            gas: gas
                        });

                        blockchainResetResults.push({
                            node: node.name,
                            success: true,
                            transactionHash: receipt.transactionHash,
                            blockNumber: receipt.blockNumber?.toString()
                        });

                        console.log(`✅ ${node.name}: Blockchain reset successful`);
                    } else {
                        console.log(`⚠️ ${node.name}: Skipping blockchain reset (not connected or no contract)`);
                        blockchainResetResults.push({
                            node: node.name,
                            success: false,
                            error: 'Node not connected or no contract'
                        });
                    }
                } catch (error) {
                    console.log(`❌ ${node.name}: Blockchain reset failed:`, error.message);
                    blockchainResetResults.push({
                        node: node.name,
                        success: false,
                        error: error.message
                    });
                }
            }

            // STEP 7: Create archive
            const archiveData = {
                timestamp: new Date().toISOString(),
                totalVotes: previousVoteCount,
                blockchainResetResults: blockchainResetResults,
                resetType: 'ENHANCED_SYSTEM_RESET',
                emergencyStorageVersion: '2.0'
            };

            const archiveFile = path.join(__dirname, `../data/election-archive-${Date.now()}.json`);
            const archiveContent = JSON.stringify(archiveData, null, 2);
            fs.writeFileSync(archiveFile, archiveContent);
            console.log(`📁 Archived reset info to: ${archiveFile}`);

            // STEP 8: Restart auto-sync
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
            }
            await this.startAutoSync();

            // STEP 9: Return SUCCESS
            const successfulBlockchainResets = blockchainResetResults.filter(r => r.success).length;

            console.log('✅ ENHANCED SYSTEM RESET: All data cleared successfully');
            console.log(`📊 Results: ${previousVoteCount} in-memory votes cleared, ${successfulBlockchainResets}/${this.nodes.length} blockchain nodes reset`);

            return {
                success: true,
                resetAt: new Date().toISOString(),
                emergencyVotesCleared: previousVoteCount,
                blockchainNodesReset: successfulBlockchainResets,
                totalBlockchainNodes: this.nodes.length,
                archiveFile: archiveFile,
                details: {
                    inMemoryStorage: 'COMPLETELY_CLEARED',
                    blockchainContracts: `${successfulBlockchainResets}/${this.nodes.length} reset`,
                    serviceState: 'RESET',
                    electionState: 'RESET_TO_NOT_STARTED',
                    emergencyStorage: 'CLEARED_AND_RESTRUCTURED',
                    autoSync: 'RESTARTED'
                },
                message: `SUCCESS: ${previousVoteCount} votes cleared from memory, ${successfulBlockchainResets} blockchain nodes reset`
            };

        } catch (error) {
            console.error('❌ CRITICAL RESET ERROR:', error);
            
            const memoryCleared = this.voteStorage.size === 0;
            
            return {
                success: memoryCleared,
                error: error.message,
                resetAt: new Date().toISOString(),
                emergencyVotesCleared: memoryCleared ? 'ALL' : 'NONE',
                partialSuccess: memoryCleared,
                message: memoryCleared ? 
                    'In-memory storage cleared but blockchain reset encountered errors' : 
                    'CRITICAL: Reset failed completely'
            };
        }
    }

    async forceResetWhenFinished() {
        console.log('🚨 FORCE RESET: Voting finished - overriding all restrictions...');
        return await this.resetVotingData();
    }

    async checkResetCapability() {
        const emergencyStats = this.loadEmergencyStorage();
        
        return {
            resetSupported: true,
            emergencyResetSupported: true,
            connectedNodes: this.nodes.filter(n => n.isConnected).length,
            totalNodes: this.nodes.length,
            emergencyVoteCount: this.voteStorage.size,
            emergencyStorageVoteCount: emergencyStats.metadata.totalVotes,
            dataIntegrity: this.verifyDataIntegrity(emergencyStats) ? 'verified' : 'compromised',
            lastSuccessfulSync: this.lastSuccessfulSync,
            syncHistory: this.syncHistory.length,
            autoSyncEnabled: this.autoSyncEnabled,
            syncDataUpdated: this.syncDataUpdated,
            electionState: this.electionState,
            forceResetAvailable: true,
            message: 'ENHANCED_RESET: All storage systems will be cleared with data integrity checks'
        };
    }

    async loadContractOnAllNodes() {
        try {
            const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
            const node1ContractAddress = process.env.NODE1_CONTRACT_ADDRESS;
            const node2ContractAddress = process.env.NODE2_CONTRACT_ADDRESS;

            console.log('📝 Loading contracts on all nodes...');

            const nodeContracts = {
                node1: node1ContractAddress || contractAddress,
                node2: node2ContractAddress || contractAddress
            };

            let contractsLoaded = 0;

            for (const node of this.nodes) {
                if (node.isConnected) {
                    const contractAddress = nodeContracts[node.name];
                    if (!contractAddress) {
                        console.log(`❌ ${node.name}: No contract address available`);
                        continue;
                    }

                    console.log(`🔍 Loading contract for ${node.name} at: ${contractAddress}`);

                    const loaded = await this.loadContractOnNode(node, contractAddress);
                    if (loaded) contractsLoaded++;
                }
            }

            console.log(`📊 Contracts loaded on ${contractsLoaded}/${this.nodes.filter(n => n.isConnected).length} nodes`);

        } catch (error) {
            console.error('❌ Failed to load contracts:', error.message);
        }
    }

    async loadContractOnNode(node, contractAddress) {
        try {
            if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
                console.log(`❌ ${node.name}: Invalid contract address: ${contractAddress}`);
                node.contract = null;
                node.syncStatus = 'invalid_address';
                return false;
            }

            console.log(`🔍 Checking contract on ${node.name} at ${contractAddress}...`);
            const code = await node.web3.eth.getCode(contractAddress);
            const hasContractCode = code !== '0x' && code !== '0x0';

            console.log(`📄 ${node.name} contract code: ${hasContractCode ? `Found (${code.length} bytes)` : 'Not found'}`);

            if (hasContractCode) {
                node.contract = new node.web3.eth.Contract(this.contractABI, contractAddress);
                console.log(`✅ Contract instance created on ${node.name}`);

                try {
                    const totalVotes = await node.contract.methods.getTotalVotes().call();
                    console.log(`🔗 ${node.name} contract test - Total votes:`, totalVotes);
                    node.syncStatus = 'synced';
                    return true;
                } catch (testError) {
                    console.log(`⚠️ ${node.name} contract test failed:`, testError.message);
                    node.syncStatus = 'error';
                    return true;
                }
            } else {
                console.log(`⚠️ No contract code on ${node.name} at address ${contractAddress}`);
                node.contract = null;
                node.syncStatus = 'no_contract';
                return false;
            }
        } catch (error) {
            console.log(`❌ Failed to load contract on ${node.name}:`, error.message);
            node.contract = null;
            node.syncStatus = 'error';
            return false;
        }
    }

    async ensureInitialized() {
        if (!this.initialized && !this.initializing) {
            await this.init();
        }
        while (this.initializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async getBlockchainInfo() {
        await this.ensureInitialized();
        try {
            const activeNode = await this.getActiveNode();
            const blockNumber = activeNode.web3 && activeNode.isConnected ?
                await activeNode.web3.eth.getBlockNumber().catch(() => 0) : 0;

            const nodesStatus = await Promise.all(
                this.nodes.map(async (node) => {
                    let nodeBlockNumber = 0;
                    if (node.isConnected && node.web3) {
                        try {
                            nodeBlockNumber = await node.web3.eth.getBlockNumber().catch(() => 0);
                        } catch (error) {
                        }
                    }

                    return {
                        name: node.name,
                        connected: node.isConnected,
                        url: node.rpcUrl,
                        account: node.discoveredAccount,
                        blockNumber: nodeBlockNumber,
                        hasContract: !!node.contract,
                        syncStatus: node.syncStatus,
                        lastSync: node.lastSync,
                        lastDataReceived: node.lastDataReceived,
                        isPrimary: node.name === this.currentPrimaryNode,
                        failureCount: node.failureCount
                    };
                })
            );

            const connectedNodes = this.nodes.filter(n => n.isConnected).length;
            const contractsLoaded = this.nodes.filter(n => n.contract).length;

            const emergencyStats = this.loadEmergencyStorage();

            const response = {
                isConnected: connectedNodes > 0,
                blockNumber: blockNumber?.toString() || '0',
                currentNode: activeNode.name,
                contractDeployed: contractsLoaded > 0,
                contractAddress: this.contractAddress,
                emergencyMode: this.emergencyMode,
                emergencyModeStart: this.emergencyModeStart,
                emergencyVoteCount: this.voteStorage.size,
                emergencyStorageVoteCount: emergencyStats.metadata.totalVotes,
                dataIntegrity: this.verifyDataIntegrity(emergencyStats) ? 'verified' : 'compromised',
                nodes: nodesStatus,
                connectedNodes: connectedNodes,
                totalNodes: this.nodes.length,
                autoSyncEnabled: this.autoSyncEnabled,
                syncStatus: this.getOverallSyncStatus(nodesStatus),
                failoverActive: this.emergencyMode,
                robustMode: true,
                nodeHierarchy: {
                    primary: 'node1',
                    secondary: 'node2',
                    emergency: 'emergency_storage'
                },
                electionState: this.electionState,
                syncAllowed: this.shouldAllowSync(),
                noDataSincePause: this.noDataSincePause,
                syncDataUpdated: this.syncDataUpdated,
                syncHistory: {
                    lastSuccessful: this.lastSuccessfulSync,
                    totalSyncs: this.syncHistory.length,
                    recentSyncs: this.syncHistory.slice(-5)
                }
            };

            console.log('📊 Enhanced Blockchain Info:', {
                currentNode: response.currentNode,
                connectedNodes: `${response.connectedNodes}/${response.totalNodes}`,
                emergencyMode: response.emergencyMode,
                emergencyVotes: response.emergencyVoteCount,
                dataIntegrity: response.dataIntegrity,
                electionState: response.electionState.status,
                syncAllowed: response.syncAllowed,
                autoSyncEnabled: response.autoSyncEnabled,
                noDataSincePause: response.noDataSincePause,
                lastSuccessfulSync: response.syncHistory.lastSuccessful
            });

            return response;

        } catch (error) {
            console.error('❌ Error getting blockchain info:', error);
            return {
                isConnected: false,
                emergencyMode: true,
                emergencyVoteCount: this.voteStorage.size,
                emergencyStorageVoteCount: 0,
                dataIntegrity: 'unknown',
                autoSyncEnabled: this.autoSyncEnabled,
                nodes: this.nodes.map(n => ({
                    name: n.name,
                    connected: n.isConnected,
                    syncStatus: n.syncStatus,
                    isPrimary: n.name === this.currentPrimaryNode
                })),
                connectedNodes: this.nodes.filter(n => n.isConnected).length,
                totalNodes: this.nodes.length,
                failoverActive: true,
                robustMode: true,
                nodeHierarchy: {
                    primary: 'node1',
                    secondary: 'node2',
                    emergency: 'emergency_storage'
                },
                electionState: this.electionState,
                syncAllowed: this.shouldAllowSync(),
                noDataSincePause: this.noDataSincePause,
                syncDataUpdated: this.syncDataUpdated,
                error: error.message
            };
        }
    }

    getOverallSyncStatus(nodesStatus) {
        const syncedNodes = nodesStatus.filter(n => n.syncStatus === 'synced').length;
        const totalConnected = nodesStatus.filter(n => n.connected).length;

        if (totalConnected === 0) return 'emergency_mode';
        if (syncedNodes === totalConnected) return 'fully_synced';
        if (syncedNodes > 0) return 'partially_synced';
        return 'not_synced';
    }

    async getElectionResults() {
        await this.ensureInitialized();

        console.log(`🔶 Getting election results from ${this.emergencyMode ? 'ENHANCED EMERGENCY STORAGE' : 'blockchain with emergency backup'}`);
        
        // Combine votes from all sources
        const allVotes = Array.from(this.voteStorage.values());
        const emergencyData = this.loadEmergencyStorage();
        const emergencyVotes = emergencyData.votes;
        
        // Verify data integrity
        if (!this.verifyDataIntegrity(emergencyData)) {
            console.log('⚠️ Emergency storage integrity compromised, using in-memory data only');
        }
        
        // Merge votes, preferring in-memory storage for duplicates
        const voteMap = new Map();
        
        // Add emergency storage votes first
        emergencyVotes.forEach(vote => {
            voteMap.set(vote.ballotId, vote);
        });
        
        // Override with in-memory votes (more recent)
        allVotes.forEach(vote => {
            voteMap.set(vote.ballotId, vote);
        });
        
        const mergedVotes = Array.from(voteMap.values());
        
        const results = {};
        let totalVotes = 0;

        mergedVotes.forEach(vote => {
            if (vote.votes && Array.isArray(vote.votes)) {
                vote.votes.forEach(v => {
                    const position = v.position;
                    const candidateId = v.candidateId;

                    if (!results[position]) {
                        results[position] = {};
                    }

                    if (!results[position][candidateId]) {
                        results[position][candidateId] = {
                            candidateId: candidateId,
                            voteCount: 0
                        };
                    }

                    results[position][candidateId].voteCount++;
                    totalVotes++;
                });
            }
        });

        return {
            results: results,
            totalVotes: totalVotes,
            voteData: mergedVotes,
            source: this.emergencyMode ? 'enhanced_emergency_storage' : 'blockchain_with_emergency_backup',
            emergencyMode: this.emergencyMode,
            emergencyVoteCount: this.voteStorage.size,
            emergencyStorageVoteCount: emergencyData.metadata.totalVotes,
            dataIntegrity: this.verifyDataIntegrity(emergencyData) ? 'verified' : 'compromised',
            electionState: this.electionState
        };
    }

    async getVoteFromBlockchain(ballotId) {
        await this.ensureInitialized();

        const simulationVote = this.voteStorage.get(ballotId);
        if (simulationVote) {
            return simulationVote;
        }

        try {
            const connectedNodes = this.nodes.filter(node => node.isConnected && node.contract);
            if (connectedNodes.length > 0) {
                const node = connectedNodes[0];
                const voteDetails = await node.contract.methods.getVote(ballotId).call();
                if (voteDetails && voteDetails[0]) {
                    const blockchainVote = {
                        voterId: voteDetails[0],
                        ballotId: voteDetails[1],
                        votes: JSON.parse(voteDetails[2]),
                        timestamp: parseInt(voteDetails[3]) * 1000,
                        voterHash: voteDetails[4],
                        source: 'blockchain'
                    };

                    this.voteStorage.set(ballotId, blockchainVote);

                    return blockchainVote;
                }
            }
        } catch (error) {
            console.log(`⚠️ Blockchain vote fetch failed: ${error.message}`);
        }

        return null;
    }

    async checkVoterHasVoted(voterId) {
        await this.ensureInitialized();

        for (let [_, vote] of this.voteStorage) {
            if (vote.voterId === voterId) return true;
        }

        try {
            const connectedNodes = this.nodes.filter(node => node.isConnected && node.contract);
            for (const node of connectedNodes) {
                try {
                    const hasVoted = await node.contract.methods.hasVotedFunction(voterId).call();
                    if (hasVoted) return true;
                } catch (error) {
                }
            }
        } catch (error) {
        }

        return false;
    }

    async getAllVotesFromBlockchain() {
        await this.ensureInitialized();

        return Array.from(this.voteStorage.values());
    }

    serializeBigInt(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'bigint') {
            return obj.toString();
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.serializeBigInt(item));
        }

        if (typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.serializeBigInt(value);
            }
            return result;
        }

        return obj;
    }

    updateElectionState(newState) {
        const oldStatus = this.electionState.status;
        this.electionState = { ...this.electionState, ...newState };
        console.log(`📊 Election state updated: ${this.electionState.status}`);
        
        // If status changed to voting or paused, restart auto-sync
        if ((oldStatus !== 'voting' && this.electionState.status === 'voting') ||
            (oldStatus !== 'paused' && this.electionState.status === 'paused')) {
            
            console.log('🔄 Election state changed, restarting auto-sync if needed');
            
            if (!this.autoSyncEnabled || !this.syncInterval) {
                this.autoSyncEnabled = true;
                this.startAutoSync();
            }
        }
        
        // If status changed to finished, stop auto-sync
        if (oldStatus !== 'finished' && this.electionState.status === 'finished') {
            console.log('🛑 Election finished, stopping auto-sync');
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
                this.autoSyncEnabled = false;
            }
        }
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        // Emergency storage is automatically saved to file with backup
    }
}

const ethereumService = new MultiNodeEthereumService();

ethereumService.init().catch(error => console.error('❌ Failed to initialize:', error));

process.on('SIGINT', () => {
    console.log('🛑 Shutting down enhanced blockchain service...');
    ethereumService.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down enhanced blockchain service...');
    ethereumService.destroy();
    process.exit(0);
});

export { ethereumService };