@echo off
title Ethereum Node 1 - Port 8545 (MASTER - DEV MODE + PERSISTENT)
echo ========================================
echo NODE 1 - ETHEREUM NODE (MASTER - DEV MODE + PERSISTENT)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development Mode with Persistent Storage (Chain ID: 1337)
echo Storage: Persistent on disk
echo Ports: HTTP 8545, WS 8546, Auth 8551
echo.
echo Starting Node 1 as MASTER node in DEV MODE with persistent storage...
echo.

cd /d "%~dp0"
if not exist "node1-data" mkdir node1-data
if not exist "node1" mklink /d "node1" "node1-data"
if not exist "shared-chain" mkdir shared-chain
if not exist "node1\geth\chaindata" mklink /d "node1\geth\chaindata" "shared-chain\chaindata"
if not exist "node1\geth\nodes" mklink /d "node1\geth\nodes" "shared-chain\nodes"

echo [INIT] Development mode will auto-create genesis...
echo ✅ Node 1 ready for development mode

echo [START] Launching Geth for Node 1 as MASTER...
echo.

geth --datadir node1 ^
--dev ^
--dev.period 5 ^
--http ^
--http.port 8545 ^
--http.addr 0.0.0.0 ^
--http.corsdomain "*" ^
--http.api "eth,net,web3,personal,debug,admin" ^
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