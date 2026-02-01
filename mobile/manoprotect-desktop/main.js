const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Production URL
const MANOPROTECT_URL = 'https://manoprotect.com';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'ManoProtect',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        autoHideMenuBar: false,
        backgroundColor: '#4F46E5'
    });

    // Load the web app
    mainWindow.loadURL(MANOPROTECT_URL);

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://') || url.startsWith('http://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create menu
const menuTemplate = [
    {
        label: 'ManoProtect',
        submenu: [
            { label: 'Inicio', click: () => mainWindow.loadURL(MANOPROTECT_URL) },
            { type: 'separator' },
            { label: 'Recargar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
            { type: 'separator' },
            { role: 'quit', label: 'Salir' }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            { role: 'undo', label: 'Deshacer' },
            { role: 'redo', label: 'Rehacer' },
            { type: 'separator' },
            { role: 'cut', label: 'Cortar' },
            { role: 'copy', label: 'Copiar' },
            { role: 'paste', label: 'Pegar' },
            { role: 'selectAll', label: 'Seleccionar todo' }
        ]
    },
    {
        label: 'Ver',
        submenu: [
            { role: 'zoomIn', label: 'Aumentar zoom' },
            { role: 'zoomOut', label: 'Reducir zoom' },
            { role: 'resetZoom', label: 'Zoom normal' },
            { type: 'separator' },
            { role: 'togglefullscreen', label: 'Pantalla completa' }
        ]
    },
    {
        label: 'Ayuda',
        submenu: [
            { 
                label: 'Soporte', 
                click: () => shell.openExternal('mailto:info@manoprotect.com') 
            },
            { 
                label: 'Sitio Web', 
                click: () => shell.openExternal('https://manoprotect.com') 
            },
            { type: 'separator' },
            { 
                label: 'Acerca de ManoProtect',
                click: () => {
                    const { dialog } = require('electron');
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Acerca de ManoProtect',
                        message: 'ManoProtect v2.0.0',
                        detail: 'Protección contra fraudes digitales para toda la familia.\n\n© 2024 ManoProtect'
                    });
                }
            }
        ]
    }
];

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event) => {
        event.preventDefault();
    });
});
