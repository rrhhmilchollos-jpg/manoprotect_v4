# 🚀 COMPILAR CON EAS BUILD (Método Más Confiable)

## ¿Por qué EAS Build?
- ✅ Maneja automáticamente incompatibilidades de Kotlin/Gradle
- ✅ Entorno x86 (no ARM64)
- ✅ Más estable que GitHub Actions
- ✅ Descarga directa del .aab

---

## 📋 PASOS:

### 1. Instalar EAS CLI (en tu PC)
```bash
npm install -g eas-cli
```

### 2. Login en Expo
```bash
eas login
```
(Si no tienes cuenta, créala gratis en https://expo.dev)

### 3. Configurar proyecto
```bash
cd /ruta/a/tu/proyecto/mobile-app
eas build:configure
```

### 4. Subir keystore
Coloca tu `manoprotect-2025.keystore` en `mobile-app/android/app/`

### 5. Compilar
```bash
eas build --platform android --profile production
```

**Se subirá a los servidores de Expo y compilará en ~10-15 minutos**

### 6. Descargar
Una vez termine, te dará un link para descargar el .aab directamente.

---

## 💰 COSTO:
- **GRATIS** para los primeros builds
- Después: $29/mes (pero puedes cancelar después del primer mes)

---

## 🔐 CREDENCIALES NECESARIAS:
El build te pedirá las passwords del keystore:
- **Keystore password:** `19862210Des`
- **Key alias:** `manoprotect`
- **Key password:** `19862210Des`

---

## ✅ RESULTADO:
Link de descarga directo del .aab listo para Google Play Store.

---

**¿Quieres que te guíe paso a paso con EAS Build?** 🚀
