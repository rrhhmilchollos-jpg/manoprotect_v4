# ManoProtect Desktop - Software Interno para Empleados

## 🖥️ Descripción
Software de escritorio para las sucursales de ManoProtect. Permite a los empleados gestionar amenazas, clientes, tickets de soporte y comunicarse internamente.

## 📋 Funcionalidades
- **Dashboard**: Resumen en tiempo real de amenazas, tickets y estadísticas
- **Gestión de Amenazas**: Ver, asignar y resolver amenazas detectadas
- **Gestión de Clientes**: Buscar y administrar cuentas de clientes
- **Verificador de Estafas**: Analizar contenido sospechoso y añadir a la base de datos
- **Sistema de Tickets**: Gestión de soporte al cliente
- **Chat Interno**: Comunicación entre empleados
- **Reportes**: Métricas y estadísticas del equipo

## 🔐 Credenciales por defecto

### Administrador
- **Email**: admin@manoprotect.com
- **Contraseña**: Admin2024!

### Empleados
- **Email**: [nombre]@manoprotect.com
- **Contraseña**: Mano2024!

## 🚀 Instalación

### Windows
1. Ejecutar `ManoProtect Desktop.exe`
2. O usar el instalador si está disponible

### Mac
1. Abrir el archivo `.dmg`
2. Arrastrar a Aplicaciones

### Linux
1. Dar permisos de ejecución al AppImage
2. Ejecutar

## 💻 Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn

### Comandos
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Compilar para Windows
npm run build:win

# Compilar para Mac
npm run build:mac

# Compilar para Linux
npm run build:linux
```

## 📁 Estructura del Proyecto
```
manoprotect-desktop/
├── main.js           # Proceso principal de Electron
├── database.js       # Base de datos SQLite local
├── renderer/
│   ├── index.html    # Interfaz principal
│   └── app.js        # Lógica de la aplicación
├── assets/
│   ├── icon.png      # Icono de la app
│   └── icon.ico      # Icono para Windows
└── package.json      # Configuración del proyecto
```

## 🏢 Empresa
STARTBOOKING SL - CIF: B19427723

© 2026 ManoProtect - Todos los derechos reservados
