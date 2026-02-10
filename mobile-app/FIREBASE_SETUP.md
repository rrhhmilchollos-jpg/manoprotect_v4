# Configuracion de Firebase - MANO Protect (Android)

## Configuracion Completada

### Android
- **Package Name:** `com.Manoprotect.Mano`
- **Project ID:** `manoprotect-f889b`
- **Archivo:** `/app/mobile-app/android/app/google-services.json`

---

## Testing Push Notifications

### Desde Firebase Console

1. Ve a Firebase Console -> Cloud Messaging
2. Crea un nuevo mensaje
3. Selecciona la app Android de destino
4. Envia mensaje de prueba

### Desde Backend

El backend ya tiene preparados los endpoints para enviar notificaciones:
- `POST /api/push/subscribe` - Suscribir dispositivo
- `DELETE /api/push/unsubscribe` - Desuscribir
- `GET /api/push/vapid-public-key` - Obtener clave VAPID

---

## Proyecto Firebase

- **Console:** https://console.firebase.google.com/project/manoprotect-f889b
- **Project ID:** manoprotect-f889b
- **Project Number:** 97231251022
- **Storage Bucket:** manoprotect-f889b.firebasestorage.app

---

## Seguridad

Los archivos de configuracion de Firebase contienen claves de API publicas.
Esto es normal y seguro, pero debes:

1. Configurar **Firebase Security Rules** en la consola
2. Restringir las claves de API en Google Cloud Console (opcional pero recomendado)
3. No exponer tokens de servidor o claves privadas

---

Ultima actualizacion: Febrero 2026
