# ManoProtect - Product Requirements Document

## Información General
- **Nombre**: ManoProtect
- **Empresa**: STARTBOOKING SL
- **Descripción**: Aplicación de protección contra fraudes digitales para familias españolas

## Estado Actual: Preparación para Google Play (Febrero 2025)

### ✅ Completado

#### Correcciones Google Play (5 Feb 2025)
- [x] Período de prueba actualizado a 7 días en TODA la app
- [x] Nuevo icono de alta calidad generado (512x512, sin pixelación)
- [x] Guía AAB actualizada con instrucciones para evitar "SB StartBooking"
- [x] AggregateRating falso eliminado
- [x] Scripts de ads comentados (evitar errores)
- [x] Testimonios falsos eliminados del noscript

#### Refactorización Backend (5 Feb 2025)
- [x] server.py reducido de 3198 a 2811 líneas
- [x] Rutas /push/* movidas a push_routes.py
- [x] Rutas /notifications/* movidas a notifications_routes.py
- [x] Rutas /family/* movidas a family_routes.py (NUEVO)
- [x] Componente ScarcityIndicator.jsx eliminado

#### Limpieza Anterior (Feb 2025)
- [x] Contenido engañoso eliminado (estadísticas falsas, certificaciones)
- [x] Solo testimonios reales de Google Reviews
- [x] Logos de medios falsos eliminados

### ⏳ Pendiente

#### P0 - Bloqueante
- [ ] Generar nuevo .aab con branding ManoProtect (usuario debe hacer localmente)
- [ ] Subir a Google Play Console y solicitar revisión

#### P1 - Próximos pasos
- [ ] Configurar Pixel IDs de ads cuando estén disponibles

#### P2 - Backlog
- [ ] Continuar refactorización de server.py (meta: <500 líneas)
- [ ] Configurar CI/CD

## Arquitectura

```
/app/
├── android/
│   ├── GENERAR_AAB_GUIA.md    # Guía actualizada
│   ├── twa-manifest.json      # Config Android
│   └── res/values/            # Strings y colores
├── backend/
│   ├── server.py              # 2811 líneas (refactorizado)
│   └── routes/
│       ├── family_routes.py   # NUEVO - Rutas /family/*
│       ├── push_routes.py     # Rutas /push/*
│       ├── notifications_routes.py
│       └── ...
├── frontend/
│   ├── public/
│   │   ├── icons/             # Iconos actualizados
│   │   └── manoprotect_icon_512x512.png  # Para Google Play
│   └── src/components/
│       ├── conversion/        # 7 componentes activos
│       └── trust/             # 1 componente activo
└── memory/
    └── PRD.md                 # Este documento
```

## Integraciones Activas
- Infobip (SMS)
- Firebase Cloud Messaging (Push)
- Stripe (Pagos)
- Emergent LLM (Chatbot IA)
- OpenStreetMap/Leaflet (Mapas)

## Credenciales de Prueba
- **Superadmin**: info@manoprotect.com / 19862210Des

## Notas Importantes
- El período de prueba es **7 días** (no 15, no 30)
- No agregar estadísticas sin verificación
- Testimonios deben ser reales y verificables
- El .aab debe generarse con nombre "ManoProtect", no "StartBooking"

---
*Última actualización: 5 Febrero 2025*
