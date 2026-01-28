# ManoBank & ManoProtect - Product Requirements Document

## Última Actualización: 28 Enero 2026

## Problema Original
Construir ManoBank (banca digital) y ManoProtect (protección digital) como servicios separados con flujos de registro distintos, diseños diferentes y funcionalidades específicas.

## Arquitectura Actual

```
/app/
├── backend/routes/
│   ├── manobank_routes.py        // Registro clientes, depósitos, cuentas, recuperar password
│   ├── manobank_admin_routes.py  // Gestión empleados, aprobación KYC
│   └── auth_routes.py            // Autenticación
├── frontend/src/
│   ├── pages/
│   │   ├── ManoBankRegistro.js        // Registro estilo BBVA (5 pasos, AZUL)
│   │   ├── ManoProtectRegistro.js     // Registro con planes (2 pasos, PÚRPURA)
│   │   ├── RecuperarPasswordManoBank.js // Recuperar contraseña + verificación tarjeta
│   │   ├── LoginSeguro.js              // Login 3 tabs (Email/DNI/Registro)
│   │   ├── ManoBankDashboard.js        // Dashboard cliente + modal depósito
│   │   ├── LandingPage.js              // Landing ManoProtect + testimonios + SEO
│   │   └── LandingPromo.js             // Landing ManoBank + SEO
│   └── components/
│       ├── FloatingWhatsApp.js   // Botón WhatsApp flotante permanente
│       ├── UrgencyBanner.js      // Banner de oferta/urgencia
│       └── SEO.js                // Meta tags SEO + JSON-LD
├── public/
│   ├── sitemap.xml               // Sitemap para SEO
│   └── robots.txt                // Robots.txt para SEO
```

## ✅ Funcionalidades Completadas

### Registro y Login
- [x] Registro BBVA-style para ManoBank (5 pasos, videoverificación)
- [x] Registro ManoProtect separado (2 pasos, selección de planes)
- [x] Login con DNI/NIE + contraseña temporal
- [x] Cambio de contraseña obligatorio en primer login
- [x] **NUEVO: Recuperar contraseña con verificación de tarjeta**

### Sistema de Credenciales
- [x] Contraseñas temporales para nuevos clientes (SMS)
- [x] Contraseñas temporales para nuevos empleados (SMS)
- [x] Validez 24 horas
- [x] Forzar cambio en primer acceso

### Depósito Inicial €25
- [x] Modal automático para cuentas pendientes
- [x] Integración con Stripe Checkout
- [x] Activación de cuenta tras pago

### Conversión y SEO
- [x] Banner de urgencia con ofertas
- [x] WhatsApp Business flotante (601 510 950)
- [x] Testimonios de clientes
- [x] Badges de confianza (Banco de España, RGPD, etc.)
- [x] Meta tags SEO (Open Graph, Twitter Cards)
- [x] Schema.org JSON-LD
- [x] sitemap.xml y robots.txt

## 📋 Credenciales de Prueba

### Director General
- Email: rrhh.milchollos@gmail.com
- Password: 19862210Des

### Empleados
| Nombre | Email | Contraseña |
|--------|-------|------------|
| Ana García | ana.garcia@manobank.es | bm6TRCzJQH |
| Juan Martínez | juan.martinez@manobank.es | zHWmD6MJnG |
| Laura Sánchez | laura.sanchez@manobank.es | in9zdl1x7X |
| Carlos López | carlos.lopez@manobank.es | gH163tRjNX |

## 📱 Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing ManoProtect |
| `/landing-manobank` | Landing ManoBank |
| `/registro` | Registro ManoProtect |
| `/manobank/registro` | Registro ManoBank (BBVA style) |
| `/login-seguro` | Login clientes (3 tabs) |
| `/manobank/recuperar-password` | Recuperar contraseña con tarjeta |
| `/banco` | Login empleados |
| `/banco/sistema` | Portal empleados |

## 🔗 APIs Importantes

### Recuperación de Contraseña
- `POST /api/manobank/recuperar-password/iniciar` - Inicia proceso
- `POST /api/manobank/recuperar-password/verificar-tarjeta` - Verifica con tarjeta
- `POST /api/manobank/recuperar-password/verificar-sms` - Verifica con SMS

### Registro y Login
- `POST /api/manobank/registro/nuevo-cliente` - Nuevo cliente
- `POST /api/manobank/registro/login-temporal` - Login DNI + temporal
- `POST /api/manobank/registro/cambiar-password` - Cambiar temporal

### Depósito
- `POST /api/manobank/deposito-inicial/crear-sesion` - Crear sesión Stripe
- `POST /api/manobank/deposito-inicial/confirmar` - Confirmar pago

## 🟡 Tareas Pendientes

### Backlog
- [ ] Apps móviles (Android APK / iOS)
- [ ] 2FA en login de clientes
- [ ] Certificado de Titularidad PDF
- [ ] Más optimizaciones de conversión

## Integraciones
- **Stripe** - Pagos y depósito inicial
- **Twilio** - SMS (fallback a debug si no configurado)
- **Zoom Video SDK** - Videoverificación KYC

## Colecciones MongoDB
- `manobank_customer_registrations`
- `manobank_accounts`
- `manobank_customers`
- `manobank_employees`
- `manobank_password_recovery` (NUEVA)
- `manobank_payment_sessions`
- `manobank_transactions`
- `manobank_audit_log`
