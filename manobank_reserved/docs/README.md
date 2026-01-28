# ManoBank - Código Reservado

## Estado: RESERVADO
Este código está reservado para cuando el dominio ManoBank.es esté configurado.

## Fecha de reserva: 28 de enero de 2026

## Contenido reservado (53 archivos)

### Frontend (React) - /frontend/pages/
- `BancoEmpleados.js` - Portal de login para empleados del banco
- `BancoSistema.js` - Dashboard completo del sistema bancario (empleados)
- `LoginSeguro.js` - Login seguro para clientes con 2FA
- `ManoBank.js` - Vista clásica del banco
- `ManoBankDashboard.js` - Dashboard del cliente bancario
- `ManoBankRegistro.js` - Registro estilo BBVA para nuevos clientes
- `RecuperarPasswordManoBank.js` - Recuperación de contraseña con verificación de tarjeta
- `LandingPromo.js` - Landing page promocional para ManoBank
- `SolicitarCuenta.js` - Formulario para solicitar cuenta bancaria
- `KYCVideoVerification.js` - Verificación por video para KYC

### Backend (FastAPI) - /backend/routes/
- `manobank_routes.py` - Rutas de cliente: login, registro, depósito, 2FA, PDF certificado
- `manobank_admin_routes.py` - Rutas de empleados: gestión de clientes, KYC, préstamos, tarjetas
- `kyc_video_routes.py` - Rutas de verificación KYC por video
- `banking_core_routes.py` - Rutas del core bancario
- `compliance_routes.py` - Rutas de compliance y auditoría
- `sms_routes.py` - Rutas de SMS para notificaciones bancarias

### Servicios - /backend/services/
- `card_shipping.py` - Servicio de envío de tarjetas físicas
- `contract_generator.py` - Generador de contratos bancarios PDF
- `compliance_service.py` - Servicio de compliance y auditoría
- `zoom_video_sdk.py` - Servicio de video SDK para KYC

### Compliance y Ledger - /backend/
- `/compliance/` - Servicios de AML, KYC, Reporting
- `/ledger/` - Servicio de libro mayor bancario
- `/policies/` - Políticas de AML, KYC, Riesgos, etc.

### Tests - /backend/tests/
- `test_manobank_registration_iteration_20.py`
- `test_manobank_admin_iteration_19.py`
- `test_employee_portal_iteration_21.py`
- `test_banking_core_iteration_18.py`
- `test_iteration_17.py`

## Funcionalidades implementadas
1. ✅ Registro de clientes estilo BBVA (multistep)
2. ✅ Login con credenciales temporales (DNI + password temporal)
3. ✅ Cambio de contraseña obligatorio en primer login
4. ✅ Depósito inicial obligatorio de €25 (Stripe)
5. ✅ 2FA para login de clientes
6. ✅ Certificado de titularidad en PDF
7. ✅ Recuperación de contraseña con verificación de tarjeta
8. ✅ Portal de empleados con 2FA
9. ✅ Dashboard administrativo completo
10. ✅ Gestión de solicitudes de apertura (KYC)

## Credenciales de prueba
- **Director General:** rrhh.milchollos@gmail.com / 19862210Des
- **Subdirector:** msolassanchis@gmail.com / Mano2024!

## Para reactivar
1. Configurar dominio ManoBank.es
2. Crear correos corporativos (@manobank.es)
3. Mover archivos de vuelta a sus ubicaciones originales
4. Descomentar rutas en `/app/backend/server.py`
5. Agregar imports en `/app/frontend/src/App.js`
6. Actualizar CORS para incluir ManoBank.es
7. Crear base de datos separada si es necesario

## Colecciones MongoDB usadas
- `manobank_registrations` - Solicitudes de apertura de cuenta
- `manobank_accounts` - Cuentas bancarias
- `manobank_employees` - Empleados del banco
- `manobank_transactions` - Transacciones
- `manobank_cards` - Tarjetas
- `manobank_loans` - Préstamos

## Notas importantes
- Las rutas backend estaban en el prefijo `/api/manobank/*`
- Las rutas admin estaban en `/api/manobank/admin/*`
- Twilio SMS está en modo mock
- Stripe usa claves de test
