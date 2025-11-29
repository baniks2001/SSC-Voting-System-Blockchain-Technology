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
            `<strong>Platform:</strong> ${systemInfo.platform}`;
        
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
        addOutput(`Current IP: ${currentIP}, Env IP: ${currentEnvIP}`, 'system', 'info');
        
    } catch (error) {
        addOutput('Error loading system information: ' + error.message, 'system', 'error');
    }
}

function setupOutputListener() {
    window.electronAPI.onCommandOutput((data) => {
        addOutput(data.data, data.category, data.type);
        updateProcessIndicators(data.category, data.type);
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
    combinedLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : ''}`;
    combinedLine.textContent = `[${outputData.timestamp}] ${outputData.message}`;
    document.getElementById('terminal-combined').appendChild(combinedLine);

    // Add to specific category terminal
    const specificLine = document.createElement('div');
    specificLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : ''}`;
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

function updateProcessIndicators(category, type) {
    let indicator;
    
    if (category === 'blockchain-node1') {
        indicator = document.getElementById('blockchainNode1Indicator');
    } else if (category === 'blockchain-node2') {
        indicator = document.getElementById('blockchainNode2Indicator');
    } else if (category === 'backend') {
        indicator = document.getElementById('backendIndicator');
    } else if (category === 'frontend') {
        indicator = document.getElementById('frontendIndicator');
    }
    
    if (indicator && type === 'stdout') {
        indicator.classList.add('running');
    }
}

function updateProcessIndicatorDirect(process, status) {
    let indicator;
    
    if (process === 'blockchain-node1') {
        indicator = document.getElementById('blockchainNode1Indicator');
    } else if (process === 'blockchain-node2') {
        indicator = document.getElementById('blockchainNode2Indicator');
    } else if (process === 'backend') {
        indicator = document.getElementById('backendIndicator');
    } else if (process === 'frontend') {
        indicator = document.getElementById('frontendIndicator');
    } else if (process === 'env') {
        // Update env status
        document.getElementById('envStatus').textContent = 'Up to date';
        document.getElementById('envStatus').className = 'status status-running';
        document.getElementById('envIP').textContent = currentIP;
        return;
    }
    
    if (indicator) {
        if (status === 'running') {
            indicator.classList.add('running');
        } else if (status === 'stopped') {
            indicator.classList.remove('running');
        }
    }
}

// Control functions
async function updateEnv() {
    try {
        addOutput('Checking if .env file needs update...', 'system', 'info');
        const result = await window.electronAPI.updateEnv(currentIP);
        
        if (result.success) {
            if (result.updated) {
                document.getElementById('envStatus').textContent = 'Updated';
                document.getElementById('envStatus').className = 'status status-running';
                document.getElementById('envIP').textContent = result.ip;
                addOutput('.env file updated with new IP: ' + result.ip, 'system', 'info');
            } else {
                document.getElementById('envStatus').textContent = 'Up to date';
                document.getElementById('envStatus').className = 'status status-running';
                addOutput('IP address unchanged (' + result.ip + '), no update needed', 'system', 'info');
            }
        } else {
            addOutput('Error updating .env file', 'system', 'error');
        }
    } catch (error) {
        addOutput('Error updating .env: ' + error.message, 'system', 'error');
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
        
        addOutput('IP refreshed: ' + currentIP, 'system', 'info');
    } catch (error) {
        addOutput('Error refreshing IP: ' + error.message, 'system', 'error');
    }
}

async function cleanBlockchain() {
    try {
        addOutput('Cleaning blockchain...', 'system', 'info');
        await window.electronAPI.cleanBlockchain();
        addOutput('Blockchain cleaned successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error cleaning blockchain: ' + error.message, 'system', 'error');
    }
}

async function startBlockchain() {
    try {
        addOutput('Starting blockchain nodes...', 'system', 'info');
        document.getElementById('blockchainStatus').textContent = 'Starting...';
        document.getElementById('blockchainStatus').className = 'status status-running';
        document.getElementById('stopBlockchainBtn').disabled = false;
        
        await window.electronAPI.startBlockchain();
        document.getElementById('blockchainStatus').textContent = 'Running';
        addOutput('Blockchain nodes started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('blockchainStatus').textContent = 'Error';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainBtn').disabled = true;
        addOutput('Error starting blockchain: ' + error.message, 'system', 'error');
    }
}

async function stopBlockchain() {
    try {
        addOutput('Stopping blockchain nodes...', 'system', 'info');
        await window.electronAPI.stopBlockchain();
        document.getElementById('blockchainStatus').textContent = 'Stopped';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainBtn').disabled = true;
        addOutput('Blockchain nodes stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping blockchain: ' + error.message, 'system', 'error');
    }
}

async function compileContract() {
    try {
        addOutput('Compiling contract...', 'system', 'info');
        await window.electronAPI.compileContract();
        addOutput('Contract compiled successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error compiling contract: ' + error.message, 'system', 'error');
    }
}

async function deployContract() {
    try {
        addOutput('Deploying contract...', 'system', 'info');
        await window.electronAPI.deployContract();
        addOutput('Contract deployed successfully', 'system', 'info');
    } catch (error) {
        addOutput('Error deploying contract: ' + error.message, 'system', 'error');
    }
}

async function startBackend() {
    try {
        addOutput('Starting backend...', 'system', 'info');
        document.getElementById('backendStatus').textContent = 'Starting...';
        document.getElementById('backendStatus').className = 'status status-running';
        document.getElementById('stopBackendBtn').disabled = false;
        
        await window.electronAPI.startBackend();
        document.getElementById('backendStatus').textContent = 'Running';
        addOutput('Backend started successfully', 'system', 'info');
    } catch (error) {
        document.getElementById('backendStatus').textContent = 'Error';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        addOutput('Error starting backend: ' + error.message, 'system', 'error');
    }
}

async function stopBackend() {
    try {
        addOutput('Stopping backend...', 'system', 'info');
        await window.electronAPI.stopBackend();
        document.getElementById('backendStatus').textContent = 'Stopped';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        addOutput('Backend stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping backend: ' + error.message, 'system', 'error');
    }
}

async function startFrontend() {
    try {
        addOutput('Starting frontend...', 'system', 'info');
        document.getElementById('frontendStatus').textContent = 'Starting...';
        document.getElementById('frontendStatus').className = 'status status-running';
        document.getElementById('stopFrontendBtn').disabled = false;
        
        const result = await window.electronAPI.startFrontend(currentIP);
        document.getElementById('frontendStatus').textContent = 'Running';
        document.getElementById('openFrontendBtn').disabled = false;
        addOutput('Frontend started: ' + result.url, 'system', 'info');
    } catch (error) {
        document.getElementById('frontendStatus').textContent = 'Error';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        addOutput('Error starting frontend: ' + error.message, 'system', 'error');
    }
}

async function stopFrontend() {
    try {
        addOutput('Stopping frontend...', 'system', 'info');
        await window.electronAPI.stopFrontend();
        document.getElementById('frontendStatus').textContent = 'Stopped';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        document.getElementById('openFrontendBtn').disabled = true;
        addOutput('Frontend stopped', 'system', 'info');
    } catch (error) {
        addOutput('Error stopping frontend: ' + error.message, 'system', 'error');
    }
}

async function openFrontend() {
    try {
        const url = `http://${currentIP}:5173`;
        await window.electronAPI.openBrowser(url);
        addOutput('Opened browser: ' + url, 'system', 'info');
    } catch (error) {
        addOutput('Error opening browser: ' + error.message, 'system', 'error');
    }
}

async function runAllSteps() {
    const cleanBlockchain = document.getElementById('cleanBlockchain').checked;
    
    try {
        addOutput('Starting complete system setup...', 'system', 'info');
        
        const result = await window.electronAPI.runAllSteps({ cleanBlockchain: cleanBlockchain });
        
        if (result.success) {
            addOutput('All systems started successfully!', 'system', 'info');
            document.getElementById('envStatus').textContent = 'Updated';
            document.getElementById('envStatus').className = 'status status-running';
            document.getElementById('blockchainStatus').textContent = 'Running';
            document.getElementById('backendStatus').textContent = 'Running';
            document.getElementById('frontendStatus').textContent = 'Running';
            document.getElementById('stopBlockchainBtn').disabled = false;
            document.getElementById('stopBackendBtn').disabled = false;
            document.getElementById('stopFrontendBtn').disabled = false;
            document.getElementById('openFrontendBtn').disabled = false;
            
            setTimeout(() => openFrontend(), 2000);
        } else {
            addOutput('System setup failed: ' + result.error, 'system', 'error');
        }
    } catch (error) {
        addOutput('Error running all steps: ' + error.message, 'system', 'error');
    }
}