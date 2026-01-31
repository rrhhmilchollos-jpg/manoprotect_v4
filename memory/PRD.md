# Proyectos ManoProtect y ManoBank

## Última actualización: 31 de enero de 2026 (sesión 2)

---

## Arquitectura de Dos Proyectos

Los proyectos están completamente separados pero conectados mediante API de antifraude.

```
/app/
├── frontend/          # ManoProtect Frontend (puerto 3000)
├── backend/           # ManoProtect Backend (puerto 8001)
├── manoprotect-desktop/  # Desktop App para empleados (Electron)
└── manobank/          # ManoBank - Proyecto independiente
    ├── frontend/      # ManoBank Frontend (puerto 3001)
    └── backend/       # ManoBank Backend (puerto 8002)
```

---

# ManoProtect.com

## Información Legal
- **Empresa:** STARTBOOKING SL
- **CIF:** B19427723
- **App ID (Android):** com.manoprotect.app

## Descripción
Plataforma de protección contra fraudes y estafas digitales para familias españolas.

## Tecnología
- Frontend: React + TailwindCSS + Shadcn/UI + Capacitor 6 (Android)
- Backend: FastAPI (Python)
- Base de datos: MongoDB (test_database)
- Desktop App: Electron (Windows/Mac/Linux)

## Funcionalidades ✅
- Landing page con testimonios y badges de confianza
- Sistema de autenticación (email + Google OAuth)
- Dashboard de protección con alertas recientes
- Verificador de estafas público mejorado
- **Sistema de alertas por email (28 enero 2026)**
  - Suscripción gratuita a alertas de fraude
  - Broadcast de amenazas a todos los suscriptores
  - Historial de alertas enviadas
  - Integración con SendGrid
- **Panel Admin mejorado (28 enero 2026)**
  - Nueva pestaña "Alertas" para gestionar alertas de seguridad
  - Crear y enviar alertas masivas desde el panel
  - Ver estadísticas de suscriptores
- **✅ Bug Plan Familiar CORREGIDO (28 enero 2026)**
  - Eliminado archivo duplicado `/app/backend/routes/family.py`
  - Corregido `/app/backend/routes/__init__.py`
  - Endpoints funcionando correctamente
  - 13 tests automatizados pasando (pytest)
- **✅ SEO/SEM Avanzado (30 enero 2026)**
  - Meta tags optimizados (título, descripción, keywords)
  - Schema.org markup (Organization, SoftwareApplication, FAQPage)
  - Open Graph y Twitter Cards
  - sitemap.xml y robots.txt configurados
  - Canonical URLs
- **✅ Checkout con info empresa (30 enero 2026)**
  - Descripción del producto en checkout
  - Datos de STARTBOOKING SL (CIF B19427723)
  - Período de facturación visible
- **✅ App Móvil Android COMPLETA (30 enero 2026)**
  - Capacitor 6 configurado
  - Keystore generado: `/app/frontend/android/keystores/manoprotect-release.keystore`
  - Android SDK 34 + Build Tools 34.0.0
  - Icono de app generado (512x512)
  - Feature graphic generado (1024x500)
  - Paquete descargable: `/app/ManoProtect-GooglePlay.zip`
  - Guía de compilación: `/app/frontend/ANDROID_BUILD_GUIDE.md`
  - Ficha de Play Store: `/app/frontend/GOOGLE_PLAY_LISTING.md`
- **✅ Desktop App para Empleados COMPLETA (31 enero 2026)**
  - Electron app con SQLite local
  - Funcionalidades: Dashboard, Gestión de amenazas, Clientes, Verificador de estafas, Tickets, Chat interno
  - Ejecutable Windows compilado: `ManoProtect Desktop.exe` (107MB)
  - ZIP descargable: `/app/frontend/public/ManoProtect-Desktop-Windows.zip`
  - Página de descarga: `/empleados/descargar`
  - **Portal completo para sucursales: `/empleados/portal`**
  - Credenciales: admin@manoprotect.com / Admin2024!
- **✅ Localización Familiar Mejorada (31 enero 2026)**
  - Campo de EDAD añadido al formulario
  - Clasificación automática: Niño (<18), Adulto (18-64), Anciano (≥65)
  - Iconos diferenciados por tipo: 👶 👤 👴
  - Backend actualizado con person_type
  - Textos actualizados de "Niño" a "Familiar"
- **✅ Sistema SOS Premium Familiar (31 enero 2026)**
  - Botón SOS grande (rojo) para emergencias
  - Grabación de audio automática (~15-20s)
  - Detección GPS en tiempo real
  - Notificación a todos los familiares
  - Alertas a usuarios premium cercanos (5km)
  - Sirena/sonido en dispositivos familiares
  - Cancelación/confirmación de alertas
  - Historial de alertas SOS
  - Página: /sos-emergency
- **✅ Bug Enlace Invitación Familiar CORREGIDO (31 enero 2026 - sesión 2)**
  - Corregido `verify_password_secure()` para soportar hashes bcrypt ($2b$)
  - El `invite_token` ahora se muestra correctamente en el frontend
  - Enlace de vinculación visible para miembros pendientes
  - Botones "Enviar por WhatsApp" y "Enviar por Email" funcionando
  - Archivo modificado: `/app/backend/services/security_service.py`
- **✅ Sistema i18n Multiidioma COMPLETO (31 enero 2026 - sesión 2)**
  - 9 idiomas soportados: Español, Inglés, Francés, Alemán, Italiano, Portugués, Chino, Ruso, Árabe
  - Detección automática por IP del país del usuario
  - Selector de idiomas en el header con banderas
  - Soporte RTL para árabe
  - Landing page principal traducida a todos los idiomas
  - Archivos: `/app/frontend/src/i18n/locales/[lang].json`
- **✅ Proyecto iOS Completo (31 enero 2026)**
  - Capacitor iOS configurado
  - Iconos iOS generados (todos los tamaños requeridos)
  - Proyecto Xcode descargable: `/app/frontend/public/ManoProtect-iOS-Project.zip`
  - Guía completa: `/app/frontend/public/GUIA_APP_STORE_IOS.md`
- **✅ Guías de Publicación (31 enero 2026)**
  - Guía Google Play: `/app/frontend/public/GUIA_GOOGLE_PLAY.md`
  - Portal de desarrolladores: `/desarrolladores/descargas`
- **✅ Correcciones AdSense (30 enero 2026)**
  - Páginas de callback/loading mejoradas con contenido real
  - Meta tags para excluir páginas sin contenido de ads
  - robots.txt actualizado para excluir páginas de proceso
  - Nueva página FAQ con contenido de alta calidad
  - Sitemap actualizado con todas las páginas públicas
- Planes y precios con Stripe

## Rutas activas
- `/` - Landing principal
- `/login`, `/registro` - Auth
- `/dashboard` - Panel de usuario
- `/verificar-estafa` - Verificador público
- `/pricing` - Planes
- `/admin` - Panel admin

## API de Fraude (para ManoBank)
```
POST /api/fraud/check       - Verificar transacción
POST /api/fraud/report      - Reportar fraude
GET  /api/fraud/alerts/{id} - Obtener alertas
GET  /api/fraud/public/scam-stats - Estadísticas
```

## API de Alertas (NUEVO)
```
POST /api/alerts/subscribe          - Suscribirse a alertas
POST /api/alerts/unsubscribe        - Darse de baja
GET  /api/alerts/subscriptions/count - Contador de suscriptores
POST /api/alerts/broadcast          - Enviar alerta masiva
GET  /api/alerts/history            - Historial de alertas
```

---

# ManoBank.es

## Descripción
Banco digital español con protección antifraude integrada mediante ManoProtect.

## Tecnología
- Frontend: React + TailwindCSS (puerto 3001)
- Backend: FastAPI (puerto 8002)
- Base de datos: MongoDB (manobank_db)

## Funcionalidades ✅
- Landing page
- Login/Registro de clientes
- Dashboard de cliente (básico)
- Portal de empleados (básico)
- Integración con API de fraude ManoProtect

## Funcionalidades Pendientes 📋
- Sistema completo de cuentas
- Transferencias SEPA/Bizum
- Tarjetas virtuales
- KYC/Videoverificación
- Préstamos
- Gestión de empleados completa

## Rutas
- `/` - Landing
- `/login`, `/registro` - Auth clientes
- `/dashboard` - Panel cliente
- `/banco` - Portal empleados
- `/banco/sistema` - Sistema interno

---

## Integración ManoProtect ↔ ManoBank

ManoBank consume la API de ManoProtect para:
1. **Verificar transacciones** antes de procesarlas
2. **Consultar base de datos** de estafadores conocidos
3. **Recibir alertas** de fraude en tiempo real
4. **Reportar actividades** sospechosas

### Flujo de verificación
```
[Cliente ManoBank] → [Backend ManoBank] → [API ManoProtect] → [Respuesta]
                                              ↓
                                     Verificación antifraude
```

---

## Backlog Global

### P0 - Crítico
- (Ninguno)

### P1 - Alta
- [ ] Completar sistema de cuentas ManoBank
- [ ] Implementar transferencias
- [ ] Sistema de notificaciones

### P2 - Media
- [ ] Apps móviles ManoProtect
- [ ] KYC/Videoverificación ManoBank
- [ ] Sistema de préstamos

### P3 - Baja
- [ ] Tarjetas físicas
- [ ] API pública
- [ ] Gamificación

---

## Dominios

- **ManoProtect**: manoprotect.com (activo)
- **ManoBank**: manobank.es (pendiente configuración)

---

## Credenciales de prueba

### ManoProtect
- Admin: (configurar en producción)

### ManoBank
- Director: rrhh.milchollos@gmail.com / 19862210Des
- Subdirector: msolassanchis@gmail.com / Mano2024!
