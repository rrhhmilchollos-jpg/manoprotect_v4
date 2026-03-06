# ManoProtect Comerciales - App Android

## Descripción
App móvil profesional para el equipo comercial de ManoProtect. Permite consultar stock, crear pedidos, gestionar clientes y recibir notificaciones en tiempo real.

## Funcionalidades
- Login con credenciales únicas (JWT)
- Consulta de stock en tiempo real
- Creación de presupuestos y pedidos
- Historial de clientes y pedidos
- Notificaciones push: stock bajo, pedidos urgentes
- Auto-actualización desde Play Store

## Configuración
1. Copiar `google-services.json` del proyecto Firebase
2. Configurar variables de entorno:
   - `KEYSTORE_PATH`: Ruta al keystore de firma
   - `KEYSTORE_PASSWORD`: Contraseña del keystore
   - `KEY_ALIAS`: Alias de la clave
   - `KEY_PASSWORD`: Contraseña de la clave
3. Ejecutar build: `../scripts/build.sh comerciales`

## Credenciales de prueba
- Email: `comercial@manoprotect.com`
- Password: `Comercial2025!`

## API Base
- Producción: `https://www.manoprotect.com/api/gestion`
- Preview: `https://crm-dashboard-213.preview.emergentagent.com/api/gestion`
