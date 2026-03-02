# ManoProtect - Product Requirements Document v6.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock (cerradura inteligente), Plataforma CRA (software profesional), ManoProtect Connect (app movil), Sentinel SOS, Escudo Vecinal, Panel Vecinal Premium, Dashboard de Barrio con ranking gamificado, Sistema Central de Empresa (CRM + Instalaciones), sistema de referidos universal, y chatbot de captacion de leads.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush

## MODELO DE NEGOCIO
- Instalacion profesional: GRATIS | SIN permanencia | SIN pruebas gratis (interno)
- Referidos: 1 mes gratis para ambos | Pago anual: 10 meses, llevate 12

## PRECIOS
### Alarmas Hogar: Essential 33.90/44.90, Premium 44.90/54.90
### Alarmas Negocio: Comercio 54.90/69.90, Empresa 74.90/89.90
### Sentinel SOS: Basic 9.99, Plus 14.99, Pro 24.99 EUR/mes
### Sentinel Lock: 249 EUR (dispositivo) + plan monitorizacion desde 9.99/mes
### Dispositivos: X=199, J=79, S=103 EUR
### Vecinal Premium: 299.99 EUR/ano

## ECOSISTEMA DE PRODUCTOS (NUEVO v6.0)
### Sentinel Lock (/sentinel-lock)
- Cerradura inteligente autonoma con IA de deteccion de intrusion
- NB-IoT/LTE-M, eSIM integrada, acelerometro, sensor continuidad, sensor presion cilindro
- Flujo: Deteccion → IA → NB-IoT → CRA verifica → Policia
- **BAJO PEDIDO**: Fabricacion 15-20 dias laborables. Pago anticipado obligatorio.
- Precio: 249 EUR + plan monitorizacion desde 9,99 EUR/mes
- Instalacion profesional GRATIS

### Plataforma Central CRA (/plataforma-cra)
- Software profesional para operadores de Central Receptora de Alarmas
- 6 modulos: recepcion alarmas, verificacion video IA, geolocalizacion/despacho, gestion abonados, multi-protocolo, registro/auditoria
- Cumple Ley 5/2014, UNE-EN 50518, RGPD
- API REST abierta para integraciones

### ManoProtect Connect (/manoprotect-connect)
- App movil iOS/Android para clientes
- Armado/desarmado remoto, camaras en directo, notificaciones push, gestion usuarios, boton SOS, historial eventos
- Incluida GRATIS con todos los planes de alarma

## CHATBOT LEAD CAPTURE
- Widget flotante verde en todas las paginas (z-[80])
- Respuestas predefinidas: precios, productos, instalacion, referidos
- Formulario de captacion: nombre, telefono, email
- Leads guardados en enterprise-central con source='chatbot'

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Completed Features (as of Feb 2026)
- Universal Referral System (Stripe webhook + validation)
- Gamified Neighborhood Ranking (Dashboard de Barrio)
- Enterprise Central Management Portal
- Lead-Capture Chatbot
- Performance Optimization (Lighthouse +90 target)
- Pricing Overhaul (competitive with Securitas Direct)
- Content Correction (Instalacion GRATIS, not equipo)
- New Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect pages
- Cross-sell integration (Sentinel Lock on alarm pages + calculator)
- Navigation updated (header + footer links to all new products)
- Sentinel Lock custom product images (cerradura cilindrica europea estilo DIN)
- Interactive AI detection demo (6 estados: Normal → Vibracion → Intrusion → CRA → Policia → Resuelto)
- Imagenes fabricante (PCB interna + mecanismo multipunto) + Video presentacion MP4
- Sentinel Lock marcado como "bajo pedido" con pago anticipado obligatorio (249 EUR)

## Backlog
- P1: SEO/SEM (requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P2: Build app iOS (requiere Mac con Xcode)
- P2: Activar integraciones mockeadas (112 emergencia, BigQuery)
- P2: CRO avanzado (A/B testing, remarketing)
- P3: Videos marketing (Sora 2 - sin credito)
- P3: Migrar SHA256 a bcrypt

## Testing
- iteration_82: 100% pass - Imagenes fabricante + Video MP4 + Bajo pedido/pago anticipado
- iteration_81: 100% pass - Imagenes producto Sentinel Lock + Demo interactiva IA
- iteration_80: 100% pass - Ecosistema nuevos productos (3 paginas + rutas + navegacion + cross-sell)
- iteration_79: 100% pass - Chatbot lead capture
- iteration_78: 100% pass - Precios actualizados + Performance
- iteration_77: 100% pass - Pricing + Referidos universales
- iteration_76: 100% pass - Full button audit + Ranking
- iteration_75: 100% pass - Dashboard Barrio + Enterprise + Push
