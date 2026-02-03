let currentIP = '';
let currentEnvIP = '';
let currentTerminalTab = 'system';
let outputBuffer = {};
let maxOutputLines = 1000;
let performanceData = {
    cpu: [],
    memory: [],
    network: [],
    timestamps: []
};
let performanceInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadSystemInfo();
    setupOutputListener();
    setupStatusListener();
    setupPerformanceListener();
    startPerformanceMonitoring();
});

async function loadSystemInfo() {
    try {
        const systemInfo = await window.electronAPI.getSystemInfo();
        currentIP = systemInfo.ipAddress;
        currentEnvIP = systemInfo.currentEnvIP || 'Not set';
        
        document.getElementById('systemInfo').innerHTML = 
            `<strong>IP Address:</strong> ${systemInfo.ipAddress}<br>` +
            `<strong>Platform:</strong> ${systemInfo.platform} | <strong>Architecture:</strong> ${systemInfo.arch}`;
        
        // Show IP comparison
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


function setupStatusListener() {
    window.electronAPI.onProcessStatus((data) => {
        updateProcessIndicatorDirect(data.process, data.status);
    });
}

function setupPerformanceListener() {
    window.electronAPI.onPerformanceData((data) => {
        updatePerformanceGraph(data);
    });
}

function setupOutputListener() {
    window.electronAPI.onCommandOutput((data) => {
        addOutput(data.data, data.category, data.type);
    });
}


// Performance monitoring functions
function startPerformanceMonitoring() {
    if (performanceInterval) {
        clearInterval(performanceInterval);
    }
    
    performanceInterval = setInterval(async () => {
        try {
            const perfData = await window.electronAPI.getPerformanceData();
            updatePerformanceGraph(perfData);
        } catch (error) {
            console.error('Error getting performance data:', error);
        }
    }, 2000);
}

function updatePerformanceGraph(data) {
    const now = new Date().toLocaleTimeString();
    
    // Keep only last 30 data points
    if (performanceData.timestamps.length >= 30) {
        performanceData.cpu.shift();
        performanceData.memory.shift();
        performanceData.network.shift();
        performanceData.timestamps.shift();
    }
    
    performanceData.cpu.push(data.cpu);
    performanceData.memory.push(data.memory);
    performanceData.network.push(data.network);
    performanceData.timestamps.push(now);
    
    renderPerformanceGraph();
    updateNetworkStatus(data.network);
}

function updateNetworkStatus(networkActivity) {
    const networkStatus = document.getElementById('networkStatus');
    if (networkStatus) {
        if (networkActivity > 70) {
            networkStatus.innerHTML = '<span style="color: #ef4444;">● High</span>';
        } else if (networkActivity > 30) {
            networkStatus.innerHTML = '<span style="color: #f59e0b;">● Medium</span>';
        } else {
            networkStatus.innerHTML = '<span style="color: #10b981;">● Low</span>';
        }
    }
}

function addOutput(message, category, type = 'stdout') {
    const timestamp = new Date().toLocaleTimeString();
    const outputData = { message: message, category: category, type: type, timestamp: timestamp };

    // Initialize buffer for category if not exists
    if (!outputBuffer[category]) {
        outputBuffer[category] = [];
    }

    // Add to buffer
    outputBuffer[category].push(outputData);

    // Limit buffer size to prevent memory issues
    if (outputBuffer[category].length > maxOutputLines) {
        outputBuffer[category] = outputBuffer[category].slice(-maxOutputLines);
    }

    // Add to specific category terminal
    const specificLine = document.createElement('div');
    specificLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : (outputData.type === 'info' ? 'info' : '')}`;
    specificLine.textContent = `[${outputData.timestamp}] ${outputData.message}`;
    
    const terminalId = `terminal-${outputData.category}`;
    const terminal = document.getElementById(terminalId);
    if (terminal) {
        terminal.appendChild(specificLine);
        
        // Auto-scroll to bottom only if user is at bottom
        const isAtBottom = terminal.scrollHeight - terminal.scrollTop <= terminal.clientHeight + 50;
        if (isAtBottom) {
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        // Limit terminal lines to prevent performance issues
        const lines = terminal.children;
        if (lines.length > maxOutputLines) {
            for (let i = 0; i < lines.length - maxOutputLines; i++) {
                terminal.removeChild(lines[0]);
            }
        }
    }
    
    updateOutputCount();
}

function updateOutputCount() {
    const terminal = document.getElementById(`terminal-${currentTerminalTab}`);
    if (terminal) {
        const lines = terminal.children.length;
        document.getElementById('outputCount').textContent = lines;
    }
}

function switchTerminalTab(tabName) {
    document.querySelectorAll('.terminal-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.terminal-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.terminal-tab[onclick="switchTerminalTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`terminal-${tabName}`).classList.add('active');
    
    currentTerminalTab = tabName;
    updateOutputCount();
    
    // Scroll to bottom when switching tabs
    const terminal = document.getElementById(`terminal-${tabName}`);
    if (terminal) {
        setTimeout(() => {
            terminal.scrollTop = terminal.scrollHeight;
        }, 100);
    }
}

function clearCurrentTerminal() {
    const currentTerminal = document.getElementById(`terminal-${currentTerminalTab}`);
    if (currentTerminal) {
        currentTerminal.innerHTML = '';
        updateOutputCount();
    }
}

function clearAllTerminals() {
    document.querySelectorAll('.terminal-content').forEach(terminal => terminal.innerHTML = '');
    outputBuffer = {};
    updateOutputCount();
    addOutput('All terminals cleared', 'system', 'info');
}

function renderPerformanceGraph() {
    const canvas = document.getElementById('performanceCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw CPU line
    drawLine(ctx, performanceData.cpu, '#10b981', height);
    
    // Draw Memory line
    drawLine(ctx, performanceData.memory, '#3b82f6', height);
    
    // Draw Network line
    drawLine(ctx, performanceData.network, '#f59e0b', height);
}

function drawLine(ctx, data, color, height) {
    if (data.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const width = ctx.canvas.width;
    const step = width / (data.length - 1);
    
    data.forEach((value, index) => {
        const x = index * step;
        const y = height - (value / 100) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
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
        addOutput('Refreshing IP address...', 'system', 'info');
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
        console.log('Starting both blockchain nodes...');
        document.getElementById('blockchainStatus').textContent = 'Starting...';
        document.getElementById('blockchainStatus').className = 'status status-running';
        document.getElementById('stopBlockchainAllBtn').disabled = false;
        
        await window.electronAPI.startBlockchain();
        document.getElementById('blockchainStatus').textContent = 'Running';
        console.log('Both blockchain nodes started successfully');
    } catch (error) {
        document.getElementById('blockchainStatus').textContent = 'Error';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainAllBtn').disabled = true;
        console.error('Error starting blockchain:', error.message);
    }
}

async function startBlockchainNode1() {
    try {
        console.log('Starting blockchain node 1...');
        await window.electronAPI.startBlockchainNode1();
        console.log('Blockchain node 1 started');
    } catch (error) {
        console.error('Error starting blockchain node 1:', error.message);
    }
}

async function startBlockchainNode2() {
    try {
        console.log('Starting blockchain node 2...');
        await window.electronAPI.startBlockchainNode2();
        console.log('Blockchain node 2 started');
    } catch (error) {
        console.error('Error starting blockchain node 2:', error.message);
    }
}

async function stopBlockchainNode1() {
    try {
        console.log('Stopping blockchain node 1...');
        await window.electronAPI.stopBlockchainNode1();
        console.log('Blockchain node 1 stopped');
    } catch (error) {
        console.error('Error stopping blockchain node 1:', error.message);
    }
}

async function stopBlockchainNode2() {
    try {
        console.log('Stopping blockchain node 2...');
        await window.electronAPI.stopBlockchainNode2();
        console.log('Blockchain node 2 stopped');
    } catch (error) {
        console.error('Error stopping blockchain node 2:', error.message);
    }
}

async function stopBlockchainAll() {
    try {
        console.log('Stopping all blockchain nodes...');
        await window.electronAPI.stopBlockchainAll();
        document.getElementById('blockchainStatus').textContent = 'Stopped';
        document.getElementById('blockchainStatus').className = 'status status-stopped';
        document.getElementById('stopBlockchainAllBtn').disabled = true;
        console.log('All blockchain nodes stopped');
    } catch (error) {
        console.error('Error stopping blockchain:', error.message);
    }
}

async function compileContract() {
    try {
        console.log('Compiling smart contracts...');
        await window.electronAPI.compileContract();
        console.log('Smart contracts compiled successfully');
    } catch (error) {
        console.error('Error compiling contracts:', error.message);
    }
}

async function deployContract() {
    try {
        console.log('Deploying smart contracts to blockchain...');
        await window.electronAPI.deployContract();
        console.log('Smart contracts deployed successfully');
    } catch (error) {
        console.error('Error deploying contracts:', error.message);
    }
}

async function startBackend() {
    try {
        console.log('Starting backend server...');
        document.getElementById('backendStatus').textContent = 'Starting...';
        document.getElementById('backendStatus').className = 'status status-running';
        document.getElementById('stopBackendBtn').disabled = false;
        
        await window.electronAPI.startBackend();
        document.getElementById('backendStatus').textContent = 'Running';
        console.log('Backend server started successfully');
    } catch (error) {
        document.getElementById('backendStatus').textContent = 'Error';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        console.error('Error starting backend:', error.message);
    }
}

async function stopBackend() {
    try {
        console.log('Stopping backend server...');
        await window.electronAPI.stopBackend();
        document.getElementById('backendStatus').textContent = 'Stopped';
        document.getElementById('backendStatus').className = 'status status-stopped';
        document.getElementById('stopBackendBtn').disabled = true;
        console.log('Backend server stopped');
    } catch (error) {
        console.error('Error stopping backend:', error.message);
    }
}

async function startFrontend() {
    try {
        console.log('Starting frontend application...');
        document.getElementById('frontendStatus').textContent = 'Starting...';
        document.getElementById('frontendStatus').className = 'status status-running';
        document.getElementById('stopFrontendBtn').disabled = false;
        
        const result = await window.electronAPI.startFrontend(currentIP);
        document.getElementById('frontendStatus').textContent = 'Running';
        document.getElementById('openFrontendBtn').disabled = false;
        console.log('Frontend application started: ' + result.url);
    } catch (error) {
        document.getElementById('frontendStatus').textContent = 'Error';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        console.error('Error starting frontend:', error.message);
    }
}

async function stopFrontend() {
    try {
        console.log('Stopping frontend application...');
        await window.electronAPI.stopFrontend();
        document.getElementById('frontendStatus').textContent = 'Stopped';
        document.getElementById('frontendStatus').className = 'status status-stopped';
        document.getElementById('stopFrontendBtn').disabled = true;
        document.getElementById('openFrontendBtn').disabled = true;
        console.log('Frontend application stopped');
    } catch (error) {
        console.error('Error stopping frontend:', error.message);
    }
}

async function openFrontend() {
    try {
        const url = `http://${currentIP}:5173`;
        await window.electronAPI.openBrowser(url);
        console.log('Opened frontend in browser: ' + url);
    } catch (error) {
        console.error('Error opening browser:', error.message);
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
    
// Start XAMPP services first
addOutput('Starting XAMPP services first...', 'system', 'info');
await window.electronAPI.startApache();
addOutput('Apache started, waiting 10 seconds...', 'system', 'info');
await new Promise(resolve => setTimeout(resolve, 10000));
    
await window.electronAPI.startMysql();
addOutput('MySQL started, waiting 10 seconds...', 'system', 'info');
await new Promise(resolve => setTimeout(resolve, 10000));
    
// Continue with the rest of the deployment
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