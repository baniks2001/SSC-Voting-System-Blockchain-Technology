const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  refreshIP: () => ipcRenderer.invoke('refresh-ip'),
  updateEnv: (ipAddress) => ipcRenderer.invoke('update-env', ipAddress),
  cleanBlockchain: () => ipcRenderer.invoke('clean-blockchain'),
  startBlockchain: () => ipcRenderer.invoke('start-blockchain'),
  stopBlockchain: () => ipcRenderer.invoke('stop-blockchain'),
  compileContract: () => ipcRenderer.invoke('compile-contract'),
  deployContract: () => ipcRenderer.invoke('deploy-contract'),
  startBackend: () => ipcRenderer.invoke('start-backend'),
  stopBackend: () => ipcRenderer.invoke('stop-backend'),
  startFrontend: (ipAddress) => ipcRenderer.invoke('start-frontend', ipAddress),
  stopFrontend: () => ipcRenderer.invoke('stop-frontend'),
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url),
  runAllSteps: (options) => ipcRenderer.invoke('run-all-steps', options),
  onCommandOutput: (callback) => ipcRenderer.on('command-output', (event, data) => callback(data)),
  onIPChanged: (callback) => ipcRenderer.on('ip-changed', (event, data) => callback(data)),
  onIPRefreshed: (callback) => ipcRenderer.on('ip-refreshed', (event, data) => callback(data))
});