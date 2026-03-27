# ManoProtect - Google Play Console Setup Guide

## 📱 Preparación para Google Play Console

### 1. Requisitos Previos

#### Cuenta de Desarrollador
- Crear cuenta en [Google Play Console](https://play.google.com/console)
- Pagar tarifa única de $25 USD
- Verificar identidad de desarrollador

#### Firmas y Keystore
```bash
# Crear keystore para firmar APK/AAB
keytool -genkey -v -keystore manoprotect-release.keystore \
  -alias manoprotect \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Información de la App

```yaml
Nombre: ManoProtect
Subtítulo: Protección Familiar Digital
Descripción corta: Protege a tu familia contra fraudes y estafas digitales

Categoría: Herramientas > Seguridad
Clasificación: PEGI 3 / Everyone

Países: España (inicial), luego expansión a LATAM
```

### 3. Assets Requeridos

| Asset | Dimensiones | Ubicación |
|-------|-------------|-----------|
| Icono | 512x512 | `/icons/icon-512x512.png` |
| Feature Graphic | 1024x500 | `/manoprotect_feature_1024x500.png` |
| Screenshots Phone | 1080x1920 | `/screenshots/` |
| Screenshots Tablet 7" | 1200x1600 | `/tablet7_*.png` |
| Screenshots Tablet 10" | 2560x1600 | `/tablet10_*.png` |

### 4. Ficha de Play Store

#### Descripción Larga (4000 caracteres max)
```
🛡️ ManoProtect - Tu escudo digital contra fraudes

¿Preocupado por la seguridad digital de tu familia? ManoProtect te protege contra:

✅ PHISHING - Detecta emails fraudulentos
✅ SMISHING - Bloquea SMS de estafa
✅ VISHING - Alerta sobre llamadas sospechosas

🆘 BOTÓN SOS DE EMERGENCIA
- Envía tu ubicación GPS exacta a familiares
- Notificaciones push + SMS instantáneos
- Sirena de alerta en dispositivos de contactos

📍 ZONAS SEGURAS (Geofencing)
- Define áreas seguras: casa, colegio, trabajo
- Alertas cuando tus hijos entran o salen
- Radio personalizable de 50m a 500m

👨‍👩‍👧‍👦 PROTECCIÓN FAMILIAR
- Localización en tiempo real
- Historial de ubicaciones
- Hasta 5 miembros por familia

🤖 ASISTENTE IA 24/7
- Chat inteligente con respuestas instantáneas
- Soporte en español
- Escalamiento a agentes humanos

PLANES:
• Gratis: Funciones básicas + 1 zona segura
• Familiar (4.99€/mes): Todo ilimitado, sin anuncios
• Familiar Anual (49.99€/año): 2 meses gratis

Desarrollado en España por STARTBOOKING SL
Cumple con RGPD y normativa europea de protección de datos
```

### 5. Configuración de Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear proyecto "manoprotect-app"
3. Añadir app Android con package: `com.manoprotect.www.twa`
4. Descargar `google-services.json`
5. Habilitar:
   - Cloud Messaging (FCM)
   - Analytics
   - Crashlytics (opcional)

### 6. Configuración de AdMob

1. Ir a [AdMob Console](https://admob.google.com)
2. Crear app con los mismos datos
3. Crear unidades de anuncio:
   - Intersticial (al iniciar app)
   - Banner (opcional)
4. Vincular con Firebase

**IDs actuales:**
- App ID: `ca-app-pub-7713974112203810~9265947358`
- Intersticial Test: `ca-app-pub-3940256099942544/1033173712`

### 7. Generar AAB

```bash
cd android-project/

# Configurar signing en gradle.properties
MANOPROTECT_STORE_FILE=../manoprotect-release.keystore
MANOPROTECT_STORE_PASSWORD=tu_password
MANOPROTECT_KEY_ALIAS=manoprotect
MANOPROTECT_KEY_PASSWORD=tu_password

# Build release
./gradlew bundleRelease

# El AAB estará en:
# app/build/outputs/bundle/release/app-release.aab
```

### 8. Subir a Play Console

1. Crear nueva app en Play Console
2. Configurar ficha de la tienda
3. Subir AAB a Internal Testing
4. Probar con equipo interno
5. Pasar a Closed Testing (beta)
6. Lanzar a Production

### 9. Checklist Pre-Lanzamiento

- [ ] Política de privacidad publicada
- [ ] Términos de servicio publicados
- [ ] Declaración de permisos completada
- [ ] Cuestionario de contenido completado
- [ ] Datos de contacto de soporte
- [ ] Precios y suscripciones configurados
- [ ] Digital Asset Links verificado
- [ ] Firebase Analytics funcionando
- [ ] Crashlytics configurado
- [ ] AdMob IDs de producción

### 10. URLs Importantes

- App: https://manoprotectt.com
- Privacidad: https://manoprotectt.com/privacidad
- Términos: https://manoprotectt.com/terminos
- Soporte: info@manoprotectt.com
- WhatsApp: +34 601 510 950

---

## 🚀 Timeline Sugerido

| Día | Acción |
|-----|--------|
| 1 | Crear cuenta Play Console |
| 2 | Preparar assets y descripciones |
| 3 | Generar keystore y AAB |
| 4 | Subir a Internal Testing |
| 5-7 | Testing interno |
| 8 | Closed Testing (beta) |
| 9-14 | Beta testing |
| 15 | Lanzamiento Production |
