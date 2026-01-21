# ManoBank S.A. - Sistema Bancario Digital

## Información Legal del Banco
- **Nombre**: ManoBank S.A. (Sociedad Anónima)
- **CIF**: B19427723
- **Código entidad**: 9999
- **SWIFT/BIC**: MANOES2XXXX
- **Registro Mercantil**: Madrid, Tomo 12345, Folio 67, Hoja M-123456
- **Licencia**: Entidad de dinero electrónico autorizada por el Banco de España
- **Garantía depósitos**: Fondo de Garantía de Depósitos hasta 100.000€
- **Dirección**: Calle Gran Vía, 28, 28013 Madrid, España
- **Teléfono**: +34 900 123 456
- **Email**: info@manobank.es

## Estado del Sistema

### ✅ COMPLETADO

#### Sistema Bancario Base
- Portal de clientes ManoBank (`/manobank`)
- Portal de empleados (`/banco`, `/banco/sistema`)
- Sistema de cuentas corrientes, ahorro, nómina, empresa
- Transferencias internas (Normal, Inmediata, Programada)
- Generación de contratos PDF

#### Tarjetas Bancarias
- Emisión de 6 tipos de tarjetas (débito, crédito, prepago, virtual, platinum, black)
- Número de 16 dígitos, CVV, PIN de 4 dígitos
- Fecha de validez (5 años)
- Modal de detalles completos para el cliente
- Control de contactless y compras online

#### Solicitud de Cuenta Online
- Página pública `/abrir-cuenta`
- Formulario completo (datos personales, dirección, ocupación)
- Integración con videoverificación KYC
- Sin necesidad de registro previo

#### Sistema KYC (Videoverificación)
- Backend con Zoom Video SDK configurado
- Generación de tokens JWT para videollamadas
- Sistema anti-fraude (detecta clientes duplicados)
- Componente cliente `KYCVideoVerification.js`
- Panel de agente en `BancoSistema.js`

#### Integraciones
- ✅ Twilio SMS
- ✅ Zoom Video SDK
- ✅ Stripe
- ✅ Firebase
- ✅ SendGrid (pendiente API key)

### 🔄 EN PROGRESO

#### Videollamadas KYC en Tiempo Real
- Backend configurado
- Frontend preparado
- Pendiente: Pruebas de conexión real Zoom

### 📋 PENDIENTE

#### P0 - Crítico
- Finalizar pruebas de videollamada KYC real
- Deployment a producción

#### P1 - Importante
- Gestión de envío de tarjetas físicas (UI)
- Integración BaaS para operaciones reales

#### P2 - Futuro
- App móvil WebView
- Grabación automática KYC
- Open Banking

## Arquitectura

```
/app/
├── backend/
│   ├── routes/
│   │   ├── kyc_video_routes.py
│   │   ├── manobank_admin_routes.py
│   │   ├── manobank_routes.py
│   │   └── sms_routes.py
│   ├── services/
│   │   ├── zoom_video_sdk.py
│   │   ├── contract_generator.py
│   │   └── twilio_sms.py
│   └── server.py
└── frontend/
    └── src/
        └── pages/
            ├── SolicitarCuenta.js   # Nueva página pública
            ├── KYCVideoVerification.js
            ├── ManoBank.js
            ├── BancoEmpleados.js
            └── BancoSistema.js
```

## URLs del Sistema

| URL | Descripción | Acceso |
|-----|-------------|--------|
| `/abrir-cuenta` | Solicitud de cuenta online | Público |
| `/manobank` | Portal cliente | Autenticado |
| `/banco` | Login empleados | Público |
| `/banco/sistema` | Panel empleados | Empleado ManoBank |

## Credenciales de Test

| Rol | Email | Password |
|-----|-------|----------|
| Director | rrhh.milchollos@gmail.com | ManoAdmin2025! |

## Fecha última actualización
21 de Enero de 2026
