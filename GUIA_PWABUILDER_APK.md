# Guía: Generar APKs con PWABuilder (TWA)

## Resumen
Usaremos **PWABuilder** (https://www.pwabuilder.com/) para convertir las 3 apps web en APKs/AABs que puedes subir directamente a Google Play Store.

---

## URLs para generar cada app

| App | URL para PWABuilder | Package Name |
|-----|---------------------|--------------|
| **Clientes** | `https://www.manoprotectt.com/` | `com.manoprotect.clientes` |
| **Comerciales** | `https://www.manoprotectt.com/pwa-comerciales.html` | `com.manoprotectt.comerciales` |
| **Instaladores** | `https://www.manoprotectt.com/pwa-instaladores.html` | `com.manoprotect.instaladores` |

---

## Paso a Paso

### 1. App de Clientes (Principal)

1. Ve a **https://www.pwabuilder.com/**
2. Escribe la URL: `https://www.manoprotectt.com/`
3. Haz clic en **"Start"**
4. PWABuilder analizará la web. Espera a que termine.
5. Haz clic en **"Package for stores"** > **"Android"**
6. Configura los siguientes campos:
   - **Package ID**: `com.manoprotect.clientes`
   - **App name**: `ManoProtect`
   - **App version**: `2.1.0`
   - **App version code**: `4`
   - **Host**: `www.manoprotectt.com`
   - **Start URL**: `/`
   - **Theme color**: `#10b981`
   - **Background color**: `#ffffff`
   - **Display mode**: `Standalone`
   - **Status bar color**: `#10b981`
   - **Splash screen color**: `#ffffff`
7. En la sección **Signing Key**:
   - Si ya tienes keystore del Play Store, sube el archivo
   - Si no, selecciona **"Create a new signing key"**
   - **IMPORTANTE**: Guarda el keystore generado, lo necesitarás para todas las actualizaciones
8. Haz clic en **"Generate"**
9. Se descargará un ZIP con el AAB listo para subir a Play Store

### 2. App de Comerciales

1. Ve a **https://www.pwabuilder.com/**
2. Escribe la URL: `https://www.manoprotectt.com/pwa-comerciales.html`
3. Haz clic en **"Start"**
4. Haz clic en **"Package for stores"** > **"Android"**
5. Configura:
   - **Package ID**: `com.manoprotectt.comerciales`
   - **App name**: `ManoProtect Comerciales`
   - **App version**: `2.1.0`
   - **App version code**: `4`
   - **Host**: `www.manoprotectt.com`
   - **Start URL**: `/gestion/login?app=comerciales`
   - **Theme color**: `#10b981`
   - **Background color**: `#0f172a`
   - **Signing Key**: Usa el **MISMO keystore** que generaste para Clientes
6. Haz clic en **"Generate"**

### 3. App de Instaladores

1. Ve a **https://www.pwabuilder.com/**
2. Escribe la URL: `https://www.manoprotectt.com/pwa-instaladores.html`
3. Haz clic en **"Start"**
4. Haz clic en **"Package for stores"** > **"Android"**
5. Configura:
   - **Package ID**: `com.manoprotect.instaladores`
   - **App name**: `ManoProtect Instaladores`
   - **App version**: `2.1.0`
   - **App version code**: `4`
   - **Host**: `www.manoprotectt.com`
   - **Start URL**: `/gestion/login?app=instaladores`
   - **Theme color**: `#f59e0b`
   - **Background color**: `#0f172a`
   - **Signing Key**: Usa el **MISMO keystore**
6. Haz clic en **"Generate"**

---

## Subir a Google Play Store

### Para cada AAB generado:

1. Ve a **Google Play Console** (https://play.google.com/console)
2. Si es una app nueva: **"Crear aplicación"**
3. Ve a **"Producción"** > **"Crear nueva versión"**
4. Sube el archivo **.aab** generado por PWABuilder
5. Completa la ficha de la app:
   - Título
   - Descripción corta y larga
   - Screenshots (los tienes en `/frontend/public/`)
   - Icono de la app
   - Categoría: **Herramientas** o **Negocios**
   - Clasificación de contenido
   - Política de privacidad: `https://www.manoprotectt.com/privacy`
6. Haz clic en **"Enviar a revisión"**

---

## Configurar Digital Asset Links (Verificación del dominio)

Después de generar el APK, PWABuilder te dará un archivo `assetlinks.json`.

1. Copia el contenido del archivo
2. Debe estar accesible en: `https://www.manoprotectt.com/.well-known/assetlinks.json`
3. Este archivo ya existe en tu servidor (pregunta si necesitas actualizarlo)

---

## Notas Importantes

- **Usa el MISMO keystore** para las 3 apps. Guárdalo en un lugar seguro.
- Si pierdes el keystore, no podrás actualizar las apps en Play Store.
- Las apps TWA requieren que el dominio esté verificado con `assetlinks.json`.
- Después del primer deploy, las actualizaciones son automáticas: cuando actualizas la web, las apps TWA se actualizan solas.
- Si necesitas funcionalidades nativas (cámara, GPS background), necesitarás Capacitor.
