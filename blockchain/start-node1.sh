#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "$0")"

echo "🚀 Starting Ethereum Node 1..."

# Create data directory if it doesn't exist
mkdir -p node1

# Development mode will auto-create genesis
echo "📦 Development mode will auto-create genesis..."
echo "✅ Node 1 ready for development mode"

# Start node with development mode and persistent storage
echo "🔑 Starting Node 1..."
geth --datadir node1 \
     --dev \
     --dev.period 5 \
     --port 30303 \
     --http \
     --http.port 8545 \
     --http.addr 0.0.0.0 \
     --http.corsdomain "*" \
     --http.api "web3,eth,net,personal,admin,debug" \
     --ws \
     --ws.port 8546 \
     --ws.addr 0.0.0.0 \
     --ws.api "web3,eth,net,admin,debug,personal" \
     --authrpc.port 8551 \
     --authrpc.addr 0.0.0.0 \
     --ipcdisable \
     --verbosity 3 \
     --rpc.allow-unprotected-txs \
     --miner.gasprice 1000000000 \
     --mine \
     --nodiscover \
     --maxpeers 0 \
     console