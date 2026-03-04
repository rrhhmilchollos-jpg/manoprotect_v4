const { app, BrowserWindow, ipcMain, Menu, Tray, shell, session } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Almacenamiento persistente
const store = new Store();

// Clave de acceso de empleado
const EMPLOYEE_ACCESS_KEY = '14082015';

// URL de la web de ManoProtect (PRODUCCIÓN: cambiar a manoprotect.com)
const WEB_URL = 'https://manoprotect-desktop.preview.emergentagent.com';

let mainWindow;
let loginWindow;
let tray;

// Crear ventana de login
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 650,
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

// Crear ventana principal con la WEB
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: true,
    title: 'ManoProtect - Portal de Empleados',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  // Cargar la WEB de ManoProtect
  mainWindow.loadURL(WEB_URL);

  // Mostrar cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Abrir links externos en el navegador por defecto
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Prevenir cierre accidental - minimizar a tray
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
      label: 'Inicio',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.loadURL(WEB_URL);
        }
      }
    },
    { 
      label: 'Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.loadURL(WEB_URL + '/dashboard');
        }
      }
    },
    { 
      label: 'Verificar Estafas',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.loadURL(WEB_URL + '/verificar-estafa');
        }
      }
    },
    { 
      label: 'Precios',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.loadURL(WEB_URL + '/pricing');
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Recargar',
      click: () => {
        if (mainWindow) {
          mainWindow.reload();
        }
      }
    },
    { 
      label: 'Cerrar Sesión',
      click: () => {
        // Limpiar sesión
        session.defaultSession.clearStorageData();
        store.delete('authenticated');
        
        if (mainWindow) {
          mainWindow.close();
          mainWindow = null;
        }
        createLoginWindow();
      }
    },
    { type: 'separator' },
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

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// IPC Handlers
ipcMain.handle('verify-access-key', async (event, key) => {
  if (key === EMPLOYEE_ACCESS_KEY) {
    store.set('authenticated', true);
    store.set('lastLogin', new Date().toISOString());
    return { success: true, message: 'Acceso concedido' };
  }
  return { success: false, message: 'Clave de acceso incorrecta' };
});

ipcMain.handle('get-auth-status', async () => {
  return { authenticated: store.get('authenticated', false) };
});

// App ready
app.whenReady().then(() => {
  // Verificar si ya estaba autenticado
  if (store.get('authenticated')) {
    createMainWindow();
  } else {
    createLoginWindow();
    
    ipcMain.once('login-success', () => {
      if (loginWindow) {
        loginWindow.close();
        loginWindow = null;
      }
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
  // No cerrar, mantener en tray
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (store.get('authenticated')) {
      createMainWindow();
    } else {
      createLoginWindow();
    }
  }
});

// Limpiar al salir
app.on('before-quit', () => {
  app.isQuitting = true;
});
