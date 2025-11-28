import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE1_URL = 'http://localhost:8545';
const NODE2_URL = 'http://localhost:8547';
const ARTIFACTS_PATH = path.resolve(__dirname, '../artifacts/Voting.json');


async function deployToBothNodes() {
    try {
        console.log('🚀 Starting dual-node contract deployment...');
        console.log('🔧 Development Mode: Deploying to both nodes independently');
        
        const web3Node1 = new Web3(NODE1_URL);
        const web3Node2 = new Web3(NODE2_URL);
        
        console.log('⏳ Waiting for both nodes to be ready...');
        await waitForNode(web3Node1, 'Node 1');
        await waitForNode(web3Node2, 'Node 2');
        
        console.log('✅ Both nodes connected successfully');
        
        // Get all available accounts from both nodes
        const accountsNode1 = await web3Node1.eth.getAccounts();
        const accountsNode2 = await web3Node2.eth.getAccounts();
        
        console.log('📊 Node 1 available accounts:', accountsNode1.length);
        console.log('📊 Node 2 available accounts:', accountsNode2.length);
        
        // Display all accounts for debugging
        console.log('🔍 Node 1 accounts:', accountsNode1);
        console.log('🔍 Node 2 accounts:', accountsNode2);
        
        // Strategy: Use different account indices
        let NODE1_ACCOUNT = accountsNode1[0];
        let NODE2_ACCOUNT = accountsNode2[0];
        
        // If we have multiple accounts, use different ones
        if (accountsNode1.length > 1 && accountsNode2.length > 1) {
            NODE1_ACCOUNT = accountsNode1[0];
            NODE2_ACCOUNT = accountsNode2[1];
            console.log('🔄 Using account[0] for Node 1 and account[1] for Node 2');
        } 
        // If only one account per node but they're different, that's fine
        else if (NODE1_ACCOUNT.toLowerCase() !== NODE2_ACCOUNT.toLowerCase()) {
            console.log('✅ Nodes have different default accounts');
        }
        // If same account on both nodes, we need to create a different scenario
        else {
            console.log('⚠️ Both nodes have the same account address');
            console.log('💡 Using same account but different nonces will still create different contract addresses');
        }
        
        console.log('👤 Node 1 account:', NODE1_ACCOUNT);
        console.log('👤 Node 2 account:', NODE2_ACCOUNT);
        
        if (!fs.existsSync(ARTIFACTS_PATH)) {
            throw new Error('Compiled contract not found. Run npm run compile-contract first.');
        }
        
        const contractData = JSON.parse(fs.readFileSync(ARTIFACTS_PATH, 'utf8'));
        const abi = contractData.abi;
        const bytecode = contractData.bytecode;
        
        console.log('💰 Deploying contract to Node 1 (Primary)...');
        const contractAddress1 = await deployContract(web3Node1, NODE1_ACCOUNT, abi, bytecode, 'Node 1');
        
        console.log('💰 Deploying contract to Node 2 (Secondary)...');
        const contractAddress2 = await deployContract(web3Node2, NODE2_ACCOUNT, abi, bytecode, 'Node 2');
        
        console.log('✅ Contracts deployed successfully!');
        console.log('📝 Node 1 Contract address (Primary):', contractAddress1);
        console.log('📝 Node 2 Contract address (Secondary):', contractAddress2);
        
        console.log('⏳ Verifying contracts...');
        const node1Verified = await verifyContractOnNode(web3Node1, contractAddress1, abi, NODE1_ACCOUNT, 'Node 1');
        const node2Verified = await verifyContractOnNode(web3Node2, contractAddress2, abi, NODE2_ACCOUNT, 'Node 2');
        
        await updateEnvFile(contractAddress1, contractAddress2, NODE1_ACCOUNT, NODE2_ACCOUNT);
        
        console.log('🎉 Dual-node deployment complete!');
        console.log('📋 Deployment Summary:');
        console.log('   - Node 1 (Primary):', contractAddress1, node1Verified ? '✅' : '❌');
        console.log('   - Node 2 (Secondary):', contractAddress2, node2Verified ? '✅' : '❌');
        console.log('   - Node 1 Account:', NODE1_ACCOUNT);
        console.log('   - Node 2 Account:', NODE2_ACCOUNT);
        
        // Show failover information
        console.log('\n🔄 Failover Configuration:');
        console.log('   - Primary: Node 1 (' + contractAddress1 + ')');
        console.log('   - Secondary: Node 2 (' + contractAddress2 + ')');
        console.log('   - If Node 1 fails, system will automatically use Node 2');
        
        if (contractAddress1.toLowerCase() === contractAddress2.toLowerCase()) {
            console.log('\n⚠️  WARNING: Both contracts have the same address!');
            console.log('💡 This means both nodes are using identical blockchain state.');
            console.log('💡 For true redundancy, ensure nodes have separate data directories.');
        } else {
            console.log('\n✅ SUCCESS: Different contract addresses - true redundancy achieved!');
        }
        
        if (!node1Verified || !node2Verified) {
            console.log('');
            console.log('⚠️  One or more nodes have contract issues.');
            console.log('💡 The system will use failover mode.');
        }
        
        return {
            node1: contractAddress1,
            node2: contractAddress2
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

async function deployContract(web3, account, abi, bytecode, nodeName) {
    try {
        const VotingContract = new web3.eth.Contract(abi);
        const deployTx = VotingContract.deploy({ 
            data: '0x' + bytecode, 
            arguments: [] 
        });
        
        const gas = 5000000;
        const gasPrice = await web3.eth.getGasPrice();
        
        console.log(`⛽ ${nodeName} - Using gas:`, gas);
        console.log(`⛽ ${nodeName} - Gas price:`, web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');
        
        const txCount = await web3.eth.getTransactionCount(account);
        console.log(`🔢 ${nodeName} - Transaction count (nonce):`, txCount);
        
        const contractInstance = await deployTx.send({ 
            from: account, 
            gas: gas,
            gasPrice: gasPrice,
            nonce: txCount
        });
        
        console.log(`📦 ${nodeName} - Contract deployed:`, contractInstance.options.address);
        return contractInstance.options.address;
        
    } catch (error) {
        console.error(`${nodeName} deployment error:`, error.message);
        throw error;
    }
}

async function verifyContractOnNode(web3, contractAddress, abi, account, nodeName) {
    try {
        const code = await web3.eth.getCode(contractAddress);
        if (code === '0x' || code === '0x0') {
            console.log(`❌ ${nodeName}: No contract code at address`);
            return false;
        }
        
        console.log(`✅ ${nodeName}: Contract code found (${code.length} bytes)`);
        
        const contract = new web3.eth.Contract(abi, contractAddress);
        
        try {
            const totalVotes = await contract.methods.getTotalVotes().call({ from: account });
            console.log(`✅ ${nodeName} verified - Total votes:`, totalVotes);
            return true;
        } catch (error) {
            console.log(`⚠️ ${nodeName} getTotalVotes failed:`, error.message);
            return false;
        }
        
    } catch (error) {
        console.log(`⚠️ ${nodeName} verification failed:`, error.message);
        return false;
    }
}

async function waitForNode(web3, nodeName, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const isListening = await web3.eth.net.isListening();
            if (isListening) {
                const accounts = await web3.eth.getAccounts();
                const blockNumber = await web3.eth.getBlockNumber();
                console.log(`✅ ${nodeName} ready - Accounts: ${accounts.length}, Block: ${blockNumber}`);
                return true;
            }
        } catch (error) {}
        console.log(`⏰ Waiting for ${nodeName}... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`${nodeName} not ready after ${maxAttempts} seconds`);
}

async function updateEnvFile(contractAddress1, contractAddress2, node1Account, node2Account) {
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        // Remove existing Ethereum config
        const lines = envContent.split('\n');
        const filteredLines = lines.filter(line => 
            !line.startsWith('VOTING_CONTRACT_ADDRESS=') &&
            !line.startsWith('NODE1_CONTRACT_ADDRESS=') &&
            !line.startsWith('NODE2_CONTRACT_ADDRESS=') &&
            !line.startsWith('ETHEREUM_NODE1_ACCOUNT=') &&
            !line.startsWith('ETHEREUM_NODE2_ACCOUNT=') &&
            !line.startsWith('ETHEREUM_NODE1_URL=') &&
            !line.startsWith('ETHEREUM_NODE2_URL=') &&
            !line.startsWith('ETHEREUM_CHAIN_ID=')
        );
        envContent = filteredLines.join('\n');
    }
    
    // Add clean Ethereum config with separate contract addresses
    envContent += `\n# Ethereum Configuration (Auto-filled by deployment)\n`;
    envContent += `VOTING_CONTRACT_ADDRESS=${contractAddress1}\n`;
    envContent += `NODE1_CONTRACT_ADDRESS=${contractAddress1}\n`;
    envContent += `NODE2_CONTRACT_ADDRESS=${contractAddress2}\n`;
    envContent += `ETHEREUM_NODE1_URL=http://localhost:8545\n`;
    envContent += `ETHEREUM_NODE2_URL=http://localhost:8547\n`;
    envContent += `ETHEREUM_NODE1_ACCOUNT=${node1Account}\n`;
    envContent += `ETHEREUM_NODE2_ACCOUNT=${node2Account}\n`;
    envContent += `ETHEREUM_CHAIN_ID=1337\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('🔧 .env file updated with dual-contract config');
}

deployToBothNodes();