# ManoProtect - Product Requirements Document

## Estado Actual: ACTIVO (ManoProtect.com independiente)

## Última actualización: 28 de enero de 2026

---

## Descripción del Producto
ManoProtect es una plataforma de protección contra fraudes y estafas digitales diseñada para familias españolas. Ofrece detección automática de phishing, bloqueo de llamadas fraudulentas, alertas en tiempo real y monitoreo de seguridad digital.

## Arquitectura
- **Frontend**: React con TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Base de datos**: MongoDB
- **Servicios**: Firebase (Analytics, Auth), Stripe (pagos)

---

## Funcionalidades Implementadas ✅

### Core de Protección
- [x] Detección automática de phishing
- [x] Bloqueo de llamadas fraudulentas
- [x] Alertas en tiempo real (SMS y Email)
- [x] Base de datos de estafadores conocidos
- [x] Verificador público de estafas (`/verificar-estafa`)

### Autenticación y Usuarios
- [x] Login con email/password
- [x] Google OAuth
- [x] Registro de usuarios
- [x] Recuperación de contraseña
- [x] Perfiles de usuario

### Dashboard y Analytics
- [x] Dashboard de protección
- [x] Analizador de amenazas
- [x] Historial de alertas
- [x] Modo familiar (protección para menores)

### Planes y Pagos
- [x] Página de precios (`/pricing`)
- [x] Integración con Stripe
- [x] Planes: Personal, Familiar, Premium, Enterprise

### SEO y Conversión
- [x] Meta tags optimizados
- [x] Sitemap y robots.txt
- [x] 6 testimonios de clientes
- [x] Logos de partners (Visa, Mastercard, PayPal, Stripe, OpenAI, Microsoft)
- [x] Badges de confianza (SSL, RGPD, ISO 27001, PCI DSS, Banco de España)
- [x] Estadísticas de impacto (+15.000 familias, 50.000+ fraudes bloqueados)
- [x] Banner de urgencia
- [x] Botón flotante de WhatsApp

### Páginas Legales
- [x] Política de privacidad
- [x] Términos de servicio
- [x] Política de reembolsos
- [x] Aviso legal

---

## Rutas Activas

### Públicas
- `/` - Landing page principal
- `/promo` - Landing promocional
- `/pricing` - Planes y precios
- `/how-it-works` - Cómo funciona
- `/knowledge` - Base de conocimiento
- `/community` - Comunidad
- `/verificar-estafa` - Verificador de estafas
- `/registro` - Registro de usuarios
- `/login` - Inicio de sesión
- `/recuperar-password` - Recuperación de contraseña

### Protegidas (requieren login)
- `/dashboard` - Panel principal
- `/family-mode` - Modo familiar
- `/family-admin` - Administración familiar
- `/child-tracking` - Seguimiento de menores
- `/contacts` - Contactos de confianza
- `/profile` - Perfil de usuario
- `/rewards` - Recompensas
- `/enterprise` - Dashboard empresarial

### Admin
- `/admin` - Panel de administración

---

## Separación ManoBank.es (RESERVADO)

El 28 de enero de 2026 se separó completamente el código de ManoBank para mantenerlo independiente hasta que el dominio ManoBank.es esté configurado.

### Ubicación del código reservado
`/app/manobank_reserved/`

### Contenido reservado (53 archivos)
- Frontend: 10 páginas de React
- Backend: 6 rutas, 4 servicios
- Compliance: AML, KYC, Reporting
- Ledger: Sistema de libro mayor
- Tests: 5 archivos de pruebas

### Para reactivar ManoBank
1. Configurar dominio ManoBank.es
2. Crear correos corporativos (@manobank.es)
3. Restaurar archivos desde `/app/manobank_reserved/`
4. Descomentar rutas en `server.py`
5. Actualizar CORS
6. Configurar base de datos separada si es necesario

---

## Backlog / Próximas Tareas

### P0 - Crítico
- (Ninguno pendiente)

### P1 - Alta Prioridad
- [ ] Mejorar UX del dashboard de protección
- [ ] Implementar notificaciones push
- [ ] Añadir más idiomas (Catalán, Gallego, Euskera)

### P2 - Media Prioridad
- [ ] Apps móviles (Android/iOS) para ManoProtect
- [ ] Integración con más bancos españoles
- [ ] API pública para empresas

### P3 - Baja Prioridad
- [ ] Gamificación y sistema de puntos
- [ ] Integración con redes sociales
- [ ] Extensión para navegador

---

## Credenciales de Prueba

### Admin ManoProtect
- Email: admin@manoprotect.com
- Password: (configurar en producción)

---

## APIs Mockeadas ⚠️
- Twilio SMS: Logs a consola en desarrollo
- Stripe: Usa claves de test

---

## Contacto
- Web: https://manoprotect.com
- Email: info@manoprotect.com
- WhatsApp: +34 XXX XXX XXX
