@echo off
title Ethereum Node 2 - Port 8547 (PEER)
echo ========================================
echo NODE 2 - ETHEREUM DEV NODE (PEER NODE)
echo ========================================
echo.
echo Geth Version: 1.16.5 Compatible
echo Network: Development (Chain ID: 1337)
echo Ports: HTTP 8547, WS 8548, Auth 8552
echo.
echo Starting Node 2 as PEER connected to Node 1...
echo.

if not exist "node2" mkdir node2

echo [START] Launching Geth for Node 2 as PEER...
echo.

geth --datadir node2 ^
--dev ^
--dev.period 1 ^
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
console

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start Node 2
    echo 💡 Check if ports 8547, 8548, 8552, 30304 are available
    pause
    exit /b %errorlevel%
)

pause