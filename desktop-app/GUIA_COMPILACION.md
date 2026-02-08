# 🖥️ ManoProtect - Portal de Empleados (Desktop App)

## Guía de Compilación del Instalador .exe

Este documento explica cómo compilar la aplicación de escritorio ManoProtect para Windows.

---

## 📋 Requisitos Previos

### 1. Node.js 18+
- Descarga: https://nodejs.org/
- Verifica: `node --version`

### 2. Yarn (gestor de paquetes)
```bash
npm install -g yarn
```

### 3. Git (opcional)
- Descarga: https://git-scm.com/

---

## 🚀 Pasos para Compilar

### Paso 1: Descarga el código
Descarga el código desde Emergent usando "Download Code" o "Save to GitHub".

### Paso 2: Navega a la carpeta
```bash
cd desktop-app
```

### Paso 3: Instala dependencias
```bash
yarn install
```

### Paso 4: Prueba la aplicación (opcional)
```bash
yarn start
```
Esto abrirá la aplicación en modo desarrollo.

### Paso 5: Compila el instalador .exe
```bash
yarn build:win
```

### Paso 6: Encuentra el instalador
El archivo `.exe` estará en:
```
desktop-app/dist/ManoProtect-Empleados-Setup-1.0.0.exe
```

---

## 🔐 Clave de Acceso

La aplicación requiere una clave de acceso para entrar:

```
Clave: 14082015
```

Esta clave está configurada en `main.js` y puede modificarse.

---

## ⚙️ Configuración

### Cambiar la URL del Backend
Edita `main.js`:
```javascript
const BACKEND_URL = 'https://tu-servidor.com';
```

### Cambiar la Clave de Acceso
Edita `main.js`:
```javascript
const EMPLOYEE_ACCESS_KEY = 'nueva-clave';
```

### Personalizar el Icono
Reemplaza los archivos en `assets/`:
- `icon.ico` - Windows
- `icon.png` - Linux/Tray
- `icon.icns` - macOS

---

## 📦 Estructura del Proyecto

```
desktop-app/
├── main.js              # Proceso principal de Electron
├── preload.js           # Bridge entre Node y Renderer
├── package.json         # Configuración y scripts
├── src/
│   ├── login.html       # Pantalla de acceso
│   ├── index.html       # Interfaz principal
│   ├── styles.css       # Estilos
│   └── app.js           # Lógica del frontend
├── assets/
│   ├── icon.ico         # Icono Windows
│   ├── icon.png         # Icono PNG
│   └── icon.icns        # Icono macOS
└── dist/                # Carpeta de salida (generada)
```

---

## 🔧 Solución de Problemas

### Error: "node-fetch" no encontrado
```bash
yarn add node-fetch
```

### Error al compilar en Windows
Asegúrate de tener Visual Studio Build Tools instalado.

### La app no se conecta al servidor
Verifica que el `BACKEND_URL` sea accesible desde tu red.

---

## 📱 Otras Plataformas

### macOS
```bash
yarn build:mac
```

### Linux
```bash
yarn build:linux
```

---

## 📞 Soporte

- Web: https://manoprotect.com
- Email: soporte@manoprotect.com

---

© 2025 STARTBOOKING SL - ManoProtect
