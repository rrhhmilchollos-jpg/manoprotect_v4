# ManoProtect - Plataforma Integral de Protección contra Fraudes + ManoBank

## Problema Original
Crear una plataforma integral de seguridad digital multi-plataforma (web + móvil) con diferentes niveles para individuos, familias y empresas.

**ACTUALIZACIÓN:** El proyecto ha evolucionado para incluir **ManoBank**, un sistema bancario digital completo estilo BBVA con portal separado para empleados.

## Estado del Proyecto - 20 Enero 2026

### ✅ COMPLETADO HOY (20 Enero 2026)

#### 🔧 Bug Fix: Portal de Empleados Login Corregido
- **Problema:** Error "body stream already read" al hacer login en `/banco`
- **Solución:** 
  1. Mejorado manejo de respuestas JSON con try-catch
  2. Añadido `checkAuth()` del AuthContext para actualizar estado de autenticación
- **Archivos:** `/app/frontend/src/pages/BancoEmpleados.js`
- **Testing:** 100% tests pasados (backend + frontend)

#### ManoBank - Portal de Empleados Separado
- **Login:** `/banco` - Portal exclusivo para empleados del banco
- **Sistema:** `/banco/sistema` - Panel de administración completo
- **Acceso protegido:** Solo empleados autorizados pueden acceder

#### ManoBank - Sistema Bancario Completo (Estilo BBVA)

**Backend** (`/app/backend/routes/manobank_admin_routes.py`):
- Panel de Administración Bancaria completo
- Gestión de empleados (Director, Gerente, Analista de Riesgos, Cajero, etc.)
- Apertura de cuentas para clientes con flujo de aprobación
- Sistema de préstamos completo:
  - Personal, Hipotecario, Vehículo, Empresarial, Estudios, Rápido
  - Cálculo automático de cuotas e intereses
  - Score de riesgo automático
  - Flujo: Solicitud → Evaluación → Aprobación → Desembolso
- Emisión de tarjetas (Débito, Crédito, Platinum, Black)
- Gestión de clientes con KYC

**Frontend** (`/app/frontend/src/pages/BancoSistema.js`):
- Dashboard con estadísticas en tiempo real (Clientes, Cuentas, Depósitos, Préstamos)
- Tabs: Dashboard, Aperturas, Clientes, Préstamos, Tarjetas, Empleados
- Header con nombre y rol del empleado (ej: "Ivan Rubio Cano - Director General")
- Flujos completos para gestión bancaria

**Accesos**:
- Portal Empleados: `/banco` → `/banco/sistema`
- Portal Clientes: `/manobank`

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
