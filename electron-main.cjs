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
    frontend: null
};
let currentIP = 'localhost';
let ipCheckInterval = null;

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
        show: false
    });

    mainWindow.loadFile('electron-ui.html').then(() => {
        console.log('UI loaded successfully');
        mainWindow.show();
        startIPMonitoring();
    }).catch(err => {
        console.error('Failed to load UI:', err);
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
        stopIPMonitoring();
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
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: options.category || 'system'
                });
            }
        });
        
        process.stderr.on('data', function (data) {
            errorOutput += data.toString();
            if (mainWindow) {
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
            reject(error);
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

ipcMain.handle('update-env', async function (event, ipAddress) {
    const currentEnvIP = getCurrentEnvIP();
    if (currentEnvIP === ipAddress) {
        addTerminalOutput('system', 'IP address unchanged (' + ipAddress + '), no update needed', 'info');
        return { success: true, updated: false, ip: ipAddress };
    } else {
        const success = updateEnvFile(ipAddress);
        if (success) {
            addTerminalOutput('system', 'Updated .env file with new IP: ' + ipAddress, 'info');
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

ipcMain.handle('start-blockchain', async function () {
    try {
        const blockchainDir = path.join(__dirname, 'blockchain');
        
        addTerminalOutput('system', 'Starting Blockchain Node 1 (port 8545)...', 'info');
        const node1Process = spawn('start-node1.bat', [], {
            cwd: blockchainDir,
            shell: true,
            detached: true
        });
        
        processes.blockchainNode1 = node1Process;
        
        node1Process.stdout.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: 'blockchain-node1'
                });
            }
        });
        
        node1Process.stderr.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stderr',
                    data: data.toString(),
                    category: 'blockchain-node1'
                });
            }
        });

        await new Promise(resolve => setTimeout(resolve, 5000));
        
        addTerminalOutput('system', 'Starting Blockchain Node 2 (port 8547)...', 'info');
        const node2Process = spawn('start-node2.bat', [], {
            cwd: blockchainDir,
            shell: true,
            detached: true
        });
        
        processes.blockchainNode2 = node2Process;
        
        node2Process.stdout.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: 'blockchain-node2'
                });
            }
        });
        
        node2Process.stderr.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stderr',
                    data: data.toString(),
                    category: 'blockchain-node2'
                });
            }
        });

        addTerminalOutput('system', 'Waiting for blockchain nodes to start (30 seconds)...', 'info');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        addTerminalOutput('system', 'Blockchain nodes should be running now', 'info');
        return { success: true };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-blockchain', async function () {
    try {
        addTerminalOutput('system', 'Stopping blockchain nodes...', 'info');
        
        if (processes.blockchainNode1) {
            processes.blockchainNode1.kill();
            processes.blockchainNode1 = null;
        }
        
        if (processes.blockchainNode2) {
            processes.blockchainNode2.kill();
            processes.blockchainNode2 = null;
        }
        
        spawn('taskkill', ['/f', '/im', 'geth.exe'], { shell: true });
        
        addTerminalOutput('system', 'Blockchain nodes stopped', 'info');
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
        const backendProcess = spawn('npm', ['run', 'dev:network'], { 
            shell: true, 
            cwd: path.join(__dirname, 'server') 
        });
        
        processes.backend = backendProcess;
        
        backendProcess.stdout.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stdout', 
                    data: data.toString(), 
                    category: 'backend' 
                });
            }
        });
        
        backendProcess.stderr.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stderr', 
                    data: data.toString(), 
                    category: 'backend' 
                });
            }
        });
        
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
        addTerminalOutput('system', 'Stopping backend server...', 'info');
        
        if (processes.backend) {
            processes.backend.kill();
            processes.backend = null;
        }
        
        spawn('taskkill', ['/f', '/im', 'node.exe'], { shell: true });
        
        addTerminalOutput('system', 'Backend server stopped', 'info');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-frontend', async function (event, ipAddress) {
    try {
        const frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], { 
            shell: true 
        });
        
        processes.frontend = frontendProcess;
        
        frontendProcess.stdout.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stdout', 
                    data: data.toString(), 
                    category: 'frontend' 
                });
            }
        });
        
        frontendProcess.stderr.on('data', function (data) {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stderr', 
                    data: data.toString(), 
                    category: 'frontend' 
                });
            }
        });
        
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
        addTerminalOutput('system', 'Stopping frontend server...', 'info');
        
        if (processes.frontend) {
            processes.frontend.kill();
            processes.frontend = null;
        }
        
        spawn('taskkill', ['/f', '/im', 'node.exe'], { shell: true });
        
        addTerminalOutput('system', 'Frontend server stopped', 'info');
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
        const currentEnvIP = getCurrentEnvIP();
        if (currentEnvIP !== ipAddress) {
            updateEnvFile(ipAddress);
            addTerminalOutput('system', 'Updated .env with new IP: ' + ipAddress, 'info');
        }
        
        if (options.cleanBlockchain) {
            await runCommand('node', ['scripts/clean-reset.js']);
        }
        
        const blockchainDir = path.join(__dirname, 'blockchain');
        
        addTerminalOutput('system', 'Starting Blockchain Node 1 (port 8545)...', 'info');
        const node1Process = spawn('start-node1.bat', [], {
            cwd: blockchainDir,
            shell: true,
            detached: true
        });
        processes.blockchainNode1 = node1Process;
        
        node1Process.stdout.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: 'blockchain-node1'
                });
            }
        });
        
        node1Process.stderr.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stderr',
                    data: data.toString(),
                    category: 'blockchain-node1'
                });
            }
        });

        await new Promise(resolve => setTimeout(resolve, 5000));
        
        addTerminalOutput('system', 'Starting Blockchain Node 2 (port 8547)...', 'info');
        const node2Process = spawn('start-node2.bat', [], {
            cwd: blockchainDir,
            shell: true,
            detached: true
        });
        processes.blockchainNode2 = node2Process;
        
        node2Process.stdout.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stdout',
                    data: data.toString(),
                    category: 'blockchain-node2'
                });
            }
        });
        
        node2Process.stderr.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', {
                    type: 'stderr',
                    data: data.toString(),
                    category: 'blockchain-node2'
                });
            }
        });

        addTerminalOutput('system', 'Waiting for blockchain nodes to start (30 seconds)...', 'info');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        await runCommand('node', ['scripts/compile.js']);
        await runCommand('node', ['scripts/deploy.js']);
        
        const backendProcess = spawn('npm', ['run', 'dev:network'], { 
            shell: true, 
            cwd: path.join(__dirname, 'server') 
        });
        processes.backend = backendProcess;
        
        backendProcess.stdout.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stdout', 
                    data: data.toString(), 
                    category: 'backend' 
                });
            }
        });
        
        backendProcess.stderr.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stderr', 
                    data: data.toString(), 
                    category: 'backend' 
                });
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], { 
            shell: true 
        });
        processes.frontend = frontendProcess;
        
        frontendProcess.stdout.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stdout', 
                    data: data.toString(), 
                    category: 'frontend' 
                });
            }
        });
        
        frontendProcess.stderr.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('command-output', { 
                    type: 'stderr', 
                    data: data.toString(), 
                    category: 'frontend' 
                });
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        return { success: true, url: 'http://' + ipAddress + ':5173' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

function addTerminalOutput(category, message, type) {
    if (mainWindow) {
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