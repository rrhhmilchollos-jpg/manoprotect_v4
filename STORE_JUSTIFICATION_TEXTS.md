# ManoProtect - Textos para Publicación en Stores

## GOOGLE PLAY CONSOLE

### Justificación del permiso ACCESS_BACKGROUND_LOCATION

**Descripción del uso del permiso de ubicación en segundo plano:**

ManoProtect utiliza la ubicación en segundo plano para permitir que los familiares autorizados puedan solicitar y recibir la ubicación del usuario en situaciones de emergencia, incluso cuando la aplicación no está abierta.

Esta función es esencial para la seguridad del usuario y solo se activa con consentimiento explícito. La ubicación no se comparte públicamente ni se vende a terceros.

**Funcionalidad principal que requiere este permiso:**
- Botón SOS: cuando el usuario activa una alerta de emergencia, se envía su ubicación GPS en tiempo real a sus contactos de emergencia, incluso si la app está en segundo plano.
- Localización familiar: los familiares autorizados pueden solicitar la ubicación del usuario para verificar su seguridad.
- Zonas seguras: el sistema notifica cuando el usuario entra o sale de zonas geográficas predefinidas.

---

## APP STORE CONNECT (Apple)

### Purpose Strings para Info.plist

**NSLocationWhenInUseUsageDescription:**
ManoProtect necesita tu ubicación para enviar alertas SOS con tu posición exacta a tus contactos de emergencia y permitir que tu familia pueda localizarte en situaciones de peligro.

**NSLocationAlwaysAndWhenInUseUsageDescription:**
ManoProtect necesita acceder a tu ubicación en segundo plano para que tus familiares autorizados puedan localizarte en situaciones de emergencia incluso cuando la app no está abierta. Esto permite que el botón SOS funcione con la pantalla apagada y el teléfono bloqueado.

**NSLocationAlwaysUsageDescription (Legacy iOS 10):**
ManoProtect necesita tu ubicación permanente para proteger a tu familia. Permite localización en emergencias incluso con la app cerrada.

### App Review Notes para Apple

La aplicación ManoProtect incluye una función de seguridad familiar que permite a familiares autorizados solicitar la ubicación del usuario en caso de emergencia.

**Flujo de usuario:**
1. El usuario instala la app y crea una cuenta
2. El usuario invita a familiares de confianza como contactos de emergencia
3. Al activar la función de localización, se solicita permiso explícito con una pantalla paso a paso
4. El usuario debe activar manualmente el acceso "Siempre" desde Ajustes
5. Cuando un familiar necesita localizar al usuario, pulsa "Solicitar ubicación" en su app
6. El sistema envía la ubicación GPS del usuario al familiar autorizado

**Justificación del uso de ubicación en segundo plano:**
La aplicación permite que familiares puedan localizar al usuario en situaciones de emergencia incluso cuando la app no está abierta. El botón SOS envía la ubicación GPS en tiempo real a los contactos de emergencia configurados. Esta funcionalidad requiere acceso continuo a la ubicación para garantizar la seguridad del usuario en todo momento, especialmente para niños, personas mayores y personas en situaciones de riesgo.

**El usuario puede desactivar esta opción en cualquier momento** desde los Ajustes del dispositivo (Privacidad → Localización → ManoProtect → Nunca).

---

## MENSAJE DENTRO DE LA APP (In-App Permission Guide)

### Al pulsar "Activar seguimiento"

**Título:** Activa la localización de emergencia

**Mensaje:**
Para que tus familiares puedan localizarte en caso de emergencia, debes permitir el acceso a la ubicación "Siempre".

**Instrucciones Android:**
1. Ve a Ajustes → Aplicaciones → ManoProtect
2. Pulsa en Permisos → Ubicación
3. Selecciona "Permitir todo el tiempo"
4. Ve a Ajustes → Batería → ManoProtect
5. Selecciona "Sin restricciones"

**Instrucciones iOS:**
1. Ve a Ajustes → Privacidad → Localización
2. Busca ManoProtect
3. Selecciona "Siempre"
4. Activa "Actualización en segundo plano"

---

## GOOGLE PLAY: FICHA DE LA APP

### Sección de Seguridad de datos

**Datos compartidos:**
- Ubicación aproximada: Compartida con contactos de emergencia autorizados por el usuario
- Ubicación precisa: Compartida con contactos de emergencia autorizados por el usuario

**Datos recopilados:**
- Ubicación aproximada: Para funcionalidad de seguridad familiar
- Ubicación precisa: Para alertas SOS y localización de emergencia

**Prácticas de seguridad:**
- Los datos se cifran en tránsito (HTTPS/TLS)
- Los datos de ubicación no se venden a terceros
- El usuario puede solicitar la eliminación de sus datos

---

## CONFIGURACIÓN TÉCNICA IMPLEMENTADA

### Android (AndroidManifest.xml)
- ACCESS_FINE_LOCATION ✅
- ACCESS_COARSE_LOCATION ✅
- ACCESS_BACKGROUND_LOCATION ✅
- FOREGROUND_SERVICE ✅
- FOREGROUND_SERVICE_LOCATION ✅
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS ✅
- WAKE_LOCK ✅
- RECEIVE_BOOT_COMPLETED ✅

### iOS (Info.plist)
- NSLocationWhenInUseUsageDescription ✅
- NSLocationAlwaysAndWhenInUseUsageDescription ✅
- NSLocationAlwaysUsageDescription (Legacy) ✅
- UIBackgroundModes: location ✅
- UIBackgroundModes: fetch ✅
- UIBackgroundModes: remote-notification ✅

### Capacitor Plugins
- @capacitor/geolocation ✅
- @capacitor-community/background-geolocation ✅

### Runtime Permission Flow
1. Solicitar permiso foreground (Geolocation.requestPermissions)
2. Android: Guiar al usuario a Ajustes → "Permitir todo el tiempo"
3. Android: Solicitar exclusión de optimización de batería
4. iOS: Solicitar permiso "Siempre" (automático en segunda petición)
5. Iniciar background watcher con BackgroundGeolocation.addWatcher
