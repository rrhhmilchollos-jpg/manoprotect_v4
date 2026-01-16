# Guía de Compilación - MANO App Móvil (Android APK)

## Requisitos Previos

Antes de empezar, necesitas:
1. **Node.js** instalado (versión 18 o superior)
2. **Cuenta de Expo** (gratis en https://expo.dev)
3. **Cuenta de Google Play Console** (para publicar en la tienda)

---

## Paso 1: Verificar Node.js

Abre PowerShell y ejecuta:
```powershell
node --version
```

Si no tienes Node.js o es una versión antigua:
1. Ve a https://nodejs.org/
2. Descarga la versión LTS (recomendada)
3. Instala y reinicia PowerShell

---

## Paso 2: Preparar el Proyecto

### 2.1 Navegar a la carpeta del proyecto
```powershell
cd C:\Manoprotect\mobile-app
```

### 2.2 Instalar dependencias
```powershell
npm install
```

### 2.3 Instalar EAS CLI globalmente
```powershell
npm install -g eas-cli
```

---

## Paso 3: Iniciar Sesión en Expo

```powershell
npx eas login
```
Ingresa tu email y contraseña de Expo.

---

## Paso 4: Verificar el archivo app.json

El archivo `app.json` debe verse así (sin líneas extra ni `projectId`):

```json
{
  "expo": {
    "name": "MANO Protect",
    "slug": "mano-protect",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.manoprotect.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      },
      "package": "com.manoprotect.app"
    },
    "extra": {
      "eas": {}
    }
  }
}
```

**IMPORTANTE:** Si hay algún `projectId` o `owner`, elimínalos.

---

## Paso 5: Inicializar EAS

Ejecuta este comando para vincular el proyecto a tu cuenta de Expo:
```powershell
npx eas init
```

Sigue las instrucciones en pantalla:
- Selecciona "Create a new project"
- Acepta el nombre sugerido

---

## Paso 6: Verificar eas.json

El archivo `eas.json` debe verse así:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Paso 7: Compilar el APK

### Para un APK de prueba (interno):
```powershell
npx eas build --platform android --profile preview
```

### Para un APK de producción (Google Play):
```powershell
npx eas build --platform android --profile production
```

El proceso tarda 10-20 minutos. Cuando termine, recibirás un enlace para descargar el APK.

---

## Paso 8: Descargar el APK

1. Ve al enlace que te proporcionó EAS
2. Inicia sesión en Expo si es necesario
3. Descarga el archivo `.apk`

---

## Paso 9: Publicar en Google Play

### 9.1 Crear cuenta de desarrollador
1. Ve a https://play.google.com/console
2. Paga la tarifa única de $25
3. Completa la verificación de identidad

### 9.2 Crear la aplicación
1. Clic en "Crear aplicación"
2. Nombre: "MANO Protect"
3. Idioma: Español
4. Tipo: Aplicación
5. Categoría: Herramientas

### 9.3 Subir el APK
1. Ve a "Producción" > "Crear nueva versión"
2. Sube el archivo `.aab` o `.apk`
3. Completa la información requerida:
   - Descripción corta y larga
   - Capturas de pantalla
   - Icono de la app
   - Política de privacidad (URL)

### 9.4 Enviar para revisión
1. Completa todas las secciones requeridas
2. Clic en "Enviar para revisión"
3. Google revisará tu app (puede tardar 1-7 días)

---

## Solución de Errores Comunes

### Error: "Invalid UUID appId"
```powershell
# Elimina la carpeta .eas y vuelve a inicializar
Remove-Item -Recurse -Force .eas
npx eas init
```

### Error: "Project not found"
```powershell
# Verifica que estás logueado
npx eas whoami

# Si no estás logueado:
npx eas login
```

### Error: "Build failed"
1. Revisa los logs del error en Expo.dev
2. Verifica que `app.json` está bien formateado
3. Asegúrate de que todas las dependencias están instaladas

### Error: "expo-modules-autolinking"
```powershell
# Reinstala las dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

---

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npx eas whoami` | Ver usuario actual |
| `npx eas build:list` | Ver builds anteriores |
| `npx eas build:cancel` | Cancelar build en curso |
| `npx expo start` | Iniciar servidor de desarrollo |

---

## Recursos Adicionales

- Documentación Expo: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- Google Play Console: https://play.google.com/console

---

*Documento creado: Enero 2025*
