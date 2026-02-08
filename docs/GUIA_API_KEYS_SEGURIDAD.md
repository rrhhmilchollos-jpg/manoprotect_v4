# GUÍA: Cómo Obtener las Claves API de Seguridad

Para activar el análisis completo de seguridad, necesitas obtener claves API de los siguientes servicios:

---

## 1. Google Safe Browsing API (GRATIS)

### Pasos:
1. Ve a: https://console.cloud.google.com/
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services → Library**
4. Busca "Safe Browsing API" y haz clic en **Enable**
5. Ve a **APIs & Services → Credentials**
6. Haz clic en **Create Credentials → API Key**
7. Copia la clave generada

### Límites gratuitos:
- 10,000 consultas/día GRATIS

---

## 2. VirusTotal API (GRATIS con límites)

### Pasos:
1. Ve a: https://www.virustotal.com/
2. Crea una cuenta gratuita
3. Ve a tu perfil → **API Key**
4. Copia tu API Key

### Límites gratuitos:
- 500 consultas/día
- 4 consultas/minuto

---

## 3. AbuseIPDB API (GRATIS)

### Pasos:
1. Ve a: https://www.abuseipdb.com/
2. Crea una cuenta gratuita
3. Ve a **Account → API**
4. Haz clic en **Create API Key**
5. Copia la clave

### Límites gratuitos:
- 1,000 consultas/día

---

## 4. AlienVault OTX (GRATIS)

### Pasos:
1. Ve a: https://otx.alienvault.com/
2. Crea una cuenta gratuita
3. Ve a **Settings → API Integration**
4. Copia tu OTX Key

### Límites:
- Sin límites estrictos para uso normal

---

## Configurar las Claves

Una vez tengas las claves, añádelas al archivo `/app/backend/.env`:

```env
# APIs de Seguridad
GOOGLE_SAFE_BROWSING_API_KEY=tu_clave_google_aqui
VIRUSTOTAL_API_KEY=tu_clave_virustotal_aqui
ABUSEIPDB_API_KEY=tu_clave_abuseipdb_aqui
ALIENVAULT_OTX_KEY=tu_clave_alienvault_aqui
```

Después de añadir las claves, reinicia el backend:
```bash
sudo supervisorctl restart backend
```

---

## Estado Actual

Sin las claves API, ManoProtect sigue funcionando con:
- ✅ Detección de patrones de estafa en mensajes
- ✅ Análisis básico de URLs sospechosas
- ✅ Detección de typosquatting de marcas

Con las claves API activadas:
- ✅ Verificación en tiempo real con Google Safe Browsing
- ✅ Análisis con 70+ motores antivirus (VirusTotal)
- ✅ Verificación de reputación de IPs (AbuseIPDB)
- ✅ Threat Intelligence comunitaria (AlienVault)

---

## Recomendación

Para empezar, obtén al menos:
1. **Google Safe Browsing** - Es gratuito y tiene muchas consultas
2. **AbuseIPDB** - Para verificar IPs sospechosas

VirusTotal y AlienVault son opcionales pero mejoran la detección.
