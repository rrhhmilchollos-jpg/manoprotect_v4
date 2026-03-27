# Configuración de Producción - ManoProtect

## Estado Actual ✅

### Backend (manoprotectt.com)
Todo configurado y listo para deploy:

| Componente | Estado | Configuración |
|------------|--------|---------------|
| **CORS** | ✅ | `https://admin.manoprotectt.com` incluido |
| **CORS Desktop** | ✅ | `file://` y `null` para Electron |
| **Rutas Enterprise** | ✅ | Importadas en server.py |
| **Cookies Cross-Domain** | ✅ | `domain=".manoprotectt.com"` |
| **Base de Datos** | ✅ | MongoDB local (`test_database`) |

### Credenciales de Empleado
- **Email:** `ceo@manoprotectt.com`
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
│  │ manoprotectt.com │         │   admin.manoprotectt.com     │   │
│  │                 │         │                             │   │
│  │ Frontend React  │         │   Frontend React (Portal)   │   │
│  │ + Backend API   │◄────────│   Solo Frontend             │   │
│  │ + MongoDB       │  API    │   REACT_APP_BACKEND_URL=    │   │
│  │                 │  Calls  │   https://manoprotectt.com   │   │
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
│  │ (Electron)      │────────► https://manoprotectt.com/api/*    │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Para el Proyecto admin.manoprotectt.com

### Variables de Entorno (frontend/.env)
```env
REACT_APP_BACKEND_URL=https://manoprotectt.com
```

### NO necesita:
- ❌ Backend propio (usa el de manoprotectt.com)
- ❌ MongoDB propio (usa el de manoprotectt.com)
- ❌ Variables de base de datos

---

## Pasos para Deploy

### 1. Este proyecto (manoprotectt.com)
```bash
# Ya configurado - Solo hacer deploy
Save to GitHub → Deploy
```

### 2. Proyecto admin.manoprotectt.com
```bash
# Verificar que frontend/.env tiene:
REACT_APP_BACKEND_URL=https://manoprotectt.com

# Parar el backend (no lo necesita)
sudo supervisorctl stop backend

# Deploy
Save to GitHub → Deploy
```

### 3. Verificación Post-Deploy
```bash
# Test desde admin.manoprotectt.com
curl -X POST https://manoprotectt.com/api/enterprise/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://admin.manoprotectt.com" \
  -d '{"email":"ceo@manoprotectt.com","password":"19862210Des"}'

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

### manoprotectt.com
- [x] CORS incluye admin.manoprotectt.com
- [x] CORS incluye file:// para Electron
- [x] Rutas enterprise importadas
- [x] Cookies con domain=".manoprotectt.com"
- [x] Usuario CEO con contraseña actualizada

### admin.manoprotectt.com
- [ ] REACT_APP_BACKEND_URL=https://manoprotectt.com
- [ ] Backend detenido (no necesario)
- [ ] DNS configurado en IONOS

### App Desktop
- [x] Configurada para https://manoprotectt.com
- [x] Ojito ver/ocultar contraseña
- [x] Recuperar contraseña por email

---

Fecha: 16 Febrero 2026
