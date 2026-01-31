# 📱 Guía Completa: Publicar ManoProtect en Google Play Store

## Paso 1: Acceder a PWA Builder

1. Ve a **[pwabuilder.com](https://www.pwabuilder.com/)**
2. En el campo de URL, escribe: `https://www.manoprotect.com`
3. Haz clic en **"Start"**

> ⚠️ **IMPORTANTE**: Primero debes hacer **Redeploy** en Emergent para que los iconos PWA estén en producción.

---

## Paso 2: Verificar PWA Score

PWA Builder analizará tu sitio. Deberías ver:
- ✅ Manifest encontrado
- ✅ Service Worker activo
- ✅ Iconos disponibles
- ✅ Screenshots incluidos

Si algo falla, verifica que `manoprotect.com/manifest.json` sea accesible.

---

## Paso 3: Generar Android Package

1. Haz clic en **"Package for stores"**
2. Selecciona **"Android"**
3. Configura estas opciones:

| Campo | Valor |
|-------|-------|
| Package ID | `com.manoprotect.app` |
| App name | `ManoProtect` |
| App version | `1.0.0` |
| Version code | `1` |
| Display mode | `Standalone` |
| Status bar color | `#10b981` |
| Navigation bar color | `#10b981` |
| Background color | `#ffffff` |
| Theme color | `#10b981` |
| Signing key | **Selecciona "None" o genera uno nuevo** |

4. Haz clic en **"Generate"**
5. Descarga el archivo `.aab` (Android App Bundle)

---

## Paso 4: Google Play Console

### 4.1 Crear cuenta de desarrollador
1. Ve a **[play.google.com/console](https://play.google.com/console/)**
2. Paga la tarifa única de **$25 USD**
3. Completa la verificación de identidad

### 4.2 Crear nueva aplicación
1. Haz clic en **"Crear app"**
2. Completa:
   - **Nombre**: ManoProtect
   - **Idioma predeterminado**: Español
   - **App o juego**: App
   - **Gratis o de pago**: Gratis

### 4.3 Configurar ficha de Play Store

#### Información básica
```
Nombre de la app: ManoProtect
Descripción breve: Protege a tu familia contra fraudes, phishing y estafas digitales.

Descripción completa:
ManoProtect es tu escudo digital contra el fraude. Protege a toda tu familia de estafas telefónicas, phishing, SMS fraudulentos y mucho más.

🛡️ CARACTERÍSTICAS PRINCIPALES:

• Verificador de Estafas: Analiza mensajes, llamadas y enlaces sospechosos al instante
• Alertas en Tiempo Real: Recibe notificaciones sobre nuevas amenazas detectadas en España
• Protección Familiar: Un plan para toda la familia con hasta 5 miembros
• Base de Datos Actualizada: +50,000 estafas identificadas y en crecimiento
• Modo SOS: Botón de emergencia para reportar fraudes rápidamente
• Educación: Aprende a identificar estafas con nuestra guía interactiva

👨‍👩‍👧‍👦 PLAN FAMILIAR:
Protege a padres, hijos y abuelos con una sola suscripción. Ideal para mantener segura a toda la familia en el mundo digital.

🇪🇸 HECHO EN ESPAÑA:
Desarrollado específicamente para amenazas que afectan a usuarios españoles. Detectamos estafas del Banco de España, Correos, Hacienda, y más.

📊 ESTADÍSTICAS:
• +10,000 familias protegidas
• +50,000 estafas en nuestra base de datos
• 98% de precisión en detección

¡Descarga ManoProtect y navega tranquilo!

Empresa: STARTBOOKING SL (CIF: B19427723)
```

#### Categoría
- **Categoría principal**: Herramientas
- **Etiquetas**: Seguridad, Familia, Antifraude

#### Información de contacto
- **Email**: soporte@manoprotect.com
- **Sitio web**: https://www.manoprotect.com
- **Política de privacidad**: https://www.manoprotect.com/privacy-policy

### 4.4 Subir recursos gráficos

Los archivos están en `/app/frontend/google-play-console/`:

| Recurso | Archivo | Dimensiones |
|---------|---------|-------------|
| Icono de app | `developer-icon-512x512.png` | 512x512 |
| Gráfico de funciones | `header-banner-4096x2304.png` | 1024x500 (recortar) |
| Capturas de pantalla | Crear desde el sitio web | Mín. 2 capturas |

#### Crear capturas de pantalla:
1. Ve a `manoprotect.com` en tu móvil
2. Toma capturas de: Landing, Dashboard, Verificador
3. Dimensiones recomendadas: 1080x1920 (móvil)

### 4.5 Subir el AAB

1. Ve a **"Producción"** → **"Crear nueva versión"**
2. Sube el archivo `.aab` generado por PWA Builder
3. Añade notas de la versión:
```
Versión 1.0.0
• Lanzamiento inicial
• Verificador de estafas
• Alertas en tiempo real
• Plan familiar
• Dashboard de protección
```

### 4.6 Completar cuestionarios

#### Clasificación de contenido
- Responde el cuestionario IARC
- Resultado esperado: **PEGI 3** (para todos)

#### Seguridad de datos
```
¿Tu app recopila datos de usuarios? Sí
Tipos de datos:
- Email (para cuenta)
- Nombre (opcional)
- Actividad en la app (análisis)

¿Los datos se cifran en tránsito? Sí (HTTPS)
¿Los usuarios pueden solicitar eliminación? Sí
```

#### Público objetivo
- **Edad objetivo**: Todas las edades
- **¿Atrae a niños?**: No específicamente

---

## Paso 5: Enviar para revisión

1. Verifica que todo esté completo (checks verdes)
2. Haz clic en **"Enviar para revisión"**
3. Tiempo de revisión: 1-7 días

---

## 🎉 ¡Listo!

Una vez aprobada, tu app estará disponible en:
`https://play.google.com/store/apps/details?id=com.manoprotect.app`

---

## Problemas comunes

### PWA Builder no detecta el manifest
- Verifica: `curl https://www.manoprotect.com/manifest.json`
- Debe retornar el JSON del manifest

### Error de signing key
- Usa la opción "None" para pruebas
- O genera una nueva key en PWA Builder

### Rechazo por política
- Revisa que la política de privacidad esté accesible
- Asegúrate de tener información de contacto válida
