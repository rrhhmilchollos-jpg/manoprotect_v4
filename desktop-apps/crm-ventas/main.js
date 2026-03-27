const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { net } = require('electron');

// Server URL - production
const URLS = [
  'https://www.manoprotectt.com',
  'https://manoprotectt.com'
];
const APP_ROUTE = '/gestion';
const AUTO_REFRESH_INTERVAL = 10000;
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 60;

let mainWindow;
let refreshInterval;
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

  const menuTemplate = [
    {
      label: 'CRM ManoProtect',
      submenu: [
        { label: 'Inicio CRM', click: () => loadApp() },
        { type: 'separator' },
        { label: 'Back Office', click: () => navigateTo('/backoffice') },
        { label: 'Pipeline CRM', click: () => navigateTo('/backoffice') },
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
        { label: 'Gestion Admin', click: () => navigateTo('/gestion') },
        { label: 'Back Office', click: () => navigateTo('/backoffice') },
        { label: 'App Comerciales', click: () => navigateTo('/app-comerciales') },
        { type: 'separator' },
        { label: 'CRA Operador', click: () => navigateTo('/cra-operador') },
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
        { type: 'separator' },
        { label: 'Abrir en Navegador', click: () => { if (activeURL) shell.openExternal(activeURL + APP_ROUTE); } },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Web ManoProtect', click: () => shell.openExternal('https://www.manoprotectt.com') },
        { label: 'Soporte', click: () => shell.openExternal('mailto:soporte@manoprotectt.com') },
        { type: 'separator' },
        { label: `Version ${require('./package.json').version}` }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    startAutoRefresh();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (activeURL && !url.startsWith(activeURL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; stopAutoRefresh(); });

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
  mainWindow.setTitle('ManoProtect CRM - Conectando...');
  const url = await findWorkingURL();
  if (url) {
    activeURL = url;
    isOffline = false;
    reconnectAttempts = 0;
    mainWindow.setTitle('ManoProtect CRM de Ventas');
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
      mainWindow.setTitle('ManoProtect CRM de Ventas');
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

function stopAutoRefresh() { if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; } }
function toggleAutoRefresh(enabled) { enabled ? startAutoRefresh() : stopAutoRefresh(); }

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
