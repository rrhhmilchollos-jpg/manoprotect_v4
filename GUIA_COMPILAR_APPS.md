# GUIA COMPLETA: Compilar Apps ManoProtect

## Dominio actual: manoprotectt.com

---

## 1. APPS DE ESCRITORIO (Electron) - CRA y CRM

### Requisitos:
- Node.js 18+ instalado
- Windows 10/11 (para compilar .exe)

### Pasos:
```bash
# Desde la raiz del proyecto:
cd desktop-apps/cra-operador
npm install
npx electron-builder --win --publish never

cd ../crm-ventas
npm install
npx electron-builder --win --publish never
```

### Resultado:
- `desktop-apps/cra-operador/dist/ManoProtect CRA Setup 1.0.0.exe`
- `desktop-apps/crm-ventas/dist/ManoProtect CRM Setup 1.0.0.exe`

### Distribucion:
1. Enviar el `.exe` a cada operador/comercial
2. Instalar en su PC
3. La app cargara automaticamente `https://www.manoprotectt.com`

---

## 2. APPS ANDROID (APK/AAB) - PWABuilder

### Opcion A: PWABuilder (Recomendado - No requiere Android Studio)

1. Ve a **https://www.pwabuilder.com**
2. Escribe la URL de la app:

| App | URL | Package ID |
|-----|-----|-----------|
| **Clientes** | `https://www.manoprotectt.com` | `com.manoprotect.www.twa` |
| **Comerciales** | `https://www.manoprotectt.com/pwa-comerciales.html` | `com.manoprotect.comerciales` |
| **Instaladores** | `https://www.manoprotectt.com/pwa-instaladores.html` | `com.manoprotect.instaladores` |

3. Click **"Start"** > **"Build My PWA"**
4. Selecciona **"Android"**
5. Configura:
   - **Package ID**: El de la tabla
   - **App Name**: ManoProtect [tipo]
   - **Display Mode**: Standalone
   - **Signing Key**: Genera una nueva o usa la existente
6. Click **"Generate"** > Descarga el `.aab`

### Opcion B: Compilar desde codigo (Android Studio)

```bash
# Desde la raiz del proyecto:
cd manoprotect-twa

# Verificar dominio correcto
grep "hostName" app/build.gradle
# Debe mostrar: www.manoprotectt.com

# Compilar
./gradlew assembleRelease
```

Resultado: `app/build/outputs/apk/release/app-release.apk`

### Subir a Google Play:
1. Ve a **https://play.google.com/console**
2. Selecciona la app
3. **Production** > **Create new release**
4. Sube el `.aab` generado
5. Completa la informacion y publica

---

## 3. FIREBASE AUTH - Agregar dominio autorizado

### IMPORTANTE: Esto es obligatorio para que el login funcione en produccion

1. Ve a **https://console.firebase.google.com**
2. Selecciona el proyecto **manoprotect-f889b**
3. Ve a **Authentication** > **Settings** > **Authorized domains**
4. Click **"Add domain"**
5. Agrega:
   - `manoprotectt.com`
   - `www.manoprotectt.com`
6. Guarda los cambios

### Verificar:
Los dominios autorizados deben incluir:
- `localhost` (ya existe)
- `manoprotect-f889b.firebaseapp.com` (ya existe)
- `manoprotectt.com` (NUEVO)
- `www.manoprotectt.com` (NUEVO)

---

## 4. GOOGLE PLAY CONSOLE - assetlinks.json

Para que la TWA (Trusted Web Activity) funcione correctamente:

1. Ve a **Google Play Console** > tu app
2. En **Setup** > **App signing**, copia el **SHA-256 certificate fingerprint**
3. Reemplaza `__SHA256_FINGERPRINT_FROM_PWABUILDER__` en:
   - `frontend/public/.well-known/assetlinks.json`
4. Haz deploy

### Verificar:
```
https://www.manoprotectt.com/.well-known/assetlinks.json
```
Debe devolver JSON con tu fingerprint real.

---

## 5. GOOGLE SEARCH CONSOLE

1. Ve a **https://search.google.com/search-console**
2. Agrega propiedad: `https://manoprotectt.com`
3. Verifica con el metodo DNS o meta tag
4. Agrega el sitemap: `https://manoprotectt.com/sitemap.xml`

---

## Resumen de URLs

| Servicio | URL |
|----------|-----|
| Web principal | https://www.manoprotectt.com |
| API | https://www.manoprotectt.com/api |
| Login Gestion | https://www.manoprotectt.com/gestion/login |
| Admin CRA | https://www.manoprotectt.com/gestion/admin |
| CRM Comerciales | https://www.manoprotectt.com/gestion/comerciales |
| Instaladores | https://www.manoprotectt.com/gestion/instaladores |
| Sitemap | https://www.manoprotectt.com/sitemap.xml |
| AssetLinks | https://www.manoprotectt.com/.well-known/assetlinks.json |

## Credenciales de acceso

| Rol | Email | Password |
|-----|-------|----------|
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
