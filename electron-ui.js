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
let isLocked = false;

document.addEventListener('DOMContentLoaded', async () => {
    await loadSystemInfo();
    setupOutputListener();
    setupStatusListener();
    setupPerformanceListener();
    startPerformanceMonitoring();
    initializeLockSystem();
});

// Window control functions
async function minimizeWindow() {
    try {
        await window.electronAPI.minimizeWindow();
        addOutput('Window minimized', 'system', 'info');
    } catch (error) {
        addOutput('Failed to minimize window: ' + error.message, 'system', 'error');
    }
}

async function maximizeWindow() {
    try {
        const result = await window.electronAPI.maximizeWindow();
        if (result.success) {
            addOutput(`Window ${result.maximized ? 'maximized' : 'restored'}`, 'system', 'info');
            updateMaximizeButton(result.maximized);
        }
    } catch (error) {
        addOutput('Failed to toggle maximize: ' + error.message, 'system', 'error');
    }
}

async function attemptCloseWindow() {
    try {
        if (isLocked) {
            addOutput('Cannot close window while interface is locked', 'system', 'warning');
            return;
        }
        
        await window.electronAPI.closeWindow();
        addOutput('Closing application...', 'system', 'info');
    } catch (error) {
        addOutput('Failed to close window: ' + error.message, 'system', 'error');
    }
}

async function updateMaximizeButton() {
    try {
        const result = await window.electronAPI.isWindowMaximized();
        if (result.success) {
            const maximizeBtn = document.querySelector('.maximize-btn');
            if (maximizeBtn) {
                maximizeBtn.innerHTML = result.maximized ? '❐' : '□';
                maximizeBtn.title = result.maximized ? 'Restore' : 'Maximize';
            }
        }
    } catch (error) {
        console.error('Failed to update maximize button:', error);
    }
}

// Update maximize button when window state changes
window.addEventListener('resize', updateMaximizeButton);

// Lock/Unlock System
function initializeLockSystem() {
    updateLockUI();
}

function toggleLock() {
    isLocked = !isLocked;
    updateLockUI();
    
    if (isLocked) {
        addOutput('Interface locked - All controls disabled', 'system', 'info');
        // Focus password input when locked
        setTimeout(() => {
            const passwordInput = document.getElementById('unlockPassword');
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 100);
    } else {
        addOutput('Interface unlocked - All controls enabled', 'system', 'info');
        // Clear password field and error when unlocked
        clearPasswordField();
    }
}

// Password functionality
function handlePasswordKeyPress(event) {
    if (event.key === 'Enter') {
        attemptUnlock();
    }
}

function attemptUnlock() {
    const passwordInput = document.getElementById('unlockPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value.trim();
    
    // Clear previous error
    passwordError.style.display = 'none';
    passwordInput.classList.remove('error');
    
    if (password === '123') {
        // Correct password - unlock interface
        isLocked = false;
        updateLockUI();
        addOutput('Interface unlocked - All controls enabled', 'system', 'info');
        clearPasswordField();
    } else {
        // Incorrect password - show error
        passwordInput.classList.add('error');
        passwordError.style.display = 'block';
        addOutput('Incorrect password entered - Interface remains locked', 'system', 'warning');
        
        // Clear password after failed attempt
        setTimeout(() => {
            passwordInput.value = '';
            passwordInput.classList.remove('error');
        }, 1000);
    }
}

function clearPasswordField() {
    const passwordInput = document.getElementById('unlockPassword');
    const passwordError = document.getElementById('passwordError');
    
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.classList.remove('error');
    }
    
    if (passwordError) {
        passwordError.style.display = 'none';
    }
}

// Fullscreen functionality
function toggleFullscreen() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
        addOutput('Entered fullscreen mode', 'system', 'info');
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        addOutput('Exited fullscreen mode', 'system', 'info');
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '⛷ Exit Fullscreen';
            fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            fullscreenBtn.innerHTML = '⛶ Fullscreen';
            fullscreenBtn.title = 'Toggle Fullscreen';
        }
    }
}

function updateLockUI() {
    const lockBtn = document.getElementById('lockBtn');
    const lockStatus = document.getElementById('lockStatus');
    const lockedOverlay = document.getElementById('lockedOverlay');
    const unlockModalBtn = document.querySelector('.unlock-modal-btn');
    const windowControls = document.querySelectorAll('.window-btn');
    const allButtons = document.querySelectorAll('button:not(#lockBtn):not(.unlock-modal-btn):not(.window-btn)');
    
    if (isLocked) {
        lockBtn.innerHTML = '🔓 Unlock Interface';
        lockBtn.classList.add('locked');
        lockBtn.disabled = false; // Ensure lock button is always enabled
        lockBtn.style.opacity = '1';
        lockBtn.style.cursor = 'pointer';
        lockStatus.textContent = '🔒 Locked';
        lockedOverlay.classList.add('active');
        
        // Enable unlock modal button
        if (unlockModalBtn) {
            unlockModalBtn.disabled = false;
            unlockModalBtn.style.opacity = '1';
            unlockModalBtn.style.cursor = 'pointer';
        }
        
        // Disable window control buttons when locked
        windowControls.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        });
        
        // Disable all other buttons
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    } else {
        lockBtn.innerHTML = '🔒 Lock Interface';
        lockBtn.classList.remove('locked');
        lockBtn.disabled = false; // Ensure lock button is always enabled
        lockBtn.style.opacity = '1';
        lockBtn.style.cursor = 'pointer';
        lockStatus.textContent = '🔓 Unlocked';
        lockedOverlay.classList.remove('active');
        
        // Enable window control buttons
        windowControls.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '0.8';
            btn.style.cursor = 'pointer';
        });
        
        // Enable all buttons
        allButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        
        // Update button states based on current system status
        updateButtonStates();
    }
}

function updateButtonStates() {
    // This function will be called to update button states based on current system status
    // Implementation depends on your existing status checking logic
}

async function loadSystemInfo() {
    try {
        const systemInfo = await window.electronAPI.getSystemInfo();
        currentIP = systemInfo.ipAddress;
        currentEnvIP = systemInfo.currentEnvIP || 'Not set';
        
        // Update new layout elements
        document.getElementById('currentIP').textContent = currentIP;
        document.getElementById('platform').textContent = systemInfo.platform;
        document.getElementById('arch').textContent = systemInfo.arch;
        document.getElementById('envIP').textContent = currentEnvIP;
        
        // Update env status based on IP comparison
        const envStatus = document.getElementById('envStatus');
        if (currentEnvIP === currentIP) {
            envStatus.textContent = 'Up to date';
            envStatus.className = 'status status-running';
        } else {
            envStatus.textContent = 'Needs update';
            envStatus.className = 'status status-stopped';
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
    updatePerformanceStatus(data);
}

function updatePerformanceStatus(data) {
    const statusIndicator = document.querySelector('.performance-status .status-indicator');
    const statusText = statusIndicator.querySelector('span');
    const statusDot = statusIndicator.querySelector('.status-dot');
    
    // Determine overall system status based on CPU and Memory
    const cpuUsage = data.cpu;
    const memoryUsage = data.memory;
    
    if (cpuUsage > 80 || memoryUsage > 85) {
        // Critical status
        statusIndicator.className = 'status-indicator status-critical';
        statusText.textContent = 'System Critical';
        statusDot.style.background = 'var(--critical)';
    } else if (cpuUsage > 60 || memoryUsage > 70) {
        // Warning status
        statusIndicator.className = 'status-indicator status-warning';
        statusText.textContent = 'System Warning';
        statusDot.style.background = 'var(--warning)';
    } else {
        // Normal status
        statusIndicator.className = 'status-indicator status-normal';
        statusText.textContent = 'System Normal';
        statusDot.style.background = 'var(--normal)';
    }
}

function renderPerformanceGraph() {
    const canvas = document.getElementById('performanceCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up dimensions
    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Draw grid lines
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (graphHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
        const x = padding + (graphWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Draw data lines
    const datasets = [
        { data: performanceData.cpu, color: '#10b981', label: 'CPU' },
        { data: performanceData.memory, color: '#3b82f6', label: 'Memory' },
        { data: performanceData.network, color: '#f59e0b', label: 'Network' }
    ];
    
    datasets.forEach(dataset => {
        if (dataset.data.length < 2) return;
        
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        dataset.data.forEach((value, index) => {
            const x = padding + (graphWidth / (performanceData.timestamps.length - 1)) * index;
            const y = padding + graphHeight - (value / 100) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = dataset.color;
        dataset.data.forEach((value, index) => {
            const x = padding + (graphWidth / (performanceData.timestamps.length - 1)) * index;
            const y = padding + graphHeight - (value / 100) * graphHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // Draw threshold lines
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // CPU threshold at 80%
    const cpuThresholdY = padding + graphHeight - (80 / 100) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, cpuThresholdY);
    ctx.lineTo(width - padding, cpuThresholdY);
    ctx.stroke();
    
    // Memory threshold at 85%
    const memThresholdY = padding + graphHeight - (85 / 100) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, memThresholdY);
    ctx.lineTo(width - padding, memThresholdY);
    ctx.stroke();
    
    ctx.setLineDash([]);
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

    // Add to system terminal (single terminal in new layout)
    const terminalLine = document.createElement('div');
    terminalLine.className = `output-line ${outputData.category} ${outputData.type === 'error' ? 'error' : (outputData.type === 'info' ? 'info' : '')}`;
    terminalLine.textContent = `[${outputData.timestamp}] [${outputData.category.toUpperCase()}] ${outputData.message}`;
    
    const terminal = document.getElementById('terminal-system');
    if (terminal) {
        terminal.appendChild(terminalLine);
        
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
    const terminal = document.getElementById('terminal-system');
    if (terminal) {
        terminal.innerHTML = '';
        updateOutputCount();
        addOutput('Terminal cleared', 'system', 'info');
    }
}

function updateOutputCount() {
    const terminal = document.getElementById('terminal-system');
    if (terminal) {
        const lines = terminal.children.length;
        document.getElementById('outputCount').textContent = lines;
    }
}

// Terminal scroll functions
function scrollTerminal(direction) {
    const terminal = document.getElementById('terminal-system');
    if (!terminal) return;
    
    const scrollAmount = 100; // pixels to scroll
    
    switch(direction) {
        case 'up':
            terminal.scrollTop -= scrollAmount;
            break;
        case 'down':
            terminal.scrollTop += scrollAmount;
            break;
        case 'top':
            terminal.scrollTop = 0;
            break;
        case 'bottom':
            terminal.scrollTop = terminal.scrollHeight;
            break;
    }
}

// Keyboard shortcuts for terminal scrolling
document.addEventListener('keydown', function(event) {
    const terminal = document.getElementById('terminal-system');
    if (!terminal) return;
    
    // Only handle scrolling when terminal is focused or when using Ctrl+scroll keys
    if (document.activeElement === terminal || event.ctrlKey) {
        switch(event.key) {
            case 'PageUp':
                event.preventDefault();
                scrollTerminal('up');
                break;
            case 'PageDown':
                event.preventDefault();
                scrollTerminal('down');
                break;
            case 'Home':
                if (event.ctrlKey) {
                    event.preventDefault();
                    scrollTerminal('top');
                }
                break;
            case 'End':
                if (event.ctrlKey) {
                    event.preventDefault();
                    scrollTerminal('bottom');
                }
                break;
        }
    }
});

function updateProcessIndicatorDirect(process, status) {
    let indicator;
    let statusElement;
    let stopButton;
    let startButton;
    
    if (process === 'blockchain-node1') {
        indicator = document.getElementById('blockchainNode1Indicator');
        statusElement = document.getElementById('node1Status');
        stopButton = document.getElementById('stopNode1Btn');
        startButton = document.getElementById('startNode1Btn');
    } else if (process === 'blockchain-node2') {
        indicator = document.getElementById('blockchainNode2Indicator');
        statusElement = document.getElementById('node2Status');
        stopButton = document.getElementById('stopNode2Btn');
        startButton = document.getElementById('startNode2Btn');
    } else if (process === 'apache') {
        indicator = document.getElementById('apacheIndicator');
        statusElement = document.getElementById('apacheStatus');
        stopButton = document.getElementById('stopApacheBtn');
        startButton = document.getElementById('startApacheBtn');
    } else if (process === 'mysql') {
        indicator = document.getElementById('mysqlIndicator');
        statusElement = document.getElementById('mysqlStatus');
        stopButton = document.getElementById('stopMysqlBtn');
        startButton = document.getElementById('startMysqlBtn');
    } else if (process === 'backend') {
        indicator = document.getElementById('backendIndicator');
        statusElement = document.getElementById('backendStatus');
        stopButton = document.getElementById('stopBackendBtn');
        startButton = document.getElementById('startBackendBtn');
    } else if (process === 'frontend') {
        indicator = document.getElementById('frontendIndicator');
        statusElement = document.getElementById('frontendStatus');
        stopButton = document.getElementById('stopFrontendBtn');
        startButton = document.getElementById('startFrontendBtn');
    }
    
    if (indicator && statusElement) {
        if (status === 'running') {
            indicator.classList.add('running');
            statusElement.textContent = 'Running';
            statusElement.className = 'process-status status-running';
            if (stopButton) stopButton.disabled = false;
            if (startButton) startButton.disabled = true;
        } else {
            indicator.classList.remove('running');
            statusElement.textContent = 'Stopped';
            statusElement.className = 'process-status status-stopped';
            if (stopButton) stopButton.disabled = true;
            if (startButton) startButton.disabled = false;
        }
        
        // Update lock state if needed
        if (isLocked) {
            if (stopButton) stopButton.disabled = true;
            if (startButton) startButton.disabled = true;
            // Don't disable the lock button
        }
    }
}

// Control functions
async function checkDependencies() {
    try {
        addOutput('Checking system dependencies...', 'system', 'info');
        const result = await window.electronAPI.checkDependencies();
        
        if (result.success) {
            const results = result.results;
            addOutput('Dependency check completed:', 'system', 'info');
            
            // Show results in terminal
            if (results.frontend.installed) {
                addOutput('✅ Frontend dependencies: Installed', 'system', 'info');
            } else if (results.frontend.needsInstall) {
                addOutput('⚠️ Frontend dependencies: Missing - will auto-install', 'system', 'warning');
            } else {
                addOutput(`❌ Frontend dependencies: Error - ${results.frontend.error}`, 'system', 'error');
            }
            
            if (results.backend.installed) {
                addOutput('✅ Backend dependencies: Installed', 'system', 'info');
            } else if (results.backend.needsInstall) {
                addOutput('⚠️ Backend dependencies: Missing - will auto-install', 'system', 'warning');
            } else {
                addOutput(`❌ Backend dependencies: Error - ${results.backend.error}`, 'system', 'error');
            }
            
            if (results.geth.installed) {
                addOutput(`✅ Geth: Installed (version ${results.geth.version})`, 'system', 'info');
            } else if (results.geth.needsInstall) {
                addOutput('⚠️ Geth: Missing - will auto-install', 'system', 'warning');
            } else {
                addOutput(`❌ Geth: Error - ${results.geth.error}`, 'system', 'error');
            }
            
            return result.results;
        } else {
            addOutput(`Error checking dependencies: ${result.error}`, 'system', 'error');
            return null;
        }
    } catch (error) {
        addOutput(`Failed to check dependencies: ${error.message}`, 'system', 'error');
        return null;
    }
}

async function installDependencies() {
    try {
        addOutput('Starting dependency installation...', 'system', 'info');
        
        // Disable buttons during installation
        if (isLocked) return;
        toggleLock();
        
        const result = await window.electronAPI.installDependencies();
        
        if (result.success) {
            addOutput('✅ All dependencies installed successfully!', 'system', 'info');
            
            const results = result.results;
            if (results.frontend.success) {
                addOutput('✅ Frontend dependencies installed', 'system', 'info');
            } else if (results.frontend.error) {
                addOutput(`❌ Frontend installation failed: ${results.frontend.error}`, 'system', 'error');
            }
            
            if (results.backend.success) {
                addOutput('✅ Backend dependencies installed', 'system', 'info');
            } else if (results.backend.error) {
                addOutput(`❌ Backend installation failed: ${results.backend.error}`, 'system', 'error');
            }
            
            if (results.geth.success) {
                addOutput('✅ Geth installed successfully', 'system', 'info');
            } else if (results.geth.error) {
                addOutput(`❌ Geth installation failed: ${results.geth.error}`, 'system', 'error');
            }
        } else {
            addOutput(`❌ Dependency installation failed: ${result.error}`, 'system', 'error');
        }
        
        // Re-enable buttons after installation
        toggleLock();
        
    } catch (error) {
        addOutput(`Failed to install dependencies: ${error.message}`, 'system', 'error');
        if (isLocked) toggleLock();
    }
}

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
        
        // Check and install dependencies first
        addOutput('🔍 Checking system dependencies...', 'system', 'info');
        const depCheck = await checkDependencies();
        
        if (!depCheck) {
            addOutput('❌ Dependency check failed. Please run manual dependency check.', 'system', 'error');
            return;
        }
        
        // Install missing dependencies if any
        const needsInstall = depCheck.frontend.needsInstall || depCheck.backend.needsInstall || depCheck.geth.needsInstall;
        if (needsInstall) {
            addOutput('📦 Installing missing dependencies...', 'system', 'info');
            await installDependencies();
            addOutput('✅ Dependencies installed. Continuing deployment...', 'system', 'info');
        } else {
            addOutput('✅ All dependencies already installed. Continuing deployment...', 'system', 'info');
        }
        
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