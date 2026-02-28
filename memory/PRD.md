# ManoProtect - Product Requirements Document v2.1.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias con dispositivos Sentinel (X, J, S) y sistemas de alarma para viviendas y empresas.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## Implemented Features (Feb 28, 2026)

### CEO Dashboard Enterprise (8 secciones)
- Dashboard: 6 stat cards, 3 inventario, 3 graficos (barras/linea/circular), alertas, contadores promo, actividad
- Inventario: Tabla Sentinel X/J/S, filtros producto/estado, botones Anadir/Editar/Marcar vendido
- Usuarios: Nombre, Email, ID, IP, Plan, Estado + cambiar plan + suspender + bloquear IP + CSV
- Membresias: Tabla suscripciones, promo flag, panel gestion planes, alertas expiracion
- Pagos: Tabla transacciones (19+ reales), CSV/PDF + Panel reembolsos Aprobar/Rechazar
- Seguridad: Admins, 2FA, intentos fallidos, Panel bloqueo IPs, registro actividad por IP
- Mensajes: Tabla contacto con badge no leidos
- Reportes: Exportar CSV usuarios/pagos, resumen financiero MRR/Hoy/Mes/Total
- Notificaciones Push: Campana con polling cada 10s

### Sistema de Deteccion y Bloqueo de IP
- Middleware IPBlockMiddleware bloquea IPs de lista negra (cache 30s)
- Auto-detecta IP en login/registro (last_login_ip, registration_ip)
- CEO puede bloquear/desbloquear desde panel Seguridad o tabla Usuarios
- IPs bloqueadas no pueden acceder a web ni app (HTTP 403)

### Tabla Comparativa (14 funciones premium - TODAS true para X/J/S)
GPS en tiempo real, Boton SOS, Resistente al agua, Conectividad 4G, Bluetooth 5.0, SOS invisible, Grabacion en la nube, Correas intercambiables, Alerta anti-retirada, Sirena 120dB, E-SIM integrada, Con camara y con internet, Sensor cardiaco, Funciona en segundo plano

### Segundo Plano / Background Mode
- Seccion en landing: Movil Bloqueado + E-SIM Integrada + Segundo Plano
- AndroidManifest.xml: ACCESS_BACKGROUND_LOCATION, FOREGROUND_SERVICE_LOCATION
- Info.plist: UIBackgroundModes location, NSLocationAlwaysAndWhenInUseUsageDescription

### Pagina de Alarmas para Viviendas y Empresas (NEW - Feb 28, 2026)
- Ruta: /seguridad-hogar-empresa, /alarmas, /kits-alarma
- Hero con imagen profesional de sistema de alarma instalado en hogar espanol
- Galeria de componentes con imagenes generadas: centralita hub, camaras IP 4K, sirena exterior, sensor PIR, contacto magnetico, relojes Sentinel X/J/S
- Pestanas de filtro interactivas: Todos, Camaras, Sensores, Centralitas y Sirenas, Relojes Sentinel
- 3 kits de alarma con imagenes: Hogar Basico (29,99EUR/mes), Hogar Premium (49,99EUR/mes), Empresa (89,99EUR/mes)
- Tabla comparativa de 16 filas entre los 3 kits
- Seccion de integracion con relojes Sentinel (imagen trio + watch individual)
- Seccion de seguridad empresarial con imagen
- Trust badges: +2.500 hogares, +800 empresas, <60s respuesta, 4.8/5 valoracion
- FAQ con 8 preguntas acordeon
- CTAs que navegan a /contacto

### Boton SOS Flotante - ELIMINADO (Feb 28, 2026)
- Componente FloatingSOSButton eliminado de App.js y archivo borrado
- Paginas SOS originales (/servicios-sos) siguen funcionando sin cambios

### UX y Conversion
- Banner "Probar 7 dias gratis": fijo abajo en todas las paginas publicas
- Popup urgencia stock: aparece a los 8 segundos mostrando stock restante
- Contadores en tiempo real en /plans: 50/50 Sentinel Basic + 200/200 plazas -20%

### SEO Fase 3
- robots.txt optimizado, sitemap.xml 24+ URLs
- 7 landing pages SEO long-tail
- Schema markup avanzado

### Video Marketing
- 1 video real (Sora 2) + 3 imagenes de familias espanolas

## Backlog
- P1: IDs Meta Pixel, Hotjar, Google SC (bloqueado por usuario)
- P1: Funcionalidad de pago para kits de alarma (botones "Contratar" funcionales con Stripe)
- P2: Remarketing/A/B testing, SEO Fase 4
- P2: Generar videos marketing restantes (bloqueado por credito Sora 2)
- P2: Mejorar pagina "Quienes Somos"
- P3: Integraciones 112, BigQuery, PayPal
- P3: App iOS con Capacitor (requiere Mac+Xcode)

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
