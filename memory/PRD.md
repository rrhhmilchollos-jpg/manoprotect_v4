# ManoProtect - Product Requirements Document v2.0.3

## Core Product
Plataforma líder en España de protección digital y física para familias con dispositivos Sentinel (X, J, S).

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## Implemented Features (Feb 28, 2026)

### CEO Dashboard Enterprise (8 secciones)
- Dashboard: 6 stat cards, 3 inventario, 3 gráficos (barras/línea/circular), alertas, contadores promo, actividad
- Inventario: Tabla Sentinel X/J/S, filtros producto/estado, botones Añadir/Editar/Marcar vendido
- Usuarios: Nombre, Email, ID, IP, Plan, Estado + cambiar plan + suspender + bloquear IP + CSV
- Membresías: Tabla suscripciones, promo flag, panel gestión planes, alertas expiración
- Pagos: Tabla transacciones (19+ reales), CSV/PDF + Panel reembolsos Aprobar/Rechazar
- Seguridad: Admins, 2FA, intentos fallidos, **Panel bloqueo IPs**, registro actividad por IP
- Mensajes: Tabla contacto con badge no leídos
- Reportes: Exportar CSV usuarios/pagos, resumen financiero MRR/Hoy/Mes/Total
- Notificaciones Push: Campana con polling cada 10s

### Sistema de Detección y Bloqueo de IP
- Middleware `IPBlockMiddleware` bloquea IPs de lista negra (cache 30s)
- Auto-detecta IP en login/registro (`last_login_ip`, `registration_ip`)
- CEO puede bloquear/desbloquear desde panel Seguridad o tabla Usuarios
- IPs bloqueadas no pueden acceder a web ni app (HTTP 403)
- Endpoints: `POST /api/ceo/block-ip`, `POST /api/ceo/unblock-ip`, `GET /api/ceo/blocked-ips`

### Tabla Comparativa (14 funciones premium - TODAS true para X/J/S)
GPS en tiempo real, Botón SOS, Resistente al agua, Conectividad 4G, Bluetooth 5.0, SOS invisible, Grabación en la nube, Correas intercambiables, Alerta anti-retirada, Sirena 120dB, **E-SIM integrada**, **Con cámara y con internet**, Sensor cardíaco, **Funciona en segundo plano**

### Segundo Plano / Background Mode
- Sección en landing: Móvil Bloqueado + E-SIM Integrada + Segundo Plano
- AndroidManifest.xml: ACCESS_BACKGROUND_LOCATION, FOREGROUND_SERVICE_LOCATION
- Info.plist: UIBackgroundModes location, NSLocationAlwaysAndWhenInUseUsageDescription
- Sentinel funciona independiente con E-SIM 4G incluso con móvil apagado

### UX & Conversión
- Botón SOS flotante: todas las páginas públicas, expande a "Llamar al 112" + "ManoProtect 24h"
- Banner "Probar 7 días gratis": fijo abajo en todas las páginas públicas
- Popup urgencia stock: aparece a los 8 segundos mostrando stock restante
- Contadores en tiempo real en /plans: 50/50 Sentinel Basic + 200/200 plazas -20%

### SEO Fase 3
- robots.txt optimizado, sitemap.xml 24+ URLs
- 7 landing pages SEO long-tail
- Schema markup avanzado

### Video Marketing
- 1 video real (Sora 2) + 3 imágenes de familias españolas

## Backlog
- P1: IDs Meta Pixel, Hotjar, Google SC (bloqueado)
- P2: Remarketing/A/B testing, SEO Fase 4
- P3: Integraciones 112, BigQuery, PayPal

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
