SSC-Voting-with-Blockcchain

IF Everything is Setup you can also use the start-electron.bat to open a electron app.
Explained Guide: How to run and install SSC-Voting-System
This guide will walk you through setting up a full-stack voting system that uses a React/Vue frontend,
a Node.js backend, a MySQL database, and a private Ethereum blockchain for secure and transparent vote recording.

Step 1: Install Node.js
Explanation: Node.js is a JavaScript runtime that allows you to run JavaScript on your server or local machine.
It's the foundation for both our frontend and backend servers. npm (Node Package Manager) comes bundled with it and is used 
to install all the JavaScript libraries (dependencies) our project needs.

Option 1: Download from Official Website

Go to Node.js official website : https://nodejs.org/en

Download the LTS (Long Term Support) version for your operating system. (LTS is more stable, recommended for production and development).

Run the installer and follow the setup wizard.

Option 2: Using Node Version Manager (Recommended for advanced users)

Windows: nvm-windows

macOS/Linux: nvm

Why use NVM? It allows you to install and switch between multiple versions of Node.js easily, which is helpful if you work on different projects with different version requirements.

Verify Installation:
bash
# Open Gitbash or Terminal
node --version
npm --version
Explanation: This confirms that Node.js and npm were installed correctly and are accessible from your command line. You should see version numbers for both.

Step 2: Install Git (Required for Blockchain)
Explanation: Git is a version control system. We need it not for the code itself, but because one of our project's dependencies (a library, likely ganache-cli or a similar tool for our private blockchain) requires Git to be installed on your system to function properly.
Download from git-scm.com
Install with default settings.
Verify: git --version

Step 3: Project Setup
Explanation: Now we install all the necessary libraries (dependencies) defined in the package.json file(s). The project has dependencies in the root (for frontend and scripts) and in the server folder (for the backend API).
1.Install Root Dependencies:
    Open Terminal/bash - npm install
    Explanation: This command reads the package.json in the root folder and downloads all the libraries listed there into a node_modules folder. These are for the frontend application and the blockchain scripts.

2. Install Server Dependencies:
    Open Terminal/Bash -
    cd server
    npm install
    cd ..
    Explanation: The backend server has its own set of dependencies (like Express.js for the web server, database connectors, etc.). This command installs those into a node_modules folder inside the server directory.

Step 4: Environment Configuration
Explanation: The .env file is used to store environment variables—configuration settings that can change between different environments (development, production) without altering the code. This includes sensitive data like database passwords and blockchain URLs.
1. Create .env file in root directory.
2.Copy all content inside the environment(.env).txt file and paste it into the newly created .env file.
Explanation: The provided .txt file contains template variables (e.g., DATABASE_URL=your_database_connection_string, BLOCKCHAIN_RPC_URL=http://localhost:8545). You must fill in the correct values for your setup, especially the database credentials in the next step.

Step 5: Database Setup
Explanation: Our application needs a MySQL database to store non-blockchain data, such as user information, election details, and candidate lists. The votes themselves will be recorded on the blockchain.
1. Import MySQL Database:
Import student_Voting_system.sql from Supabase.
OR create database manually:

sql
CREATE DATABASE student_voting_system;

Explanation: This creates an empty database. You will likely need to run the provided .sql file to create the necessary tables (structure) and maybe some initial data.
2. Verify Database Connection:
Update database credentials in the .env file (the DATABASE_URL or similar variables).
Ensure the MySQL service is running on your machine (e.g., via XAMPP, WAMP, or as a system service).

Step 6: Blockchain Setup
Explanation: This is the core of the system's security and transparency. We are setting up a private, local Ethereum network for development. "Geth" is the software that runs an Ethereum node. We will run two nodes to simulate a distributed network. The smart contract is the program that defines the voting rules and holds the votes on the blockchain.
1. Install Geth (Ethereum Client):
# On Windows (using Chocolatey)
choco install geth
# Or download from: https://geth.ethereum.org/downloads

# Verify installation
geth version

2. Terminal 1 - Start Ethereum Nodes:
npm run start-nodes

Explanation: This script (defined in package.json) starts two local Ethereum blockchain nodes on ports 8545 and 8547. These nodes will mine blocks and process transactions. Wait until you see "Node 1 ready" and "Node 2 ready".

3.Compile Smart Contract:
node scripts/compile.js
Explanation: This takes the Solidity source code of our voting contract (Voting.sol) and compiles it into two essential things: 1) Bytecode (the code that gets deployed to the blockchain), and 2) ABI (Application Binary Interface) which is a JSON file that tells our JavaScript code how to interact with the deployed contract.

4. Deploy Smart Contract:
node scripts/deploy.js
Explanation: This script takes the compiled bytecode and sends a transaction to the local blockchain (node 1) that creates a new instance of the Voting contract. The script will output a contract address. This address is crucial and must be saved in your .env file so the backend knows where to find the contract.

Step 7: Start the Application
Explanation: With the database and blockchain running, we can now start the web servers that will power the application's frontend and backend.
Prerequisite: Ensure the blockchain nodes from Step 6 are still running.
Terminal 2 - Start Main Application (Frontend):

npm run dev -- --host  

Explanation: This starts the development server for the React/Vue frontend (using Vite). It will be available in your browser at http://localhost:5173. This server provides the user interface.

Terminal 3 - Start Backend Server (API):
cd server

npm run dev:network    

Explanation: This starts the Node.js/Express backend server. It listens for API requests from the frontend (e.g., "get candidates," "cast a vote"), interacts with the database, and sends transactions to the blockchain. It runs on http://localhost:5000.

Step 8: Verify Installation
Explanation: Let's make sure every part of the system is working correctly.

Check All Services:
    Blockchain Nodes: http://localhost:8545 & http://localhost:8547 (You might just see a JSON-RPC message, which is fine).
    Backend API: http://localhost:5000/api/health (Should return a "OK" or similar status).
    Frontend App: http://localhost:5173 (or 3000) (Should load the voting application website).

    Test Endpoints via Command Line:
    # Test if the backend server is responsive
    curl http://localhost:5000/api/health

    # Test if the backend can communicate with the blockchain
    curl http://localhost:5000/api/blockchain-status

Required Ports

Make sure these ports are not being used by other applications on your computer.

Service	            Ports	                Purpose
Frontend	        5173 (Vite) / 3000	    React/Vue Application
Backend Server	    5000	                API Server
Ethereum Node 1	    8545 (HTTP), 8546 (WS)	HTTP JSON-RPC and WebSocket connections
Ethereum Node 2	    8547 (HTTP), 8548 (WS)	HTTP JSON-RPC and WebSocket connections
MySQL Database	    3306	                Database

Troubleshooting Tips & Explanations
1. Node.js Commands Not Recognized: The system couldn't find the Node.js executable. Restarting the terminal often reloads the system PATH. If it persists, you may need to reinstall Node.js or manually add its installation directory to your PATH.

2. Ports Are Busy: Another program (like another running app or a previous failed instance of this project) is using a port we need.

# Find the Process ID (PID) using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

3. Dependency Installation Fails: This is a common issue. Corrupted cache or a failed partial installation can cause it. The commands clear the npm cache and delete all installed dependencies so you can try a fresh install.

4. Blockchain Nodes Not Starting: Usually a problem with the Geth installation or port conflict. Verify Geth is installed correctly and that the required ports (8545-8548) are free.

5. Contract Deployment Fails: The most common reason is that the blockchain nodes aren't running. The deployment script needs a live network to send the contract creation transaction to. Also, in a development network, the account deploying the contract needs Ether (ETH) to pay for gas, which is usually automatically handled in dev mode.

6. Database Connection Issues: The backend server cannot talk to MySQL. Triple-check that MySQL is running, the database name in your .env file is correct, and the username/password are valid.

7. Environment Variables Not Loading: The backend server reads the .env file when it starts. If you change the .env file, you must stop and restart the backend server for the changes to take effect.

8. Permission Issues (Linux/macOS): You may not have global write permissions to the default directory where npm installs packages. This command configures npm to use a directory in your user home folder, which you always have permissions for.

Development Notes & Production Deployment
First Time Setup: The initial contract deployment might take 1-2 minutes as the blockchain nodes generate the necessary blocks.

Production Deployment: This setup is for development only. For a real-world application, you would:

Use professional Ethereum node services (Infura/Alchemy) instead of local Geth nodes.

Use a secure, cloud-based database (e.g., AWS RDS) with regular backups.

Use environment variables on your production server (never commit .env files to code).

Use a process manager like PM2 to keep your Node.js applications running reliably.

Set up SSL certificates (HTTPS) for secure communication.

developer: Servando S. Tio III
