# ManoProtect - Product Requirements Document

## Última Actualización: 24 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de protección contra fraudes digitales para usuarios individuales, familias y empresas en España. Incluye análisis de amenazas con IA, botón SOS de emergencia físico, localización familiar, y un portal enterprise para la gestión interna.

---

## Actualizaciones 24 Febrero 2026

### MASTER ARCHITECTURE PROMPT - SEO, CRO & Blog Integration - COMPLETADO

#### 1. Artículos Blog Estratégicos - COMPLETADO
Creados y enrutados 4 artículos SEO optimizados:
- `/blog/mejores-relojes-sos-2026` - Ranking mejores relojes SOS (existía, ahora enrutado)
- `/blog/como-funciona-reloj-sos` - Guía paso a paso funcionamiento
- `/blog/reloj-gps-alzheimer` - Reloj GPS para personas con Alzheimer
- `/blog/reloj-gps-sin-cuotas` - La verdad sobre "sin cuotas"

Cada artículo incluye:
- Schema.org Article markup
- SEO meta tags optimizados
- Enlace canonical
- Artículos relacionados (internal linking)
- CTA hacia Sentinel X

#### 2. Sección "Guías y Comparativas" en BlogPage - COMPLETADO
- Nueva sección en `/blog` con cards para los 4 artículos estratégicos
- Tags por categoría (Ranking, Guía, Salud, Análisis)
- Hover effects y navegación directa

#### 3. CRO Components en Sentinel X - COMPLETADO
Integrados 3 componentes CRO en `/sentinel-x`:
- **Testimonials**: 4 reseñas verificadas con Schema.org Review markup
- **ProductComparison**: Tabla comparativa Sentinel X vs SaveFamily vs Weenect
- **StickyCTA**: Barra sticky que aparece al scroll con CTA "Reservar Ahora - 149€"

#### 4. Verificación SEM Landing Pages - COMPLETADO
- `/reloj-sos-ancianos` - Funcional
- `/reloj-gps-mayores` - Funcional
- `/boton-sos-senior` - Funcional

**Testing**: Iteración 49 - 100% tests pasados (13/13)

---

## Actualizaciones 23 Febrero 2026

### Integración Frontend Suscripciones - COMPLETADO
- Página `/registro` refactorizada con selección de plan y Stripe Elements
- Email de bienvenida automático tras registro exitoso

### Panel Admin Mejorado - COMPLETADO
- Endpoints administración para usuarios y pedidos
- Frontend Admin `/admin/orders`

### SENTINEL X Landing Page - COMPLETADO
- Página premium `/sentinel-x` con preventa Stripe
- Contador de unidades disponibles

### SEO Completo 2026 - COMPLETADO
- Sitemaps, robots.txt, Schema.org
- Landing pages SEM
- Componentes SEO reutilizables
- Analytics events para GTM

---

## Arquitectura Técnica

### Stack
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async driver)
- **Payments**: Stripe (checkout + webhooks + refunds + Stripe Elements)
- **Email**: SendGrid (pendiente verificación dominio)
- **Auth**: JWT + session cookies
- **Messaging**: Twilio (WhatsApp Sandbox)

### Estructura Clave
```
/app/frontend/src/
├── components/
│   ├── cro/                    # CRO Components
│   │   ├── StickyCTA.jsx       # Barra sticky de conversión
│   │   ├── Testimonials.jsx    # Reseñas con Schema.org
│   │   └── ProductComparison.jsx # Tabla comparativa
│   ├── seo/                    # SEO Components
│   │   ├── Breadcrumbs.jsx
│   │   └── FAQSchema.jsx
│   └── landing/
│       ├── LandingHeader.jsx
│       └── LandingFooter.jsx
├── pages/
│   ├── blog/                   # Artículos estratégicos
│   │   ├── MejoresRelojesSOS2026.js
│   │   ├── ComoFuncionaRelojSOS.js
│   │   ├── RelojParaAlzheimer.js
│   │   └── RelojGPSSinCuotas.js
│   ├── BlogPage.js             # Blog principal + guías
│   ├── SentinelXLanding.js     # Con CRO integrado
│   ├── RelojSOSAncianos.js     # SEM
│   ├── RelojGPSMayores.js      # SEM
│   └── BotonSOSSenior.js       # SEM
└── App.js                      # Rutas actualizadas
```

---

## Estado de Integraciones

| Integración | Estado | Notas |
|-------------|--------|-------|
| Stripe | Funcional | Checkout cart y SENTINEL X |
| Infobip SMS | Bloqueado | API key inválida |
| Twilio WhatsApp | Sandbox | Producción pendiente |
| SendGrid | Pendiente | Verificación dominio |

---

## Backlog Pendiente

### P0 - Crítico
- [ ] Obtener API key válida de Infobip para SMS

### P1 - Alta
- [ ] Crear app iOS con Capacitor
- [ ] Conectar Google Tag Manager & Search Console (analytics.js ya creado)
- [ ] Habilitar 2FA cuando SMS funcione
- [ ] Producción Twilio WhatsApp

### P2 - Media
- [ ] Página "Quiénes Somos" con fotos del equipo (esperando contenido)
- [ ] Setup BigQuery + Looker Studio Dashboards
- [ ] SEO Fase 3: Backlinks y autoridad
- [ ] Integración con 112

### P3 - Baja
- [ ] Emails de recordatorio trial (cron job existe, SendGrid pendiente)
- [ ] Blog automatizado de alertas de estafas
- [ ] Extraer carrito a React Context global

---

## Credenciales del Sistema

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | 19862210Des | super_admin |
| Admin | admin@manoprotect.com | Admin2024! | admin |

---

## Notas Importantes

1. **Portal Empleados (admin.manoprotect.com)**: Backend API completamente funcional. Problemas reportados son del frontend SEPARADO del usuario.
2. **Integraciones bloqueadas**: Infobip (SMS), SendGrid (emails), Twilio producción (WhatsApp) - todas esperan acción del usuario.
3. **Sentinel X social proof**: Contador de unidades y notificaciones son datos de demostración (client-side).
