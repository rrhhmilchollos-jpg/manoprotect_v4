# ManoProtect - Aplicaciones de Escritorio

## Contenido

Este paquete contiene dos aplicaciones de escritorio independientes para ManoProtect:

### 1. CRM de Ventas (`crm-ventas/`)
- Pipeline de ventas Kanban
- Calendario de visitas
- Comisiones de agentes
- Gestion de stock
- Generacion de contratos

### 2. CRA Operador (`cra-operador/`)
- Monitoreo de alarmas en tiempo real
- Video-verificacion
- Protocolos de actuacion
- Notificaciones de escritorio para nuevas alertas
- Despacho de unidades

---

## Requisitos

- **Node.js** v18+ (https://nodejs.org)
- **npm** o **yarn** instalado

---

## Instalacion y Ejecucion (Desarrollo)

### CRM de Ventas:
```bash
cd crm-ventas
npm install
npm start
```

### CRA Operador:
```bash
cd cra-operador
npm install
npm start
```

---

## Compilacion para Produccion

### Windows:
```bash
cd crm-ventas
npm install
npm run build:win
# El instalador estara en crm-ventas/dist/
```

### macOS:
```bash
cd crm-ventas
npm install
npm run build:mac
# El .dmg estara en crm-ventas/dist/
```

### Linux:
```bash
cd crm-ventas
npm install
npm run build:linux
# El AppImage estara en crm-ventas/dist/
```

### Todas las plataformas:
```bash
npm run build:all
```

Repetir lo mismo para `cra-operador/`.

---

## Caracteristicas

- Conexion en vivo 24/7 con el backend de ManoProtect
- Auto-refresh de datos cada 10 segundos
- Notificaciones de escritorio (CRA) para alertas criticas
- Pagina offline cuando no hay conexion
- Menu con acceso rapido a todos los modulos
- Funciona en Windows, macOS y Linux

---

## Configuracion

La URL del servidor esta configurada en `main.js`:
```javascript
const PRODUCTION_URL = 'https://manoprotect.com';
```

Si necesitas cambiar el servidor (por ejemplo, para desarrollo), edita esta linea.

---

## Credenciales

| Usuario | Contrasena | Acceso |
|---------|------------|--------|
| ceo@manoprotect.com | 19862210Des | CRM + CRA (Admin) |
| operador@manoprotect.com | (contactar admin) | CRA Operador |

---

## Soporte

Email: soporte@manoprotect.com
Web: https://manoprotect.com
