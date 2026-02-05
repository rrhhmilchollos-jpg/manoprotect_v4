# ManoProtect - Product Requirements Document

## Información General
- **Nombre**: ManoProtect
- **Empresa**: STARTBOOKING SL
- **Descripción**: Aplicación de protección contra fraudes digitales para familias españolas

## Estado Actual: Preparación para Google Play (Febrero 2025)

### ✅ Completado

#### Limpieza de Políticas Google Play (Feb 2025)
- [x] Eliminado contenido engañoso (estadísticas falsas, certificaciones falsas)
- [x] Testimonios reales de Google (Selomit, María Deseada Solas Sanchis)
- [x] Período de prueba actualizado a 7 días en toda la app
- [x] AggregateRating falso eliminado del Schema.org
- [x] Errores de consola corregidos (scripts ads comentados)

#### Icono de Alta Calidad (Feb 2025)
- [x] Nuevo icono 512x512 generado sin pixelación
- [x] Todos los tamaños PWA actualizados (72-512px)
- [x] Escudo verde/morado con mano de protección

#### Documentación Android (Feb 2025)
- [x] Guía AAB actualizada (`/app/android/GENERAR_AAB_GUIA.md`)
- [x] Archivos configuración TWA (`twa-manifest.json`, `strings.xml`, `colors.xml`)
- [x] Instrucciones para evitar error "SB StartBooking"

### ⏳ Pendiente

#### P0 - Bloqueante
- [ ] Generar nuevo .aab con branding ManoProtect (usuario debe hacer localmente)
- [ ] Subir a Google Play Console y solicitar revisión

#### P1 - Próximos pasos
- [ ] Configurar Pixel IDs de ads cuando estén disponibles
- [ ] Completar refactorización de `server.py`

#### P2 - Backlog
- [ ] Eliminar archivos .jsx de componentes removidos
- [ ] Configurar CI/CD

## Arquitectura

```
/app/
├── android/                    # Configuración Android/TWA
│   ├── GENERAR_AAB_GUIA.md    # Guía actualizada
│   ├── twa-manifest.json      # Config Bubblewrap
│   └── res/values/            # Strings y colores
├── backend/
│   ├── server.py              # API principal FastAPI
│   └── routes/                # Rutas modulares
├── frontend/
│   └── public/
│       ├── manifest.json      # PWA manifest
│       ├── icons/             # Iconos actualizados
│       └── manoprotect_icon_512x512.png  # Para Google Play
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
