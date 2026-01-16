# MANO - Product Requirements Document

## Plataforma Integral de Protección contra Fraudes Digitales

**Última actualización:** 16 Enero 2025

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

### 3.2 Planes Familiares (con GPS + SOS)
| Plan | Precio | Usuarios | Características Exclusivas |
|------|--------|----------|---------------------------|
| Familiar Mensual | €49.99/mes | 5 | 🆘 Botón SOS + 📍 GPS automático |
| Familiar Trimestral | €129.99/3m | 5 | 🆘 Botón SOS + 📍 GPS automático |
| Familiar Anual | €399.99/año | 5 | 🆘 Botón SOS + 📍 GPS automático |

### 3.3 Función GPS + SOS (Solo Plan Familiar)
**Funcionamiento:**
1. Usuario pulsa botón SOS de emergencia
2. App captura ubicación GPS precisa automáticamente
3. Ubicación se envía a todos los contactos de emergencia familiar
4. Contactos reciben notificación con enlace a Google Maps

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

## 9. Tareas Pendientes

### P0 - Crítico
- [ ] Refactorizar server.py en rutas modulares

### P1 - Alta Prioridad
- [ ] Despliegue Firebase Hosting (manoprotect.com)
- [ ] Completar compilación Expo EAS

### P2 - Media Prioridad
- [ ] Configurar SendGrid para emails
- [ ] Configurar WhatsApp Business API

### P3 - Backlog
- [ ] Mejorar análisis IA de amenazas
- [ ] Integración bancaria real (actualmente mocked)

---

## 10. URLs de Producción

| Servicio | URL |
|----------|-----|
| Preview Web | https://fraudshield-20.preview.emergentagent.com |
| Dominio Custom | https://manoprotect.com (pendiente DNS) |

---

*Documento actualizado automáticamente*
