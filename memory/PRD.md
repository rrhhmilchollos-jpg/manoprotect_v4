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

## Punto de Envío SEUR
- **ID Pick-up**: ES29153
- **Dirección**: Calle Sor Isabel de Villena 82 bajo, 46819 Novelda, Valencia

## Estado del Sistema (Actualizado: 21 Enero 2026)

### ✅ COMPLETADO

#### Dashboard Cliente Estilo CaixaBank (NUEVO)
- Nuevo diseño profesional en `ManoBankDashboard.js`
- Sidebar con: Inicio, Mis Cuentas, Mis Tarjetas, Pagos, Movimientos, Mis Productos, Ofertas, Ajustes
- Pagos unificado: Transferencias, Bizum, Programadas
- Sección de productos contratados (Hipotecas, Préstamos, Seguros)
- Ofertas de marketing (Renting, Telefonía, Seguros, Hipotecas)
- Acciones rápidas: Transferir, Bizum, Recibos
- Posición Global con resumen financiero
- Modal de detalles de tarjeta con PIN/CVV

#### Sistema Bancario Base
- Portal de clientes ManoBank (`/manobank`) - REDISEÑADO
- Portal de empleados (`/banco`, `/banco/sistema`)
- Sistema de cuentas corrientes, ahorro, nómina, empresa
- Transferencias internas (Normal, Inmediata, Programada)
- Generación de contratos PDF

#### Tarjetas Bancarias
- Emisión de múltiples tipos: VISA, Mastercard, Gold, Platinum
- Número de 16 dígitos, CVV, PIN de 4 dígitos
- Fecha de validez (5 años)
- Modal de detalles completos para el cliente
- Diseños elegantes con gradientes

#### Sistema de Envío de Tarjetas (SEUR)
- Tab "Envíos" en el portal de empleados
- Gestión de estados: Pendiente, Enviado, Entregado
- Tracking number generado (MOCKEADO - no conecta con API real SEUR)
- Notificaciones SMS a clientes via Twilio

#### Login Seguro
- Página `/login-seguro` con diseño profesional tipo BBVA
- Indicadores de seguridad visual
- Opción de login con Google

#### Solicitud de Cuenta Online
- Página pública `/abrir-cuenta`
- Formulario multi-paso (datos personales, dirección, ocupación)
- Integración con videoverificación KYC
- Sin necesidad de registro previo

#### Sistema KYC (Videoverificación)
- Backend con Zoom Video SDK configurado
- Generación de tokens JWT para videollamadas
- Sistema anti-fraude (detecta clientes duplicados)
- Componente cliente `KYCVideoVerification.js`
- Panel de agente en `BancoSistema.js` con cola de espera

#### Integraciones
- ✅ Twilio SMS (activo)
- ✅ Zoom Video SDK (configurado)
- ✅ Stripe
- ✅ Firebase
- ✅ ReportLab (PDFs)

### 📋 PENDIENTE

#### P0 - Crítico
- Test E2E completo del flujo KYC: conectar `/abrir-cuenta` con `KYCVideoVerification.js`
- Test del flujo de envío de tarjetas con SEUR

#### P1 - Importante
- Integración BaaS (Swan) para transacciones reales - requiere registro del usuario
- Implementar 2FA real en login seguro usando Twilio SMS

#### P2 - Futuro
- Grabación automática de videollamadas KYC
- App móvil (compilación con EAS fallando)
- Conectar con API real de SEUR para tracking
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
