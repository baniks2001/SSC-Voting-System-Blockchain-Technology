import Web3 from 'web3';

async function checkBothNodes() {
    try {
        console.log('🔍 Checking vote counts on both nodes...');
        
        const web3_1 = new Web3('http://localhost:8545');
        const web3_2 = new Web3('http://localhost:8547');
        
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
            }
        ];
        
        const contractAddress = '0xE74A3C7427CDA785e0000D42a705B1f3fD371E09';
        const contract1 = new web3_1.eth.Contract(abi, contractAddress);
        const contract2 = new web3_2.eth.Contract(abi, contractAddress);
        
        // Check node1
        try {
            const node1Votes = await contract1.methods.getTotalVotes().call();
            const node1AllVotes = await contract1.methods.getAllVotes().call();
            console.log(`📊 Node1: ${node1Votes} votes, ballotIds: ${node1AllVotes[0]}`);
        } catch (error) {
            console.log('❌ Node1 failed:', error.message);
        }
        
        // Check node2
        try {
            const node2Votes = await contract2.methods.getTotalVotes().call();
            const node2AllVotes = await contract2.methods.getAllVotes().call();
            console.log(`📊 Node2: ${node2Votes} votes, ballotIds: ${node2AllVotes[0]}`);
        } catch (error) {
            console.log('❌ Node2 failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

checkBothNodes();
