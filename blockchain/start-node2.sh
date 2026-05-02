#!/bin/bash

echo "🚀 Starting Ethereum Node 2..."

# Create data directory if it doesn't exist
mkdir -p node2

# Initialize node with genesis block (only first time)
if [ ! -d "node2/geth" ]; then
    echo "📦 Initializing Node 2 with genesis block..."
    geth --datadir node2 init node2/genesis.json
fi

# Start node with IPC disabled
echo "🔑 Starting Node 2..."
geth --datadir node2 \
     --networkid 1337 \
     --port 30304 \
     --http \
     --http.port 8547 \
     --http.addr 0.0.0.0 \
     --http.corsdomain "*" \
     --http.api "web3,eth,net,personal,admin,debug" \
     --ipcdisable \
     --allow-insecure-unlock \
     --unlock "0x8e6fde38f1233b19e4b7653a5a335a1e3b97a9e2" \
     --password password.txt \
     console