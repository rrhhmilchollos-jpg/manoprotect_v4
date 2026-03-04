const { app, BrowserWindow, Menu, shell, Notification } = require('electron');
const path = require('path');

// Production URL - change this to your deployed URL
const PRODUCTION_URL = 'https://manoprotect.com';
const APP_ROUTE = '/cra-operador';
const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds
const ALERT_CHECK_INTERVAL = 10000; // Check for new alerts every 10s

let mainWindow;
let refreshInterval;
let alertCheckInterval;
let lastAlertCount = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    title: 'ManoProtect CRA - Central Receptora de Alarmas',
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
      label: 'CRA ManoProtect',
      submenu: [
        { label: 'Panel CRA', click: () => mainWindow.loadURL(PRODUCTION_URL + APP_ROUTE) },
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
        { label: 'Alertas en Tiempo Real', click: () => navigateTo(APP_ROUTE) },
        { label: 'Video-Verificacion', click: () => navigateTo(APP_ROUTE + '?tab=video') },
        { label: 'Protocolos', click: () => navigateTo(APP_ROUTE + '?tab=protocols') },
        { type: 'separator' },
        { label: 'CRM Ventas', click: () => navigateTo('/gestion-empresa') },
        { label: 'App Cliente', click: () => navigateTo('/mi-seguridad') }
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
        {
          label: 'Notificaciones Alertas',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => toggleAlertNotifications(menuItem.checked)
        },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Abrir en Navegador', click: () => shell.openExternal(PRODUCTION_URL + APP_ROUTE) },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Web ManoProtect', click: () => shell.openExternal('https://manoprotect.com') },
        { label: 'Soporte Tecnico', click: () => shell.openExternal('mailto:soporte@manoprotect.com') },
        { type: 'separator' },
        { label: `Version ${require('./package.json').version}` }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the CRA page
  mainWindow.loadURL(PRODUCTION_URL + APP_ROUTE);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    startAutoRefresh();
    startAlertCheck();
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
    stopAlertCheck();
  });

  // Connection monitoring
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode !== -3) {
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
        if (window.__MANOPROTECT_REFRESH__) {
          window.__MANOPROTECT_REFRESH__();
        } else {
          window.dispatchEvent(new CustomEvent('manoprotect-refresh'));
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

function startAlertCheck() {
  alertCheckInterval = setInterval(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const alertCount = await mainWindow.webContents.executeJavaScript(`
          document.querySelectorAll('[data-testid*="alert-item"], .alert-item, [data-alert-status="pending"]').length
        `);
        
        if (alertCount > lastAlertCount && lastAlertCount > 0) {
          const newAlerts = alertCount - lastAlertCount;
          if (Notification.isSupported()) {
            new Notification({
              title: 'ALERTA CRA - ManoProtect',
              body: newAlerts + ' nueva(s) alerta(s) detectada(s)',
              urgency: 'critical',
              icon: path.join(__dirname, 'assets', 'icon.png')
            }).show();
          }
          mainWindow.flashFrame(true);
        }
        lastAlertCount = alertCount;
      } catch (e) {
        // Silently handle
      }
    }
  }, ALERT_CHECK_INTERVAL);
}

function stopAlertCheck() {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
  }
}

function toggleAutoRefresh(enabled) {
  enabled ? startAutoRefresh() : stopAutoRefresh();
}

function toggleAlertNotifications(enabled) {
  enabled ? startAlertCheck() : stopAlertCheck();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
