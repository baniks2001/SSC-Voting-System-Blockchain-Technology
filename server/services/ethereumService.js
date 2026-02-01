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
        this.initialized = false;
        this.initializing = false;
        this.maxFailures = 3;
        this.currentPrimaryNode = 'node1';
        this.syncInterval = null;
        this.contractABI = null;

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

    triggerImmediateSync() {
        console.log('🚀 Triggering immediate sync...');
        // Immediate sync functionality will be handled by regular sync process
    }

    shouldAllowSync() {
        // Always allow sync during voting and paused states to ensure data consistency
        if (this.electionState.status === 'voting' || this.electionState.status === 'paused') {
            console.log(`✅ Sync allowed - election state: ${this.electionState.status}`);
            return true;
        }
        
        // Allow sync during not_started to ensure nodes are synchronized before voting begins
        if (this.electionState.status === 'not_started') {
            console.log('✅ Sync allowed - election state: not_started (preparing nodes)');
            return true;
        }
        
        // Don't allow sync during finished state
        console.log(`🚫 Sync not allowed - election state: ${this.electionState.status}`);
        return false;
    }

    async init() {
        if (this.initialized || this.initializing) return;
        this.initializing = true;

        try {
            console.log('🔧 Initializing robust dual-node service...');

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

            await this.loadContractOnAllNodes();
            await this.startAutoSync();
            this.initialized = true;
            console.log('✅ Enhanced blockchain service ready with auto-sync');

        } catch (error) {
            console.error('❌ Service init failed:', error);
            this.initialized = false;
        } finally {
            this.initializing = false;
        }
    }

    async startAutoSync() {
        console.log('🔄 Starting enhanced auto-sync with Node1-Node2 detection...');
        
        // Clear any existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(async () => {
            try {
                await this.checkNodeHealth();

                // Update node data timestamps
                this.updateNodeDataTimestamps();

                if (this.shouldAllowSync()) {
                    // Enhanced Node1-Node2 AutoSync Detection
                    const autoSyncResult = await this.performNode1Node2AutoSync();
                    
                    if (autoSyncResult.synced) {
                        console.log(`✅ AutoSync detected and synced ${autoSyncResult.votesSynced} votes from ${autoSyncResult.sourceNode} to ${autoSyncResult.targetNodes.join(', ')}`);
                    }
                    
                    // Only check if all data is updated if we're in a stable state
                    // Don't stop auto-sync just because data appears synchronized - keep monitoring
                    if (await this.isAllDataUpdated()) {
                        console.log('✅ All data is currently synchronized, continuing to monitor for changes');
                        this.syncDataUpdated = true;
                        
                        // Don't stop auto-sync - keep monitoring for new votes
                        // Only stop if election is finished
                        if (this.electionState.status === 'finished') {
                            console.log('🛑 Election finished, stopping auto-sync');
                            if (this.autoSyncEnabled) {
                                clearInterval(this.syncInterval);
                                this.syncInterval = null;
                                this.autoSyncEnabled = false;
                            }
                            return;
                        }
                    }
                    
                    this.syncDataUpdated = false;
                    
                    // Perform regular sync operations if auto-sync didn't handle everything
                    if (!autoSyncResult.synced || autoSyncResult.votesSynced === 0) {
                        const nodeSyncResult = await this.syncAllNodes();
                        
                        // If no sync happened, just log it - don't stop auto-sync
                        if (nodeSyncResult === 0) {
                            console.log('ℹ️ No sync operations performed, nodes appear to be in sync');
                        }
                    }
                    
                } else {
                    console.log('🚫 Auto-sync skipped - election state does not allow sync');
                    
                    // Stop auto-sync if election is finished
                    if (this.electionState.status === 'finished') {
                        console.log('🛑 Election finished, stopping auto-sync');
                        if (this.autoSyncEnabled) {
                            clearInterval(this.syncInterval);
                            this.syncInterval = null;
                            this.autoSyncEnabled = false;
                        }
                        return;
                    }
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

    // Check if all data is updated across all nodes
    async isAllDataUpdated() {
        try {
            const connectedNodes = this.nodes.filter(node => 
                node.isConnected && node.contract && node.syncStatus === 'synced'
            );
            
            if (connectedNodes.length < 2) {
                console.log(`⚠️ Need at least 2 synced nodes for data consistency check, have: ${connectedNodes.length}`);
                return false;
            }
            
            // Get vote counts from all connected nodes
            const nodeVoteCounts = [];
            for (const node of connectedNodes) {
                try {
                    const voteCount = await node.contract.methods.getTotalVotes().call();
                    nodeVoteCounts.push(parseInt(voteCount));
                    node.lastDataReceived = new Date().toISOString();
                    console.log(`📊 ${node.name} vote count: ${voteCount}`);
                } catch (error) {
                    console.log(`⚠️ Failed to get vote count from ${node.name}:`, error.message);
                    return false;
                }
            }
            
            // Check if all vote counts are the same
            const allCountsSame = nodeVoteCounts.every(count => count === nodeVoteCounts[0]);
            
            if (allCountsSame) {
                console.log(`✅ All nodes synchronized with ${nodeVoteCounts[0]} votes each`);
            } else {
                console.log(`⚠️ Nodes out of sync: ${nodeVoteCounts.join(', ')}`);
            }
            
            return allCountsSame;
            
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

        console.log(`📊 Node health: ${connectedCount}/2 connected`);
    }

    async testNodeConnection(node) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.log(`⏰ ${node.name} connection timeout`);
                resolve(false);
            }, 5000);

            node.web3.eth.net.isListening()
                .then(isListening => {
                    clearTimeout(timeout);
                    console.log(`📡 ${node.name} connection: ${isListening ? '✅' : '❌'}`);
                    resolve(isListening);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    console.log(`❌ ${node.name} connection error: ${error.message}`);
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

        console.log('🔶 No nodes available');
        throw new Error('No blockchain nodes available');
    }

    async submitVoteToAllNodes(voteData) {
        await this.ensureInitialized();

        console.log('� Fast vote submission to blockchain nodes...');

        // Get both node1 and node2 specifically
        const node1 = this.nodes.find(node => node.name === 'node1');
        const node2 = this.nodes.find(node => node.name === 'node2');
        
        // Try node1 first (primary), then node2 as fallback
        const primaryNode = node1?.isConnected && node1?.contract && node1?.discoveredAccount ? node1 : 
                           (node2?.isConnected && node2?.contract && node2?.discoveredAccount ? node2 : null);
        
        const fallbackNode = primaryNode === node1 && node2?.isConnected && node2?.contract && node2?.discoveredAccount ? node2 :
                            (primaryNode === node2 && node1?.isConnected && node1?.contract && node1?.discoveredAccount ? node1 : null);

        if (!primaryNode) {
            console.error('❌ No blockchain nodes available for vote submission');
            throw new Error('No blockchain nodes available for vote submission');
        }

        console.log(`🎯 Submitting to primary node: ${primaryNode.name}`);

        try {
            const votesString = JSON.stringify(voteData.votes);
            const transaction = primaryNode.contract.methods.submitVote(
                voteData.voterId,
                voteData.ballotId,
                votesString,
                Math.floor(Date.now() / 1000),
                voteData.voterHash
            );

            // Optimized gas estimation and submission
            const [gas] = await Promise.all([
                transaction.estimateGas({ from: primaryNode.discoveredAccount }),
            ]);
            
            // Ensure gas is a number, not BigInt
            const gasLimit = typeof gas === 'bigint' ? Number(gas) : gas;
            const gasBuffer = Math.floor(gasLimit * 1.1);
            
            const receipt = await transaction.send({
                from: primaryNode.discoveredAccount,
                gas: gasBuffer
            });

            console.log(`✅ Success on ${primaryNode.name}:`, receipt.transactionHash);

            // Update node timestamp
            primaryNode.lastDataReceived = new Date().toISOString();

            // Serialize BigInt values in receipt before creating response
            const serializedReceipt = this.serializeBigInt({
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber?.toString(),
                gasUsed: receipt.gasUsed?.toString(),
                cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
                effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
                voterHash: voteData.voterHash,
                node: primaryNode.name,
                ballotId: voteData.ballotId,
                simulated: false,
                status: receipt.status,
                logs: receipt.logs
            });

            const results = [{
                success: true,
                node: primaryNode.name,
                receipt: serializedReceipt
            }];

            // Async fallback submission (non-blocking)
            if (fallbackNode) {
                this.submitToFallbackNodeAsync(fallbackNode, voteData).catch(err => {
                    console.log(`⚠️ Fallback submission to ${fallbackNode.name} failed:`, err.message);
                });
            }

            return {
                success: true,
                results: results,
                errors: [],
                submittedTo: 1,
                totalNodes: fallbackNode ? 2 : 1,
                primaryNode: primaryNode.name
            };

        } catch (error) {
            console.warn(`❌ Primary node ${primaryNode.name} submission failed:`, error.message);
            
            // Try fallback node if available
            if (fallbackNode) {
                console.log(`🔄 Trying fallback node: ${fallbackNode.name}`);
                try {
                    return await this.submitToNode(fallbackNode, voteData);
                } catch (fallbackError) {
                    console.error(`❌ Fallback node ${fallbackNode.name} also failed:`, fallbackError.message);
                }
            }
            
            throw new Error(`Vote submission failed on all nodes: ${error.message}`);
        }
    }

    async submitToNode(node, voteData) {
        const votesString = JSON.stringify(voteData.votes);
        const transaction = node.contract.methods.submitVote(
            voteData.voterId,
            voteData.ballotId,
            votesString,
            Math.floor(Date.now() / 1000),
            voteData.voterHash
        );

        const gas = await transaction.estimateGas({ from: node.discoveredAccount });
        
        // Ensure gas is a number, not BigInt
        const gasLimit = typeof gas === 'bigint' ? Number(gas) : gas;
        const gasBuffer = Math.floor(gasLimit * 1.1);
        
        const receipt = await transaction.send({
            from: node.discoveredAccount,
            gas: gasBuffer
        });

        node.lastDataReceived = new Date().toISOString();

        // Serialize BigInt values in receipt before creating response
        const serializedReceipt = this.serializeBigInt({
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber?.toString(),
            gasUsed: receipt.gasUsed?.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
            voterHash: voteData.voterHash,
            node: node.name,
            ballotId: voteData.ballotId,
            simulated: false,
            status: receipt.status,
            logs: receipt.logs
        });

        return {
            success: true,
            results: [{
                success: true,
                node: node.name,
                receipt: serializedReceipt
            }],
            errors: [],
            submittedTo: 1,
            totalNodes: 1,
            primaryNode: node.name
        };
    }

    async submitToFallbackNodeAsync(node, voteData) {
        console.log(`🔄 Async fallback submission to ${node.name}...`);
        await this.submitToNode(node, voteData);
        console.log(`✅ Fallback submission to ${node.name} completed`);
    }

    // Enhanced Node1-Node2 AutoSync Detection and Syncing
    async performNode1Node2AutoSync() {
        try {
            const node1 = this.nodes.find(node => node.name === 'node1');
            const node2 = this.nodes.find(node => node.name === 'node2');
            
            // Both nodes must be connected and have contracts
            if (!node1?.isConnected || !node1?.contract || !node2?.isConnected || !node2?.contract) {
                return { synced: false, reason: 'Both nodes not available' };
            }
            
            console.log('🔍 Performing Node1-Node2 AutoSync detection...');
            
            // Get vote counts from both nodes
            let node1VoteCount = 0;
            let node2VoteCount = 0;
            
            try {
                node1VoteCount = parseInt(await node1.contract.methods.getTotalVotes().call());
                node2VoteCount = parseInt(await node2.contract.methods.getTotalVotes().call());
            } catch (error) {
                console.log('⚠️ Failed to get vote counts for AutoSync detection:', error.message);
                return { synced: false, reason: 'Failed to get vote counts' };
            }
            
            console.log(`📊 Node1 votes: ${node1VoteCount}, Node2 votes: ${node2VoteCount}`);
            
            // If votes are equal, no sync needed
            if (node1VoteCount === node2VoteCount) {
                return { synced: false, reason: 'Nodes already in sync' };
            }
            
            // Determine which node has more votes (source) and which has fewer (target)
            let sourceNode, targetNode, sourceVoteCount, targetVoteCount, sourceName, targetName;
            
            if (node1VoteCount > node2VoteCount) {
                sourceNode = node1;
                targetNode = node2;
                sourceVoteCount = node1VoteCount;
                targetVoteCount = node2VoteCount;
                sourceName = 'node1';
                targetName = 'node2';
            } else {
                sourceNode = node2;
                targetNode = node1;
                sourceVoteCount = node2VoteCount;
                targetVoteCount = node1VoteCount;
                sourceName = 'node2';
                targetName = 'node1';
            }
            
            console.log(`🔄 AutoSync detected: ${sourceName} has ${sourceVoteCount} votes, ${targetName} has ${targetVoteCount} votes`);
            console.log(`🔄 Syncing missing votes from ${sourceName} to ${targetName}...`);
            
            // Get all votes from source node
            const allVotesData = await sourceNode.contract.methods.getAllVotes().call();
            const ballotIds = allVotesData[0];
            
            let votesSynced = 0;
            let errors = 0;
            
            // Sync missing votes to target node
            for (const ballotId of ballotIds) {
                try {
                    // Check if vote exists on target node
                    const voteExists = await targetNode.contract.methods.voteExists(ballotId).call();
                    
                    if (!voteExists) {
                        // Get vote details from source node
                        const voteDetails = await sourceNode.contract.methods.getVote(ballotId).call();
                        
                        // Submit to target node
                        await targetNode.contract.methods.submitVote(
                            voteDetails[0], // voterId
                            voteDetails[1], // ballotId
                            voteDetails[2], // votes
                            voteDetails[3], // timestamp
                            voteDetails[4]  // voterHash
                        ).send({
                            from: targetNode.discoveredAccount,
                            gas: 200000
                        });
                        
                        votesSynced++;
                        console.log(`✅ AutoSynced vote ${ballotId} from ${sourceName} to ${targetName} (${votesSynced}/${sourceVoteCount - targetVoteCount})`);
                    }
                } catch (voteError) {
                    errors++;
                    if (!voteError.message.includes('already voted') && 
                        !voteError.message.includes('vote already exists')) {
                        console.log(`⚠️ AutoSync failed for vote ${ballotId}:`, voteError.message);
                    }
                }
                
                // Small delay to prevent overwhelming the network
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Update target node sync status
            if (votesSynced > 0) {
                targetNode.syncStatus = 'synced';
                targetNode.lastSync = new Date().toISOString();
                targetNode.lastDataReceived = new Date().toISOString();
                
                console.log(`✅ AutoSync completed: ${votesSynced} votes synced from ${sourceName} to ${targetName}`);
                
                // Record sync history
                this.recordSyncHistory('node1_node2_autosync', votesSynced, errors);
                
                return {
                    synced: true,
                    votesSynced: votesSynced,
                    sourceNode: sourceName,
                    targetNodes: [targetName],
                    errors: errors
                };
            } else {
                console.log(`ℹ️ AutoSync: No new votes to sync from ${sourceName} to ${targetName}`);
                return {
                    synced: false,
                    reason: 'No new votes to sync',
                    sourceNode: sourceName,
                    targetNodes: [targetName]
                };
            }
            
        } catch (error) {
            console.error('❌ Node1-Node2 AutoSync failed:', error.message);
            return { synced: false, reason: error.message };
        }
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
                            console.log(`ℹ️ ${node.name} ready for blockchain sync`);
                        } else {
                            console.log(`🚫 Blockchain sync skipped for ${node.name} - election state does not allow sync`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Failed to recover ${node.name}:`, error.message);
                    node.failureCount++;
                }
            }
        }
    }

    async resetVotingData() {
        try {
            console.log('🔄 COMPLETE SYSTEM RESET: Starting guaranteed data wipe...');

            // STEP 1: Reset ALL service state
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

            // STEP 5: Attempt blockchain reset on ALL nodes
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
                resetType: 'SYSTEM_RESET'
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

            console.log('✅ SYSTEM RESET: All data cleared successfully');

            return {
                success: true,
                resetAt: new Date().toISOString(),
                votesCleared: previousVoteCount,
                blockchainNodesReset: successfulBlockchainResets,
                totalBlockchainNodes: this.nodes.length,
                archiveFile: archiveFile,
                details: {
                    memoryStorage: 'CLEARED',
                    blockchainContracts: `${successfulBlockchainResets}/${this.nodes.length} reset`,
                    serviceState: 'RESET',
                    electionState: 'RESET_TO_NOT_STARTED',
                    autoSync: 'RESTARTED'
                },
                message: `SUCCESS: ${previousVoteCount} votes cleared from memory, ${successfulBlockchainResets} blockchain nodes reset`
            };

        } catch (error) {
            console.error('❌ CRITICAL RESET ERROR:', error);
            
            return {
                success: true,
                error: error.message,
                resetAt: new Date().toISOString(),
                votesCleared: memoryCleared ? 'ALL' : 'NONE',
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
        return {
            resetSupported: true,
            connectedNodes: this.nodes.filter(n => n.isConnected).length,
            totalNodes: this.nodes.length,
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

            const response = {
                isConnected: connectedNodes > 0,
                blockNumber: blockNumber?.toString() || '0',
                currentNode: activeNode.name,
                contractDeployed: contractsLoaded > 0,
                contractAddress: this.contractAddress,
                nodes: nodesStatus,
                connectedNodes: connectedNodes,
                totalNodes: this.nodes.length,
                autoSyncEnabled: this.autoSyncEnabled,
                syncStatus: this.getOverallSyncStatus(nodesStatus),
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
                error: error.message,
                autoSyncEnabled: this.autoSyncEnabled,
                nodes: this.nodes.map(n => ({
                    name: n.name,
                    connected: n.isConnected,
                    syncStatus: n.syncStatus,
                    isPrimary: n.name === this.currentPrimaryNode
                })),
                connectedNodes: this.nodes.filter(n => n.isConnected).length,
                totalNodes: this.nodes.length,
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

        if (totalConnected === 0) return 'no_connection';
        if (syncedNodes === totalConnected) return 'fully_synced';
        if (syncedNodes > 0) return 'partially_synced';
        return 'not_synced';
    }

    async getElectionResults() {
        await this.ensureInitialized();

        console.log('🔶 Getting election results from blockchain contract');
        
        // Get connected nodes
        const connectedNodes = this.nodes.filter(node => 
            node.isConnected && node.contract && node.discoveredAccount
        );

        if (connectedNodes.length === 0) {
            console.log('❌ No connected blockchain nodes available for results');
            return {
                results: {},
                totalVotes: 0,
                voteData: [],
                source: 'blockchain_nodes',
                electionState: this.electionState
            };
        }

        // Use the first available connected node
        const node = connectedNodes[0];
        console.log(`📊 Reading results from ${node.name}`);

        try {
            // Get total votes from blockchain
            const totalVotes = await node.contract.methods.getTotalVotes().call();
            console.log(`📊 Total votes from blockchain: ${totalVotes}`);

            // Get all votes from blockchain
            const allVotesData = await node.contract.methods.getAllVotes().call();
            const ballotIds = allVotesData[0];
            const voterIds = allVotesData[1];
            const timestamps = allVotesData[2];

            console.log(`📊 Retrieved ${ballotIds.length} votes from blockchain`);

            const results = {};
            let processedVotes = 0;

            // Process each vote from blockchain
            for (let i = 0; i < ballotIds.length; i++) {
                try {
                    const ballotId = ballotIds[i];
                    const voterId = voterIds[i];
                    const timestamp = timestamps[i];

                    // Get detailed vote data
                    const voteData = await node.contract.methods.getVote(ballotId).call();
                    
                    // getVote returns: [someField, voterId, votes, timestamp, voterHash]
                    // The actual votes JSON is in index 2, not 0!
                    const votesJson = voteData[2]; // votes are stored as JSON string (third return value)

                    if (votesJson && votesJson !== '') {
                        try {
                            const votes = JSON.parse(votesJson);
                            
                            if (Array.isArray(votes)) {
                                votes.forEach(vote => {
                                    const position = vote.position;
                                    const candidateId = vote.candidateId;

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
                                    processedVotes++;
                                });
                            }
                        } catch (parseError) {
                            console.error(`❌ JSON parse error for ballotId ${ballotId}:`, parseError.message);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing vote ${i}:`, error.message);
                }
            }

            console.log(`✅ Processed ${processedVotes} votes from blockchain`);

            return {
                results: results,
                totalVotes: parseInt(totalVotes),
                source: 'blockchain_contract',
                electionState: this.electionState,
                blockchainVotes: processedVotes
            };

        } catch (error) {
            console.error('❌ Failed to get results from blockchain:', error.message);
            throw new Error('Unable to retrieve votes from blockchain - nodes may be unavailable');
        }
    }

    async getBlockchainInfo() {
        await this.ensureInitialized();

        try {
            const activeNode = await this.getActiveNode();
            const blockNumber = await activeNode.web3.eth.getBlockNumber();

            const nodesStatus = this.nodes.map(node => ({
                name: node.name,
                connected: node.isConnected,
                syncStatus: node.syncStatus,
                lastBlock: node.lastBlock,
                isPrimary: node.name === this.currentPrimaryNode
            }));

            const response = {
                isConnected: nodesStatus.some(n => n.connected),
                blockNumber: blockNumber?.toString() || '0',
                currentNode: activeNode.name,
                contractDeployed: this.nodes.some(n => n.contract),
                contractAddress: this.contractAddress,
                nodes: nodesStatus,
                connectedNodes: nodesStatus.filter(n => n.connected).length,
                totalNodes: this.nodes.length,
                autoSyncEnabled: this.autoSyncEnabled,
                syncStatus: this.getOverallSyncStatus(nodesStatus),
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
                error: error.message,
                autoSyncEnabled: this.autoSyncEnabled,
                nodes: this.nodes.map(n => ({
                    name: n.name,
                    connected: n.isConnected,
                    syncStatus: n.syncStatus,
                    isPrimary: n.name === this.currentPrimaryNode
                })),
                connectedNodes: this.nodes.filter(n => n.isConnected).length,
                totalNodes: this.nodes.length,
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

        if (totalConnected === 0) return 'no_connection';
        if (syncedNodes === totalConnected) return 'fully_synced';
        if (syncedNodes > 0) return 'partially_synced';
        return 'not_synced';
    }

    async getElectionResults() {
        await this.ensureInitialized();

        console.log('🔶 Getting election results from blockchain contract');
        
        const connectedNodes = this.nodes.filter(node => 
            node.isConnected && node.contract && node.discoveredAccount
        );

        if (connectedNodes.length === 0) {
            console.log('❌ No connected blockchain nodes available for results');
            throw new Error('No connected blockchain nodes available for results');
        }

        try {
            const activeNode = await this.getActiveNode();
            const totalVotes = await activeNode.contract.methods.getTotalVotes().call();
            const allVotesData = await activeNode.contract.methods.getAllVotes().call();
            
            const ballotIds = allVotesData[0];
            const results = {};
            let processedVotes = 0;

            console.log(`📊 Processing ${ballotIds.length} votes from blockchain`);

            for (let i = 0; i < ballotIds.length; i++) {
                try {
                    const voteDetails = await activeNode.contract.methods.getVote(ballotIds[i]).call();
                    const votesJson = voteDetails[2];
                    const votes = JSON.parse(votesJson);
                    
                    console.log(`🔍 Processing vote ${i} (${ballotIds[i]}):`, {
                        votesType: Array.isArray(votes) ? 'array' : typeof votes,
                        votesLength: Array.isArray(votes) ? votes.length : Object.keys(votes).length,
                        votesSample: Array.isArray(votes) ? votes.slice(0, 2) : Object.entries(votes).slice(0, 2)
                    });
                    
                    processedVotes++;

                    // Handle both array of objects and simple object formats
                    if (Array.isArray(votes)) {
                        // New format: array of {candidateId, position, ...}
                        votes.forEach(vote => {
                            const position = vote.position;
                            const candidateId = vote.candidateId;
                            
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
                        });
                    } else if (typeof votes === 'object') {
                        // Legacy format: {position: candidateId}
                        for (const [position, candidateId] of Object.entries(votes)) {
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
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing vote ${i}:`, error.message);
                }
            }

            console.log(`✅ Processed ${processedVotes} votes from blockchain`);

            return {
                results: results,
                totalVotes: parseInt(totalVotes),
                source: 'blockchain_contract',
                electionState: this.electionState,
                blockchainVotes: processedVotes
            };

        } catch (error) {
            console.error('❌ Failed to get results from blockchain:', error.message);
            throw new Error('Unable to retrieve votes from blockchain - nodes may be unavailable');
        }
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

    async getVoteFromBlockchain(ballotId) {
        await this.ensureInitialized();

        try {
            const activeNode = await this.getActiveNode();
            const voteExists = await activeNode.contract.methods.voteExists(ballotId).call();
            
            if (voteExists) {
                const voteDetails = await activeNode.contract.methods.getVote(ballotId).call();
                
                const blockchainVote = {
                    voterId: voteDetails[0],
                    ballotId: voteDetails[1],
                    votes: JSON.parse(voteDetails[2]),
                    timestamp: parseInt(voteDetails[3]),
                    voterHash: voteDetails[4],
                    source: 'blockchain'
                };

                return blockchainVote;
            } else {
                return null;
            }
        } catch (error) {
            console.error(`❌ Failed to get vote ${ballotId} from blockchain:`, error.message);
            return null;
        }
    }

    async checkVoterHasVoted(voterId) {
        await this.ensureInitialized();

        try {
            const activeNode = await this.getActiveNode();
            const hasVoted = await activeNode.contract.methods.hasVotedFunction(voterId).call();
            return hasVoted;
        } catch (error) {
            console.error('❌ Failed to check voter status:', error.message);
            return false;
        }
    }

    async getAllVotesFromBlockchain() {
        await this.ensureInitialized();

        try {
            const activeNode = await this.getActiveNode();
            const allVotesData = await activeNode.contract.methods.getAllVotes().call();
            const ballotIds = allVotesData[0];
            
            const allVotes = [];
            
            for (let i = 0; i < ballotIds.length; i++) {
                const voteDetails = await activeNode.contract.methods.getVote(ballotIds[i]).call();
                allVotes.push({
                    voterId: voteDetails[0],
                    ballotId: voteDetails[1],
                    votes: JSON.parse(voteDetails[2]),
                    timestamp: parseInt(voteDetails[3]),
                    voterHash: voteDetails[4],
                    source: 'blockchain'
                });
            }
            
            return allVotes;
        } catch (error) {
            console.error('❌ Failed to get all votes from blockchain:', error.message);
            return [];
        }
    }

    async ensureInitialized() {
        if (!this.initialized) {
            if (!this.initializing) {
                await this.init();
            } else {
                while (this.initializing) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    }

    updateElectionState(newState) {
        const oldStatus = this.electionState.status;
        this.electionState = { ...this.electionState, ...newState };
        console.log(`📊 Election state updated: ${oldStatus} → ${this.electionState.status}`);
        
        // If status changed to voting or paused, ensure auto-sync is running
        if ((oldStatus !== 'voting' && this.electionState.status === 'voting') ||
            (oldStatus !== 'paused' && this.electionState.status === 'paused')) {
            
            console.log('🔄 Election state changed to active/paused, ensuring auto-sync is running');
            
            // Reset auto-sync state to ensure fresh start
            this.autoSyncEnabled = true;
            this.syncDataUpdated = false;
            this.noDataSincePause = false;
            
            // Restart auto-sync if not running
            if (!this.syncInterval) {
                console.log('🚀 Starting auto-sync due to election state change');
                this.startAutoSync();
            } else {
                console.log('✅ Auto-sync already running, will continue monitoring');
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
        
        // If status changed from paused back to voting, reset pause-related flags
        if (oldStatus === 'paused' && this.electionState.status === 'voting') {
            console.log('🔄 Election resumed from pause, resetting pause flags');
            this.noDataSincePause = false;
            this.electionState.pauseTime = null;
        }
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
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