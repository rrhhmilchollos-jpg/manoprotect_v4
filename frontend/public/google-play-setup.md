# ManoProtect - Configuración de Pruebas en Google Play Console

## 📋 Resumen de Tracks de Prueba

| Track | Propósito | Visibilidad | Usuarios |
|-------|-----------|-------------|----------|
| **Pruebas internas** | Testing del equipo | Solo invitados (max 100) | Desarrolladores |
| **Pruebas cerradas (Alpha)** | Beta privada | Solo invitados | Testers seleccionados |
| **Pruebas abiertas (Beta)** | Beta pública | Cualquiera puede unirse | Usuarios generales |
| **Producción** | Release final | Todos | Público |

---

## 🔧 PASO 1: Pruebas Internas

### En Google Play Console:
1. Ve a **Versión** → **Pruebas** → **Pruebas internas**
2. Haz clic en **"Crear versión"**
3. En "App Bundles", haz clic en **"Añadir desde biblioteca"**
4. Selecciona el archivo `.aab` que ya subiste (versión 1)
5. En "Notas de la versión", escribe:
   ```
   Versión de prueba interna - ManoProtect v1.0
   
   Funciones incluidas:
   - Sistema SOS de emergencia
   - Seguimiento familiar GPS
   - Perfil de salud
   - Notificaciones push
   ```
6. Haz clic en **"Guardar"** y luego **"Revisar versión"**
7. Haz clic en **"Iniciar lanzamiento en Pruebas internas"**

### Configurar Testers:
1. Ve a la pestaña **"Testers"**
2. Haz clic en **"Crear lista de correos electrónicos"**
3. Nombre: "Equipo interno"
4. Añade estos emails:
   ```
   internal.tester@manoprotectt.com
   info@manoprotectt.com
   ```
5. Guarda y copia el **enlace de participación**

---

## 🔧 PASO 2: Pruebas Cerradas (Alpha)

### En Google Play Console:
1. Ve a **Versión** → **Pruebas** → **Prueba cerrada**
2. Haz clic en **"Crear versión"**
3. En "App Bundles", haz clic en **"Añadir desde biblioteca"**
4. Selecciona el mismo archivo `.aab` (versión 1)
5. En "Notas de la versión", escribe:
   ```
   Versión Alpha - ManoProtect v1.0
   
   Novedades:
   - Sistema SOS con notificaciones instantáneas
   - Ubicación GPS en tiempo real
   - Panel familiar completo
   - Perfil de salud para emergencias
   
   Por favor, reporta cualquier problema a soporte@manoprotectt.com
   ```
6. Guarda y revisa la versión
7. Haz clic en **"Iniciar lanzamiento en Prueba cerrada"**

### Configurar Testers Alpha:
1. Ve a la pestaña **"Testers"**
2. Haz clic en **"Crear lista de correos electrónicos"**
3. Nombre: "Testers Alpha"
4. Añade estos emails:
   ```
   alpha.tester@manoprotectt.com
   reviewer@manoprotectt.com
   [Añade aquí más emails de testers]
   ```
5. En "Configuración de comentarios", activa la opción de recibir feedback
6. Guarda y copia el **enlace de participación**

---

## 🔧 PASO 3: Pruebas Abiertas (Beta)

### En Google Play Console:
1. Ve a **Versión** → **Pruebas** → **Prueba abierta**
2. Haz clic en **"Crear versión"**
3. En "App Bundles", haz clic en **"Añadir desde biblioteca"**
4. Selecciona el mismo archivo `.aab` (versión 1)
5. En "Notas de la versión", escribe:
   ```
   Versión Beta - ManoProtect v1.0
   
   ¡Gracias por probar ManoProtect!
   
   Funciones principales:
   🆘 Botón SOS de emergencia
   📍 Localización familiar en tiempo real
   🏥 Perfil de salud para emergencias
   🔔 Notificaciones push instantáneas
   
   Tu feedback nos ayuda a mejorar. 
   Reporta problemas a: soporte@manoprotectt.com
   ```
6. Guarda y revisa la versión
7. Haz clic en **"Iniciar lanzamiento en Prueba abierta"**

### Configurar Beta:
1. En la pestaña **"Testers"**, configura:
   - **Países**: España (o los que quieras)
   - **Límite de testers**: Sin límite (o establece uno)
2. Activa **"Comentarios de la aplicación"**
3. El enlace de participación será público

---

## 📧 Emails de Invitación

### Plantilla para Testers Internos:
```
Asunto: Invitación a probar ManoProtect (Interno)

Hola,

Te invitamos a probar la versión interna de ManoProtect.

1. Abre este enlace desde tu móvil Android:
   [ENLACE DE PARTICIPACIÓN]

2. Acepta la invitación e instala la app

3. Usa estas credenciales:
   Email: internal.tester@manoprotectt.com
   Contraseña: InternalTest2025!

4. Consulta la guía de pruebas:
   https://manoprotectt.com/testing-guide.html

¡Gracias por tu ayuda!
```

### Plantilla para Testers Alpha:
```
Asunto: Invitación a probar ManoProtect (Alpha)

Hola,

Has sido seleccionado para probar la versión Alpha de ManoProtect, 
nuestra app de seguridad familiar.

Para participar:
1. Abre este enlace desde tu móvil Android:
   [ENLACE DE PARTICIPACIÓN]

2. Acepta la invitación e instala la app

3. Credenciales de prueba:
   Email: alpha.tester@manoprotectt.com
   Contraseña: AlphaTest2025!

4. Guía de pruebas completa:
   https://manoprotectt.com/testing-guide.html

Tu feedback es muy importante. Si encuentras algún problema,
escríbenos a soporte@manoprotectt.com

¡Gracias!
Equipo ManoProtect
```

---

## ✅ Checklist Final

### Antes de lanzar cada track:
- [ ] Archivo .aab subido y verificado
- [ ] Notas de la versión en español
- [ ] Lista de testers configurada
- [ ] Enlace de participación copiado
- [ ] Email de invitación preparado

### Después de lanzar:
- [ ] Enviar invitaciones a testers
- [ ] Verificar que pueden instalar la app
- [ ] Monitorear feedback y crashes en Play Console
- [ ] Responder a reportes de bugs

---

## 🔗 Enlaces Útiles

- **Guía de pruebas para testers**: https://manoprotectt.com/testing-guide.html
- **Soporte**: soporte@manoprotectt.com
- **Play Console**: https://play.google.com/console

---

## ⚠️ Notas Importantes

1. **Versión del código**: Todos los tracks pueden usar el mismo `.aab` (versión 1) 
   usando "Añadir desde biblioteca"

2. **No subir el mismo archivo dos veces**: Esto causa el error "código de versión 
   ya usado". Siempre usa "Añadir desde biblioteca"

3. **Tiempo de propagación**: Después de iniciar un lanzamiento, puede tardar 
   hasta 48 horas en estar disponible para los testers

4. **Verificación de cuenta**: Tu cuenta de desarrollador debe estar verificada
   antes de poder publicar en cualquier track
