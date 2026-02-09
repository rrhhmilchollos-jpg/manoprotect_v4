# 🚀 INSTRUCCIONES PARA GENERAR EL ARCHIVO .AAB

## ✅ ESTADO ACTUAL
He arreglado todos los problemas del código:
- ✅ Package name correcto: `com.manoprotect.www.twa`
- ✅ gradle-wrapper.jar instalado
- ✅ Contraseñas removidas de gradle.properties (por seguridad)
- ✅ Workflow de GitHub Actions optimizado

## 📋 PASOS A SEGUIR (IMPORTANTE: SIGUE CADA PASO)

### PASO 1: Guardar los cambios en GitHub
1. En esta plataforma (Emergent), ve a donde dice **"Save to GitHub"** o **"Force Push"**
2. Haz clic para guardar TODOS los cambios en tu repositorio `manoprotect_v3`
3. Espera a que termine (te dirá "Success" o algo similar)

---

### PASO 2: Ir a tu GitHub
1. Abre tu navegador
2. Ve a: `https://github.com/TU_USUARIO/manoprotect_v3`
3. Inicia sesión si no lo has hecho

---

### PASO 3: Verificar los secrets de GitHub (MUY IMPORTANTE)
1. En tu repositorio, haz clic en **"Settings"** (Configuración)
2. En el menú lateral izquierdo, busca **"Secrets and variables"**
3. Haz clic en **"Actions"**
4. Verifica que existan estos 4 secrets:
   - `KEYSTORE_BASE64`
   - `KEY_ALIAS` (debe tener el valor: `manoprotect`)
   - `KEYSTORE_PASSWORD` (debe tener el valor: `19862210Des`)
   - `KEY_PASSWORD` (debe tener el valor: `19862210Des`)

**SI FALTAN ALGUNOS SECRETS:**
- Haz clic en "New repository secret"
- Añade cada uno con su nombre y valor correspondiente

---

### PASO 4: Crear el archivo del workflow en GitHub
1. En tu repositorio `manoprotect_v3`, haz clic en **"Add file"** → **"Create new file"**
2. En el nombre del archivo, escribe EXACTAMENTE: `.github/workflows/build-android.yml`
   (Sí, con los puntos y las barras, GitHub creará las carpetas automáticamente)
3. Copia y pega TODO el siguiente código:

```yaml
name: Build Android AAB

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Java 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
    
    - name: Install dependencies
      working-directory: mobile-app
      run: npm install --legacy-peer-deps
    
    - name: Decode and setup keystore
      working-directory: mobile-app/android/app
      run: |
        echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > manoprotect-2025.keystore
        ls -la manoprotect-2025.keystore
    
    - name: Configure signing properties
      working-directory: mobile-app/android
      run: |
        echo "" >> gradle.properties
        echo "MYAPP_UPLOAD_STORE_FILE=manoprotect-2025.keystore" >> gradle.properties
        echo "MYAPP_UPLOAD_KEY_ALIAS=${{ secrets.KEY_ALIAS }}" >> gradle.properties
        echo "MYAPP_UPLOAD_STORE_PASSWORD=${{ secrets.KEYSTORE_PASSWORD }}" >> gradle.properties
        echo "MYAPP_UPLOAD_KEY_PASSWORD=${{ secrets.KEY_PASSWORD }}" >> gradle.properties
        cat gradle.properties
    
    - name: Make gradlew executable
      working-directory: mobile-app/android
      run: chmod +x gradlew
    
    - name: Build Android App Bundle
      working-directory: mobile-app/android
      run: ./gradlew bundleRelease --no-daemon --stacktrace
    
    - name: Upload AAB artifact
      uses: actions/upload-artifact@v4
      with:
        name: ManoProtect-Release
        path: mobile-app/android/app/build/outputs/bundle/release/app-release.aab
        if-no-files-found: error
```

4. Abajo, donde dice **"Commit changes"**, haz clic en **"Commit directly to the main branch"**
5. Haz clic en **"Commit new file"** (botón verde)

---

### PASO 5: Ejecutar la compilación
1. En tu repositorio, haz clic en la pestaña **"Actions"** (arriba)
2. Verás un workflow llamado **"Build Android AAB"** en el menú lateral izquierdo
3. Haz clic en **"Build Android AAB"**
4. A la derecha verás un botón que dice **"Run workflow"**
5. Haz clic en **"Run workflow"**
6. Selecciona la rama **"main"** (o la que uses)
7. Haz clic en el botón verde **"Run workflow"**

---

### PASO 6: Esperar y descargar el archivo
1. Verás que aparece un círculo amarillo girando 🟡 (significa que está compilando)
2. **ESPERA entre 5-10 minutos** (es normal que tarde)
3. Cuando termine:
   - Si ves un ✅ verde = ¡Éxito!
   - Si ves una ❌ roja = Error (avísame y lo arreglamos)
4. Si todo salió bien, haz clic en el workflow que se ejecutó
5. Baja hasta abajo donde dice **"Artifacts"**
6. Verás un archivo llamado **"ManoProtect-Release"**
7. Haz clic para descargarlo (será un archivo .zip)
8. Descomprime el .zip y dentro estará tu archivo `.aab`

---

## 🎯 RESULTADO FINAL
Tendrás un archivo llamado `app-release.aab` que podrás subir directamente a Google Play Console.

---

## ❓ ¿QUÉ HACER SI HAY UN ERROR?
1. Ve al workflow que falló en GitHub Actions
2. Haz clic en el paso que tiene la ❌ roja
3. Copia TODO el mensaje de error
4. Envíamelo aquí y lo arreglaré inmediatamente

---

## 📱 DESPUÉS DE OBTENER EL .AAB
1. Ve a Google Play Console
2. Sube el archivo `app-release.aab`
3. ¡Listo! Tu app estará actualizada

---

**¿Necesitas ayuda en algún paso? ¡Avísame!** 🚀
