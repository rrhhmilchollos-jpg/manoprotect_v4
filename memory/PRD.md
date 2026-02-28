# ManoProtect - Product Requirements Document

## Original Problem Statement
Plataforma líder en España de protección digital y física contra fraudes, estafas y amenazas para familias. Act as a Senior Fullstack Developer & CRO Expert. Optimize manoprotect.com to be the market leader in security and sales.

## Core Product
- **Sentinel X**: Reloj GPS/SOS para adultos y adolescentes (4G, BT, grabación)
- **Sentinel J**: Reloj GPS/SOS para niños 3-12 años (8 correas, sin cámara)
- **Sentinel S**: Reloj GPS/SOS para mayores (cerámica, anti-retirada, sirena 120dB)
- **Pricing**: 9,99€/mes o 99,99€/año. Dispositivo GRATIS con suscripción.

## Tech Stack
- Frontend: React + TailwindCSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Payments: Stripe (real products created)
- Email: SendGrid
- Analytics: GTM dataLayer + gtag + fbq

## Architecture
```
/app
├── backend/ (FastAPI on port 8001)
│   ├── server.py
│   ├── routes/ (cro_routes, payments_routes, etc.)
│   └── .env (STRIPE_PRICE_ID_*, SENDGRID_API_KEY, etc.)
├── frontend/ (React on port 3000)
│   ├── src/pages/ (all pages)
│   ├── src/components/ (landing/, cro/, ui/)
│   └── .env (REACT_APP_BACKEND_URL)
└── memory/ (PRD.md, CHANGELOG.md)
```

## Implemented Pages (as of Feb 28, 2026)
- `/` - Landing Principal (Hero, Beneficios, Cómo funciona, Productos, Comparativa, Testimonios, FAQ, Urgencia)
- `/sentinel-x` - Página de producto Sentinel X
- `/sentinel-j` - Página de producto Sentinel J
- `/sentinel-s` - Página de producto Sentinel S
- `/productos` - Página de productos completa con comparativa
- `/plans` - Precios y planes (mensual/anual)
- `/faq` - Preguntas frecuentes con búsqueda
- `/contacto` - Formulario + WhatsApp + 24/7
- `/testimonios` - Testimonios y casos de uso
- `/blog` - Blog educativo SEO
- `/registro` - Registro con Stripe checkout
- `/login` - Login de usuarios
- `/dashboard` - Panel de usuario
- + muchas más páginas SEO y funcionales

## Backlog
### P1: iOS build (Mac + Xcode - BLOQUEADO), Meta Pixel ID + Google SC (BLOQUEADO), Hotjar integration, Remarketing setup
### P2: "Quiénes Somos" con contenido real, SEO Fase 3 backlinks, Activar integraciones mocked (112, BigQuery), Multimedia (videos, GIFs 360°)
### P3: Refactorizar legacy pages, A/B testing avanzado
### BLOQUEADOS: SMS Infobip (clave inválida), SendGrid dominio sin verificar, Twilio WhatsApp producción, Meta Pixel ID, Google SC

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | super_admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
