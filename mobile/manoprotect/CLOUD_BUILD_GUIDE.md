# 🚀 Compilar Apps ManoProtect - Servicios Cloud Gratuitos

## Opción 1: Codemagic (RECOMENDADO - Gratis)

### Pasos:
1. **Ir a:** https://codemagic.io/start
2. **Registrarse** con GitHub/GitLab/Bitbucket
3. **Añadir aplicación** → Seleccionar repositorio
4. **Configuración** ya incluida en `codemagic.yaml`
5. **Iniciar build** → Descargar APK/AAB

### Características:
- ✅ 500 minutos gratis/mes
- ✅ Compila Android + iOS
- ✅ Genera APK, AAB e IPA
- ✅ Publica automáticamente a Play Store/App Store

---

## Opción 2: Bitrise (Gratis con límites)

### URL: https://app.bitrise.io/users/sign_up

### Pasos:
1. Registrarse
2. Añadir app desde repositorio
3. Seleccionar "Capacitor" como tipo
4. Ejecutar workflow

---

## Opción 3: GitHub Actions (Si tienes el código en GitHub)

### URL: https://github.com/features/actions

Archivo `.github/workflows/build-android.yml` ya configurado.

---

## Opción 4: AppCenter (Microsoft - Gratis)

### URL: https://appcenter.ms/

### Pasos:
1. Crear cuenta Microsoft
2. Crear nueva app → Android
3. Conectar repositorio
4. Configurar build

---

## Opción 5: Appetize.io (Preview Online)

### URL: https://appetize.io/

Para probar la app sin compilar:
1. Subir APK existente
2. Obtener enlace de preview
3. Probar en navegador

---

## 📥 Descarga Directa (cuando esté compilada)

Una vez compilada en cualquier servicio, recibirás:

| Archivo | Uso |
|---------|-----|
| `app-debug.apk` | Testing en dispositivos Android |
| `app-release.apk` | Distribución directa |
| `app-release.aab` | Subir a Google Play Store |
| `App.ipa` | Subir a App Store (iOS) |

---

## 🔑 Configuración Requerida

### Para Play Store (AAB firmado):
1. Crear keystore:
```bash
keytool -genkey -v -keystore manoprotect.keystore -alias manoprotect -keyalg RSA -keysize 2048 -validity 10000
```

2. Subir keystore a Codemagic/Bitrise

### Para App Store (iOS):
1. Apple Developer Account ($99/año)
2. Certificados de distribución
3. Provisioning profiles

---

## 📱 URL de la App (Backend)

La app se conecta a:
```
https://crm-dashboard-213.preview.emergentagent.com
```

Cuando despliegues a producción, actualizar en `capacitor.config.json`:
```json
{
  "server": {
    "url": "https://TU-DOMINIO-PRODUCCION.com"
  }
}
```

---

## Soporte

📧 info@manoprotect.com
