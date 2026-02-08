# 📱 Guía de Compilación - ManoProtect Android (Actualizada Android 15+)

## ✅ Correcciones para Google Play Incluidas

Esta versión soluciona los problemas reportados por Google Play:

| Problema | Estado |
|----------|--------|
| Edge-to-Edge no funciona | ✅ Corregido |
| APIs obsoletas (setStatusBarColor, etc.) | ✅ Eliminadas |
| Restricciones de orientación | ✅ Removidas |
| Target SDK 35 (Android 15) | ✅ Configurado |

---

## 📋 Requisitos Previos

| Software | Versión | Descarga |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| Java JDK | 17 | https://adoptium.net/ |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | 35 | Via SDK Manager |

---

## 🔑 Configurar Keystore (IMPORTANTE)

### 1. Copia el keystore al proyecto:
```cmd
copy C:\WINDOWS\system32\manoprotect-2025.keystore mobile-app\android\app\
```

### 2. Edita `mobile-app/android/gradle.properties`:
Añade estas líneas al final del archivo:

```properties
MYAPP_UPLOAD_STORE_FILE=manoprotect-2025.keystore
MYAPP_UPLOAD_KEY_ALIAS=manoprotect
MYAPP_UPLOAD_STORE_PASSWORD=19862210Des
MYAPP_UPLOAD_KEY_PASSWORD=19862210Des
```

---

## 🚀 Compilar el AAB

### Paso 1: Descargar código
- En Emergent → **"Download Code"**
- Descomprime el ZIP en tu PC

### Paso 2: Instalar dependencias
```cmd
cd mobile-app
yarn install
```

### Paso 3: Compilar
```cmd
cd android
gradlew bundleRelease
```

### Paso 4: Resultado
```
mobile-app/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📤 Subir a Google Play

1. Abre **[Google Play Console](https://play.google.com/console)**
2. Selecciona **ManoProtect**
3. **Producción** → **Crear nueva versión**
4. Sube `app-release.aab`
5. Notas de versión:
   ```
   Versión X.X.X
   - Compatibilidad con Android 15 (Edge-to-Edge)
   - Mejoras de rendimiento en pantallas grandes
   - Correcciones de estabilidad
   ```
6. **Enviar para revisión**

---

## 🔐 Tu Keystore

```
📁 Archivo: manoprotect-2025.keystore
🔑 Contraseña: 19862210Des
🏷️ Alias: manoprotect
📍 Ubicación original: C:\WINDOWS\system32\
```

**⚠️ GUARDA UNA COPIA DE SEGURIDAD DEL KEYSTORE**

---

## ⚙️ Configuración Técnica

| Parámetro | Valor |
|-----------|-------|
| applicationId | com.Manoprotect.Mano |
| targetSdkVersion | 35 |
| compileSdkVersion | 35 |
| minSdkVersion | 24 |
| buildToolsVersion | 35.0.0 |

---

## 🔧 Solución de Problemas

### "SDK Platform 35 not installed"
```
Android Studio → SDK Manager → SDK Platforms → Android 15 (API 35) → Install
```

### "keystore file not found"
Verifica que copiaste el keystore a `android/app/`

### "signing config missing"
Verifica las 4 líneas `MYAPP_*` en `gradle.properties`

### Error de memoria
```cmd
set GRADLE_OPTS=-Xmx4096m
gradlew bundleRelease
```

---

© 2025 STARTBOOKING SL - ManoProtect
