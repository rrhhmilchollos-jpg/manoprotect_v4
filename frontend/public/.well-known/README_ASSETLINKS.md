# Cómo configurar assetlinks.json

## ¿Qué es?
El archivo assetlinks.json permite que tu app Android (TWA) se abra automáticamente 
cuando alguien hace clic en un enlace de tu sitio web, en lugar de abrir el navegador.

## ¿Dónde obtener el SHA256 fingerprint?

### Opción 1: Desde Google Play Console (RECOMENDADO)
1. Ve a Google Play Console
2. Selecciona tu app
3. Ve a "Setup" → "App signing"
4. Copia el "SHA-256 certificate fingerprint" de la sección "App signing key certificate"

### Opción 2: Desde PWABuilder
Cuando generes el AAB en PWABuilder, te mostrará el fingerprint.

## ¿Cómo actualizar el archivo?

Reemplaza `REEMPLAZAR_CON_TU_FINGERPRINT_SHA256` con tu fingerprint real.

Ejemplo de fingerprint:
```
14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5
```

## Verificar que funciona:
https://developers.google.com/digital-asset-links/tools/generator

Ingresa:
- Hosting site domain: www.manoprotectt.com
- App package name: com.manoprotect.app
- App package fingerprint: (tu fingerprint)
