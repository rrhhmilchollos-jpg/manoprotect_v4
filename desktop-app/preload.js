const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  verifyAccessKey: (key) => ipcRenderer.invoke('verify-access-key', key),
  getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
  
  // Login success
  loginSuccess: () => ipcRenderer.send('login-success'),
  
  // Platform info
  platform: process.platform
});
