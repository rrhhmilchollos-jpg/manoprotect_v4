const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  verifyAccessKey: (key) => ipcRenderer.invoke('verify-access-key', key),
  getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
  logout: () => ipcRenderer.invoke('logout'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // API calls
  apiCall: (options) => ipcRenderer.invoke('api-call', options),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Navigation listener
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, page) => callback(page)),
  
  // Login success
  loginSuccess: () => ipcRenderer.send('login-success'),
  
  // Platform info
  platform: process.platform
});
