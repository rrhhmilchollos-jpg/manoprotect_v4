# ManoProtect - Product Requirements Document v4.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, dispositivos Sentinel SOS, Escudo Vecinal comunitario, Panel Vecinal Premium, Dashboard de Barrio publico con ranking gamificado, Sistema Central de Empresa (CRM + Instalaciones), y sistema de referidos universal.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush

## PRECIOS COMPETITIVOS (tipo Securitas Direct)

### Alarmas Hogar
| Plan | Promo (6m) | Regular | Target |
|---|---|---|---|
| Essential | 33.90 EUR/mes | 44.90 EUR/mes | Pisos y apartamentos |
| Premium | 44.90 EUR/mes | 54.90 EUR/mes | Chalets, adosados y casas |

### Alarmas Negocio
| Plan | Promo (6m) | Regular | Target |
|---|---|---|---|
| Comercio | 54.90 EUR/mes | 69.90 EUR/mes | Tiendas, locales, restaurantes |
| Empresa | 74.90 EUR/mes | 89.90 EUR/mes | Naves, oficinas, franquicias |

### Sentinel SOS (suscripcion mensual)
| Plan | Precio | Incluye |
|---|---|---|
| Basic | 9.99 EUR/mes | GPS, SOS, app basica |
| Plus | 14.99 EUR/mes | +historial GPS, alertas familiares, caidas |
| Pro | 24.99 EUR/mes | +CRA 24/7, Acuda, geovallas ilimitadas |

### Dispositivos Sentinel
| Dispositivo | Precio |
|---|---|
| Sentinel X (Smartwatch) | 199 EUR |
| Sentinel J (Junior) | 79 EUR |
| Sentinel S (Senior) | 103 EUR |

### Vecinal Premium
- 299.99 EUR/ano (INDEPENDIENTE, SOLO ANUAL)

### Extras (componentes individuales)
- Cámara IP Full HD: 89 EUR, PTZ 4K: 149 EUR, Sensor PIR: 39 EUR, etc.

## INSTALACION: GRATIS
## SIN PERMANENCIA
## SIN PRUEBAS GRATIS (info interna, no se muestra en web)

## SISTEMA DE REFERIDOS UNIVERSAL
- "1 mes GRATIS para ambos" (referidor + referido)
- Funciona con TODOS los productos (alarmas, Sentinel, vecinal)
- Código único por suscriptor (formato MP-XXXXXX)
- Validación: GET /api/referrals/validate/{code}
- Procesamiento automático en webhook Stripe al completar pago
- Referral_code se pasa en checkout y se almacena en metadata
- Backend extiende suscripción del referidor +30 días

## RANKING GAMIFICADO (Dashboard de Barrio)
- Puntuaciones: Comunidad/Vigilancia/Respuesta (0-100)
- Insignias: oro/plata/bronce (Comunidad Fuerte, Defensores Elite, Barrio Seguro, Embajador, etc.)
- Siguiente objetivo con barra de progreso

## Paginas principales
- / - Landing page
- /plans - Pricing page con 5 tabs + tabla comparativa
- /alarmas-hogar, /alarmas/vivienda, /alarmas/negocio
- /productos - Sentinel devices
- /sentinel-x, /sentinel-j, /sentinel-s
- /escudo-vecinal - Mapa comunitario gratuito
- /panel-vecinal - Premium paywall + referidos
- /dashboard-barrio - Stats publicas + ranking gamificado
- /gestion-empresa - Sistema central empresa (CRM + instalaciones)
- /ceo - Dashboard CEO
- /empleados - Portal empleados

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Backlog
- P2: SEO/SEM (BLOQUEADO - requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P3: Videos marketing (Sora 2, sin credito)
- P3: Migrar SHA256 a bcrypt
- P3: Activar SMS/Email/WhatsApp produccion
- P3: Build iOS con Capacitor

## Testing
- iteration_77: 100% pass - Pricing completo + Referidos universales + Extras (backend 18/18, frontend 100%)
- iteration_76: 100% pass - Full button audit + Ranking + Referidos vecinal
- iteration_75: 100% pass - Dashboard Barrio + Enterprise Central + Push
