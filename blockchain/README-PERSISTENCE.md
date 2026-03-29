# Blockchain Node Persistence Fix

## Problem Solved
The blockchain nodes were running in `--dev` mode, which creates a temporary in-memory blockchain that gets reset every time the nodes are restarted. This caused all votes and contract data to disappear when stopping and starting the nodes.

## Solution Implemented
Converted both nodes to use **persistent storage** with the following changes:

### 1. Removed `--dev` Mode
- **Before**: `--dev` and `--dev.period 1` flags
- **After**: `--networkid 1337` with persistent storage

### 2. Added Genesis Block Initialization
- Both nodes now initialize from `genesis.json` on first run
- Subsequent runs use existing blockchain data
- Data persists in `node1/` and `node2/` directories

### 3. Enhanced Node Configuration
- Added `--mine` and `--miner.threads 1` for consistent block mining
- Added `--nodiscover` and `--maxpeers 0` for independent operation
- Added `--allow-insecure-unlocked` for development convenience

### 4. Smart Initialization Logic
- Nodes check if blockchain data exists before initializing
- Only runs `geth init` on first startup
- Preserves existing data on subsequent runs

## Key Benefits

✅ **Data Persistence**: Vote data survives node restarts  
✅ **Blockchain State**: Contract state and transactions maintained  
✅ **No Data Loss**: Stopping/starting nodes preserves all data  
✅ **Disk Storage**: Blockchain data stored on disk, not memory  
✅ **Fast Restart**: Nodes start quickly with existing data  

## Usage Instructions

### First Time Setup
1. Run `cleanup-blockchain.bat` to remove old non-persistent data
2. Run `start-nodes.cjs` to start nodes with persistent storage
3. Deploy contracts: `npm run compile-contract` && `npm run deploy-contract`

### Normal Operation
- Start nodes: `start-nodes.cjs`
- Stop nodes: Close the node windows or Ctrl+C
- Restart: Data will be preserved automatically

### File Structure
```
blockchain/
├── genesis.json           # Genesis block configuration
├── start-node1.bat        # Node 1 startup with persistence
├── start-node2.bat        # Node 2 startup with persistence  
├── start-nodes.cjs        # Main startup script
├── cleanup-blockchain.bat # Data cleanup utility
└── 
node1/                     # Node 1 persistent data
├── geth/
│   ├── chaindata/        # Blockchain state
│   ├── nodes/           # Node data
│   └── ...
└── keystore/             # Account keys

node2/                     # Node 2 persistent data
└── [same structure as node1]
```

## Technical Details

### Genesis Configuration
- Chain ID: 1337 (development)
- Pre-funded accounts for testing
- Zero difficulty for fast mining
- Compatible with all EIPs up to London

### Node Ports
- **Node 1**: HTTP 8545, WS 8546, Auth 8551, P2P 30303
- **Node 2**: HTTP 8547, WS 8548, Auth 8552, P2P 30304

### Persistence Features
- Blockchain state stored in `geth/chaindata/`
- Account keys in `keystore/`
- Node configuration in `geth/nodes/`
- Automatic recovery on restart

## Migration Notes

⚠️ **Important**: Existing non-persistent data will be lost during migration.  
Use the provided `cleanup-blockchain.bat` script to safely clean up old data before starting the persistent nodes.

## Troubleshooting

### Nodes Won't Start
- Check if ports are available (8545, 8547, etc.)
- Run `cleanup-blockchain.bat` and restart
- Check Windows Firewall settings

### Data Not Persisting  
- Ensure nodes are stopped gracefully (Ctrl+C)
- Check disk space in node directories
- Verify `geth/chaindata/` folders exist

### Contract Deployment Issues
- Re-deploy contracts after migration
- Check contract address in configuration
- Verify nodes are fully synced

## Verification

To verify persistence is working:
1. Start nodes and deploy contracts
2. Submit some test votes
3. Stop both nodes completely
4. Restart nodes
5. Check that votes and contracts are still there

The blockchain data should now survive complete restarts!
