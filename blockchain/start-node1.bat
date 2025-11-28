@echo off
title Ethereum Node 1 - Port 8545 (MASTER)
echo ========================================
echo NODE 1 - ETHEREUM DEV NODE (MASTER NODE)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development (Chain ID: 1337)
echo Ports: HTTP 8545, WS 8546, Auth 8551
echo.
echo Starting Node 1 as MASTER node...
echo.

if not exist "node1" mkdir node1

echo [START] Launching Geth for Node 1 as MASTER...
echo.

geth --datadir node1 ^
--dev ^
--dev.period 1 ^
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
console

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start Node 1
    echo 💡 Check if ports 8545, 8546, 8551, 30303 are available
    pause
    exit /b %errorlevel%
)

pause