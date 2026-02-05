# ManoProtect - Justificación de Permisos para Google Play

## 1. ACCESS_FINE_LOCATION y ACCESS_BACKGROUND_LOCATION

### Funcionalidad que lo requiere:
**Sistema de Emergencias SOS**

### Justificación:
ManoProtect es una aplicación de seguridad familiar que permite a los usuarios enviar alertas de emergencia a sus familiares con su ubicación exacta en tiempo real. 

Cuando un usuario activa el botón SOS de emergencia (por ejemplo, en caso de accidente, caída, o situación de peligro), la aplicación:

1. **Envía la ubicación exacta** a los contactos de emergencia designados
2. **Actualiza la ubicación continuamente** mientras la emergencia está activa
3. **Permite a los familiares ver en un mapa** dónde está la persona en peligro

El acceso a la ubicación en segundo plano es ESENCIAL porque:
- La persona puede tener el teléfono en el bolsillo durante una emergencia
- La pantalla puede estar apagada mientras huye de una situación peligrosa
- Los familiares necesitan saber la ubicación actualizada para poder ayudar

### Beneficio para el usuario:
En una emergencia real, cada segundo cuenta. Los familiares pueden:
- Dirigirse directamente a la ubicación de la persona en peligro
- Informar a los servicios de emergencia de la ubicación exacta
- Ver si la persona se está moviendo o está inmóvil

---

## 2. POST_NOTIFICATIONS con canal de Alertas Críticas

### Funcionalidad que lo requiere:
**Sistema de Alertas de Emergencia Familiares**

### Justificación:
Cuando un familiar activa una emergencia SOS, los contactos de emergencia deben ser notificados INMEDIATAMENTE, incluso si:
- El teléfono está en modo "No molestar"
- El volumen está silenciado
- El teléfono está en el bolsillo

La notificación de emergencia incluye:
- **Sonido de alarma de alta prioridad** que ignora el modo silencio
- **Vibración en patrón SOS** (··· --- ···) para reconocimiento táctil
- **Luz LED parpadeante** (en dispositivos compatibles)

### Por qué es necesario:
Una emergencia no puede esperar. Si un padre mayor se cae y activa el SOS, sus hijos DEBEN enterarse inmediatamente, independientemente de la configuración de sonido de su teléfono.

### Comparación con apps similares:
- Las apps de emergencias médicas (como detectores de caídas)
- Las apps de seguridad personal
- Los sistemas de alarma doméstica

Todas utilizan notificaciones de alta prioridad por las mismas razones.

---

## 3. VIBRATE

### Funcionalidad que lo requiere:
**Alertas de Emergencia SOS**

### Justificación:
La vibración se usa en patrón SOS (··· --- ···) para:
- Alertar al usuario de forma táctil incluso sin sonido
- Proporcionar una señal reconocible universalmente
- Complementar la alerta auditiva

---

## 4. INTERNET y ACCESS_NETWORK_STATE

### Funcionalidad que lo requiere:
**Comunicación en tiempo real**

### Justificación:
- Enviar alertas SOS a los servidores
- Recibir alertas de familiares
- Sincronizar ubicación en tiempo real
- Funcionalidad principal de la app

---

## Declaración de Uso Responsable

ManoProtect:
- NO recopila datos de ubicación cuando no hay una emergencia activa
- NO comparte la ubicación con terceros comerciales
- SOLO envía la ubicación a los contactos de emergencia designados por el usuario
- Cumple con GDPR y la legislación española de protección de datos
- Permite al usuario desactivar cualquier funcionalidad en cualquier momento

---

## Resumen para Revisores de Google Play

ManoProtect es una aplicación de **seguridad familiar** diseñada para proteger a personas vulnerables (personas mayores, niños, personas con condiciones médicas). 

Los permisos solicitados son **estrictamente necesarios** para la funcionalidad principal de la app:

| Permiso | Uso | Crítico? |
|---------|-----|----------|
| Ubicación en segundo plano | Emergencias SOS | ✅ Sí |
| Notificaciones de alta prioridad | Alertas a familiares | ✅ Sí |
| Vibración | Alertas táctiles | Complementario |
| Internet | Comunicación | ✅ Sí |

Sin estos permisos, la app no podría cumplir su propósito de **salvar vidas** en situaciones de emergencia.

---

**Contacto para preguntas adicionales:**
- Email: info@manoprotect.com
- Web: https://manoprotect.com

**Empresa:**
STARTBOOKING SL
CIF: B19427723
C/ Sor Isabel de Villena 82 bajo, Novelé, Valencia, España
