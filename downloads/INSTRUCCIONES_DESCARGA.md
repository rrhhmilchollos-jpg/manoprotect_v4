# 📦 MANO - Paquetes de Descarga

## Archivos Disponibles:

### 1. MANO_Web_IONOS.zip (249 KB)
**Para subir a IONOS (tu hosting web)**
- Contiene el build de producción de la web
- Descomprime y sube el contenido de la carpeta `build/` a tu hosting
- Configura el dominio manoprotect.com apuntando a estos archivos

### 2. MANO_Mobile_App.zip (2.6 MB)
**Para compilar APK y subir a Google Play Store**
- Contiene el proyecto completo de React Native
- Instrucciones de compilación en BUILD_GUIDE.md
- Pasos para subir a Play Store en PUBLISHING_GUIDE.md

### 3. MANO_Backend_Server.zip (157 KB)
**Código del servidor API**
- FastAPI + Python
- Necesita MongoDB y las variables de entorno configuradas
- Archivo requirements.txt incluido

### 4. MANO_Documentos_Inversores.zip (223 KB)
**Documentos profesionales para inversores**
- Plan de Negocio (PDF)
- Presentación Inversores (PDF)
- Modelo Financiero (PDF)
- Términos de Inversión (PDF)
- Plan Enterprise (PDF)

---

## 📱 Instrucciones para APK (Google Play Store)

1. Descomprime MANO_Mobile_App.zip
2. Abre terminal en la carpeta descomprimida
3. Ejecuta: `npm install` o `yarn install`
4. Ejecuta: `npx eas build --platform android --profile production`
5. Descarga el APK generado
6. Sube el APK a Google Play Console

## 🌐 Instrucciones para IONOS

1. Descomprime MANO_Web_IONOS.zip
2. Accede a tu panel de control de IONOS
3. Ve a "Gestor de archivos" o "FTP"
4. Sube todo el contenido de la carpeta `build/`
5. Configura manoprotect.com como dominio principal

---

*MANO Security © 2025*
