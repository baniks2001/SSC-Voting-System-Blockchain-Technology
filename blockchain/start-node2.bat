@echo off
title Ethereum Node 2 - Port 8547 (PEER - DEV MODE + PERSISTENT)
echo ========================================
echo NODE 2 - ETHEREUM NODE (PEER - DEV MODE + PERSISTENT)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development Mode with Persistent Storage (Chain ID: 1337)
echo Storage: Persistent on disk
echo Ports: HTTP 8547, WS 8548, Auth 8552
echo.
echo Starting Node 2 as PEER in DEV MODE with persistent storage...
echo.

cd /d "%~dp0"
if not exist "node2-data" mkdir node2-data
if not exist "node2" mklink /d "node2" "node2-data"
if not exist "shared-chain" mkdir shared-chain
if not exist "node2\geth\chaindata" mklink /d "node2\geth\chaindata" "shared-chain\chaindata"
if not exist "node2\geth\nodes" mklink /d "node2\geth\nodes" "shared-chain\nodes"

echo [INIT] Development mode will auto-create genesis...
echo ✅ Node 2 ready for development mode

echo [START] Launching Geth for Node 2 as PEER...
echo.

geth --datadir node2 ^
--dev ^
--dev.period 5 ^
--http ^
--http.port 8547 ^
--http.addr 0.0.0.0 ^
--http.corsdomain "*" ^
--http.api "eth,net,web3,personal,debug,admin" ^
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