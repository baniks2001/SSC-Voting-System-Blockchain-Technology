const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Web3 = require('web3');

console.log('🚀 Starting 2 Independent Ethereum Nodes...');
console.log('🔧 Development Mode - Independent Nodes');
console.log('📝 Chain ID: 1337');
console.log('');

const scriptPath = path.join(__dirname, 'blockchain');

// Function to wait for node to be ready
function waitForNode(url, nodeName, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkNode = async () => {
            try {
                const web3 = new Web3(url);
                const isListening = await web3.eth.net.isListening();
                if (isListening) {
                    console.log(`✅ ${nodeName} is ready at ${url}`);
                    resolve(true);
                    return;
                }
            } catch (error) {
                // Node not ready yet
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error(`${nodeName} timeout after ${timeout}ms`));
                return;
            }

            setTimeout(checkNode, 1000);
        };

        checkNode();
    });
}

// Start both nodes independently
console.log('🔧 Starting Node 1...');
const node1 = spawn('start-node1.bat', [], {
    cwd: scriptPath,
    stdio: 'inherit',
    shell: true,
    detached: true
});

node1.on('error', (error) => {
    console.error('❌ Failed to start Node 1:', error.message);
});

// Start Node 2 after a short delay
setTimeout(() => {
    console.log('');
    console.log('🔧 Starting Node 2...');
    const node2 = spawn('start-node2.bat', [], {
        cwd: scriptPath,
        stdio: 'inherit',
        shell: true,
        detached: true
    });

    node2.on('error', (error) => {
        console.error('❌ Failed to start Node 2:', error.message);
    });

    // Check node status after they start
    setTimeout(async () => {
        console.log('');
        console.log('⏳ Checking node status...');
        
        try {
            await waitForNode('http://localhost:8545', 'Node 1', 20000);
            await waitForNode('http://localhost:8547', 'Node 2', 20000);
            
            console.log('');
            console.log('🎉 Both nodes started successfully!');
            console.log('');
            console.log('📋 Node Configuration:');
            console.log('   Node 1: http://localhost:8545');
            console.log('   Node 2: http://localhost:8547');
            console.log('');
            console.log('💡 Development Mode:');
            console.log('   - Nodes run independently');
            console.log('   - Contracts deployed on both nodes separately');
            console.log('   - System uses failover between nodes');
            console.log('');
            console.log('🚨 Important: In this mode, contract deployment');
            console.log('   will happen separately on each node.');
            console.log('');
            console.log('🔧 Next steps:');
            console.log('   1. Run: npm run compile-contract');
            console.log('   2. Run: npm run deploy-contract');
            console.log('   3. Run: npm run dev:network');
            console.log('');

        } catch (error) {
            console.error('❌ Node startup check failed:', error.message);
        }
    }, 10000);

}, 3000);

console.log('');
console.log('⏳ Nodes starting in separate windows...');
console.log('💡 Please check the node windows for startup progress');