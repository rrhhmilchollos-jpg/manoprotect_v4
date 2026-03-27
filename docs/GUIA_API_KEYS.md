# Guía de Configuración de API Keys - MANO

Esta guía te ayudará a obtener las API keys necesarias para activar las integraciones de MANO.

---

## 1. Nordigen Open Banking (GoCardless)

Nordigen permite conectar con bancos europeos para analizar transacciones y detectar fraudes.

### Obtener API Keys (Gratis)

1. Ve a https://gocardless.com/bank-account-data/
2. Clic en "Get API keys" o "Start free"
3. Crea una cuenta con tu email empresarial
4. Verifica tu email
5. En el dashboard, ve a "Developers" > "User secrets"
6. Crea un nuevo secreto
7. Copia:
   - **Secret ID** → `NORDIGEN_SECRET_ID`
   - **Secret Key** → `NORDIGEN_SECRET_KEY`

### Configuración en MANO

```bash
# En /app/backend/.env
NORDIGEN_SECRET_ID=tu_secret_id_aqui
NORDIGEN_SECRET_KEY=tu_secret_key_aqui
```

### Límites del Plan Gratuito
- 500 conexiones de cuenta/mes
- 10 requisitions activas simultáneas
- Acceso a todos los bancos europeos

---

## 2. SendGrid Email

SendGrid permite enviar emails transaccionales (bienvenida, alertas, recibos).

### Obtener API Key

1. Ve a https://sendgrid.com/
2. Clic en "Start for Free"
3. Crea una cuenta (requiere verificación de email)
4. Una vez dentro, ve a "Settings" > "API Keys"
5. Clic en "Create API Key"
6. Nombre: `MANO Production`
7. Permisos: "Full Access" o al menos "Mail Send"
8. Clic en "Create & View"
9. Copia la API Key (solo se muestra una vez!)

### Configuración en MANO

```bash
# En /app/backend/.env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=noreply@manoprotectt.com
```

### Verificar Dominio (Opcional pero recomendado)
1. Ve a "Settings" > "Sender Authentication"
2. Sigue los pasos para verificar tu dominio
3. Esto mejora la entregabilidad de emails

### Límites del Plan Gratuito
- 100 emails/día para siempre
- Sin tarjeta de crédito requerida

---

## 3. WhatsApp Business API (Meta)

WhatsApp Cloud API permite enviar alertas y notificaciones.

### Requisitos Previos
- Cuenta de Facebook Business verificada
- Número de teléfono dedicado para WhatsApp Business

### Obtener Credenciales

1. Ve a https://developers.facebook.com/
2. Inicia sesión con tu cuenta de Facebook
3. Clic en "My Apps" > "Create App"
4. Tipo: "Business"
5. Nombre: "MANO Protect"
6. Selecciona tu Business Account

7. En el dashboard de la app:
   - Busca "WhatsApp" en los productos
   - Clic en "Set up"

8. Sigue el wizard de configuración:
   - Selecciona o crea un WhatsApp Business Account
   - Añade un número de teléfono (o usa el de prueba)

9. Ve a "WhatsApp" > "API Setup":
   - Copia el **Phone number ID** → `WHATSAPP_PHONE_ID`
   - Genera un **Permanent Token** → `WHATSAPP_TOKEN`

### Configuración en MANO

```bash
# En /app/backend/.env
WHATSAPP_TOKEN=EAAG...tu_token_permanente
WHATSAPP_PHONE_ID=1234567890123456
WHATSAPP_VERIFY_TOKEN=mano_verify_token
```

### Configurar Webhook (Opcional)
1. En la configuración de WhatsApp, ve a "Configuration"
2. Webhook URL: `https://tu-dominio.com/api/whatsapp/webhook`
3. Verify token: `mano_verify_token`
4. Suscríbete a eventos: `messages`

### Límites
- 1,000 conversaciones gratis/mes
- Mensajes de plantilla requieren aprobación previa

---

## Verificar Configuración

Después de añadir las keys al `.env`, reinicia el backend:

```bash
sudo supervisorctl restart backend
```

Luego verifica que las integraciones estén activas:

```bash
# Banking
curl https://tu-dominio.com/api/banking/status

# Email
curl https://tu-dominio.com/api/email/status

# WhatsApp
curl https://tu-dominio.com/api/whatsapp/status
```

Cada endpoint debería devolver `"configured": true`.

---

## Solución de Problemas

### "configured": false
- Verifica que las variables están en el archivo `.env` correcto
- Reinicia el backend después de cambiar `.env`
- Verifica que no hay espacios extra en los valores

### Errores de autenticación
- Regenera las API keys si han expirado
- Verifica que los permisos son correctos

### Emails no llegan
- Verifica el dominio en SendGrid
- Revisa la carpeta de spam
- Usa un email de envío verificado

### WhatsApp no envía
- El número receptor debe haber iniciado conversación primero (en producción)
- En modo sandbox, solo puedes enviar a números verificados

---

## Contacto de Soporte

- **Nordigen:** support@gocardless.com
- **SendGrid:** support.sendgrid.com
- **WhatsApp:** developers.facebook.com/support

---

*Documento creado: Enero 2025*
