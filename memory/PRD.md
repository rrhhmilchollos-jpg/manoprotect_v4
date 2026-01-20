# ManoProtect - Plataforma Integral de Protección contra Fraudes

## Problema Original
Crear una plataforma integral de seguridad digital multi-plataforma (web + móvil) con diferentes niveles para individuos, familias y empresas.

## Estado del Proyecto - 20 Enero 2026

### ✅ COMPLETADO HOY (20 Enero 2026)

#### ManoBank - Módulo Bancario Integrado
- **Dashboard bancario completo** (`/manobank`) - Saldos, resumen mensual, alertas
- **Gestión de cuentas** - Añadir, ver, eliminar cuentas bancarias (múltiples bancos)
- **Transferencias SEPA** - Con validación IBAN y detección de fraude
- **Bizum** - Envío instantáneo por teléfono (límite 1.000€)
- **Detección de fraude** - Análisis de riesgo automático (destinatarios nuevos, importes altos, internacional)
- **Alertas de seguridad** - Sistema de alertas para transferencias sospechosas
- **Pagos programados** - Crear y gestionar pagos recurrentes
- **Historial de transacciones** - Con categorización automática
- **Backend**: `/app/backend/routes/manobank_routes.py` (600+ líneas)
- **Frontend**: `/app/frontend/src/pages/ManoBank.js` (700+ líneas)
- **Acceso**: Usuarios con plan Family Premium o Enterprise

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
- Los cambios de ManoBank, páginas legales y footer están en preview
- Usuario debe presionar **"Re-Deploy"** en Emergent para publicarlos en manoprotect.com

#### App WebView en proceso
- Usuario está creando app WebView simplificada en `C:\ManoProtect-Build\ManoProtect-WebApp`
- Build EAS en proceso - pendiente resultado

#### Compilación iOS (P1)
- Requiere servicio cloud (Codemagic/MacStadium) - usuario sin Mac

### 📋 BACKLOG (P2/P3)

#### ManoBank Expansión
- Multi-banco real con TrueLayer / Token.io (requiere API keys)
- Multi-moneda internacional
- Integración Open Banking real

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
│   │   ├── manobank_routes.py  # NEW: Módulo bancario
│   │   └── ...
│   └── models/        # Schemas Pydantic
├── frontend/          # React PWA
│   └── src/
│       └── pages/
│           ├── ManoBank.js     # NEW: Dashboard bancario
│           └── ...
└── mobile-app/        # React Native (código fuente)

LOCAL (Windows):
├── C:\ManoProtect-Build\ManoProtect-WebApp\  # App WebView en construcción
├── C:\Users\rrhhm\OneDrive\Desktop\mobile-app\  # Proyecto móvil compilado
└── C:\Users\rrhhm\OneDrive\Desktop\ManoProtect-*.apk  # APKs generados
```

## API Endpoints ManoBank

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/manobank/dashboard` | Dashboard con cuentas, saldos, transacciones |
| GET | `/api/manobank/accounts` | Listar cuentas bancarias |
| POST | `/api/manobank/accounts` | Añadir cuenta bancaria |
| DELETE | `/api/manobank/accounts/{id}` | Eliminar cuenta |
| GET | `/api/manobank/transactions` | Historial de transacciones |
| POST | `/api/manobank/transfers/sepa` | Transferencia SEPA |
| POST | `/api/manobank/transfers/bizum` | Envío Bizum |
| POST | `/api/manobank/transfers/{id}/verify` | Verificar transferencia sospechosa |
| POST | `/api/manobank/transfers/{id}/cancel` | Cancelar transferencia |
| GET | `/api/manobank/scheduled` | Pagos programados |
| POST | `/api/manobank/scheduled` | Crear pago programado |
| GET | `/api/manobank/alerts` | Alertas de fraude |

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
