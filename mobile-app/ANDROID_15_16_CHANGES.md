# Cambios Android 15/16 - ManoProtect v2.0.1

## Problemas Reportados por Google Play Console

### 1. Vista Edge-to-Edge (Android 15+)
**Problema**: Las aplicaciones orientadas al SDK 35 se muestran de extremo a extremo por defecto.

**Solución implementada**:
- ✅ `MainActivity.kt`: Añadido método `enableEdgeToEdge()` usando `WindowCompat`
- ✅ `styles.xml`: Actualizado para soportar Edge-to-Edge sin APIs obsoletas
- ✅ `values-v35/styles.xml`: Creado tema específico para Android 15+ con `windowOptOutEdgeToEdgeEnforcement=false`
- ✅ `SOSLockScreenActivity.java`: Ya tenía Edge-to-Edge implementado con WindowInsets

### 2. APIs Obsoletas (setStatusBarColor, setNavigationBarColor)
**Problema**: Estas APIs están obsoletas en Android 15 (API 35).

**Solución implementada**:
- ✅ Eliminado el uso de `setStatusBarColor()` y `setNavigationBarColor()`
- ✅ Usamos `WindowCompat.setDecorFitsSystemWindows(window, false)` en su lugar
- ✅ El sistema Android 15+ maneja automáticamente las barras transparentes
- ⚠️ **Nota**: Si la advertencia persiste, viene de la biblioteca `androidbrowserhelper` (externa). No podemos modificar su código, pero nuestra app ya no usa estas APIs.

### 3. Restricciones de Orientación y Redimensionamiento (Android 16)
**Problema**: Android 16 ignora las restricciones de orientación en pantallas grandes.

**Solución implementada**:
- ✅ `AndroidManifest.xml`: Eliminado `android:screenOrientation="unspecified"` de todas las Activities
- ✅ Añadido `android:resizeableActivity="true"` para soportar pantallas grandes
- ✅ Añadido `screenLayout|smallestScreenSize` a `configChanges` para manejar cambios de configuración en foldables

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `android/app/build.gradle` | versionCode 3, versionName 2.0.1 |
| `android/app/src/main/AndroidManifest.xml` | Eliminadas restricciones de orientación |
| `android/app/src/main/java/.../MainActivity.kt` | Añadido enableEdgeToEdge() |
| `android/app/src/main/res/values/styles.xml` | Actualizado para Edge-to-Edge |
| `android/app/src/main/res/values/colors.xml` | Añadidos colores de fondo |
| `android/app/src/main/res/values-v35/styles.xml` | **NUEVO** - Tema específico Android 15+ |

## Cómo Probar

### En emulador/dispositivo Android 15:
1. Verifica que la app se muestra correctamente bajo las barras del sistema
2. Verifica que el contenido no queda oculto detrás de las barras
3. Rota el dispositivo y verifica que la UI se adapta

### En tablet/foldable:
1. Abre la app en modo horizontal
2. Usa modo de pantalla dividida
3. Verifica que la UI se adapta correctamente

## Versión
- **Versión anterior**: 2.0.0 (versionCode 2)
- **Versión nueva**: 2.0.1 (versionCode 3)

## Fecha
8 de febrero de 2026
