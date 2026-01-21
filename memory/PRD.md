# ManoBank S.A. - PRD (Product Requirements Document)

## Estado: Producción Lista ✅
**Última actualización:** 21 Enero 2026

---

## 1. Descripción del Producto

**ManoBank** es un sistema bancario digital completo que incluye:
- Portal de clientes para operaciones bancarias
- Portal de empleados para gestión administrativa
- Sistema de detección de fraude en tiempo real con Firebase Cloud
- Verificación KYC con video llamada (Zoom SDK)
- Sistema de notificaciones (Twilio SMS)

---

## 2. Funcionalidades Implementadas ✅

### 2.1 Portal de Clientes
- ✅ Dashboard estilo CaixaBank con balance, tarjetas y operaciones
- ✅ Transferencias entre cuentas
- ✅ Consulta de movimientos
- ✅ Gestión de tarjetas virtuales/físicas
- ✅ Solicitud de préstamos

### 2.2 Portal de Empleados (/banco)
- ✅ Login con 2FA obligatorio (SMS real via Twilio)
- ✅ Dashboard con estadísticas del banco
- ✅ Gestión de solicitudes de cuenta
- ✅ Verificación KYC con video (Zoom SDK)
- ✅ Gestión de préstamos (aprobar/rechazar)
- ✅ Gestión de empleados con múltiples roles
- ✅ Alertas de fraude en tiempo real
- ✅ Poderes completos para Director General

### 2.3 Sistema de Detección de Fraude (P0 - Completado ✅)
- ✅ **Firebase Firestore** integrado para base de datos en la nube
- ✅ Página pública `/verificar-estafa` para consultar estafas
- ✅ Algoritmo automático de detección de patrones sospechosos
- ✅ Análisis de transacciones en tiempo real
- ✅ Análisis de intentos de login
- ✅ Reportes públicos de fraude
- ✅ Alertas automáticas para empleados
- ✅ Fallback a MongoDB si Firebase no está configurado

### 2.4 Seguridad
- ✅ Rate limiting para prevenir ataques brute-force
- ✅ Validación de fortaleza de contraseñas
- ✅ Logs de auditoría de seguridad
- ✅ Recuperación de contraseña por email
- ✅ 2FA obligatorio para empleados

### 2.5 Marketing y Documentos
- ✅ Landing page promocional `/manobank-promo`
- ✅ Business Plan para inversores
- ✅ Pitch Deck para presentaciones
- ✅ One-Pager ejecutivo
- ✅ Campaña Google Ads

---

## 3. Arquitectura Técnica

### Backend (FastAPI + Python)
```
/app/backend/
├── routes/
│   ├── auth_routes.py          # Autenticación, 2FA, rate limiting
│   ├── manobank_routes.py      # APIs públicas del banco
│   └── manobank_admin_routes.py # APIs administrativas
├── services/
│   ├── firebase_fraud_service.py # Firebase Firestore + Algoritmo fraude
│   └── security_service.py     # Rate limiting y seguridad
└── secrets/
    └── firebase-admin.json     # Credenciales Firebase
```

### Frontend (React)
```
/app/frontend/src/
├── pages/
│   ├── ManoBankDashboard.js    # Dashboard cliente
│   ├── BancoSistema.js         # Portal empleados (2500+ líneas)
│   ├── BancoEmpleados.js       # Login empleados con 2FA
│   ├── VerificarEstafa.js      # Verificador público de fraude
│   └── SolicitarCuenta.js      # Apertura de cuenta con KYC
└── components/ui/              # Shadcn components
```

### Base de Datos
- **MongoDB**: Datos principales (usuarios, cuentas, transacciones)
- **Firebase Firestore**: Base de datos de fraude en tiempo real (cloud)

---

## 4. Integraciones de Terceros

| Servicio | Estado | Uso |
|----------|--------|-----|
| Firebase Firestore | ✅ Configurado (requiere habilitar DB) | Detección de fraude |
| Zoom Video SDK | ✅ Integrado | Video KYC |
| Twilio | ✅ Integrado | SMS 2FA |
| ReportLab | ✅ Integrado | Generación de PDFs |

---

## 5. Tareas Pendientes (Backlog)

### P1 - Alta Prioridad
- [ ] **BaaS Integration (Swan)**: Conectar con proveedor bancario para transacciones reales. Usuario debe registrarse en Swan.
- [ ] **Test flujo de envío de tarjetas (SEUR)**: E2E test del proceso de shipping.

### P2 - Media Prioridad
- [ ] **2FA para clientes**: Opcional para el portal de clientes.
- [ ] **Grabación de llamadas KYC**: Para compliance.
- [ ] **Refactoring BancoSistema.js**: Dividir archivo de 2500+ líneas.

### P3 - Baja Prioridad
- [ ] **App móvil**: Compilación con EAS build fallando.

---

## 6. Credenciales de Test

| Usuario | Email | Password | Notas |
|---------|-------|----------|-------|
| Director General | rrhh.milchollos@gmail.com | ManoAdmin2025! | Requiere 2FA (usar código de prueba) |

---

## 7. URLs Importantes

- **Landing**: `/`
- **Dashboard Cliente**: `/dashboard`
- **Login Empleados**: `/banco`
- **Verificador Estafas**: `/verificar-estafa`
- **Abrir Cuenta**: `/abrir-cuenta`
- **Recuperar Password**: `/recuperar-password`
- **Promo ManoBank**: `/manobank-promo`

---

## 8. Firebase Setup (ACCIÓN REQUERIDA)

El usuario necesita habilitar Firestore en Firebase Console:
1. Ir a: https://console.firebase.google.com/project/manoprotect-f889b/firestore
2. Hacer clic en "Create Database"
3. Seleccionar modo "Production" o "Test"
4. Elegir ubicación (recomendado: europe-west1)

Sin esto, el sistema usa MongoDB como fallback para la base de datos de fraude.

---

## Changelog

### 21 Enero 2026
- ✅ Implementado sistema de detección de fraude con Firebase Firestore
- ✅ Creado algoritmo automático de detección de patrones sospechosos
- ✅ Añadida UI para selección múltiple de roles para empleados
- ✅ Añadida ruta `/verificar-estafa` al router
- ✅ 13/13 tests pasados en iteration_16
