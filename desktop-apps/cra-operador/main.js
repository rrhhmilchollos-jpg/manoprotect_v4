const { app, BrowserWindow, Menu, shell, Notification } = require('electron');
const path = require('path');
const { net } = require('electron');

// Server URL - production
const URLS = [
  'https://www.manoprotectt.com',
  'https://manoprotectt.com'
];
const APP_ROUTE = '/cra-operador';
const AUTO_REFRESH_INTERVAL = 10000;
const ALERT_CHECK_INTERVAL = 10000;
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 60;

let mainWindow;
let refreshInterval;
let alertCheckInterval;
let lastAlertCount = 0;
let activeURL = null;
let reconnectAttempts = 0;
let isOffline = false;

async function testURL(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);
    try {
      const request = net.request({ url: url + '/api/health', method: 'GET' });
      request.on('response', (response) => {
        clearTimeout(timeout);
        resolve(response.statusCode < 500);
      });
      request.on('error', () => { clearTimeout(timeout); resolve(false); });
      request.end();
    } catch (e) {
      clearTimeout(timeout);
      resolve(false);
    }
  });
}

async function findWorkingURL() {
  for (const url of URLS) {
    const works = await testURL(url);
    if (works) return url;
  }
  return null;
}

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

  const menuTemplate = [
    {
      label: 'CRA ManoProtect',
      submenu: [
        { label: 'Panel CRA', click: () => loadApp() },
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
        { label: 'Back Office', click: () => navigateTo('/backoffice') },
        { type: 'separator' },
        { label: 'CRM Ventas', click: () => navigateTo('/gestion') },
        { label: 'App Comerciales', click: () => navigateTo('/app-comerciales') },
        { label: 'App Instaladores', click: () => navigateTo('/app-instaladores') },
        { label: 'App Cliente', click: () => navigateTo('/app-cliente') }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Auto-Refresh: Activado (10s)',
          type: 'checkbox', checked: true,
          click: (menuItem) => toggleAutoRefresh(menuItem.checked)
        },
        {
          label: 'Notificaciones Alertas',
          type: 'checkbox', checked: true,
          click: (menuItem) => toggleAlertNotifications(menuItem.checked)
        },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Abrir en Navegador', click: () => { if (activeURL) shell.openExternal(activeURL + APP_ROUTE); } },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Web ManoProtect', click: () => shell.openExternal('https://www.manoprotectt.com') },
        { label: 'Soporte Tecnico', click: () => shell.openExternal('mailto:soporte@manoprotectt.com') },
        { type: 'separator' },
        { label: `Version ${require('./package.json').version}` }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    startAutoRefresh();
    startAlertCheck();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (activeURL && !url.startsWith(activeURL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; stopAutoRefresh(); stopAlertCheck(); });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode !== -3) {
      isOffline = true;
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
      startReconnect();
    }
  });

  loadApp();
}

async function loadApp() {
  mainWindow.setTitle('ManoProtect CRA - Conectando...');
  const url = await findWorkingURL();
  if (url) {
    activeURL = url;
    isOffline = false;
    reconnectAttempts = 0;
    mainWindow.setTitle('ManoProtect CRA - Central Receptora de Alarmas');
    mainWindow.loadURL(url + APP_ROUTE);
  } else {
    isOffline = true;
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    startReconnect();
  }
}

function startReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
  setTimeout(async () => {
    if (!isOffline || !mainWindow || mainWindow.isDestroyed()) return;
    reconnectAttempts++;
    const url = await findWorkingURL();
    if (url) {
      activeURL = url;
      isOffline = false;
      reconnectAttempts = 0;
      mainWindow.setTitle('ManoProtect CRA - Central Receptora de Alarmas');
      mainWindow.loadURL(url + APP_ROUTE);
    } else {
      startReconnect();
    }
  }, RECONNECT_INTERVAL);
}

function navigateTo(route) {
  if (mainWindow && activeURL) mainWindow.loadURL(activeURL + route);
}

function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !isOffline) {
      mainWindow.webContents.executeJavaScript(`
        window.dispatchEvent(new CustomEvent('manoprotect-refresh'));
      `).catch(() => {});
    }
  }, AUTO_REFRESH_INTERVAL);
}

function startAlertCheck() {
  alertCheckInterval = setInterval(async () => {
    if (mainWindow && !mainWindow.isDestroyed() && !isOffline) {
      try {
        const alertCount = await mainWindow.webContents.executeJavaScript(`
          document.querySelectorAll('[data-testid*="alert-item"], .alert-item, [data-alert-status="pending"]').length
        `);
        if (alertCount > lastAlertCount && lastAlertCount > 0) {
          if (Notification.isSupported()) {
            new Notification({
              title: 'ALERTA CRA - ManoProtect',
              body: (alertCount - lastAlertCount) + ' nueva(s) alerta(s) detectada(s)',
              urgency: 'critical',
              icon: path.join(__dirname, 'assets', 'icon.png')
            }).show();
          }
          mainWindow.flashFrame(true);
        }
        lastAlertCount = alertCount;
      } catch (e) {}
    }
  }, ALERT_CHECK_INTERVAL);
}

function stopAutoRefresh() { if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; } }
function stopAlertCheck() { if (alertCheckInterval) { clearInterval(alertCheckInterval); alertCheckInterval = null; } }
function toggleAutoRefresh(enabled) { enabled ? startAutoRefresh() : stopAutoRefresh(); }
function toggleAlertNotifications(enabled) { enabled ? startAlertCheck() : stopAlertCheck(); }

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
