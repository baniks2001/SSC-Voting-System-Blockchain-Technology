const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow = null;
let processes = {
    blockchainNode1: null,
    blockchainNode2: null,
    backend: null,
    frontend: null,
    apache: null,
    mysql: null
};
let currentIP = 'localhost';
let ipCheckInterval = null;
let performanceMonitoringInterval = null;
let memoryCleanupInterval = null;

function createWindow() {
    console.log('Creating Electron window...');
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'electron-preload.cjs')
        },
        icon: path.join(__dirname, 'public', 'favicon.ico'),
        show: false,
        titleBarStyle: 'default',
        autoHideMenuBar: true
    });

    // Remove menu completely
    mainWindow.setMenu(null);

    mainWindow.loadFile('electron-ui.html').then(() => {
        console.log('UI loaded successfully');
        mainWindow.show();
        startIPMonitoring();
        startPerformanceMonitoring();
        startMemoryCleanup();
    }).catch(err => {
        console.error('Failed to load UI:', err);
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
        stopIPMonitoring();
        if (performanceMonitoringInterval) {
            clearInterval(performanceMonitoringInterval);
        }
        if (memoryCleanupInterval) {
            clearInterval(memoryCleanupInterval);
        }
    });
}

function startIPMonitoring() {
    ipCheckInterval = setInterval(async () => {
        const newIP = await getLocalIP();
        if (newIP !== currentIP) {
            console.log('IP address changed from', currentIP, 'to', newIP);
            const oldIP = currentIP;
            currentIP = newIP;
            
            if (mainWindow) {
                mainWindow.webContents.send('ip-changed', {
                    oldIP: oldIP,
                    newIP: newIP,
                    currentEnvIP: getCurrentEnvIP()
                });
            }
            
            autoUpdateEnvFile(newIP);
        }
    }, 10000);
}

function startPerformanceMonitoring() {
    if (performanceMonitoringInterval) {
        clearInterval(performanceMonitoringInterval);
    }
    
    performanceMonitoringInterval = setInterval(() => {
        const perfData = getPerformanceData();
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('performance-data', perfData);
        }
    }, 2000);
}

function startMemoryCleanup() {
    if (memoryCleanupInterval) {
        clearInterval(memoryCleanupInterval);
    }
    
    memoryCleanupInterval = setInterval(() => {
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        // Clean up zombie processes
        cleanupZombieProcesses();
        
        // Log memory usage
        const memUsage = process.memoryUsage();
        console.log('Memory usage:', {
            rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
        });
    }, 30000); // Every 30 seconds
}

function getPerformanceData() {
    const memUsage = process.memoryUsage();
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // Calculate CPU usage (simplified)
    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });
    
    const cpuUsage = 100 - (totalIdle / totalTick * 100);
    
    // Calculate memory usage percentage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // Network activity (simplified)
    const networkInterfaces = os.networkInterfaces();
    let networkActivity = 0;
    for (const name of Object.keys(networkInterfaces)) {
        const iface = networkInterfaces[name];
        if (iface && !iface[0].internal) {
            networkActivity += iface[0].rx_bytes || 0;
        }
    }
    
    return {
        cpu: Math.round(cpuUsage),
        memory: Math.round(memoryUsage),
        network: Math.min(100, Math.round(networkActivity / 1000000)), // Normalize to 0-100
        timestamp: Date.now()
    };
}

function cleanupZombieProcesses() {
    Object.keys(processes).forEach(key => {
        const process = processes[key];
        if (process && process.killed) {
            console.log(`Cleaning up zombie process: ${key}`);
            processes[key] = null;
        }
    });
}

function stopIPMonitoring() {
    if (ipCheckInterval) {
        clearInterval(ipCheckInterval);
        ipCheckInterval = null;
    }
}

function autoUpdateEnvFile(newIP) {
    const currentEnvIP = getCurrentEnvIP();
    if (currentEnvIP !== newIP) {
        console.log('Auto-updating .env file with new IP:', newIP);
        const success = updateEnvFile(newIP);
        if (success && mainWindow) {
            mainWindow.webContents.send('command-output', {
                type: 'info',
                data: `🔄 IP changed from ${currentEnvIP} to ${newIP}. Auto-updated .env file.`,
                category: 'system'
            });
            // Send status update for UI indicators
            mainWindow.webContents.send('process-status', {
                process: 'env',
                status: 'updated'
            });
        }
    }
}

function getLocalIP() {
    return new Promise((resolve) => {
        exec('netsh interface ip show address "Wi-Fi" | findstr "IP Address"', (error, stdout) => {
            if (!error && stdout) {
                const ipMatch = stdout.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (ipMatch && ipMatch[1]) {
                    console.log('Found Wi-Fi IP via netsh:', ipMatch[1]);
                    resolve(ipMatch[1]);
                    return;
                }
            }
            
            exec('ipconfig', (error, stdout) => {
                if (!error) {
                    const lines = stdout.split('\n');
                    let currentSection = '';
                    
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        
                        if (line.endsWith(':')) {
                            currentSection = line.toLowerCase();
                        }
                        
                        if ((currentSection.includes('wi-fi') || 
                             currentSection.includes('wireless lan adapter wi-fi') ||
                             currentSection.includes('wlan')) && 
                            (line.includes('IPv4 Address') || line.includes('IPv4 Address.'))) {
                            
                            const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                            if (ipMatch && ipMatch[1]) {
                                console.log('Found Wi-Fi IP via ipconfig section:', ipMatch[1]);
                                resolve(ipMatch[1]);
                                return;
                            }
                        }
                    }
                }
                
                const interfaces = os.networkInterfaces();
                const localIPs = [];
                
                for (const name of Object.keys(interfaces)) {
                    for (const iface of interfaces[name]) {
                        if (iface.family === 'IPv4' && !iface.internal) {
                            const ip = iface.address;
                            if (ip.startsWith('192.168.') || ip.startsWith('10.') || 
                                (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) {
                                localIPs.push({
                                    ip: ip,
                                    interface: name,
                                    isWifi: name.toLowerCase().includes('wi-fi') || 
                                           name.toLowerCase().includes('wlan') || 
                                           name.toLowerCase().includes('wireless')
                                });
                            }
                        }
                    }
                }
                
                const wifiIPs = localIPs.filter(item => item.isWifi);
                if (wifiIPs.length > 0) {
                    console.log('Using Wi-Fi IP:', wifiIPs[0].ip);
                    resolve(wifiIPs[0].ip);
                    return;
                }
                
                if (localIPs.length > 0) {
                    console.log('Using first local IP:', localIPs[0].ip);
                    resolve(localIPs[0].ip);
                    return;
                }
                
                console.log('No suitable IP found, using localhost');
                resolve('localhost');
            });
        });
    });
}

function getCurrentEnvIP() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const ipMatch = envContent.match(/VITE_API_URL=http:\/\/([^:]+):5000/);
            return ipMatch ? ipMatch[1] : null;
        }
    } catch (error) {
        console.error('Error reading current .env IP:', error);
    }
    return null;
}

function updateEnvFile(ipAddress) {
    try {
        const envPath = path.join(__dirname, '.env');
        if (!fs.existsSync(envPath)) {
            const backupPath = path.join(__dirname, 'environment(env).txt');
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, envPath);
            } else {
                throw new Error('.env file not found and no backup available');
            }
        }
        
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        envContent = envContent.replace(/CLIENT_URL=.*/, 'CLIENT_URL=http://localhost:5173,http://' + ipAddress + ':5173');
        envContent = envContent.replace(/ALLOWED_ORIGINS=.*/, 'ALLOWED_ORIGINS=http://localhost:5173,http://' + ipAddress + ':5173,http://localhost:3000,http://' + ipAddress + ':3000');
        envContent = envContent.replace(/VITE_API_URL=.*/, 'VITE_API_URL=http://' + ipAddress + ':5000');
        
        fs.writeFileSync(envPath, envContent);
        return true;
    } catch (error) {
        console.error('Error updating .env:', error);
        return false;
    }
}

function runCommand(command, args, options) {
    if (!args) args = [];
    if (!options) options = {};
    
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { 
            shell: true, 
            ...options 
        });
        
        let output = '';
        let errorOutput = '';
        
        process.stdout.on('data', function (data) {
            output += data.toString();
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: options.category || 'system'
                });
            }
        });
        
        process.stderr.on('data', function (data) {
            errorOutput += data.toString();
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('command-output', {
                    type: 'stderr', 
                    data: data.toString(),
                    category: options.category || 'system'
                });
            }
        });
        
        process.on('close', function (code) {
            if (code === 0) {
                resolve({ output: output, errorOutput: errorOutput });
            } else {
                reject(new Error('Process exited with code ' + code));
            }
        });
        
        process.on('error', function (error) {
            console.error('Process error:', error);
            reject(error);
        });
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            process.kill();
            reject(new Error('Process timeout after 60 seconds'));
        }, 60000);
        
        process.on('close', () => {
            clearTimeout(timeout);
        });
    });
}


// IPC Handlers
ipcMain.handle('get-system-info', async function () {
    currentIP = await getLocalIP();
    const currentEnvIP = getCurrentEnvIP();
    console.log('Current IP:', currentIP, 'Env IP:', currentEnvIP);
    return { 
        ipAddress: currentIP, 
        currentEnvIP: currentEnvIP,
        platform: process.platform, 
        arch: process.arch 
    };
});

ipcMain.handle('refresh-ip', async function () {
    const newIP = await getLocalIP();
    const currentEnvIP = getCurrentEnvIP();
    currentIP = newIP;
    
    if (mainWindow) {
        mainWindow.webContents.send('ip-refreshed', {
            ipAddress: newIP,
            currentEnvIP: currentEnvIP
        });
    }
    
    return { 
        ipAddress: newIP, 
        currentEnvIP: currentEnvIP
    };
});

ipcMain.handle('get-performance-data', async function () {
    return getPerformanceData();
});

ipcMain.handle('update-env', async function (event, ipAddress) {
    const currentEnvIP = getCurrentEnvIP();
    if (currentEnvIP === ipAddress) {
        console.log('IP address unchanged (' + ipAddress + '), no update needed');
        return { success: true, updated: false, ip: ipAddress };
    } else {
        const success = updateEnvFile(ipAddress);
        if (success) {
            console.log('Updated .env file with new IP: ' + ipAddress);
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'env',
                    status: 'updated'
                });
            }
        }
        return { success: success, updated: true, ip: ipAddress };
    }
});

ipcMain.handle('clean-blockchain', async function () {
    try {
        await runCommand('node', ['scripts/clean-reset.js']);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-blockchain-node1', async function () {
    try {
        const blockchainDir = path.join(__dirname, 'blockchain');
        const batchFile = path.join(blockchainDir, 'start-node1.bat');
        
        console.log('Starting Blockchain Node 1 (port 8545) in separate terminal...');
        console.log('Batch file path:', batchFile);
        
        // Open in new terminal window using start command
        const node1Process = spawn('cmd', ['/c', `start "Node 1" cmd /k "${batchFile}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        
        processes.blockchainNode1 = node1Process;
        node1Process.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node1',
                status: 'running'
            });
        }

        console.log('Blockchain node 1 terminal opened, waiting for startup (15 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log('Blockchain node 1 should be running now');
        return { success: true };
        
    } catch (error) {
        console.error('Error starting blockchain node 1:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-blockchain-node2', async function () {
    try {
        const blockchainDir = path.join(__dirname, 'blockchain');
        const batchFile = path.join(blockchainDir, 'start-node2.bat');
        
        console.log('Starting Blockchain Node 2 (port 8547) in separate terminal...');
        console.log('Batch file path:', batchFile);
        
        // Open in new terminal window using start command
        const node2Process = spawn('cmd', ['/c', `start "Node 2" cmd /k "${batchFile}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        
        processes.blockchainNode2 = node2Process;
        node2Process.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node2',
                status: 'running'
            });
        }

        console.log('Blockchain node 2 terminal opened, waiting for startup (15 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log('Blockchain node 2 should be running now');
        return { success: true };
        
    } catch (error) {
        console.error('Error starting blockchain node 2:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-blockchain', async function () {
    try {
        const blockchainDir = path.join(__dirname, 'blockchain');
        const node1Batch = path.join(blockchainDir, 'start-node1.bat');
        const node2Batch = path.join(blockchainDir, 'start-node2.bat');
        
        console.log('Starting Blockchain Node 1 (port 8545) in separate terminal...');
        console.log('Node 1 batch file:', node1Batch);
        
        // Open node 1 in new terminal window
        const node1Process = spawn('cmd', ['/c', `start "Node 1" cmd /k "${node1Batch}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        
        processes.blockchainNode1 = node1Process;
        node1Process.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node1',
                status: 'running'
            });
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('Starting Blockchain Node 2 (port 8547) in separate terminal...');
        console.log('Node 2 batch file:', node2Batch);
        
        // Open node 2 in new terminal window
        const node2Process = spawn('cmd', ['/c', `start "Node 2" cmd /k "${node2Batch}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        
        processes.blockchainNode2 = node2Process;
        node2Process.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node2',
                status: 'running'
            });
        }

        console.log('Both blockchain node terminals opened, waiting for startup (30 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        console.log('Blockchain nodes should be running now');
        return { success: true };
        
    } catch (error) {
        console.error('Error starting blockchain nodes:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-blockchain-node1', async function () {
    try {
        console.log('Stopping blockchain node 1...');
        
        if (processes.blockchainNode1) {
            processes.blockchainNode1.kill();
            processes.blockchainNode1 = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'blockchain-node1',
                    status: 'stopped'
                });
            }
        }
        
        // Kill geth processes for node1 specifically (port 8545)
        try {
            exec('netstat -ano | findstr :8545', (error, stdout) => {
                if (stdout) {
                    const lines = stdout.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/LISTENING\s+(\d+)/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /pid ${pid} /f`, (err) => {
                                if (!err) {
                                    console.log(`Killed process ${pid} for node 1`);
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log('Error killing node1 processes:', e);
        }
        
        console.log('Blockchain node 1 stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-blockchain-node2', async function () {
    try {
        console.log('Stopping blockchain node 2...');
        
        if (processes.blockchainNode2) {
            processes.blockchainNode2.kill();
            processes.blockchainNode2 = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'blockchain-node2',
                    status: 'stopped'
                });
            }
        }
        
        // Kill geth processes for node2 specifically (port 8547)
        try {
            exec('netstat -ano | findstr :8547', (error, stdout) => {
                if (stdout) {
                    const lines = stdout.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/LISTENING\s+(\d+)/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /pid ${pid} /f`, (err) => {
                                if (!err) {
                                    console.log(`Killed process ${pid} for node 2`);
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log('Error killing node2 processes:', e);
        }
        
        console.log('Blockchain node 2 stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-blockchain-all', async function () {
    try {
        console.log('Stopping all blockchain nodes...');
        
        if (processes.blockchainNode1) {
            processes.blockchainNode1.kill();
            processes.blockchainNode1 = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'blockchain-node1',
                    status: 'stopped'
                });
            }
        }
        
        if (processes.blockchainNode2) {
            processes.blockchainNode2.kill();
            processes.blockchainNode2 = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'blockchain-node2',
                    status: 'stopped'
                });
            }
        }
        
        // Kill all geth processes
        try {
            exec('taskkill /f /im geth.exe', (error) => {
                if (!error) {
                    console.log('Killed all geth processes');
                }
            });
        } catch (e) {
            console.log('Error killing geth processes:', e);
        }
        
        console.log('All blockchain nodes stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('compile-contract', async function () {
    try {
        await runCommand('node', ['scripts/compile.js']);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('deploy-contract', async function () {
    try {
        await runCommand('node', ['scripts/deploy.js']);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-backend', async function () {
    try {
        const serverDir = path.join(__dirname, 'server');
        
        console.log('Starting backend server in separate terminal...');
        
        // Open backend in new terminal window
        const backendProcess = spawn('cmd', ['/c', 'start', 'cmd', '/k', 'cd /d', serverDir, '&&', 'npm', 'run', 'dev:network'], {
            shell: true,
            detached: true
        });
        
        processes.backend = backendProcess;
        backendProcess.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'backend',
                status: 'running'
            });
        }

        console.log('Backend server terminal opened, waiting for startup (10 seconds)...');
        await new Promise(function (resolve) { 
            setTimeout(resolve, 10000); 
        });
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-backend', async function () {
    try {
        console.log('Stopping backend server...');
        
        if (processes.backend) {
            processes.backend.kill();
            processes.backend = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'backend',
                    status: 'stopped'
                });
            }
        }
        
        // Kill node processes running on backend port (5000)
        try {
            exec('netstat -ano | findstr :5000', (error, stdout) => {
                if (stdout) {
                    const lines = stdout.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/LISTENING\s+(\d+)/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /pid ${pid} /f`, (err) => {
                                if (!err) {
                                    console.log(`Killed backend process ${pid} on port 5000`);
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log('Error killing backend port processes:', e);
        }
        
        console.log('Backend server stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-frontend', async function (event, ipAddress) {
    try {
        console.log('Starting frontend application in separate terminal...');
        
        // Open frontend in new terminal window
        const frontendProcess = spawn('cmd', ['/c', 'start', 'cmd', '/k', 'npm', 'run', 'dev', '--', '--host'], {
            shell: true,
            detached: true
        });
        
        processes.frontend = frontendProcess;
        frontendProcess.unref();
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'frontend',
                status: 'running'
            });
        }

        console.log('Frontend application terminal opened, waiting for startup (10 seconds)...');
        await new Promise(function (resolve) { 
            setTimeout(resolve, 10000); 
        });
        
        return { success: true, url: 'http://' + ipAddress + ':5173' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-frontend', async function () {
    try {
        console.log('Stopping frontend application...');
        
        if (processes.frontend) {
            processes.frontend.kill();
            processes.frontend = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'frontend',
                    status: 'stopped'
                });
            }
        }
        
        // Kill node processes running on frontend port (5173)
        try {
            exec('netstat -ano | findstr :5173', (error, stdout) => {
                if (stdout) {
                    const lines = stdout.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/LISTENING\s+(\d+)/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /pid ${pid} /f`, (err) => {
                                if (!err) {
                                    console.log(`Killed frontend process ${pid} on port 5173`);
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log('Error killing frontend port processes:', e);
        }
        
        console.log('Frontend application stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// XAMPP Control Handlers
ipcMain.handle('start-apache', async function () {
    try {
        console.log('Starting Apache...');
        
        // Try common XAMPP paths
        const possiblePaths = [
            'C:\\xampp\\apache\\bin\\httpd.exe',
            'C:\\xampp\\apache\\bin\\httpd.exe',
            'D:\\xampp\\apache\\bin\\httpd.exe'
        ];
        
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                const apacheProcess = spawn(path, [], { shell: true });
                processes.apache = apacheProcess;
                
                if (mainWindow) {
                    mainWindow.webContents.send('process-status', {
                        process: 'apache',
                        status: 'running'
                    });
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                console.log('Apache started');
                return { success: true };
            }
        }
        
        return { success: false, error: 'Apache executable not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-apache', async function () {
    try {
        console.log('Stopping Apache...');
        
        if (processes.apache) {
            processes.apache.kill();
            processes.apache = null;
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'apache',
                    status: 'stopped'
                });
            }
        }
        
        // Kill Apache processes
        try {
            exec('taskkill /f /im httpd.exe', (error) => {
                if (!error) {
                    console.log('Killed Apache processes');
                }
            });
        } catch (e) {
            console.log('Error killing Apache processes:', e);
        }
        
        console.log('Apache stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-mysql', async function () {
    try {
        console.log('Starting MySQL...');
        
        // Try common XAMPP paths
        const possiblePaths = [
            'C:\\xampp\\mysql_start.bat',
            'C:\\xampp\\mysql\\bin\\mysqld.exe',
            'C:\\xampp\\xampp_start.exe'
        ];
        
        let mysqlProcess = null;
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                mysqlProcess = spawn(path, [], { shell: true });
                processes.mysql = mysqlProcess;
                break;
            }
        }
        
        if (!mysqlProcess) {
            // If no specific path found, try to start MySQL service
            mysqlProcess = spawn('sc', ['start', 'MySQL'], { shell: true });
            processes.mysql = mysqlProcess;
        }
        
        // Send status update
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'mysql',
                status: 'running'
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('MySQL started');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-mysql', async function () {
    try {
        console.log('Stopping MySQL...');
        
        if (processes.mysql) {
            processes.mysql.kill();
            processes.mysql = null;
        }
        
        // Stop MySQL service
        spawn('sc', ['stop', 'MySQL'], { shell: true });
        
        // Kill MySQL processes
        exec('taskkill /f /im mysqld.exe', (error) => {
            if (!error) {
                console.log('Killed MySQL processes');
            }
        });
        
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'mysql',
                status: 'stopped'
            });
        }
        
        console.log('MySQL stopped');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-phpmyadmin', async function () {
    try {
        const url = 'http://localhost/phpmyadmin';
        await shell.openExternal(url);
        console.log('Opening phpMyAdmin in browser: ' + url);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-xampp-control', async function () {
    try {
        // Try to open XAMPP Control Panel
        const possiblePaths = [
            'C:\\xampp\\xampp-control.exe',
            'C:\\xampp\\xampp-control.exe'
        ];
        
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                spawn(path, [], { shell: true });
                console.log('Opening XAMPP Control Panel');
                return { success: true };
            }
        }
        
        // If control panel not found, open XAMPP directory
        shell.openPath('C:\\xampp');
        console.log('Opening XAMPP directory');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-browser', async function (event, url) {
    await shell.openExternal(url);
});

ipcMain.handle('run-all-steps', async function (event, options) {
    const ipAddress = await getLocalIP();
    currentIP = ipAddress;
    
    try {
        // Start XAMPP services first
        console.log('Starting XAMPP services first...');
        
        // Start Apache
        await startApacheService();
        console.log('Apache started, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Start MySQL
        await startMysqlService();
        console.log('MySQL started, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Continue with the rest of the deployment process
        const currentEnvIP = getCurrentEnvIP();
        if (currentEnvIP !== ipAddress) {
            updateEnvFile(ipAddress);
            console.log('Updated .env with new IP: ' + ipAddress);
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'env',
                    status: 'updated'
                });
            }
        }
        
        if (options.cleanBlockchain) {
            await runCommand('node', ['scripts/clean-reset.js']);
        }
        
        const blockchainDir = path.join(__dirname, 'blockchain');
        
        console.log('Starting Blockchain Node 1 (port 8545) in separate terminal...');
        const node1Batch = path.join(blockchainDir, 'start-node1.bat');
        console.log('Node 1 batch file:', node1Batch);
        const node1Process = spawn('cmd', ['/c', `start "Node 1" cmd /k "${node1Batch}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        processes.blockchainNode1 = node1Process;
        node1Process.unref();
        
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node1',
                status: 'running'
            });
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('Starting Blockchain Node 2 (port 8547) in separate terminal...');
        const node2Batch = path.join(blockchainDir, 'start-node2.bat');
        console.log('Node 2 batch file:', node2Batch);
        const node2Process = spawn('cmd', ['/c', `start "Node 2" cmd /k "${node2Batch}"`], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        processes.blockchainNode2 = node2Process;
        node2Process.unref();
        
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'blockchain-node2',
                status: 'running'
            });
        }

        console.log('Waiting for blockchain nodes to start (30 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        await runCommand('node', ['scripts/compile.js']);
        await runCommand('node', ['scripts/deploy.js']);
        
        // Start backend in separate terminal
        const serverDir = path.join(__dirname, 'server');
        console.log('Starting backend server in separate terminal...');
        const backendProcess = spawn('cmd', ['/c', 'start', 'cmd', '/k', 'cd /d', serverDir, '&&', 'npm', 'run', 'dev:network'], {
            shell: true,
            detached: true
        });
        processes.backend = backendProcess;
        backendProcess.unref();
        
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'backend',
                status: 'running'
            });
        }
        
        console.log('Backend server terminal opened, waiting for startup (10 seconds)...');
        await new Promise(function (resolve) { 
            setTimeout(resolve, 10000); 
        });
        
        // Start frontend in separate terminal
        console.log('Starting frontend application in separate terminal...');
        const frontendProcess = spawn('cmd', ['/c', 'start', 'cmd', '/k', 'npm', 'run', 'dev', '--', '--host'], {
            shell: true,
            detached: true
        });
        processes.frontend = frontendProcess;
        frontendProcess.unref();
        
        if (mainWindow) {
            mainWindow.webContents.send('process-status', {
                process: 'frontend',
                status: 'running'
            });
        }

        console.log('Frontend application terminal opened, waiting for startup (10 seconds)...');
        await new Promise(function (resolve) { 
            setTimeout(resolve, 10000); 
        });
        
        return { success: true, url: 'http://' + ipAddress + ':5173' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Helper functions for XAMPP services
async function startApacheService() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting Apache service...');
            
            const possiblePaths = [
                'C:\\xampp\\apache\\bin\\httpd.exe',
                'C:\\xampp\\apache_start.bat',
                'C:\\xampp\\xampp_start.exe'
            ];
            
            let apacheProcess = null;
            for (const path of possiblePaths) {
                if (fs.existsSync(path)) {
                    apacheProcess = spawn(path, [], { shell: true });
                    processes.apache = apacheProcess;
                    break;
                }
            }
            
            if (!apacheProcess) {
                apacheProcess = spawn('sc', ['start', 'Apache2.4'], { shell: true });
                processes.apache = apacheProcess;
            }
            
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'apache',
                    status: 'running'
                });
            }
            
            apacheProcess.on('close', function (code) {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Apache process exited with code ${code}`));
                }
            });
            
            // Also resolve after timeout even if process doesn't close
            setTimeout(() => {
                resolve();
            }, 5000);
            
        } catch (error) {
            reject(error);
        }
    });
}

async function startMysqlService() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting MySQL service...');
            
            const possiblePaths = [
                'C:\\xampp\\mysql_start.bat',
                'C:\\xampp\\mysql\\bin\\mysqld.exe',
                'C:\\xampp\\xampp_start.exe'
            ];
            
            let mysqlProcess = null;
            for (const path of possiblePaths) {
                if (fs.existsSync(path)) {
                    mysqlProcess = spawn(path, [], { shell: true });
                    processes.mysql = mysqlProcess;
                    break;
                }
            }
            
            if (!mysqlProcess) {
                mysqlProcess = spawn('sc', ['start', 'MySQL'], { shell: true });
                processes.mysql = mysqlProcess;
            }
            
            if (mainWindow) {
                mainWindow.webContents.send('process-status', {
                    process: 'mysql',
                    status: 'running'
                });
            }
            
            mysqlProcess.on('close', function (code) {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`MySQL process exited with code ${code}`));
                }
            });
            
            // Also resolve after timeout even if process doesn't close
            setTimeout(() => {
                resolve();
            }, 5000);
            
        } catch (error) {
            reject(error);
        }
    });
}

function addTerminalOutput(category, message, type = 'info') {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('command-output', {
            type: type,
            data: message,
            category: category
        });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    stopIPMonitoring();
    
    Object.values(processes).forEach(process => {
        if (process) {
            try {
                process.kill();
            } catch (error) {
                console.error('Error killing process:', error);
            }
        }
    });
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});