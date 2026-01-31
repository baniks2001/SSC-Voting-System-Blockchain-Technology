import Web3 from 'web3';

async function testBlockchainVotes() {
    try {
        console.log('🔍 Testing blockchain nodes and votes...');
        
        // Test node1
        const web3_1 = new Web3('http://localhost:8545');
        const web3_2 = new Web3('http://localhost:8547');
        
        let node1Connected = false;
        let node2Connected = false;
        
        try {
            await web3_1.eth.net.isListening();
            node1Connected = true;
            console.log('✅ Node1 connected');
        } catch (error) {
            console.log('❌ Node1 not connected:', error.message);
        }
        
        try {
            await web3_2.eth.net.isListening();
            node2Connected = true;
            console.log('✅ Node2 connected');
        } catch (error) {
            console.log('❌ Node2 not connected:', error.message);
        }
        
        if (!node1Connected && !node2Connected) {
            console.log('❌ No nodes connected');
            return;
        }
        
        // Use connected node
        const web3 = node1Connected ? web3_1 : web3_2;
        const nodeName = node1Connected ? 'node1' : 'node2';
        
        console.log(`📊 Using ${nodeName} for testing`);
        
        // Contract ABI (minimal)
        const abi = [
            {
                "inputs": [],
                "name": "getTotalVotes",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllVotes",
                "outputs": [
                    {"internalType": "string[]", "name": "", "type": "string[]"},
                    {"internalType": "string[]", "name": "", "type": "string[]"},
                    {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "string", "name": "_ballotId", "type": "string"}],
                "name": "getVote",
                "outputs": [
                    {"internalType": "string", "name": "", "type": "string"},
                    {"internalType": "string", "name": "", "type": "string"},
                    {"internalType": "string", "name": "", "type": "string"},
                    {"internalType": "uint256", "name": "", "type": "uint256"},
                    {"internalType": "string", "name": "", "type": "string"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        // Contract address from .env
        const contractAddress = '0xE74A3C7427CDA785e0000D42a705B1f3fD371E09';
        
        const contract = new web3.eth.Contract(abi, contractAddress);
        
        // Test total votes
        try {
            const totalVotes = await contract.methods.getTotalVotes().call();
            console.log(`📊 Total votes: ${totalVotes}`);
        } catch (error) {
            console.log('❌ Failed to get total votes:', error.message);
        }
        
        // Test all votes
        try {
            const allVotes = await contract.methods.getAllVotes().call();
            console.log(`📊 All votes data:`, {
                ballotIds: allVotes[0],
                voterIds: allVotes[1],
                timestamps: allVotes[2]
            });
            
            if (allVotes[0].length > 0) {
                console.log(`🔍 Testing first vote: ${allVotes[0][0]}`);
                try {
                    const voteDetails = await contract.methods.getVote(allVotes[0][0]).call();
                    console.log(`📋 Vote details:`, voteDetails);
                    console.log(`📋 Votes JSON: ${voteDetails[2]}`);
                    
                    try {
                        const votes = JSON.parse(voteDetails[2]);
                        console.log(`✅ Parsed votes:`, votes);
                        console.log(`📊 Votes type: ${Array.isArray(votes) ? 'array' : typeof votes}`);
                    } catch (parseError) {
                        console.log(`❌ Failed to parse votes JSON:`, parseError.message);
                    }
                } catch (error) {
                    console.log(`❌ Failed to get vote details:`, error.message);
                }
            } else {
                console.log(`ℹ️ No votes found in blockchain`);
            }
        } catch (error) {
            console.log('❌ Failed to get all votes:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testBlockchainVotes();
