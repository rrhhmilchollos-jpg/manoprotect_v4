# Configuración de Producción - ManoProtect

## Estado Actual ✅

### Backend (manoprotect.com)
Todo configurado y listo para deploy:

| Componente | Estado | Configuración |
|------------|--------|---------------|
| **CORS** | ✅ | `https://admin.manoprotect.com` incluido |
| **CORS Desktop** | ✅ | `file://` y `null` para Electron |
| **Rutas Enterprise** | ✅ | Importadas en server.py |
| **Cookies Cross-Domain** | ✅ | `domain=".manoprotect.com"` |
| **Base de Datos** | ✅ | MongoDB local (`test_database`) |

### Credenciales de Empleado
- **Email:** `ceo@manoprotect.com`
- **Password:** `19862210Des`
- **Rol:** `super_admin`
- **Status:** `active`

---

## Arquitectura de Conexión

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCCIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │ manoprotect.com │         │   admin.manoprotect.com     │   │
│  │                 │         │                             │   │
│  │ Frontend React  │         │   Frontend React (Portal)   │   │
│  │ + Backend API   │◄────────│   Solo Frontend             │   │
│  │ + MongoDB       │  API    │   REACT_APP_BACKEND_URL=    │   │
│  │                 │  Calls  │   https://manoprotect.com   │   │
│  └────────┬────────┘         └─────────────────────────────┘   │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │    MongoDB      │                                            │
│  │  (test_database)│                                            │
│  │                 │                                            │
│  │ - users         │                                            │
│  │ - enterprise_   │                                            │
│  │   employees     │                                            │
│  │ - sos_alerts    │                                            │
│  │ - payments      │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ Desktop App     │                                            │
│  │ (Electron)      │────────► https://manoprotect.com/api/*    │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Para el Proyecto admin.manoprotect.com

### Variables de Entorno (frontend/.env)
```env
REACT_APP_BACKEND_URL=https://manoprotect.com
```

### NO necesita:
- ❌ Backend propio (usa el de manoprotect.com)
- ❌ MongoDB propio (usa el de manoprotect.com)
- ❌ Variables de base de datos

---

## Pasos para Deploy

### 1. Este proyecto (manoprotect.com)
```bash
# Ya configurado - Solo hacer deploy
Save to GitHub → Deploy
```

### 2. Proyecto admin.manoprotect.com
```bash
# Verificar que frontend/.env tiene:
REACT_APP_BACKEND_URL=https://manoprotect.com

# Parar el backend (no lo necesita)
sudo supervisorctl stop backend

# Deploy
Save to GitHub → Deploy
```

### 3. Verificación Post-Deploy
```bash
# Test desde admin.manoprotect.com
curl -X POST https://manoprotect.com/api/enterprise/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://admin.manoprotect.com" \
  -d '{"email":"ceo@manoprotect.com","password":"19862210Des"}'

# Respuesta esperada:
# {"success":true,"requires_2fa":false,"employee_id":"emp_superadmin001",...}
```

---

## Endpoints API Enterprise

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/enterprise/auth/login` | POST | Login empleados |
| `/api/enterprise/auth/login-2fa` | POST | Verificación 2FA |
| `/api/enterprise/auth/forgot-password` | POST | Recuperar contraseña |
| `/api/enterprise/dashboard/stats` | GET | Estadísticas |
| `/api/enterprise/sos/*` | GET | Alertas SOS |
| `/api/enterprise/users` | GET | Lista usuarios |
| `/api/enterprise/payments` | GET | Lista pagos |
| `/api/enterprise/admin/payments/:id/refund` | POST | Reembolso |

---

## Checklist Pre-Deploy

### manoprotect.com
- [x] CORS incluye admin.manoprotect.com
- [x] CORS incluye file:// para Electron
- [x] Rutas enterprise importadas
- [x] Cookies con domain=".manoprotect.com"
- [x] Usuario CEO con contraseña actualizada

### admin.manoprotect.com
- [ ] REACT_APP_BACKEND_URL=https://manoprotect.com
- [ ] Backend detenido (no necesario)
- [ ] DNS configurado en IONOS

### App Desktop
- [x] Configurada para https://manoprotect.com
- [x] Ojito ver/ocultar contraseña
- [x] Recuperar contraseña por email

---

Fecha: 16 Febrero 2026
