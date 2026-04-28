const Web3 = require('web3');

const NODE1_URL = 'http://localhost:8545';
const NODE2_URL = 'http://localhost:8547';

async function waitForNodes() {
    console.log('⏳ Waiting for blockchain nodes to be ready...');
    
    const web3Node1 = new Web3(NODE1_URL);
    const web3Node2 = new Web3(NODE2_URL);
    
    let node1Ready = false;
    let node2Ready = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts = 5 minutes
    
    while ((!node1Ready || !node2Ready) && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts}...`);
        
        try {
            // Test Node 1
            if (!node1Ready) {
                const block1 = await web3Node1.eth.getBlockNumber();
                console.log(`✅ Node 1 ready - Block: ${block1}`);
                node1Ready = true;
            }
        } catch (error) {
            console.log(`⏳ Node 1 not ready yet: ${error.message}`);
        }
        
        try {
            // Test Node 2
            if (!node2Ready) {
                const block2 = await web3Node2.eth.getBlockNumber();
                console.log(`✅ Node 2 ready - Block: ${block2}`);
                node2Ready = true;
            }
        } catch (error) {
            console.log(`⏳ Node 2 not ready yet: ${error.message}`);
        }
        
        if (!node1Ready || !node2Ready) {
            console.log('⏱️ Waiting 5 seconds before next attempt...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    if (node1Ready && node2Ready) {
        console.log('🎉 Both nodes are ready!');
        return true;
    } else {
        console.log('❌ Nodes failed to become ready in time');
        return false;
    }
}

waitForNodes().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Error waiting for nodes:', error);
    process.exit(1);
});
