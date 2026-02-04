# Guía de Despliegue MANO - manoprotect.com

## Resumen
Esta guía explica cómo desplegar la aplicación web de MANO en tu dominio `manoprotect.com`.

---

## Opción 1: Firebase Hosting (Recomendado)

Firebase Hosting es gratuito, rápido y fácil de configurar para aplicaciones React.

### Paso 1: Instalar Firebase CLI
Abre PowerShell como Administrador y ejecuta:
```powershell
npm install -g firebase-tools
```

### Paso 2: Iniciar sesión en Firebase
```powershell
firebase login
```
Esto abrirá el navegador para que inicies sesión con tu cuenta de Google.

### Paso 3: Crear proyecto en Firebase Console
1. Ve a https://console.firebase.google.com/
2. Clic en "Añadir proyecto"
3. Nombre: `mano-protect` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### Paso 4: Preparar el build del frontend
Necesitas el build de producción. Puedes descargarlo desde Emergent o construirlo:

**Opción A - Descargar desde Emergent:**
1. En la plataforma Emergent, usa el botón "Deploy" o descarga el ZIP del frontend
2. Descomprime el archivo

**Opción B - Construir localmente:**
```powershell
cd C:\Manoprotect\frontend
npm install
npm run build
```

### Paso 5: Inicializar Firebase en el proyecto
```powershell
cd C:\Manoprotect\frontend
firebase init hosting
```

Responde a las preguntas:
- **Select a project:** Selecciona `mano-protect`
- **Public directory:** `build`
- **Single-page app:** `Yes`
- **Overwrite index.html:** `No`

### Paso 6: Desplegar
```powershell
firebase deploy --only hosting
```

### Paso 7: Configurar dominio personalizado
1. Ve a Firebase Console > Hosting
2. Clic en "Añadir dominio personalizado"
3. Ingresa: `manoprotect.com`
4. Firebase te dará registros DNS para configurar en IONOS

### Paso 8: Configurar DNS en IONOS
1. Inicia sesión en tu panel de IONOS
2. Ve a "Dominios & SSL" > "manoprotect.com"
3. Clic en "DNS"
4. Añade los registros que Firebase te proporcionó:
   - Tipo: `A` - Valor: (IP de Firebase)
   - Tipo: `TXT` - Valor: (código de verificación de Firebase)
5. Espera 24-48 horas para propagación DNS

---

## Opción 2: IONOS Hosting Directo

Si prefieres usar el hosting de IONOS directamente:

### Paso 1: Crear el build
```powershell
cd C:\Manoprotect\frontend
npm install
npm run build
```

### Paso 2: Subir archivos a IONOS
1. Inicia sesión en tu panel de IONOS
2. Ve a "Hosting" > "Espacio web"
3. Abre el "Administrador de archivos" o conecta por FTP
4. Sube TODO el contenido de la carpeta `build/` a la raíz del hosting

### Paso 3: Configurar .htaccess
Crea un archivo `.htaccess` en la raíz con este contenido:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### Paso 4: Configurar SSL
1. En IONOS, ve a "Dominios & SSL"
2. Activa "SSL Wildcard" para `manoprotect.com`
3. Esto habilita HTTPS automáticamente

---

## Configuración del Backend

El backend seguirá corriendo en Emergent. Asegúrate de:

1. **Variables de entorno del frontend:**
   El archivo `frontend/.env` debe tener:
   ```
   REACT_APP_BACKEND_URL=https://safety-alert-app-1.preview.emergentagent.com
   ```

2. **CORS del backend:**
   El backend ya está configurado para aceptar conexiones desde cualquier origen.

---

## Verificación Post-Despliegue

1. Abre `https://manoprotect.com` en tu navegador
2. Verifica que puedes:
   - Ver la página de inicio
   - Registrarte / Iniciar sesión
   - Acceder al dashboard
   - Ver la página de precios

---

## Solución de Problemas

### Página en blanco
- Verifica que subiste la carpeta `build/` correctamente
- Revisa que el archivo `.htaccess` existe

### Error 404 al navegar
- El `.htaccess` no está configurado correctamente
- Asegúrate de que `mod_rewrite` está habilitado

### Problemas de conexión al backend
- Verifica que `REACT_APP_BACKEND_URL` apunta a la URL correcta
- Revisa los logs del backend en Emergent

### DNS no propaga
- Puede tardar hasta 48 horas
- Usa https://dnschecker.org para verificar propagación

---

## Contacto de Soporte

Si necesitas ayuda adicional:
- IONOS Soporte: https://www.ionos.es/ayuda/
- Firebase Soporte: https://firebase.google.com/support

---

*Documento creado: Enero 2025*
