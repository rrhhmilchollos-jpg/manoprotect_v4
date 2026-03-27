# Conexión del Portal admin.manoprotectt.com

## Resumen
Este documento explica cómo conectar el frontend del portal de empleados en `admin.manoprotectt.com` con el backend de ManoProtect.

## Arquitectura

```
┌─────────────────────────────────────┐     ┌──────────────────────────────────┐
│  admin.manoprotectt.com              │     │  api.manoprotectt.com / backend   │
│  (Proyecto Separado - Frontend)     │ ──► │  (Este Proyecto)                 │
│                                     │     │                                  │
│  - Login empleados ManoProtect      │     │  /api/enterprise/*               │
│  - Dashboard interno                │     │  - /auth/login                   │
│  - Gestión clientes                 │     │  - /employees                    │
│  - SOS en tiempo real               │     │  - /clients                      │
│  - Pagos/Reembolsos                 │     │  - /invites                      │
└─────────────────────────────────────┘     └──────────────────────────────────┘
```

## Configuración del Backend (YA COMPLETADO ✅)

### 1. CORS Configurado
El backend ya acepta requests desde `https://admin.manoprotectt.com`:
```python
allowed_origins = [
    ...
    "https://admin.manoprotectt.com",  # ✅ Ya configurado
    ...
]
```

### 2. Cookies Cross-Domain
El login ya está configurado para compartir cookies entre subdominios:
```python
response.set_cookie(
    key="enterprise_session",
    value=session_token,
    httponly=True,
    max_age=86400 * 7,
    samesite="none",      # Permite cross-site
    secure=True,          # Requiere HTTPS
    domain=".manoprotectt.com"  # Compartido entre subdominios
)
```

---

## Configuración del Frontend (admin.manoprotectt.com)

### Variable de Entorno Requerida
```env
REACT_APP_BACKEND_URL=https://api.manoprotectt.com
# O si usas el mismo dominio:
REACT_APP_BACKEND_URL=https://manoprotectt.com
```

### Endpoints API Disponibles

#### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/enterprise/auth/login` | Login (devuelve session_token) |
| POST | `/api/enterprise/auth/login-2fa` | Verificar código 2FA |
| POST | `/api/enterprise/auth/logout` | Cerrar sesión |
| GET | `/api/enterprise/auth/me` | Usuario actual |
| POST | `/api/enterprise/auth/forgot-password` | Recuperar contraseña |
| POST | `/api/enterprise/auth/reset-password` | Restablecer contraseña |

#### Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/dashboard/stats` | Estadísticas generales |
| GET | `/api/enterprise/dashboard/charts` | Datos para gráficas |

#### Empleados (Internos de ManoProtect)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/employees` | Listar empleados |
| GET | `/api/enterprise/employees/{id}` | Detalle empleado |
| POST | `/api/enterprise/employees` | Crear empleado |
| PUT | `/api/enterprise/employees/{id}` | Actualizar empleado |
| DELETE | `/api/enterprise/employees/{id}` | Eliminar empleado |
| PATCH | `/api/enterprise/employees/{id}/suspend` | Suspender |
| PATCH | `/api/enterprise/employees/{id}/activate` | Activar |

#### Invitaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/invites` | Listar invitaciones |
| POST | `/api/enterprise/invites` | Crear invitación |
| DELETE | `/api/enterprise/invites/{id}` | Eliminar invitación |
| GET | `/api/enterprise/invites/verify/{code}` | Verificar código (público) |
| POST | `/api/enterprise/register` | Registrar desde invitación |

#### Clientes (Usuarios de ManoProtect)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/clients` | Listar clientes |
| GET | `/api/enterprise/clients/{id}` | Detalle cliente con historial pagos |

#### SOS / Emergencias
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/sos` | Listar eventos SOS |
| GET | `/api/enterprise/sos/pending` | SOS pendientes (tiempo real) |
| GET | `/api/enterprise/sos/{id}` | Detalle SOS |
| POST | `/api/enterprise/sos/{id}/respond` | Responder a SOS |

#### Pedidos de Dispositivos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/device-orders` | Listar pedidos |
| PATCH | `/api/enterprise/device-orders/{id}` | Actualizar pedido |

#### Pagos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/payments` | Listar pagos |
| GET | `/api/enterprise/payments/summary` | Resumen financiero |
| GET | `/api/enterprise/admin/payments/{id}` | Buscar pago en Stripe |
| POST | `/api/enterprise/admin/payments/{id}/refund` | Procesar reembolso |

#### Alertas de Seguridad
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/alerts` | Listar alertas |
| PATCH | `/api/enterprise/alerts/{id}/review` | Revisar alerta |

#### Auditoría
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/audit-logs` | Logs de auditoría |

#### Portal de Empleados (Ausencias, Nóminas, etc.)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/enterprise/absences` | Listar ausencias |
| POST | `/api/enterprise/absences` | Solicitar ausencia |
| GET | `/api/enterprise/payslips` | Listar nóminas |
| GET | `/api/enterprise/documents` | Listar documentos |
| GET | `/api/enterprise/holidays` | Festivos |

---

## Ejemplo de Implementación del Login

```javascript
// admin.manoprotectt.com/src/services/api.js
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const enterpriseLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/api/enterprise/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANTE: para enviar/recibir cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Error de autenticación');
  }
  
  // Guardar session_token para requests autenticados
  localStorage.setItem('enterprise_session', data.session_token);
  
  return data;
};

// Para requests autenticados, incluir el header X-Session-Token
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('enterprise_session');
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Session-Token': token
    }
  });
};

// Ejemplo: obtener lista de empleados
export const getEmployees = async () => {
  const response = await fetchWithAuth('/api/enterprise/employees');
  return response.json();
};

// Ejemplo: obtener lista de clientes
export const getClients = async () => {
  const response = await fetchWithAuth('/api/enterprise/clients');
  return response.json();
};
```

---

## Credenciales de Prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| CEO | ceo@manoprotectt.com | 19862210Des | super_admin |

---

## Verificación con cURL

```bash
# 1. Login
curl -X POST "https://manoprotectt.com/api/enterprise/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ceo@manoprotectt.com","password":"19862210Des"}'

# Respuesta:
# {"success":true,"session_token":"abc123...","employee_id":"emp_xxx","name":"CEO ManoProtect","role":"super_admin"}

# 2. Obtener empleados (con token)
curl -X GET "https://manoprotectt.com/api/enterprise/employees" \
  -H "X-Session-Token: abc123..."

# 3. Obtener clientes
curl -X GET "https://manoprotectt.com/api/enterprise/clients" \
  -H "X-Session-Token: abc123..."
```

---

## Notas Importantes

1. **El backend ya está listo** - No se requieren cambios adicionales.

2. **HTTPS obligatorio** - Las cookies con `SameSite=None` requieren HTTPS.

3. **Autenticación dual** - El sistema soporta tanto cookies como header `X-Session-Token`.

4. **2FA opcional** - Si el empleado tiene 2FA habilitado, el login devolverá `requires_2fa: true`.

5. **Roles disponibles**:
   - `super_admin` - Acceso total
   - `admin` - Administrador
   - `director` - Director
   - `manager` - Manager
   - `operator` - Operador SOS
   - `employee` - Empleado básico

---

## Estado Actual del Backend

- ✅ Login funcional
- ✅ Gestión de empleados
- ✅ Gestión de clientes
- ✅ Sistema de invitaciones
- ✅ Dashboard con estadísticas
- ✅ SOS en tiempo real
- ✅ Pagos y reembolsos (Stripe)
- ✅ Auditoría completa
- ✅ CORS configurado para admin.manoprotectt.com
- ✅ Cookies cross-domain configuradas
