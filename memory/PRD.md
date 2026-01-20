# ManoProtect - Plataforma Integral de Protección contra Fraudes

## Problema Original
Crear una plataforma integral de seguridad digital multi-plataforma (web + móvil) con diferentes niveles para individuos, familias y empresas.

## Estado del Proyecto - 20 Enero 2026

### ✅ COMPLETADO HOY (20 Enero 2026)

#### Páginas Legales Integradas
- **Cookie Banner** - Componente funcional con opciones de configuración (RGPD compliant)
- **Política de Privacidad** (`/privacy-policy`) - Completa con derechos RGPD
- **Términos y Condiciones** (`/terms-of-service`) - Planes, precios, responsabilidades
- **Política de Reembolsos** (`/refund-policy`) - 14 días garantía, proceso detallado
- **Aviso Legal** (`/legal-notice`) - LSSI-CE compliant para España/EU
- **Footer mejorado** - Con secciones "Producto" y "Legal" con todos los enlaces

### ✅ COMPLETADO ANTERIORMENTE

#### App Móvil Android - APKs Generados (17 Enero)
- **ManoProtect-debug.apk** (168 MB) - Para pruebas internas
- **ManoProtect-release.apk** (54 MB) - **LISTO para Google Play Store**
- Ubicación: `C:\Users\rrhhm\OneDrive\Desktop\`

#### Keystore de Producción Creado
- Archivo: `android\app\mano-release-key.keystore`
- Alias: `mano-key`
- Contraseña: `19862210Des`
- Validez: 10,000 días
- ⚠️ **GUARDAR EN LUGAR SEGURO** - Sin esto no se puede actualizar la app

#### Web Desplegada
- Dominio personalizado: **manoprotect.com** ✅
- ⚠️ **IMPORTANTE:** Presionar "Re-Deploy" en Emergent para publicar cambios recientes

### 📋 PENDIENTE (P0/P1)

#### Re-Deploy Web (P0)
- Los cambios de páginas legales y footer están en preview
- Usuario debe presionar **"Re-Deploy"** en Emergent para publicarlos en manoprotect.com

#### Build EAS Móvil (P0 - BLOQUEADO)
- Build cloud falló durante "Install dependencies"
- Logs: https://expo.dev/accounts/ivanrubioapps/projects/manoprotect/builds/760f0f41-4f7d-4e5d-b057-09f53bc91e0a

#### Compilación iOS (P1)
- Requiere servicio cloud (Codemagic/MacStadium) - usuario sin Mac

### 📋 BACKLOG (P2/P3)

#### Backend
- Continuar refactorización de `server.py` (actualmente ~3000 líneas)
- Extraer rutas de Admin, Payments, PDF a módulos separados

#### Integraciones
- WhatsApp Business (scaffolded, necesita credenciales de Meta)
- Open Banking (bloqueado por Nordigen - no acepta nuevos registros)

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
