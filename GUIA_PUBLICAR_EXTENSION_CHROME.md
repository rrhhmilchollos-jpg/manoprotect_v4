# Guía de Publicación - ManoProtect Chrome Extension

## Requisitos Previos

1. **Cuenta de Desarrollador de Chrome Web Store**
   - Costo único: $5 USD
   - Registro: https://chrome.google.com/webstore/devconsole/register

2. **Archivos necesarios**
   - Extensión empaquetada: `/app/manoprotect-chrome-extension.zip` ✅
   - Iconos de la tienda (ya incluidos en el zip):
     - icon16.png (16x16)
     - icon48.png (48x48)
     - icon128.png (128x128)

## Pasos para Publicar

### Paso 1: Acceder a la Consola de Desarrollador
1. Ve a: https://chrome.google.com/webstore/devconsole
2. Inicia sesión con tu cuenta de Google
3. Si es primera vez, paga la tarifa de registro ($5 USD)

### Paso 2: Crear Nuevo Item
1. Haz clic en "New Item" (Nuevo elemento)
2. Sube el archivo `manoprotect-chrome-extension.zip`
3. Espera a que se procese

### Paso 3: Completar Información de la Tienda

#### Listado de la Tienda:
- **Nombre**: ManoProtect - Protección contra Estafas
- **Descripción corta** (132 caracteres max):
  ```
  Verifica URLs en tiempo real. Protege contra phishing, scams y sitios maliciosos. Powered by VirusTotal y Google Safe Browsing.
  ```
- **Descripción completa**:
  ```
  🛡️ ManoProtect - Tu escudo contra estafas online

  Protege tu navegación con verificación en tiempo real de URLs sospechosas.

  ✅ CARACTERÍSTICAS:
  • Verificación instantánea de URLs contra bases de datos de seguridad
  • Alertas visuales para sitios peligrosos
  • Click derecho para verificar cualquier enlace
  • Estadísticas de amenazas bloqueadas
  • Funciona con Google Safe Browsing y VirusTotal

  🔒 PRIVACIDAD:
  • No recopilamos datos personales
  • Solo verificamos URLs que tú decides analizar
  • Código abierto y transparente

  👨‍👩‍👧‍👦 PERFECTO PARA:
  • Familias que quieren proteger a sus seres queridos
  • Personas mayores vulnerables a estafas telefónicas
  • Cualquiera que compre online
  • Empresas que manejan información sensible

  📊 TECNOLOGÍA:
  • APIs de seguridad en tiempo real
  • Detección basada en IA
  • Actualizaciones constantes de amenazas

  Desarrollado por ManoProtect - www.manoprotect.com
  ```

#### Categoría:
- **Categoría principal**: Productivity (Productividad)
- **Categoría secundaria**: Security (Seguridad)

#### Idiomas:
- Español (principal)
- English (secundario)

### Paso 4: Capturas de Pantalla
Necesitas subir:
- **Al menos 1 screenshot** (1280x800 o 640x400)
- **Icono promocional pequeño** (440x280) - Opcional pero recomendado
- **Icono promocional grande** (920x680) - Opcional

### Paso 5: Información de Privacidad
1. **Prácticas de privacidad**:
   - ¿Recopila datos del usuario? → No (solo URLs verificadas voluntariamente)
   - ¿Usa permisos sensibles? → No
   
2. **Política de privacidad URL**:
   - https://www.manoprotect.com/privacy-policy

### Paso 6: Distribución
1. **Visibilidad**: Pública (todos pueden ver)
2. **Regiones**: Todas las regiones
3. **Usuarios objetivo**: Cualquier usuario

### Paso 7: Revisión y Envío
1. Revisa toda la información
2. Haz clic en "Submit for Review"
3. Tiempo de revisión: 1-3 días hábiles

## Post-Publicación

### Actualizar la Extensión
1. Incrementa la versión en `manifest.json`:
   ```json
   "version": "1.0.1"
   ```
2. Vuelve a crear el ZIP
3. En la consola, selecciona tu extensión
4. Sube la nueva versión

### Responder a Reseñas
- Monitorea las reseñas regularmente
- Responde de forma profesional y útil
- Usa feedback para mejorar

### Analytics
- Chrome Web Store proporciona métricas básicas
- Usuarios activos, instalaciones, desinstalaciones

## Checklist Final

- [ ] Cuenta de desarrollador creada y verificada
- [ ] $5 USD pagados
- [ ] ZIP de extensión subido
- [ ] Descripción completada en español e inglés
- [ ] Capturas de pantalla subidas
- [ ] Política de privacidad vinculada
- [ ] Información de contacto: inversores@manoprotect.com
- [ ] Revisión enviada

## Soporte

Si tienes problemas:
- Email: inversores@manoprotect.com
- Teléfono: +34 601 510 950
- Web: https://www.manoprotect.com

---

Última actualización: 11 de Febrero de 2026
