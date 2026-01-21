# ManoBank - Sistema Bancario Digital Completo

## Problema Original
Crear **ManoBank**, un sistema bancario digital completo estilo BBVA con portal de clientes y portal de empleados separado.

## Estado del Proyecto - Actualizado

### ✅ COMPLETADO HOY

#### 🔧 Optimización de Base de Datos (Bloqueador de Despliegue)
- Añadida paginación a consultas de cuentas (`/api/manobank/admin/accounts`)
- Añadida paginación a consultas de tarjetas (`/api/manobank/admin/cards`)
- Límite máximo de 100 documentos por consulta

#### 🆕 Sistema de Videoverificación KYC con Zoom Video SDK
**Backend:**
- Servicio Zoom Video SDK: `/app/backend/services/zoom_video_sdk.py`
- Rutas KYC: `/app/backend/routes/kyc_video_routes.py`
- Generación de tokens JWT para videollamadas
- Sistema anti-fraude automático (verifica si cliente ya existe)
- Endpoints para cliente y agente

**Frontend:**
- Componente cliente: `/app/frontend/src/pages/KYCVideoVerification.js`
- Panel del agente integrado en `/app/frontend/src/pages/BancoSistema.js`
- Flujo completo: Permisos → Espera → Videollamada → Resultado

**Credenciales Zoom configuradas:**
- SDK Key: ✅
- SDK Secret: ✅
- API Key: ✅
- API Secret: ✅

### ✅ COMPLETADO ANTERIORMENTE

- Portal de empleados ManoBank (`/banco`)
- Portal de clientes estilo BBVA (`/manobank`)
- Sistema de apertura de cuentas con PDF de contrato
- Integración Twilio SMS
- Sistema de préstamos completo
- Emisión de tarjetas (6 tipos)
- Role-Based Access Control

### 📋 PENDIENTE

#### P0 - Crítico
- **Integrar componente KYC en formulario de solicitud online**: El componente `KYCVideoVerification.js` está creado pero falta integrarlo en el flujo de solicitud de cuenta pública

#### P1 - Importante  
- Implementar UI para bloquear/desbloquear cuentas
- Tabla de gestión de envío de tarjetas físicas
- Integración Open Banking / BaaS para transferencias reales

#### P2 - Futuro
- App móvil WebView y compilación iOS
- Refactorización del backend

## Arquitectura

```
/app/
├── backend/
│   ├── routes/
│   │   ├── kyc_video_routes.py    # NUEVO: Rutas videoverificación
│   │   ├── manobank_admin_routes.py
│   │   ├── manobank_routes.py
│   │   └── sms_routes.py
│   ├── services/
│   │   ├── zoom_video_sdk.py      # NUEVO: Servicio Zoom
│   │   ├── contract_generator.py
│   │   └── twilio_sms.py
│   └── server.py
└── frontend/
    └── src/
        └── pages/
            ├── KYCVideoVerification.js  # NUEVO: Componente cliente
            ├── BancoSistema.js          # MODIFICADO: Panel agente KYC
            └── ManoBank.js
```

## API Endpoints KYC Video

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/kyc/config-status` | Estado de configuración Zoom |
| POST | `/api/kyc/customer/initiate` | Cliente inicia sesión KYC |
| POST | `/api/kyc/customer/joined/{id}` | Marca cliente como conectado |
| GET | `/api/kyc/customer/session-status/{id}` | Polling estado sesión |
| GET | `/api/kyc/agent/pending-sessions` | Sesiones esperando agente |
| POST | `/api/kyc/agent/join` | Agente se une a sesión |
| POST | `/api/kyc/agent/complete-verification` | Completar verificación |
| POST | `/api/kyc/agent/end-session/{id}` | Finalizar sesión |

## Credenciales de Test

| Rol | Email | Password |
|-----|-------|----------|
| Director/Superadmin | rrhh.milchollos@gmail.com | ManoAdmin2025! |

## Integraciones Activas

- ✅ Stripe (Pagos)
- ✅ Firebase
- ✅ Twilio SMS
- ✅ Zoom Video SDK (NUEVO)
- ⏸️ Nordigen/Open Banking (bloqueado)
