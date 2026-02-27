# ManoProtect - Guía de Configuración de Ubicación en Segundo Plano

## Arquitectura del Sistema

```
[Sentinel S/J/X Watch] → Bluetooth → [App ManoProtect] → 4G → [Servidor API]
                                           ↓
                                    Background Location
                                    (Android + iOS)
                                           ↓
                                    /api/family/location/update
                                           ↓
                                    [Dashboard Familiar]
```

---

## 1. Android - Configuración Completa

### Permisos en AndroidManifest.xml ✅ (Ya configurado)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### Flujo de Permisos en Runtime
1. **Primero**: Solicitar `ACCESS_FINE_LOCATION` (ubicación normal)
2. **Después**: Solicitar `ACCESS_BACKGROUND_LOCATION` (en segundo plano)
3. **Android 11+**: El usuario DEBE ir a Ajustes manualmente y seleccionar "Permitir todo el tiempo"
4. **Batería**: Redirigir a Ajustes para desactivar optimización de batería

### Exclusión de Optimización de Batería
En Android, la optimización de batería puede matar el servicio de ubicación. El usuario debe:
- Ajustes → Batería → Optimización → ManoProtect → No optimizar
- O bien: usar `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

---

## 2. iOS - Configuración Completa

### Info.plist ✅ (Ya configurado en /ios-config/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>ManoProtect necesita tu ubicación para enviar alertas SOS...</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>ManoProtect necesita acceder a tu ubicación en segundo plano...</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

### Background Modes en Xcode
1. Abrir el proyecto en Xcode
2. Target → Signing & Capabilities
3. + Capability → Background Modes
4. Activar: "Location updates", "Background fetch", "Remote notifications"

---

## 3. App Store Connect - Justificación OBLIGATORIA

### Texto para App Store Review (copiar exacto):

**¿Por qué necesitas ubicación en segundo plano?**

> "La aplicación ManoProtect permite que familiares puedan localizar al usuario en situaciones de emergencia incluso cuando la app no está abierta. El dispositivo SOS (Sentinel S/J/X) envía la ubicación GPS en tiempo real a los contactos de emergencia configurados por el usuario. Esta funcionalidad es crítica para la seguridad de niños (3-14 años), personas mayores y personas en situaciones de riesgo. La ubicación en segundo plano garantiza que el botón SOS de emergencia funcione con la pantalla apagada y el teléfono bloqueado, que es precisamente cuando más se necesita."

### Categoría en App Store
- **Primary**: Utilities
- **Secondary**: Health & Fitness (por seguridad personal)
- **Age Rating**: 4+
- **Privacy Nutrition Labels**: Location (Linked to User, for App Functionality)

---

## 4. Guía Post-Publicación para Usuarios

### Android - El familiar debe:
1. Instalar/actualizar ManoProtect desde Google Play
2. Abrir la app → Aceptar permiso de ubicación
3. Ir a **Ajustes → Aplicaciones → ManoProtect → Permisos → Ubicación**
4. Seleccionar **"Permitir todo el tiempo"**
5. Ir a **Ajustes → Batería → ManoProtect → Sin restricciones**

### iPhone - El familiar debe:
1. Instalar/actualizar ManoProtect desde App Store
2. Abrir la app → Permitir ubicación "Siempre"
3. Ir a **Ajustes → Privacidad → Localización → ManoProtect → Siempre**
4. Ir a **Ajustes → General → Actualización en segundo plano → Activar ManoProtect**

---

## 5. Resultado Final ✅

Cuando todo esté configurado correctamente:

- ✅ El botón "Solicitar ubicación" funciona con la app cerrada
- ✅ Funciona con la pantalla apagada
- ✅ Funciona con el teléfono bloqueado
- ✅ Se actualiza cada 10 segundos en modo emergencia
- ✅ Se actualiza cada 5 minutos en modo normal (ahorro batería)
- ✅ Se reinicia automáticamente después de reiniciar el teléfono

---

## 6. Archivos Creados/Modificados

| Archivo | Descripción |
|---------|-------------|
| `android/app/src/main/AndroidManifest.xml` | Permisos Android completos |
| `ios-config/Info.plist` | Configuración iOS con permisos y Background Modes |
| `capacitor.config.json` | Configuración Capacitor con BackgroundGeolocation plugin |
| `src/services/backgroundLocation.js` | Servicio JS de tracking en segundo plano |
| `src/components/LocationPermissionFlow.js` | UI para solicitar permisos al usuario |

---

## 7. Meta Pixel y GTM

### Google Tag Manager: GTM-MK53XZ8Q ✅ (Ya configurado en index.html)
### Meta Pixel: Reemplazar `META_PIXEL_ID` en index.html con tu ID real
  - Obtener en: https://business.facebook.com/events_manager
  - Crear nuevo pixel → Copiar el ID (solo números)
  - Buscar y reemplazar `META_PIXEL_ID` en `/app/frontend/public/index.html`

### Google Search Console: Reemplazar `YOUR_GOOGLE_VERIFICATION_CODE` en index.html
  - Obtener en: https://search.google.com/search-console
  - Añadir propiedad → Verificación por meta tag → Copiar el content value
