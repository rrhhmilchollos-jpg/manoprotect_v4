# MANO - Product Requirements Document

## Plataforma Integral de Protección contra Fraudes Digitales

**Última actualización:** 17 Enero 2025

---

## 1. Descripción del Producto

MANO es una plataforma de seguridad digital multi-plataforma que protege a usuarios individuales, familias y empresas contra fraudes digitales, estafas y amenazas en línea.

### 1.1 Usuarios Objetivo
- **Particulares (B2C):** Usuarios individuales que buscan protección básica o premium
- **Familias:** Grupos familiares con funciones GPS, SOS y modo senior
- **Empresas (B2B):** PYMEs y grandes corporaciones
- **Bancos:** Soluciones enterprise personalizadas

### 1.2 Plataformas
- ✅ Aplicación Web (PWA) - React
- ✅ Backend API - FastAPI
- ✅ App Móvil - React Native (Expo EAS)

---

## 2. Sistema de Roles

| Rol | Descripción | Email |
|-----|-------------|-------|
| `user` | Usuario estándar | Cualquier email |
| `admin` | Administrador | Asignado por superadmin |
| `superadmin` | Control total | rrhh.milchollos@gmail.com |
| `investor` | Acceso portal inversores | Aprobado por superadmin |

---

## 3. Planes y Precios

### 3.1 Planes Individuales
| Plan | Precio | Usuarios | Características |
|------|--------|----------|-----------------|
| Gratis | €0 | 1 | Análisis básico, alertas limitadas |
| Personal | €9.99/mes | 2 | IA avanzada, alertas ilimitadas |
| Premium Anual | €249.99/año | 1 | Todo incluido + 31% descuento |

### 3.2 Planes Familiares (DIFERENCIADOS)
| Plan | Precio | Usuarios | Características |
|------|--------|----------|-----------------|
| Familiar Mensual | €49.99/mes | 5 | 🆘 Solo botón SOS básico (sin GPS) |
| Familiar Trimestral | €129.99/3m | 5 | 🆘 SOS + 📍 GPS bajo demanda |
| Familiar Anual | €399.99/año | 5 | ⭐ TODO: SOS + GPS + 👶 Localizar niños + Historial + Modo silencioso |

### 3.3 Función Localización de Niños (SOLO PLAN ANUAL)
**Características:**
- Añadir niños por número de teléfono
- Localización bajo demanda (cuando el padre solicita)
- Historial de ubicaciones (últimos 7 días)
- Modo silencioso configurable (opción para que el niño NO reciba notificación)
- El niño debe tener app MANO instalada

**Funcionamiento:**
1. Padre añade niño con nombre y teléfono
2. Se instala app MANO en teléfono del niño
3. Padre puede solicitar ubicación cuando quiera
4. Ubicación se muestra con enlace a Google Maps
5. Historial disponible de los últimos 7 días

### 3.4 Planes Business/Enterprise
| Plan | Precio | Usuarios |
|------|--------|----------|
| Business | €49.99/mes | 25 |
| Enterprise | €199.99/mes | Ilimitado |

---

## 4. Funcionalidades Implementadas

### 4.1 Web App ✅
- [x] Landing page con información
- [x] Registro/Login (Email + Google OAuth)
- [x] Dashboard principal con análisis de amenazas
- [x] Página de precios con Stripe
- [x] Panel de administración (superadmin)
- [x] Modo Familiar con botón SOS + GPS
- [x] Portal de inversores
- [x] Firebase Analytics integrado

### 4.2 Backend API ✅
- [x] Autenticación JWT + Google OAuth
- [x] Sistema de roles (user, admin, superadmin, investor)
- [x] Análisis de amenazas con IA (GPT-5.2)
- [x] Integración Stripe (pagos LIVE)
- [x] Endpoint SOS con GPS (`/api/sos/alert`)
- [x] Gestión de contactos de emergencia
- [x] Descarga de documentos para inversores

### 4.3 App Móvil ✅
- [x] Proyecto React Native configurado
- [x] Firebase integrado (google-services.json)
- [x] Iconos y splash screen
- [x] Configuración Expo EAS para compilación
- [x] Estructura de screens completa

---

## 5. Integraciones Activas

| Servicio | Estado | Notas |
|----------|--------|-------|
| Stripe | ✅ LIVE | Pagos funcionando |
| Google OAuth | ✅ Activo | Emergent-managed |
| Firebase | ✅ Activo | Analytics + Cloud Messaging |
| Expo EAS | ✅ Configurado | Build en progreso |
| SendGrid | ⏳ Pendiente | Requiere API Key |
| WhatsApp | ⏳ Pendiente | Requiere API Key |

---

## 6. Documentos para Inversores

| Documento | Ubicación | Formato |
|-----------|-----------|---------|
| Plan de Negocio | /app/docs/pdf/PLAN_DE_NEGOCIO.pdf | PDF |
| Presentación Inversores | /app/docs/pdf/PRESENTACION_INVERSORES.pdf | PDF |
| Modelo Financiero | /app/docs/pdf/MODELO_FINANCIERO.pdf | PDF |
| Términos Inversión | /app/docs/pdf/TERMINOS_INVERSION.pdf | PDF |
| Plan Enterprise | /app/docs/pdf/MANO_ENTERPRISE_BUSINESS_PLAN.pdf | PDF |

**URL de descarga:** `/api/v1/documents/download-zip?key=mano2025investor`

---

## 7. Credenciales de Prueba

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Superadmin | rrhh.milchollos@gmail.com | ManoAdmin2025! |

---

## 8. Arquitectura Técnica

```
/app/
├── backend/
│   ├── server.py          # API principal (NECESITA REFACTOR)
│   ├── routes/            # Rutas modulares (vacío)
│   └── .env               # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas React
│   │   └── components/    # Componentes reutilizables
│   └── firebase.json      # Configuración Firebase Hosting
├── mobile-app/
│   ├── android/           # Proyecto nativo Android
│   ├── ios/               # Proyecto nativo iOS
│   └── eas.json           # Configuración Expo EAS
└── docs/
    └── pdf/               # Documentos PDF para inversores
```

---

## 9. Tareas Completadas Recientemente

### 17 Enero 2025 - Sesión 5 (Refactorización Backend + SendGrid)
- [x] **Fase 1:** Extraídos modelos Pydantic a `/app/backend/models/all_schemas.py`
- [x] **Fase 2:** Extraídas funciones de autenticación a `/app/backend/core/auth.py`
- [x] **Fase 3-4:** Extraídas rutas a archivos modulares (auth, investors, threats, profile, contacts, family, sos)
- [x] server.py reducido de **4848 → 3042 líneas** (~37% reducción, 1806 líneas menos)
- [x] **SendGrid configurado** con API Key real - emails funcionando
- [x] Backend verificado y funcionando correctamente

### 16 Enero 2025 - Sesión 4 (Bug Fix Inversores)
- [x] **CORREGIDO:** Flujo de aprobación de inversores ahora muestra acceso a descargas
- [x] Añadido botón "Descargas" en el header del Dashboard para inversores
- [x] Añadido banner prominente "Acceso de Inversor Verificado" en Dashboard
- [x] Navegación directa a página /downloads funcional

### 16 Enero 2025 - Sesión 3 (Integraciones)
- [x] Nordigen Open Banking - Rutas implementadas en `/api/banking/*`
- [x] SendGrid Email - Rutas implementadas en `/api/email/*`
- [x] WhatsApp Cloud API - Rutas implementadas en `/api/whatsapp/*`
- [x] Componente BankingIntegration.jsx creado
- [x] Variables de entorno añadidas al .env
- [x] Guía de despliegue IONOS/Firebase creada
- [x] Guía de compilación móvil creada

### 16 Enero 2025 - Sesión 2
- [x] Precios sincronizados frontend/backend
- [x] Nueva página PaymentSuccess.js con mensaje "Gracias por tu pedido"
- [x] Checkout redirige a /payment-success
- [x] Testing: 23/23 tests pasados

### 16 Enero 2025 - Sesión 1
- [x] Panel Admin - Botones Activar/Desactivar usuarios
- [x] Panel Admin - Botón Cancelar suscripción
- [x] Panel Familiar - Clic en tarjeta de miembro abre editor
- [x] Testing: 17/17 tests pasados

---

## 10. Tareas Pendientes

### P0 - Crítico
- [x] ~~Fase 1: Extraer modelos a archivo separado~~ - Completado
- [x] ~~Fase 2: Extraer helpers y funciones de autenticación~~ - Completado  
- [x] ~~Fase 3: Extraer rutas por dominio (auth, investors, threats)~~ - Completado (parcial)
- [ ] Fase 4: Continuar extrayendo más rutas (contacts, family, admin, payments, etc.)

### P1 - Alta Prioridad
- [ ] Despliegue Firebase Hosting (manoprotect.com) - Guía creada
- [ ] Completar compilación Expo EAS (bloqueado en máquina del usuario) - Guía creada
- [ ] Obtener API Keys para integraciones:
  - [ ] NORDIGEN_SECRET_ID y NORDIGEN_SECRET_KEY (https://gocardless.com/bank-account-data/)
  - [ ] SENDGRID_API_KEY (https://sendgrid.com/)
  - [ ] WHATSAPP_TOKEN y WHATSAPP_PHONE_ID (https://developers.facebook.com/docs/whatsapp)

### P2 - Media Prioridad
- [ ] Integrar componente BankingIntegration en Dashboard
- [ ] Crear página de configuración de integraciones en Admin Panel

### P3 - Backlog
- [ ] Mejorar análisis IA de amenazas

---

## 11. URLs de Producción

| Servicio | URL |
|----------|-----|
| Preview Web | https://digital-guard-1.preview.emergentagent.com |
| Dominio Custom | https://manoprotect.com (pendiente DNS) |

---

## 12. Testing y QA

| Iteración | Tests | Resultado |
|-----------|-------|-----------|
| Iteration 12 | 17 tests | 100% pasados |
| Iteration 13 | 23 tests | 100% pasados |
| Iteration 14 | 36 tests | 100% pasados |

**Archivos de test:** `/app/tests/test_iteration_*.py`
**Reportes:** `/app/test_reports/iteration_*.json`

---

## 13. Documentación Creada

| Documento | Descripción |
|-----------|-------------|
| `/app/docs/GUIA_DESPLIEGUE_IONOS.md` | Despliegue web en Firebase/IONOS |
| `/app/docs/GUIA_COMPILACION_MOVIL.md` | Compilar APK con Expo EAS |
| `/app/docs/GUIA_API_KEYS.md` | Obtener API keys para integraciones |

---

*Documento actualizado: 16 Enero 2025*
