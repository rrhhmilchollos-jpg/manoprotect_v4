# Diagnóstico: Pantalla en Blanco en admin.manoprotect.com

## Estado del Backend (Este proyecto - manoprotect.com)
**VERIFICADO: Todos los endpoints funcionan correctamente**

| Endpoint | Estado | Respuesta |
|----------|--------|-----------|
| `POST /api/enterprise/auth/login` | ✅ OK | Devuelve session_token |
| `GET /api/enterprise/dashboard/stats` | ✅ OK | KPIs del dashboard |
| `GET /api/enterprise/dashboard/charts` | ✅ OK | Datos de gráficos |
| `GET /api/enterprise/employees` | ✅ OK | Lista de empleados |
| `GET /api/enterprise/alerts` | ✅ OK | Alertas de seguridad |

## El Problema
La pantalla en blanco ocurre **después del login**, lo que indica que:
1. El login funciona (el backend responde correctamente)
2. La cookie de sesión se establece
3. El frontend de `admin.manoprotect.com` NO puede renderizar el dashboard

## Pasos para Diagnosticar

### Paso 1: Abrir la Consola del Navegador
1. Ir a `https://admin.manoprotect.com`
2. Presionar **F12** para abrir DevTools
3. Ir a la pestaña **"Console"**
4. Iniciar sesión con `ceo@manoprotect.com` / `19862210Des`
5. **Capturar screenshot de los errores en rojo**

### Paso 2: Verificar la Pestaña Network
1. En DevTools, ir a la pestaña **"Network"**
2. Marcar **"Preserve log"**
3. Iniciar sesión
4. Buscar llamadas fallidas (en rojo) a:
   - `/api/enterprise/dashboard/stats`
   - `/api/enterprise/dashboard/charts`
   - `/api/enterprise/employees`
5. **Capturar screenshot de las llamadas fallidas**

## Posibles Causas

### 1. Error de CORS en Producción
Si ves errores como:
```
Access to fetch at 'https://manoprotect.com/api/...' from origin 'https://admin.manoprotect.com' has been blocked by CORS policy
```
**Solución**: El proyecto manoprotect.com necesita ser **desplegado** con la última configuración CORS que incluye `admin.manoprotect.com`.

### 2. La API apunta a localhost o URL incorrecta
Si las llamadas de Network muestran:
```
Request URL: http://localhost:8001/api/...
```
**Solución**: En el proyecto `admin.manoprotect.com`, verificar que `REACT_APP_BACKEND_URL` apunta a `https://manoprotect.com`.

### 3. Error de JavaScript en el Frontend
Si hay errores como:
```
TypeError: Cannot read property 'xxx' of undefined
Uncaught ReferenceError: xxx is not defined
ChunkLoadError: Loading chunk xxx failed
```
**Solución**: 
- Limpiar cache del navegador (Ctrl+Shift+Delete)
- Rebuildar el frontend del proyecto admin.manoprotect.com

### 4. Cookie de sesión no se establece
Si el login funciona pero las llamadas posteriores fallan con `401 Unauthorized`:
**Solución**: Verificar que:
- La cookie `enterprise_session` se guarda (ver pestaña Application > Cookies)
- El dominio de la cookie es `.manoprotect.com` (con punto al inicio)

## Verificación del Backend desde Producción

Ejecutar estos comandos para verificar que el backend de producción funciona:

```bash
# 1. Probar login
curl -s -X POST "https://manoprotect.com/api/enterprise/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ceo@manoprotect.com","password":"19862210Des"}'

# 2. Probar dashboard (usar el session_token del paso anterior)
curl -s -X GET "https://manoprotect.com/api/enterprise/dashboard/stats" \
  -H "Cookie: enterprise_session=TU_SESSION_TOKEN"
```

## Siguiente Paso Crítico

**IMPORTANTE**: El proyecto `manoprotect.com` (este) debe ser **desplegado** para que los cambios de CORS y cookies cross-domain funcionen en producción.

Después del deploy, ejecutar el comando `init-ceo` para crear el usuario CEO en la base de datos de producción:

```bash
curl -X POST "https://manoprotect.com/api/enterprise/auth/init-ceo" \
  -H "Content-Type: application/json" \
  -d '{"secret_key":"MANOPROTECT_INIT_2026_SECURE","password":"19862210Des"}'
```
