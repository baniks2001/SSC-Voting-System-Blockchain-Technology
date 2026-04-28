# Shared Blockchain Architecture

## Overview
This architecture provides true redundancy where both nodes share the same blockchain state while maintaining separate data files for corruption protection.

## Directory Structure
```
blockchain/
├── shared-chain/           # Shared blockchain data (chaindata, nodes)
│   ├── chaindata/         # Actual blockchain state
│   └── nodes/             # Network node information
├── node1-data/           # Node 1 specific data
│   └── geth/
│       ├── keystore/      # Node 1 accounts
│       ├── chaindata -> ../shared-chain/chaindata  # Symbolic link
│       └── nodes -> ../shared-chain/nodes          # Symbolic link
├── node2-data/           # Node 2 specific data
│   └── geth/
│       ├── keystore/      # Node 2 accounts
│       ├── chaindata -> ../shared-chain/chaindata  # Symbolic link
│       └── nodes -> ../shared-chain/nodes          # Symbolic link
├── node1 -> node1-data/   # Symbolic link for Geth
└── node2 -> node2-data/   # Symbolic link for Geth
```

## How It Works

### Shared Blockchain Data
- **chaindata**: Contains the actual blockchain state (blocks, transactions, votes)
- **nodes**: Contains network node information
- Both nodes read from and write to the same blockchain data

### Separate Node Data
- **keystore**: Each node has its own account keys
- **node1-data/**: Node 1 specific configuration and accounts
- **node2-data/**: Node 2 specific configuration and accounts

### Redundancy Benefits
1. **Data Corruption Protection**: If node1-data is corrupted, node2-data remains intact
2. **Account Separation**: Each node has its own accounts and keys
3. **Shared State**: Both nodes see identical blockchain data (votes, contracts)
4. **Independent Operation**: If one node fails, the other continues with full data

## Startup Sequence

### Important: Start Node 1 First
1. **Start Node 1**: Creates shared-chain structure and initializes blockchain
2. **Start Node 2**: Connects to existing shared-chain data

### Why This Order Matters
- Node 1 creates the shared blockchain structure
- Node 2 connects to the existing structure
- Both nodes share the same blockchain state from the beginning

## Vote Synchronization

### Automatic Synchronization
- **No AutoSync Needed**: Both nodes share the same blockchain data
- **Instant Updates**: When a vote is submitted to either node, both nodes see it immediately
- **No Transaction Reverts**: No duplicate vote issues since both nodes share state

### Vote Submission Flow
1. **Vote submitted to Node 1** → Written to shared chaindata
2. **Node 2 reads from shared chaindata** → Sees the same vote
3. **Both nodes show identical vote counts**

### Node Failure Scenarios

#### Node 1 Fails
- **Node 2 continues** with full blockchain data
- **All votes preserved** in shared-chain/chaindata
- **Node 2 can accept new votes** independently

#### Node 2 Fails  
- **Node 1 continues** with full blockchain data
- **All votes preserved** in shared-chain/chaindata
- **Node 1 can accept new votes** independently

#### Both Nodes Restart
- **Node 1 starts first** → Recovers from shared-chain data
- **Node 2 starts second** → Connects to existing data
- **All data preserved** across restarts

## Data Recovery

### If node1-data is Corrupted
1. **Stop both nodes**
2. **Delete node1-data directory**
3. **Restart Node 1** → Recreates node1-data with fresh accounts
4. **Restart Node 2** → Both nodes share existing blockchain data

### If node2-data is Corrupted
1. **Stop both nodes**
2. **Delete node2-data directory**  
3. **Restart Node 1** → Continues with existing data
4. **Restart Node 2** → Recreates node2-data with fresh accounts

### If shared-chain is Corrupted
1. **Stop both nodes**
2. **Delete shared-chain directory**
3. **Deploy new contract** → Fresh blockchain state
4. **Both nodes start fresh** with new shared data

## Benefits

### ✅ True Redundancy
- Both nodes have identical blockchain state
- Either node can continue operating independently
- No data loss during node failures

### ✅ Corruption Protection
- Separate node data directories
- Shared blockchain data is the single source of truth
- Individual node corruption doesn't affect the other

### ✅ Performance
- No synchronization overhead
- Instant data sharing between nodes
- No transaction reverts or duplicate issues

### ✅ Simplicity
- No complex AutoSync logic needed
- Automatic data sharing through symbolic links
- Easy to understand and maintain

## Troubleshooting

### "datadir already used by another process"
- **Cause**: Both nodes trying to use the same data directory
- **Solution**: Ensure symbolic links are created correctly
- **Fix**: Delete node1 and node2 directories, restart both nodes

### Vote counts don't match
- **Cause**: Symbolic links not working correctly
- **Solution**: Verify shared-chain structure
- **Fix**: Recreate symbolic links and restart both nodes

### Node won't start
- **Cause**: Missing shared-chain directory
- **Solution**: Start Node 1 first to create structure
- **Fix**: Delete all directories and restart in correct order

## Maintenance

### Regular Checks
1. **Verify symbolic links**: `dir node1\geth\chaindata` should show as symlink
2. **Check shared data**: Both nodes should show same vote counts
3. **Monitor disk space**: Shared-chain grows with blockchain data

### Backup Strategy
1. **Backup shared-chain/**: Contains all blockchain data
2. **Backup node1-data/**: Node 1 specific data
3. **Backup node2-data/**: Node 2 specific data

This architecture provides the best of both worlds: shared blockchain state for data consistency and separate node data for corruption protection.
