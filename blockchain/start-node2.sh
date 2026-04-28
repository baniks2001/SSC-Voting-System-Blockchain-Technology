#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "$0")"

echo "🚀 Starting Ethereum Node 2..."

# Create data directory if it doesn't exist
mkdir -p node2

# Development mode will auto-create genesis
echo "📦 Development mode will auto-create genesis..."
echo "✅ Node 2 ready for development mode"

# Start node with development mode and persistent storage
echo "🔑 Starting Node 2..."
geth --datadir node2 \
     --dev \
     --dev.period 5 \
     --port 30304 \
     --http \
     --http.port 8547 \
     --http.addr 0.0.0.0 \
     --http.corsdomain "*" \
     --http.api "web3,eth,net,personal,admin,debug" \
     --ws \
     --ws.port 8548 \
     --ws.addr 0.0.0.0 \
     --ws.api "web3,eth,net,admin,debug,personal" \
     --authrpc.port 8552 \
     --authrpc.addr 0.0.0.0 \
     --ipcdisable \
     --verbosity 3 \
     --rpc.allow-unprotected-txs \
     --miner.gasprice 1000000000 \
     --nodiscover \
     --maxpeers 0 \
     console