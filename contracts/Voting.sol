// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Vote {
        string voterId;
        string ballotId;
        string votes;
        uint256 timestamp;
        string voterHash;
    }
    
    mapping(string => Vote) public votes;
    mapping(string => bool) public hasVoted;
    
    address public admin;
    uint256 public totalVotes;
    string[] public ballotIds;
    string[] public voterHashes;
    uint256[] public timestamps;
    
    event VoteSubmitted(
        string indexed voterId,
        string indexed ballotId,
        string votes,
        uint256 timestamp,
        string voterHash
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        totalVotes = 0;
    }
    
    function submitVote(
        string memory _voterId,
        string memory _ballotId,
        string memory _votes,
        uint256 _timestamp,
        string memory _voterHash
    ) public returns (bool) {
        require(!hasVoted[_voterId], "Voter has already voted");
        require(bytes(_voterId).length > 0, "Voter ID is required");
        require(bytes(_ballotId).length > 0, "Ballot ID is required");
        
        // Create new vote
        votes[_ballotId] = Vote(_voterId, _ballotId, _votes, _timestamp, _voterHash);
        hasVoted[_voterId] = true;
        totalVotes++;
        
        // Add to arrays
        ballotIds.push(_ballotId);
        voterHashes.push(_voterHash);
        timestamps.push(_timestamp);
        
        emit VoteSubmitted(_voterId, _ballotId, _votes, _timestamp, _voterHash);
        return true;
    }
    
    function getVote(string memory _ballotId) public view returns (
        string memory,
        string memory, 
        string memory,
        uint256,
        string memory
    ) {
        Vote storage vote = votes[_ballotId];
        require(bytes(vote.voterId).length > 0, "Vote not found");
        return (vote.voterId, vote.ballotId, vote.votes, vote.timestamp, vote.voterHash);
    }
    
    function hasVotedFunction(string memory _voterId) public view returns (bool) {
        return hasVoted[_voterId];
    }
    
    function getTotalVotes() public view returns (uint256) {
        return totalVotes;
    }
    
    function getAllVotes() public view returns (
        string[] memory,
        string[] memory,
        uint256[] memory
    ) {
        return (ballotIds, voterHashes, timestamps);
    }
    
    // Helper function to check if vote exists
    function voteExists(string memory _ballotId) public view returns (bool) {
        return bytes(votes[_ballotId].voterId).length > 0;
    }
    
    // Get votes count for statistics
    function getVotesCount() public view returns (uint256) {
        return ballotIds.length;
    }
    
    // Reset contract (admin only - for testing)
    function resetVotes() public onlyAdmin {
        for (uint i = 0; i < ballotIds.length; i++) {
            string memory ballotId = ballotIds[i];
            string memory voterId = votes[ballotId].voterId;
            delete votes[ballotId];
            delete hasVoted[voterId];
        }
        
        delete ballotIds;
        delete voterHashes;
        delete timestamps;
        totalVotes = 0;
    }
}
