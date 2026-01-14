# 🔥 Configuración de Firebase - MANO Protect

## ✅ Configuración Completada

### Android
- **Package Name:** `com.Manoprotect.Mano`
- **Project ID:** `manoprotect-f889b`
- **Archivo:** `/app/mobile-app/android/app/google-services.json` ✅

### iOS (Pendiente)
- **Bundle ID:** `com.Manoprotect.Mano`
- **Archivo necesario:** `GoogleService-Info.plist`

---

## 📱 Próximos Pasos para iOS

Para que las push notifications funcionen en iOS, necesitas:

### 1. Añadir app iOS en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/project/manoprotect-f889b/overview)
2. Haz clic en **"Añadir app"** → **iOS**
3. Bundle ID: `com.Manoprotect.Mano`
4. Nickname: `MANO Protect iOS`
5. Descarga `GoogleService-Info.plist`

### 2. Subir archivo a la app

Coloca el archivo descargado en:
```
/app/mobile-app/ios/MANOProtect/GoogleService-Info.plist
```

### 3. Configurar APNs (Apple Push Notifications)

Para que Firebase pueda enviar notificaciones a iOS:

1. Ve a [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Crea una nueva **Key** con APNs habilitado
3. Descarga el archivo `.p8`
4. En Firebase Console → Project Settings → Cloud Messaging
5. Sube el archivo `.p8` en la sección de iOS

---

## 🧪 Testing Push Notifications

### Desde Firebase Console

1. Ve a Firebase Console → Cloud Messaging
2. Crea un nuevo mensaje
3. Selecciona la app de destino
4. Envía mensaje de prueba

### Desde Backend

El backend ya tiene preparados los endpoints para enviar notificaciones:
- `POST /api/push/subscribe` - Suscribir dispositivo
- `DELETE /api/push/unsubscribe` - Desuscribir
- `GET /api/push/vapid-public-key` - Obtener clave VAPID

---

## 📊 Proyecto Firebase

- **Console:** https://console.firebase.google.com/project/manoprotect-f889b
- **Project ID:** manoprotect-f889b
- **Project Number:** 97231251022
- **Storage Bucket:** manoprotect-f889b.firebasestorage.app

---

## 🔐 Seguridad

⚠️ **Importante:** Los archivos de configuración de Firebase contienen claves de API públicas.
Esto es normal y seguro, pero debes:

1. Configurar **Firebase Security Rules** en la consola
2. Restringir las claves de API en Google Cloud Console (opcional pero recomendado)
3. No exponer tokens de servidor o claves privadas

---

Última actualización: Diciembre 2025
