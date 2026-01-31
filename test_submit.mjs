import Web3 from 'web3';

async function testVoteSubmission() {
    try {
        console.log('🔍 Testing vote submission...');
        
        const web3 = new Web3('http://localhost:8545');
        const web3_2 = new Web3('http://localhost:8547');
        
        // Contract ABI
        const abi = [
            {
                "inputs": [{"internalType": "string", "name": "_voterId", "type": "string"}, {"internalType": "string", "name": "_ballotId", "type": "string"}, {"internalType": "string", "name": "_votes", "type": "string"}, {"internalType": "uint256", "name": "_timestamp", "type": "uint256"}, {"internalType": "string", "name": "_voterHash", "type": "string"}],
                "name": "submitVote",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTotalVotes",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        const contractAddress = '0xE74A3C7427CDA785e0000D42a705B1f3fD371E09';
        const contract = new web3.eth.Contract(abi, contractAddress);
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log(`📋 Using account: ${accounts[0]}`);
        
        // Test vote data
        const testVotes = [
            {
                candidateId: "79",
                position: "President"
            },
            {
                candidateId: "80", 
                position: "Vice President"
            }
        ];
        
        const voteData = {
            voterId: "test_voter_123",
            ballotId: "test_ballot_456",
            votes: JSON.stringify(testVotes),
            timestamp: Math.floor(Date.now() / 1000),
            voterHash: "test_hash_789"
        };
        
        console.log('📝 Submitting test vote:', voteData);
        
        // Submit vote
        const transaction = contract.methods.submitVote(
            voteData.voterId,
            voteData.ballotId,
            voteData.votes,
            voteData.timestamp,
            voteData.voterHash
        );
        
        const gas = await transaction.estimateGas({ from: accounts[0] });
        console.log(`⛽ Estimated gas: ${gas}`);
        
        const receipt = await transaction.send({
            from: accounts[0],
            gas: gas
        });
        
        console.log('✅ Vote submitted successfully!');
        console.log(`📦 Transaction hash: ${receipt.transactionHash}`);
        console.log(`📦 Block number: ${receipt.blockNumber}`);
        
        // Check total votes after submission
        const totalVotes = await contract.methods.getTotalVotes().call();
        console.log(`📊 Total votes after submission: ${totalVotes}`);
        
    } catch (error) {
        console.error('❌ Vote submission failed:', error);
    }
}

testVoteSubmission();
