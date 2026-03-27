# RESPUESTAS PARA EL CUESTIONARIO DE GOOGLE PLAY

## Sección: Clasificación de Contenido

### ¿Tu app contiene violencia?
**Respuesta:** No

### ¿Tu app contiene contenido sexual?
**Respuesta:** No

### ¿Tu app permite compras dentro de la aplicación?
**Respuesta:** Sí (suscripciones mensuales/anuales vía Stripe)

### ¿Tu app recopila datos personales?
**Respuesta:** Sí
- Email y nombre (para registro)
- Ubicación (para función SOS - solo cuando el usuario lo activa)
- Número de teléfono (opcional, para alertas SMS)

---

## Sección: Declaraciones de Permisos

### ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION

**¿Para qué usa tu app este permiso?**
```
Nuestra app utiliza la ubicación para el sistema de emergencias SOS. Cuando un usuario 
activa el botón de pánico, su ubicación exacta se envía a sus contactos de emergencia 
designados para que puedan acudir en su ayuda. Esta función es especialmente importante 
para proteger a personas mayores o en situaciones de peligro.
```

### ACCESS_BACKGROUND_LOCATION

**¿Para qué usa tu app este permiso?**
```
La ubicación en segundo plano es necesaria para el sistema de emergencias SOS. Cuando 
una emergencia está activa, la app continúa enviando actualizaciones de ubicación a 
los contactos de emergencia incluso si la pantalla está apagada. Esto es crítico porque 
en una emergencia real, el usuario puede tener el teléfono en el bolsillo mientras 
busca ayuda o se aleja de una situación peligrosa.
```

**Vídeo demostrativo (si lo piden):**
Graba un vídeo de 30 segundos mostrando:
1. Usuario activa el botón SOS
2. Familiar recibe la alerta con la ubicación
3. La ubicación se actualiza en tiempo real en el mapa

### POST_NOTIFICATIONS

**¿Para qué usa tu app este permiso?**
```
Las notificaciones se utilizan para alertar a los familiares cuando uno de sus 
contactos activa una emergencia SOS. Estas notificaciones son de alta prioridad 
y suenan incluso en modo silencio porque las emergencias no pueden esperar.
```

### VIBRATE

**¿Para qué usa tu app este permiso?**
```
La vibración se usa como parte del sistema de alertas de emergencia, utilizando 
el patrón internacional SOS (··· --- ···) para alertar a los usuarios de forma 
táctil cuando un familiar activa una emergencia.
```

---

## Sección: Política de Privacidad

**URL de tu política de privacidad:**
```
https://manoprotectt.com/privacy
```

---

## Sección: Seguridad de los Datos

### ¿Tu app recopila datos de usuarios?
**Respuesta:** Sí

### Tipos de datos recopilados:

| Tipo de dato | ¿Se recopila? | ¿Se comparte? | ¿Es opcional? |
|--------------|---------------|---------------|---------------|
| Email | Sí | No | Obligatorio |
| Nombre | Sí | No | Obligatorio |
| Ubicación | Sí | Solo con contactos de emergencia | Opcional |
| Teléfono | Sí | No | Opcional |

### ¿Los datos se cifran en tránsito?
**Respuesta:** Sí (HTTPS/TLS)

### ¿Los usuarios pueden solicitar que se eliminen sus datos?
**Respuesta:** Sí (desde la app en Configuración → Eliminar cuenta)

---

## Sección: Contenido Generado por Usuarios

### ¿Tu app permite que los usuarios publiquen contenido?
**Respuesta:** No (la app no tiene funciones sociales ni de comunidad pública)

---

## Sección: Aplicación de Seguridad/Emergencias

### ¿Tu app es una aplicación de seguridad personal?
**Respuesta:** Sí

### ¿Tu app contacta a servicios de emergencia (112)?
**Respuesta:** No directamente, pero permite al usuario contactar manualmente

### ¿Tu app envía alertas a contactos predefinidos?
**Respuesta:** Sí (contactos de emergencia configurados por el usuario)

---

## Información Adicional para Revisores

```
ManoProtect es una aplicación de seguridad familiar diseñada para proteger a 
personas vulnerables (especialmente personas mayores) de estafas digitales y 
para proporcionar un sistema de emergencias familiar.

La app NO:
- Contacta automáticamente a servicios de emergencia
- Comparte datos con terceros comerciales
- Recopila datos sin consentimiento del usuario
- Funciona en segundo plano excepto durante emergencias activas

La app SÍ:
- Permite analizar mensajes sospechosos con IA
- Envía alertas a familiares en caso de emergencia
- Muestra la ubicación del usuario a sus contactos de emergencia
- Cumple con GDPR y la legislación española de protección de datos
```

---

## Contacto para Revisores

Si tienen preguntas adicionales, pueden contactarnos en:
- **Email:** info@manoprotectt.com
- **Teléfono:** +34 601 510 950
- **Web:** https://manoprotectt.com

Estamos disponibles para proporcionar cualquier información adicional, 
vídeos demostrativos, o aclaraciones que necesiten.
