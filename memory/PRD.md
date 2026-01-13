# MANO - Plataforma Integral de Protección contra Fraudes Digitales

## Product Requirements Document (PRD)

### Problema Original
MANO es una aplicación y sistema profesional en tiempo real que protege a personas, familias, empresas y entidades públicas frente a fraudes, estafas, suplantaciones y engaños digitales, actuando antes, durante y después del ataque.

### Segmentos de Usuario
- **Particulares:** Detección en tiempo real de Phishing, Smishing, Vishing en llamadas, SMS, WhatsApp y email
- **Personas Mayores:** Modo "Protección Familiar" con botones grandes, lenguaje simple y alertas automáticas a familiares/cuidadores
- **Familias:** Panel de seguimiento de amenazas a miembros protegidos
- **Empresas:** Protección corporativa contra fraude bancario, facturas falsas y ataques a empleados
- **Bancos/Seguros:** Detección avanzada de fraude para proteger clientes
- **Municipios:** Canal verificado de alertas oficiales a ciudadanos

### Modelo de Negocio
- **Freemium:** Plan básico gratuito con funcionalidades limitadas
- **Premium:** Planes de suscripción (semanal €9.99, mensual €29.99, trimestral €74.99, anual €249.99)
- **Familiar:** Planes para hasta 5 usuarios (mensual €49.99, trimestral €129.99, anual €399.99)
- **Enterprise:** Precio personalizado para bancos y grandes corporaciones
- **Garantía:** 15 días de devolución sin preguntas

---

## Estado Actual de la Implementación

### ✅ Completado (Enero 2025)

#### Frontend (React + Tailwind CSS)
- [x] Landing Page con diseño profesional
- [x] Dashboard principal con análisis de amenazas
- [x] Página de Precios con 7 planes de suscripción
- [x] Página de Descargas con documentos para inversores
- [x] Página "Cómo Funciona"
- [x] Modo Familiar con botón SOS
- [x] Gestión de Contactos de Confianza
- [x] Perfil de Usuario
- [x] Base de Conocimiento sobre amenazas
- [x] Comunidad con alertas colectivas

#### Backend (FastAPI + MongoDB)
- [x] API de análisis de amenazas con IA (GPT-5.2)
- [x] Integración de Stripe para pagos (emergentintegrations)
- [x] Sistema de checkout con 7 planes de suscripción
- [x] Verificación de estado de pago
- [x] Webhooks de Stripe
- [x] Descarga de documentos markdown
- [x] CRUD de contactos de confianza
- [x] Sistema SOS/Pánico
- [x] Alertas comunitarias
- [x] Exportación de datos (CSV/JSON)
- [x] Base de conocimiento

#### Documentos de Negocio
- [x] Plan de Negocio Completo (72KB)
- [x] Modelo Financiero Detallado (10KB)
- [x] Pitch Deck para Inversores (23KB)
- [x] Dossier Comercial B2B (9KB)
- [x] Descripción App Store
- [x] Roadmap Técnico

### Integraciones Activas
- **Stripe Payments:** Usando emergentintegrations con clave de prueba
- **OpenAI GPT-5.2:** Análisis de amenazas con IA
- **MongoDB:** Base de datos para usuarios, amenazas, transacciones

---

## Arquitectura de Código

```
/app/
├── backend/
│   ├── .env                    # Variables de entorno
│   ├── requirements.txt        # Dependencias Python
│   └── server.py               # API principal FastAPI
├── frontend/
│   ├── .env                    # Variables de entorno
│   ├── package.json            # Dependencias React
│   ├── src/
│   │   ├── App.js              # Router principal
│   │   ├── pages/
│   │   │   ├── LandingPage.js  # Página de inicio
│   │   │   ├── Dashboard.js    # Panel principal
│   │   │   ├── Pricing.js      # Planes y checkout
│   │   │   ├── Downloads.js    # Documentos inversores
│   │   │   ├── HowItWorks.js   # Explicación del servicio
│   │   │   ├── FamilyMode.js   # Modo protección familiar
│   │   │   ├── Contacts.js     # Contactos de confianza
│   │   │   ├── Profile.js      # Perfil usuario
│   │   │   ├── Knowledge.js    # Base conocimiento
│   │   │   └── Community.js    # Alertas comunitarias
│   │   └── components/ui/      # Componentes Shadcn
└── memory/
    ├── PRD.md                  # Este documento
    ├── plan-de-negocio-completo.md
    ├── financial-model.md
    ├── pitch-deck-inversores.md
    ├── dossier-comercial-b2b.md
    ├── app-store-description.md
    └── roadmap-tecnico.md
```

---

## APIs Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/` | GET | Health check |
| `/api/analyze` | POST | Análisis de amenazas con IA |
| `/api/threats` | GET | Historial de amenazas |
| `/api/create-checkout-session` | POST | Crear sesión Stripe |
| `/api/checkout/status/{session_id}` | GET | Estado del pago |
| `/api/webhook/stripe` | POST | Webhooks de Stripe |
| `/api/download/{doc_type}` | GET | Descargar documentos |
| `/api/contacts` | GET/POST | Gestión contactos |
| `/api/sos` | POST | Alerta de emergencia |
| `/api/community-alerts` | GET | Alertas comunitarias |
| `/api/knowledge-base` | GET | Base de conocimiento |
| `/api/stats` | GET | Estadísticas usuario |
| `/api/export/threats` | GET | Exportar datos |

---

## Próximos Pasos (Backlog)

### P1 - Alta Prioridad
- [ ] Sistema de autenticación (JWT o Google Auth)
- [ ] Notificaciones push en tiempo real
- [ ] Dashboard empresarial
- [ ] Panel de administración familiar

### P2 - Media Prioridad
- [ ] Generación de PDF de documentos
- [ ] Integración con WhatsApp Business
- [ ] Detección de llamadas en tiempo real
- [ ] Dashboard de métricas avanzado

### P3 - Baja Prioridad
- [ ] App móvil nativa
- [ ] Integración con bancos
- [ ] Sistema de recompensas
- [ ] API pública para partners

---

## Notas Técnicas

### Stripe Integration
- Usa `emergentintegrations.payments.stripe.checkout`
- Clave: `STRIPE_API_KEY=sk_test_emergent`
- Flujo: origin_url → backend → checkout session → polling status

### Análisis de Amenazas
- Usa `emergentintegrations.llm.chat` con GPT-5.2
- Analiza phishing, smishing, vishing, suplantación
- Respuesta JSON con nivel de riesgo y recomendaciones

### Colecciones MongoDB
- `users`: Usuarios y suscripciones
- `threats`: Historial de análisis
- `contacts`: Contactos de confianza
- `sos_alerts`: Alertas de emergencia
- `community_alerts`: Alertas colectivas
- `payment_transactions`: Transacciones Stripe
