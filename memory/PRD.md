# MANO - Plataforma Integral de Protección contra Fraudes

## Problema Original
Crear una plataforma integral de seguridad digital multi-plataforma (web + móvil) con diferentes niveles para individuos, familias y empresas.

## Estado del Proyecto - 17 Enero 2026

### ✅ COMPLETADO HOY

#### 1. App Móvil Android - APKs Generados
- **ManoProtect-debug.apk** (168 MB) - Para pruebas internas
- **ManoProtect-release.apk** (54 MB) - **LISTO para Google Play Store**
- Ubicación: `C:\Users\rrhhm\OneDrive\Desktop\`

#### 2. Keystore de Producción Creado
- Archivo: `android\app\mano-release-key.keystore`
- Alias: `mano-key`
- Contraseña: `19862210Des`
- Validez: 10,000 días
- ⚠️ **GUARDAR EN LUGAR SEGURO** - Sin esto no se puede actualizar la app

### 🔄 EN PROGRESO

#### 3. Despliegue Web en Firebase
- Frontend descargado en: `C:\Users\rrhhm\OneDrive\Desktop\frontend`
- Dependencias instaladas
- **Pendiente:** Resolver error de build con `ajv` y completar despliegue
- Proyecto Firebase: `Manoprotect`

### 📋 PENDIENTE

#### Backend
- Continuar refactorización de `server.py` (actualmente ~3000 líneas)
- Extraer rutas de Admin, Payments, PDF a módulos separados

#### Integraciones
- WhatsApp Business (scaffolded, necesita credenciales de Meta)
- Open Banking (bloqueado por Nordigen)

## Arquitectura del Proyecto

```
/app/
├── backend/           # FastAPI + MongoDB
│   ├── server.py      # API principal (~3000 líneas)
│   ├── routes/        # Rutas modularizadas
│   └── models/        # Schemas Pydantic
├── frontend/          # React PWA
│   └── src/
└── mobile-app/        # React Native (código fuente)

LOCAL (Windows):
├── C:\Users\rrhhm\OneDrive\Desktop\mobile-app\  # Proyecto móvil compilado
├── C:\Users\rrhhm\OneDrive\Desktop\frontend\    # Frontend para Firebase
└── C:\Users\rrhhm\OneDrive\Desktop\ManoProtect-*.apk  # APKs generados
```

## Credenciales

### Superadmin
- Email: `rrhh.milchollos@gmail.com`
- Password: `ManoAdmin2025!`

### Firebase
- Proyecto: `Manoprotect`
- CLI instalado: v15.3.1

### Android Keystore
- Archivo: `mano-release-key.keystore`
- Alias: `mano-key`
- Password: `19862210Des`

## Próximos Pasos

1. **Completar despliegue web en Firebase**
   - Resolver error de ajv
   - `npm run build`
   - `firebase deploy`

2. **Publicar app en Google Play Store**
   - Crear cuenta de desarrollador ($25)
   - Subir `ManoProtect-release.apk`
   - Configurar ficha de la tienda

3. **Continuar desarrollo backend**
   - Modularizar rutas restantes
   - Completar integraciones pendientes
