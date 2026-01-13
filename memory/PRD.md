# MANO - Plataforma Integral de Protección contra Fraudes Digitales

## Product Requirements Document (PRD)

### Problema Original
MANO es una aplicación y sistema profesional en tiempo real que protege a personas, familias, empresas y entidades públicas frente a fraudes, estafas, suplantaciones y engaños digitales, actuando antes, durante y después del ataque.

### Segmentos de Usuario
- **Particulares:** Detección en tiempo real de Phishing, Smishing, Vishing en llamadas, SMS, WhatsApp y email
- **Personas Mayores:** Modo "Protección Familiar" con botones grandes, lenguaje simple y alertas automáticas
- **Familias:** Panel de seguimiento de amenazas a miembros protegidos
- **Empresas:** Protección corporativa contra fraude bancario y facturas falsas
- **Inversores:** Acceso verificado a documentación confidencial con CIF empresarial

### Modelo de Negocio
- **Freemium:** Plan básico gratuito
- **Premium:** Semanal €9.99, mensual €29.99, trimestral €74.99, anual €249.99
- **Familiar:** Mensual €49.99, trimestral €129.99, anual €399.99
- **Enterprise:** Precio personalizado
- **Garantía:** 15 días de devolución sin preguntas

---

## Estado Actual (Enero 2025)

### ✅ Completado

#### Sistema de Autenticación (NUEVO)
- [x] Login dual: Email/Password + Google OAuth (Emergent Auth)
- [x] Registro de usuarios con validación
- [x] Sesiones con cookies httpOnly seguras
- [x] Protección de rutas frontend

#### Sistema de Inversores (NUEVO)
- [x] Registro con validación de CIF español
- [x] Aprobación manual por administrador
- [x] Documentos protegidos solo para inversores aprobados
- [x] Panel admin para gestión de solicitudes

#### Frontend (React + Tailwind CSS)
- [x] Landing Page con botones login/register
- [x] Página de Login (Google + Email)
- [x] Página de Registro
- [x] Página de Registro de Inversores
- [x] Dashboard principal
- [x] Página de Precios con Stripe
- [x] Página de Descargas (protegida)
- [x] Modo Familiar, Contactos, Perfil, etc.

#### Backend (FastAPI + MongoDB)
- [x] API de análisis de amenazas con IA (GPT-4o)
- [x] Integración de Stripe para pagos
- [x] Sistema de autenticación completo
- [x] CRUD de contactos y SOS
- [x] Gestión de inversores

### Integraciones Activas
- **Stripe Payments:** emergentintegrations
- **OpenAI GPT-4o:** Análisis de amenazas
- **Google OAuth:** Emergent Auth
- **MongoDB:** Base de datos

---

## Arquitectura

```
/app/
├── backend/
│   ├── server.py           # API FastAPI (800+ líneas)
│   └── tests/              # Tests pytest
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js    # Gestión estado auth
│   │   └── pages/
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── InvestorRegister.js
│   │       ├── AuthCallback.js
│   │       └── ...
└── memory/
    └── PRD.md
```

---

## APIs Principales

### Autenticación
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/register` | POST | Registro email/password |
| `/api/auth/login` | POST | Login email/password |
| `/api/auth/google/session` | POST | Exchange Google OAuth |
| `/api/auth/me` | GET | Usuario actual |
| `/api/auth/logout` | POST | Cerrar sesión |

### Inversores
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/investors/register` | POST | Solicitar acceso inversor |
| `/api/investors/status/{cif}` | GET | Estado de solicitud |
| `/api/admin/investors` | GET | Listar solicitudes (admin) |
| `/api/admin/investors/{id}/approve` | POST | Aprobar inversor |
| `/api/investor/documents` | GET | Listar documentos |
| `/api/investor/download/{type}` | GET | Descargar documento |

### Core
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/analyze` | POST | Análisis de amenazas IA |
| `/api/create-checkout-session` | POST | Crear sesión Stripe |
| `/api/contacts` | GET/POST | Gestión contactos |
| `/api/sos` | POST | Alerta de emergencia |

---

## Tests
- **Backend:** 22/22 tests pasados (100%)
- **Frontend:** Todos los flujos verificados
- **Archivos:** `/app/tests/test_auth_investor.py`

---

## Próximos Pasos

### P1 - Alta Prioridad
- [ ] Dashboard empresarial avanzado
- [ ] Panel de administración familiar
- [ ] Notificaciones push en tiempo real

### P2 - Media Prioridad
- [ ] Generación de PDF de documentos
- [ ] Integración con WhatsApp Business
- [ ] Dashboard de métricas avanzado

### P3 - Baja Prioridad
- [ ] App móvil nativa
- [ ] Integración con bancos
- [ ] API pública para partners

---

## Notas Técnicas

### Autenticación
- Sesiones: MongoDB `user_sessions` collection
- Cookies: httpOnly, secure, sameSite=none
- Duración: 7 días
- Google OAuth: Emergent Auth (auth.emergentagent.com)

### Validación CIF
- Formato: Letra (A-W) + 7 dígitos + letra/dígito (0-9, A-J)
- Ejemplo válido: B12345678
- Validación en `InvestorRegisterRequest` model

### Roles de Usuario
- `user`: Usuario normal
- `investor`: Acceso a documentos confidenciales
- `admin`: Gestión de inversores y administración
