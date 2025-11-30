let currentIP = '';
let currentEnvIP = '';
let currentTerminalTab = 'combined';

document.addEventListener('DOMContentLoaded', async () => {
    await loadSystemInfo();
    setupOutputListener();
    setupStatusListener();
});

async function loadSystemInfo() {
    try {
        const systemInfo = await window.electronAPI.getSystemInfo();
        currentIP = systemInfo.ipAddress;
        currentEnvIP = systemInfo.currentEnvIP || 'Not set';
        
        document.getElementById('systemInfo').innerHTML = 
            `<strong>IP Address:</strong> ${systemInfo.ipAddress}<br>` +
            `<strong>Platform:</strong> ${system.platform} | <strong>Architecture:</strong> ${systemInfo.arch}`;
        
        // Show IP comparison
        document.getElementById('ipInfo').style.display = 'block';
        document.getElementById('currentIP').textContent = currentIP;
        document.getElementById('envIP').textContent = currentEnvIP;
        
        // Update env status based on IP comparison
        if (currentEnvIP === currentIP) {
            document.getElementById('envStatus').textContent = 'Up to date';
            document.getElementById('envStatus').className = 'status status-running';
        } else {
            document.getElementById('envStatus').textContent = 'Needs update';
            document.getElementById('envStatus').className = 'status status-stopped';
        }
        
        addOutput('System information loaded successfully', 'system', 'info');
        addOutput(`Current IP: ${currentIP}, Environment IP: ${currentEnvIP}`, 'system', 'info');
        
    } catch (error) {
        addOutput('Error loading system information: ' + error.message, 'system', 'error');
    }
}

function setupOutputListener() {
    window.electronAPI.onCommandOutput((data) => {
        addOutput(data.data, data.category, data.type);
    });
}

function setupStatusListener() {
    window.electronAPI.onProcessStatus((data) => {
        updateProcessIndicatorDirect(data.process, data.status);
    });
}

function addOutput(message, category, type = 'stdout') {
    const timestamp = new Date().toLocaleTimeString();
    const outputData = { message: message, category: category, type: type, timestamp: timestamp };

    // Add to combined terminal
    const combinedLine = document.createElement('div');
    combinedLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : (outputData.type === 'info' ? 'info' : '')}`;
    combinedLine.textContent = `[${outputData.timestamp}] ${outputData.message}`;
    document.getElementById('terminal-combined').appendChild(combinedLine);

    // Add to specific category terminal
    const specificLine = document.createElement('div');
    specificLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : (outputData.type === 'info' ? 'info' : '')}`;
    specificLine.textContent = `[${outputData.timestamp}] ${outputData.message}`;
    
    const terminalId = `terminal-${outputData.category}`;
    if (document.getElementById(terminalId)) {
        document.getElementById(terminalId).appendChild(specificLine);
    }

    // Scroll all terminals to bottom
    document.querySelectorAll('.terminal-content').forEach(terminal => {
        terminal.scrollTop = terminal.scrollHeight;
    });
    
    updateOutputCount();
}

function updateOutputCount() {
    const lines = document.getElementById(`terminal-${currentTerminalTab}`).children.length;
    document.getElementById('outputCount').textContent = lines;
}

function switchTerminalTab(tabName) {
    document.querySelectorAll('.terminal-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.terminal-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.terminal-tab[onclick="switchTerminalTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`terminal-${tabName}`).classList.add('active');
    
    currentTerminalTab = tabName;
    updateOutputCount();
}

function clearCurrentTerminal() {
    document.getElementById(`terminal-${currentTerminalTab}`).innerHTML = '';
    updateOutputCount();
}

function clearAllTerminals() {
    document.querySelectorAll('.terminal-content').forEach(terminal => terminal.innerHTML = '');
    updateOutputCount();
    addOutput('All terminals cleared', 'system', 'info');
}

function updateProcessIndicatorDirect(process, status) {
    let indicator;
    let statusElement;
    let stopButton;
    let startButton;
    
    if (process === 'blockchain-node1') {
        indicator = document.getElementById('blockchainNode1Indicator');
        stopButton = document.getElementById('stopNode1Btn');
        startButton = document.getElementById('startNode1Btn');
    } else if (process === 'blockchain-node2') {
        indicator = document.getElementById('blockchainNode2Indicator');
        stopButton = document.getElementById('stopNode2Btn');
        startButton = document.getElementById('startNode2Btn');
    } else if (process === 'backend') {
        indicator = document.getElementById('backendIndicator');
        statusElement = document.getElementById('backendStatus');
        stopButton = document.getElementById('stopBackendBtn');
    } else if (process === 'frontend') {
        indicator = document.getElementById('frontendIndicator');
        statusElement = document.getElementById('frontendStatus');
        stopButton = document.getElementById('stopFrontendBtn');
        document.getElementById('openFrontendBtn').disabled = status !== 'running';
    } else if (process === 'apache') {
        indicator = document.getElementById('apacheIndicator');
        statusElement = document.getElementById('apacheStatus');
        stopButton = document.getElementById('stopApacheBtn');
    } else if (process === 'mysql') {
        indicator = document.getElementById('mysqlIndicator');
        statusElement = document.getElementById('mysqlStatus');
        stopButton = document.getElementById('stopMysqlBtn');
    } else if (process === 'env') {
        // Update env status
        document.getElementById('envStatus').textContent = 'Up to date';
        document.getElementById('envStatus').className = 'status status-running';
        document.getElementById('envIP').textContent = currentIP;
        return;
    }
    
    if (indicator) {
        if (status === 'running') {
            indicator.classList.remove('stopped');
            indicator.classList.add('running');
            if (stopButton) stopButton.disabled = false;
            if (startButton) startButton.disabled = true;
            if (statusElement) {
                statusElement.textContent = 'Running';
                statusElement.className = 'status status-running';
            }
        } else if (status === 'stopped') {
            indicator.classList.remove('running');
            indicator.classList.add('stopped');
            if (stopButton) stopButton.disabled = true;
            if (startButton) startButton.disabled = false;
            if (statusElement) {
                statusElement.textContent = 'Stopped';
                statusElement.className = 'status status-stopped';
            }
        }
    }
}

// Control functions
async function updateEnv() {
    try {
        addOutput('Checking if environment file needs update...', 'system', 'info');
        const result = await window.electronAPI.updateEnv(currentIP);
        
        if (result.success) {
            if (result.updated) {
                document.getElementById('envStatus').textContent = 'Updated';
                document.getElementById('envStatus').className = 'status status-running';
                document.getElementById('envIP').textContent = result.ip;
                addOutput('Environment file updated with new IP: ' + result.ip, 'system', 'info');
            } else {
                document.getElementById('envStatus').textContent = 'Up to date';
                document.getElementById('envStatus').className = 'status status-running';
                addOutput('IP address unchanged (' + result.ip + '), no update needed', 'system', 'info');
            }
        } else {
            addOutput('Error updating environment file', 'system', 'error');
        }
    } catch (error) {
        addOutput('Error updating environment: ' + error.message, 'system', 'error');
    }
}

async function refreshIP() {
    try {
        const result = await window.electronAPI.refreshIP();
        currentIP = result.ipAddress;
        currentEnvIP = result.currentEnvIP;
        
        document.getElementById('currentIP').textContent = currentIP;
        document.getElementById('envIP').textContent = currentEnvIP;
        
        // Update env status based on IP comparison
        if (currentEnvIP === currentIP) {
            document.getElementById('envStatus').textContent = 'Up to date';
            document.getElementById('envStatus').className = 'status status-running';
        } else {
            document.getElementById('envStatus').textContent = 'Needs update';
            document.getElementById('envStatus').className = 'status status-stopped';
        }
        
        addOutput('IP address refreshed: ' + currentIP, 'system', 'info');
    } catch (error) {
        addOutput('Error refreshing IP: ' + error.message, 'system', 'error');
    }
}

async function cleanBlockchain() {
    try {
        addOutput('Cleaning blockchain data...', 'system', 'info');
        await window.electronAPI.cleanBlockchain();
        addOutput('Blockchain cleaned successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error cleaning blockchain: ' + error.message, 'system', 'error');
    }
}

async function startBlockchain() {
    try {
        addOutput('Starting both blockchain nodes...', 'system', 'info');
        document.getElementById('blockchainStatus').textContent = 'Starting...';
        document.getElementById('blockchainStatus').className = 'status status-running';
        document.getElementById('stopBlockchainAllBtn').disabled = false;
        
        await window.electronAPI.startBlockchain();
        document.getElementById('blockchainStatus').textContent = 'Running';
        addOutput('Both blockchain nodes started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('blockchainStatus').textContent = 'Error';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainAllBtn').disabled = true;
        addOutput('Error starting blockchain: ' + error.message, 'system', 'error');
    }
}

async function startBlockchainNode1() {
    try {
        addOutput('Starting blockchain node 1...', 'system', 'info');
        await window.electronAPI.startBlockchainNode1();
        addOutput('Blockchain node 1 started', 'system', 'info');
    } catch (error) {
        addOutput('Error starting blockchain node 1: ' + error.message, 'system', 'error');
    }
}

async function startBlockchainNode2() {
    try {
        addOutput('Starting blockchain node 2...', 'system', 'info');
        await window.electronAPI.startBlockchainNode2();
        addOutput('Blockchain node 2 started', 'system', 'info');
    } catch (error) {
        addOutput('Error starting blockchain node 2: ' + error.message, 'system', 'error');
    }
}

async function stopBlockchainNode1() {
    try {
        addOutput('Stopping blockchain node 1...', 'system', 'info');
        await window.electronAPI.stopBlockchainNode1();
        addOutput('Blockchain node 1 stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping blockchain node 1: ' + error.message, 'system', 'error');
    }
}

async function stopBlockchainNode2() {
    try {
        addOutput('Stopping blockchain node 2...', 'system', 'info');
        await window.electronAPI.stopBlockchainNode2();
        addOutput('Blockchain node 2 stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping blockchain node 2: ' + error.message, 'system', 'error');
    }
}

async function stopBlockchainAll() {
    try {
        addOutput('Stopping all blockchain nodes...', 'system', 'info');
        await window.electronAPI.stopBlockchainAll();
        document.getElementById('blockchainStatus').textContent = 'Stopped';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainAllBtn').disabled = true;
        addOutput('All blockchain nodes stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping blockchain: ' + error.message, 'system', 'error');
    }
}

async function compileContract() {
    try {
        addOutput('Compiling smart contracts...', 'system', 'info');
        await window.electronAPI.compileContract();
        addOutput('Smart contracts compiled successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error compiling contracts: ' + error.message, 'system', 'error');
    }
}

async function deployContract() {
    try {
        addOutput('Deploying smart contracts to blockchain...', 'system', 'info');
        await window.electronAPI.deployContract();
        addOutput('Smart contracts deployed successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error deploying contracts: ' + error.message, 'system', 'error');
    }
}

async function startBackend() {
    try {
        addOutput('Starting backend server...', 'system', 'info');
        document.getElementById('backendStatus').textContent = 'Starting...';
        document.getElementById('backendStatus').className = 'status status-running';
        document.getElementById('stopBackendBtn').disabled = false;
        
        await window.electronAPI.startBackend();
        document.getElementById('backendStatus').textContent = 'Running';
        addOutput('Backend server started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('backendStatus').textContent = 'Error';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        addOutput('Error starting backend: ' + error.message, 'system', 'error');
    }
}

async function stopBackend() {
    try {
        addOutput('Stopping backend server...', 'system', 'info');
        await window.electronAPI.stopBackend();
        document.getElementById('backendStatus').textContent = 'Stopped';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        addOutput('Backend server stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping backend: ' + error.message, 'system', 'error');
    }
}

async function startFrontend() {
    try {
        addOutput('Starting frontend application...', 'system', 'info');
        document.getElementById('frontendStatus').textContent = 'Starting...';
        document.getElementById('frontendStatus').className = 'status status-running';
        document.getElementById('stopFrontendBtn').disabled = false;
        
        const result = await window.electronAPI.startFrontend(currentIP);
        document.getElementById('frontendStatus').textContent = 'Running';
        document.getElementById('openFrontendBtn').disabled = false;
        addOutput('Frontend application started: ' + result.url, 'system', 'info');
    } catch (error) {
        document.getElementById('frontendStatus').textContent = 'Error';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        addOutput('Error starting frontend: ' + error.message, 'system', 'error');
    }
}

async function stopFrontend() {
    try {
        addOutput('Stopping frontend application...', 'system', 'info');
        await window.electronAPI.stopFrontend();
        document.getElementById('frontendStatus').textContent = 'Stopped';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        document.getElementById('openFrontendBtn').disabled = true;
        addOutput('Frontend application stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping frontend: ' + error.message, 'system', 'error');
    }
}

async function openFrontend() {
    try {
        const url = `http://${currentIP}:5173`;
        await window.electronAPI.openBrowser(url);
        addOutput('Opened frontend in browser: ' + url, 'system', 'info');
    } catch (error) {
        addOutput('Error opening browser: ' + error.message, 'system', 'error');
    }
}

// XAMPP Control functions
async function startApache() {
    try {
        addOutput('Starting Apache server...', 'system', 'info');
        document.getElementById('apacheStatus').textContent = 'Starting...';
        document.getElementById('apacheStatus').className = 'status status-running';
        document.getElementById('stopApacheBtn').disabled = false;
        
        await window.electronAPI.startApache();
        document.getElementById('apacheStatus').textContent = 'Running';
        addOutput('Apache server started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('apacheStatus').textContent = 'Error';
        document.getElementById('apacheStatus').className = 'status status-stopped';
        document.getElementById('stopApacheBtn').disabled = true;
        addOutput('Error starting Apache: ' + error.message, 'system', 'error');
    }
}

async function stopApache() {
    try {
        addOutput('Stopping Apache server...', 'system', 'info');
        await window.electronAPI.stopApache();
        document.getElementById('apacheStatus').textContent = 'Stopped';
        document.getElementById('apacheStatus').className = 'status status-stopped';
        document.getElementById('stopApacheBtn').disabled = true;
        addOutput('Apache server stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping Apache: ' + error.message, 'system', 'error');
    }
}

async function startMysql() {
    try {
        addOutput('Starting MySQL server...', 'system', 'info');
        document.getElementById('mysqlStatus').textContent = 'Starting...';
        document.getElementById('mysqlStatus').className = 'status status-running';
        document.getElementById('stopMysqlBtn').disabled = false;
        
        await window.electronAPI.startMysql();
        document.getElementById('mysqlStatus').textContent = 'Running';
        addOutput('MySQL server started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('mysqlStatus').textContent = 'Error';
        document.getElementById('mysqlStatus').className = 'status status-stopped';
        document.getElementById('stopMysqlBtn').disabled = true;
        addOutput('Error starting MySQL: ' + error.message, 'system', 'error');
    }
}

async function stopMysql() {
    try {
        addOutput('Stopping MySQL server...', 'system', 'info');
        await window.electronAPI.stopMysql();
        document.getElementById('mysqlStatus').textContent = 'Stopped';
        document.getElementById('mysqlStatus').className = 'status status-stopped';
        document.getElementById('stopMysqlBtn').disabled = true;
        addOutput('MySQL server stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping MySQL: ' + error.message, 'system', 'error');
    }
}

async function openPhpMyAdmin() {
    try {
        await window.electronAPI.openPhpMyAdmin();
        addOutput('Opening phpMyAdmin in browser', 'system', 'info');
    } catch (error) {
        addOutput('Error opening phpMyAdmin: ' + error.message, 'system', 'error');
    }
}

async function openXamppControl() {
    try {
        await window.electronAPI.openXamppControl();
        addOutput('Opening XAMPP Control Panel', 'system', 'info');
    } catch (error) {
        addOutput('Error opening XAMPP Control: ' + error.message, 'system', 'error');
    }
}

async function runAllSteps() {
    const cleanBlockchain = document.getElementById('cleanBlockchain').checked;
    
    try {
        addOutput('Starting complete system deployment...', 'system', 'info');
        
        const result = await window.electronAPI.runAllSteps({ cleanBlockchain: cleanBlockchain });
        
        if (result.success) {
            addOutput('Complete system deployed successfully!', 'system', 'info');
            document.getElementById('envStatus').textContent = 'Updated';
            document.getElementById('envStatus').className = 'status status-running';
            document.getElementById('blockchainStatus').textContent = 'Running';
            document.getElementById('backendStatus').textContent = 'Running';
            document.getElementById('frontendStatus').textContent = 'Running';
            document.getElementById('stopBlockchainAllBtn').disabled = false;
            document.getElementById('stopBackendBtn').disabled = false;
            document.getElementById('stopFrontendBtn').disabled = false;
            document.getElementById('openFrontendBtn').disabled = false;
            
            setTimeout(() => openFrontend(), 2000);
        } else {
            addOutput('System deployment failed: ' + result.error, 'system', 'error');
        }
    } catch (error) {
        addOutput('Error running complete deployment: ' + error.message, 'system', 'error');
    }
}