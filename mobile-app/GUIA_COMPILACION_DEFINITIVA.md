# GUIA DEFINITIVA - Compilar ManoProtect AAB

## Tienes 3 opciones para compilar. Elige la que prefieras:

---

## OPCION 1: GitHub Actions (RECOMENDADA - No necesitas nada instalado)

### Pasos:
1. En Emergent, haz clic en **"Save to Github"** para subir el codigo al repositorio
2. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/TU_REPO`
3. Haz clic en la pestana **"Actions"**
4. En la barra lateral izquierda, selecciona **"Build Android AAB - ManoProtect"**
5. Haz clic en **"Run workflow"** > **"Run workflow"**
6. Espera ~10-15 minutos
7. Una vez completado (icono verde), haz clic en el build
8. En la seccion **"Artifacts"**, descarga **"ManoProtect-v2.0.1-release"**
9. Descomprime el ZIP. Dentro encontraras `app-release.aab`
10. Sube el AAB a [Google Play Console](https://play.google.com/console)

### Si falla:
- Haz clic en el job que fallo para ver los logs
- Captura pantalla del error y compartela aqui

---

## OPCION 2: Compilar en Windows (local)

### Requisitos previos:
1. **JDK 17**: Descarga de https://adoptium.net/temurin/releases/
   - Selecciona: Windows x64, JDK, version 17
   - Instala y reinicia la terminal
   
2. **Node.js 18+**: Descarga de https://nodejs.org/
   
3. **Android SDK**: Instala Android Studio https://developer.android.com/studio
   - Abre Android Studio > SDK Manager
   - Instala Android SDK 34 y Build Tools 34.0.0

### Configurar JAVA_HOME:
Abre PowerShell como administrador y ejecuta:
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot", "User")
```
(Ajusta la ruta segun tu instalacion de JDK 17)

### Compilar:
1. Abre PowerShell en la carpeta `mobile-app`
2. Ejecuta:
```powershell
.\compilar-windows.ps1
```

Para una compilacion limpia:
```powershell
.\compilar-windows.ps1 -Clean
```

El archivo AAB se generara en:
```
android\app\build\outputs\bundle\release\app-release.aab
```

---

## OPCION 3: Compilar en macOS/Linux

### Requisitos:
- JDK 17 (`brew install openjdk@17` en macOS)
- Node.js 18+
- Android SDK

### Compilar:
```bash
cd mobile-app
chmod +x compilar.sh
./compilar.sh
```

Para compilacion limpia:
```bash
./compilar.sh --clean
```

---

## Subir a Google Play

1. Ve a [Google Play Console](https://play.google.com/console)
2. Selecciona tu app **ManoProtect**
3. Ve a **Produccion** > **Crear nueva version**
4. Sube el archivo `app-release.aab`
5. Completa las notas de la version
6. Envia para revision

---

## Informacion de firma (ya configurada)

- **Keystore**: `manoprotect-2025.keystore`
- **Alias**: `manoprotect`
- **Version**: 2.0.1 (versionCode: 3)
- **Package**: `com.manoprotect.www.twa`

---

## Versiones de herramientas

| Herramienta | Version |
|---|---|
| React Native | 0.73.2 |
| Gradle | 8.3 |
| Android Gradle Plugin | 8.1.4 |
| Kotlin | 1.9.22 |
| JDK | 17 |
| compileSdk | 34 |
| targetSdk | 34 |
| minSdk | 24 |
