const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const WebSocket = require('ws');

// Almacenamiento persistente
const store = new Store();

// Clave de acceso de empleado
const EMPLOYEE_ACCESS_KEY = '14082015';

// URL del backend de ManoProtect (PRODUCCIÓN: cambiar a manoprotect.com)
const BACKEND_URL = 'https://manoprotect-qa.preview.emergentagent.com';
const WS_URL = 'wss://manoprotect-qa.preview.emergentagent.com/ws';

let mainWindow;
let tray;
let isAuthenticated = false;
let wsConnection = null;

// Conexión WebSocket en tiempo real
function connectWebSocket() {
  try {
    wsConnection = new WebSocket(WS_URL);
    
    wsConnection.on('open', () => {
      console.log('✅ WebSocket conectado');
    });
    
    wsConnection.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleRealtimeMessage(message);
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    });
    
    wsConnection.on('close', () => {
      console.log('WebSocket desconectado, reconectando...');
      setTimeout(connectWebSocket, 5000);
    });
    
    wsConnection.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });
  } catch (error) {
    console.error('Error connecting WebSocket:', error);
    setTimeout(connectWebSocket, 5000);
  }
}

// Manejar mensajes en tiempo real
function handleRealtimeMessage(message) {
  switch (message.type) {
    case 'sos_alert':
      // Mostrar notificación de alerta SOS
      new Notification({
        title: '🚨 Alerta SOS',
        body: message.data?.sender_name + ' necesita ayuda',
        urgency: 'critical'
      }).show();
      
      if (mainWindow) {
        mainWindow.show();
        mainWindow.webContents.send('sos-alert', message.data);
      }
      break;
      
    case 'fraud_report':
      // Nueva alerta de fraude
      if (mainWindow) {
        mainWindow.webContents.send('new-fraud-report', message.data);
      }
      break;
      
    case 'system_update':
      // Actualización del sistema
      if (mainWindow) {
        mainWindow.webContents.send('system-update', message.data);
      }
      break;
  }
}

// Crear ventana de login
function createLoginWindow() {
  const loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  loginWindow.loadFile(path.join(__dirname, 'src', 'login.html'));
  
  return loginWindow;
}

// Crear ventana principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  // Cargar la aplicación principal
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Mostrar cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Prevenir cierre accidental
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  return mainWindow;
}

// Crear menú del sistema (tray)
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir ManoProtect', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Panel de Seguridad',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', 'security');
        }
      }
    },
    { 
      label: 'Verificar URL',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', 'url-check');
        }
      }
    },
    { 
      label: 'Alertas',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', 'alerts');
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Cerrar Sesión',
      click: () => {
        isAuthenticated = false;
        store.delete('authenticated');
        if (mainWindow) {
          mainWindow.close();
          mainWindow = null;
        }
        createLoginWindow();
      }
    },
    { 
      label: 'Salir',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('ManoProtect - Portal de Empleados');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// IPC Handlers
ipcMain.handle('verify-access-key', async (event, key) => {
  if (key === EMPLOYEE_ACCESS_KEY) {
    isAuthenticated = true;
    store.set('authenticated', true);
    store.set('lastLogin', new Date().toISOString());
    return { success: true, message: 'Acceso concedido' };
  }
  return { success: false, message: 'Clave de acceso incorrecta' };
});

ipcMain.handle('get-auth-status', async () => {
  return { authenticated: isAuthenticated };
});

ipcMain.handle('logout', async () => {
  isAuthenticated = false;
  store.delete('authenticated');
  return { success: true };
});

// Window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.hide();
});

// API calls
ipcMain.handle('api-call', async (event, { endpoint, method, body }) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
});

// Open external links
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// App ready
app.whenReady().then(() => {
  // Verificar si ya estaba autenticado
  if (store.get('authenticated')) {
    isAuthenticated = true;
    createMainWindow();
  } else {
    const loginWin = createLoginWindow();
    
    ipcMain.once('login-success', () => {
      loginWin.close();
      createMainWindow();
    });
  }
  
  createTray();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // No cerrar, mantener en tray
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (isAuthenticated) {
      createMainWindow();
    } else {
      createLoginWindow();
    }
  }
});
