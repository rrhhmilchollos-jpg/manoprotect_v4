# GUÍA DE COMPILACIÓN ANDROID - ManoProtect 2.0.0

## IMPORTANTE: Lee esto primero

Esta guía está diseñada para compilar la app Android en tu ordenador Windows.
**Fecha límite para subir a Google Play: 8 de febrero de 2026** (cuando la nueva clave esté activa)

---

## OPCIÓN A: Usando Android Studio (RECOMENDADO)

### Paso 1: Instalar Android Studio
1. Descarga Android Studio desde: https://developer.android.com/studio
2. Instálalo con las opciones predeterminadas
3. Abre Android Studio y deja que descargue los componentes necesarios (puede tardar 10-20 minutos)

### Paso 2: Abrir el Proyecto
1. En Android Studio, selecciona **"Open"**
2. Navega a la carpeta del proyecto: `C:\Users\eds\Desktop\manoprotect_v1-main\mobile-app\android`
3. Haz clic en **"OK"**
4. Espera a que Android Studio sincronice el proyecto (barra de progreso abajo)

### Paso 3: Configurar la Firma
1. Ve a **File → Project Structure → Modules → app → Signing Configs**
2. Haz clic en el **+** para añadir una nueva configuración
3. Nombre: `release`
4. Rellena los campos:
   - **Store File**: `C:\Users\eds\Desktop\manoprotect-2025.keystore`
   - **Store Password**: `19862210Des`
   - **Key Alias**: `manoprotect`
   - **Key Password**: `19862210Des`
5. Haz clic en **Apply** y **OK**

### Paso 4: Generar el AAB
1. Ve a **Build → Generate Signed Bundle / APK**
2. Selecciona **Android App Bundle**
3. Haz clic en **Next**
4. Selecciona la configuración de firma que creaste
5. Selecciona **release** como Build Variant
6. Haz clic en **Finish**

### Paso 5: Encontrar el AAB
El archivo estará en:
```
C:\Users\eds\Desktop\manoprotect_v1-main\mobile-app\android\app\build\outputs\bundle\release\app-release.aab
```

---

## OPCIÓN B: Usando Línea de Comandos

### Paso 1: Preparar el Entorno

Abre **PowerShell como Administrador** y ejecuta estos comandos uno por uno:

```powershell
# Ir a la carpeta del proyecto
cd "C:\Users\eds\Desktop\manoprotect_v1-main\mobile-app"

# Verificar que estás en la carpeta correcta
dir
```

Deberías ver archivos como `package.json`, `App.tsx`, y una carpeta `android`.

### Paso 2: Copiar el Keystore

```powershell
# Copiar el keystore a la carpeta android/app
copy "C:\Users\eds\Desktop\manoprotect-2025.keystore" "android\app\"
```

### Paso 3: Configurar gradle.properties

Abre el archivo `android\gradle.properties` con el Bloc de Notas y añade al final:

```properties
# Configuración de firma para release
MYAPP_UPLOAD_STORE_FILE=manoprotect-2025.keystore
MYAPP_UPLOAD_KEY_ALIAS=manoprotect
MYAPP_UPLOAD_STORE_PASSWORD=19862210Des
MYAPP_UPLOAD_KEY_PASSWORD=19862210Des
```

Guarda y cierra el archivo.

### Paso 4: Compilar

```powershell
# Ir a la carpeta android
cd android

# Limpiar compilaciones anteriores
.\gradlew clean

# Generar el AAB
.\gradlew bundleRelease
```

### Paso 5: Encontrar el AAB

El archivo estará en:
```
android\app\build\outputs\bundle\release\app-release.aab
```

---

## SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "gradlew is not recognized"
- Asegúrate de estar en la carpeta `android` del proyecto
- Ejecuta: `cd "C:\Users\eds\Desktop\manoprotect_v1-main\mobile-app\android"`

### Error: "JAVA_HOME is not set"
1. Instala Java JDK 17 desde: https://adoptium.net/
2. Reinicia PowerShell después de instalar

### Error: "Could not find gradle wrapper"
1. Descarga el proyecto de nuevo desde Emergent (botón "Download")
2. Extrae el ZIP y vuelve a intentar

### Error: "SDK location not found"
1. Abre Android Studio
2. Ve a **Tools → SDK Manager**
3. Anota la ruta del SDK (ej: `C:\Users\eds\AppData\Local\Android\Sdk`)
4. Crea un archivo `local.properties` en la carpeta `android` con:
   ```
   sdk.dir=C:\\Users\\eds\\AppData\\Local\\Android\\Sdk
   ```

---

## DESPUÉS DE COMPILAR

### Subir a Google Play Console

1. Ve a https://play.google.com/console
2. Selecciona la app ManoProtect
3. Ve a **Release → Production → Create new release**
4. Sube el archivo `.aab`
5. Añade las notas de la versión
6. Revisa y publica

### Recordatorios

- La nueva clave de firma estará activa el **8 de febrero de 2026**
- Guarda el keystore (`manoprotect-2025.keystore`) en un lugar seguro
- Credenciales del keystore:
  - Alias: `manoprotect`
  - Contraseña: `19862210Des`

---

## RESUMEN RÁPIDO

```
1. Abrir Android Studio
2. Open → seleccionar carpeta "android" del proyecto
3. Esperar sincronización
4. Build → Generate Signed Bundle / APK
5. Seleccionar App Bundle → Configurar firma → Finish
6. Buscar AAB en: android/app/build/outputs/bundle/release/
```

¿Problemas? Envía capturas de pantalla del error al soporte.
