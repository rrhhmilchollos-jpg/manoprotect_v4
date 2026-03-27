const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// Production URL - change this to your deployed URL
const PRODUCTION_URL = 'https://manoprotectt.com';
const APP_ROUTE = '/gestion-empresa';
const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds

let mainWindow;
let refreshInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'ManoProtect CRM de Ventas',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: false,
    show: false
  });

  // Build the menu
  const menuTemplate = [
    {
      label: 'CRM ManoProtect',
      submenu: [
        { label: 'Inicio CRM', click: () => mainWindow.loadURL(PRODUCTION_URL + APP_ROUTE) },
        { type: 'separator' },
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Forzar Recarga', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Salir', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Modulos',
      submenu: [
        { label: 'Pipeline Ventas (Kanban)', click: () => navigateTo(APP_ROUTE) },
        { label: 'Calendario', click: () => navigateTo(APP_ROUTE + '?tab=calendar') },
        { label: 'Comisiones', click: () => navigateTo(APP_ROUTE + '?tab=commissions') },
        { label: 'Stock', click: () => navigateTo(APP_ROUTE + '?tab=stock') },
        { type: 'separator' },
        { label: 'CRA Operador', click: () => navigateTo('/cra-operador') },
        { label: 'Mi Seguridad', click: () => navigateTo('/mi-seguridad') }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        { 
          label: 'Auto-Refresh: Activado (10s)',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => toggleAutoRefresh(menuItem.checked)
        },
        { type: 'separator' },
        { label: 'Abrir en Navegador', click: () => shell.openExternal(PRODUCTION_URL + APP_ROUTE) },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Web ManoProtect', click: () => shell.openExternal('https://manoprotectt.com') },
        { label: 'Soporte', click: () => shell.openExternal('mailto:soporte@manoprotectt.com') },
        { type: 'separator' },
        { label: `Version ${require('./package.json').version}` }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the CRM page
  mainWindow.loadURL(PRODUCTION_URL + APP_ROUTE);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    startAutoRefresh();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(PRODUCTION_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopAutoRefresh();
  });

  // Connection status monitoring
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode !== -3) { // Ignore aborted loads
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    }
  });
}

function navigateTo(route) {
  if (mainWindow) {
    mainWindow.loadURL(PRODUCTION_URL + route);
  }
}

function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript(`
        // Trigger data refresh without full page reload
        if (window.__MANOPROTECT_REFRESH__) {
          window.__MANOPROTECT_REFRESH__();
        } else {
          // Dispatch custom event for React to pick up
          window.dispatchEvent(new CustomEvent('manoprotect-refresh'));
          // Also trigger visibility change to force React Query/SWR refetch
          document.dispatchEvent(new Event('visibilitychange'));
        }
      `).catch(() => {});
    }
  }, AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

function toggleAutoRefresh(enabled) {
  if (enabled) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
