# ManoProtect - Product Requirements Document v4.1.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, dispositivos Sentinel SOS, Escudo Vecinal comunitario, Panel Vecinal Premium, Dashboard de Barrio publico con ranking gamificado, Sistema Central de Empresa (CRM + Instalaciones), y sistema de referidos universal.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush

## MODELO DE NEGOCIO
- **Instalacion profesional: GRATIS** (el equipo se incluye en la cuota mensual)
- **SIN permanencia** (cancela cuando quieras)
- **SIN pruebas gratis** (info interna, no se muestra en la web)
- **Sistema de referidos**: 1 mes gratis para ambos (referidor + referido)
- **Pago anual**: 10 meses, llevate 12

## PRECIOS ACTUALIZADOS (competitivos tipo Securitas Direct)

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

### Vecinal Premium: 299.99 EUR/ano (INDEPENDIENTE, SOLO ANUAL)

### Extras (componentes individuales)
Camara IP Full HD: 89 EUR | PTZ 4K: 149 EUR | Sensor PIR: 39 EUR | Contacto magnetico: 29 EUR | Sirena 120dB: 79 EUR | Detector humo+CO2: 59 EUR | Detector inundacion: 45 EUR | Mando extra: 35 EUR | Teclado RFID: 69 EUR | Control biometrico: 129 EUR

## SISTEMA DE REFERIDOS UNIVERSAL
- "1 mes GRATIS para ambos" en TODOS los productos
- Codigo unico por suscriptor (MP-XXXXXX)
- Validacion: GET /api/referrals/validate/{code}
- Procesamiento automatico en webhook Stripe
- +30 dias al referidor

## OPTIMIZACIONES RENDIMIENTO (Lighthouse)
- Hero image: fetchpriority="high" + width/height explicitos
- Imagenes below-fold: loading="lazy" + decoding="async"
- Cache headers: 5min para endpoints publicos (plans, dashboard-barrio)
- Preconnect a origenes criticos (fonts, images CDN)
- Preload hero image para LCP
- Structured data Product con precios correctos para Google Snippets
- Accesibilidad: aria-label en botones, aria-hidden en iconos

## Paginas principales
- / | /plans | /alarmas-hogar | /alarmas/vivienda | /alarmas/negocio
- /productos | /sentinel-x | /sentinel-j | /sentinel-s
- /escudo-vecinal | /panel-vecinal | /dashboard-barrio
- /gestion-empresa | /ceo | /empleados

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Backlog
- P2: SEO/SEM (requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P3: Videos marketing (Sora 2, sin credito)
- P3: Migrar SHA256 a bcrypt
- P3: Activar SMS/Email/WhatsApp produccion
- P3: Build iOS con Capacitor

## Testing
- iteration_78: 100% pass - Precios actualizados + "Equipo GRATIS" eliminado + Performance
- iteration_77: 100% pass - Pricing completo + Referidos universales + Extras
- iteration_76: 100% pass - Full button audit + Ranking + Referidos vecinal
- iteration_75: 100% pass - Dashboard Barrio + Enterprise Central + Push
