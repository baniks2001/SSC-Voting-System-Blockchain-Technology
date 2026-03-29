@echo off
title Ethereum Node 1 - Port 8545 (MASTER - DEV MODE)
echo ========================================
echo NODE 1 - ETHEREUM NODE (MASTER - DEV MODE)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development Mode (Chain ID: 1337)
echo Storage: In-memory development
echo Ports: HTTP 8545, WS 8546, Auth 8551
echo.
echo Starting Node 1 as MASTER node in development mode...
echo.

if not exist "node1" mkdir node1

echo [INIT] Checking if Node 1 needs genesis initialization...
if not exist "node1\geth\chaindata" (
    echo [INIT] Initializing Node 1 with genesis block...
    geth --datadir node1 init genesis.json
    if %errorlevel% neq 0 (
        echo ❌ Failed to initialize Node 1 with genesis
        pause
        exit /b %errorlevel%
    )
    echo ✅ Node 1 initialized with genesis block
) else (
    echo ✅ Node 1 already has blockchain data
)

echo [START] Launching Geth for Node 1 as MASTER in DEV mode...
echo.

geth --datadir node1 ^
--networkid 1337 ^
--http ^
--http.port 8545 ^
--http.addr 0.0.0.0 ^
--http.corsdomain "*" ^
--http.api "web3,eth,net,admin,debug,txpool,personal,engine" ^
--ws ^
--ws.port 8546 ^
--ws.addr 0.0.0.0 ^
--ws.api "web3,eth,net,admin,debug,personal" ^
--authrpc.port 8551 ^
--authrpc.addr 0.0.0.0 ^
--ipcdisable ^
--verbosity 3 ^
--rpc.allow-unprotected-txs ^
--miner.gasprice 1000000000 ^
--port 30303 ^
--dev ^
--dev.period 5 ^
--nodiscover ^
--maxpeers 0 ^
console

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start Node 1
    echo 💡 Check if ports 8545, 8546, 8551, 30303 are available
    pause
    exit /b %errorlevel%
)

pause
