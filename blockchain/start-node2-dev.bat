@echo off
title Ethereum Node 2 - Port 8547 (PEER - DEV MODE)
echo ========================================
echo NODE 2 - ETHEREUM NODE (PEER - DEV MODE)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development Mode (Chain ID: 1337)
echo Storage: In-memory development
echo Ports: HTTP 8547, WS 8548, Auth 8552
echo.
echo Starting Node 2 as PEER in development mode...
echo.

if not exist "node2" mkdir node2

echo [INIT] Checking if Node 2 needs genesis initialization...
if not exist "node2\geth\chaindata" (
    echo [INIT] Initializing Node 2 with genesis block...
    geth --datadir node2 init genesis.json
    if %errorlevel% neq 0 (
        echo ❌ Failed to initialize Node 2 with genesis
        pause
        exit /b %errorlevel%
    )
    echo ✅ Node 2 initialized with genesis block
) else (
    echo ✅ Node 2 already has blockchain data
)

echo [START] Launching Geth for Node 2 as PEER in DEV mode...
echo.

geth --datadir node2 ^
--networkid 1337 ^
--http ^
--http.port 8547 ^
--http.addr 0.0.0.0 ^
--http.corsdomain "*" ^
--http.api "web3,eth,net,admin,debug,txpool,personal,engine" ^
--ws ^
--ws.port 8548 ^
--ws.addr 0.0.0.0 ^
--ws.api "web3,eth,net,admin,debug,personal" ^
--authrpc.port 8552 ^
--authrpc.addr 0.0.0.0 ^
--ipcdisable ^
--verbosity 3 ^
--rpc.allow-unprotected-txs ^
--miner.gasprice 1000000000 ^
--port 30304 ^
--dev ^
--dev.period 5 ^
--nodiscover ^
--maxpeers 0 ^
console

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start Node 2
    echo 💡 Check if ports 8547, 8548, 8552, 30304 are available
    pause
    exit /b %errorlevel%
)

pause
