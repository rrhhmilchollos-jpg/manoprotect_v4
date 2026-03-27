# 🚀 Guía para Generar .AAB para Google Play Store (ACTUALIZADA)

## ⚠️ IMPORTANTE: Problema del Splash Screen

El .aab anterior mostraba "StartBooking SL" en la pantalla de carga porque fue generado con configuración incorrecta. Esta guía te muestra cómo generar uno nuevo con el branding correcto de **ManoProtect**.

---

## OPCIÓN 1: PWABuilder (RECOMENDADO - Más Fácil)

### Paso 1: Ir a PWABuilder
1. Abre: https://www.pwabuilder.com/
2. Introduce la URL: `https://manoprotectt.com` (o tu URL de preview)
3. Click en "Start"

### Paso 2: Verificar que detecta el PWA correctamente
- Debería mostrar "ManoProtect" como nombre
- Verificar que los iconos son los correctos (escudo con mano)

### Paso 3: Generar Android Package
1. Click en **"Package for stores"**
2. Selecciona **"Android"**
3. **IMPORTANTE - Configura EXACTAMENTE así:**

   | Campo | Valor |
   |-------|-------|
   | Package ID | `com.manoprotect.app` |
   | App name | `ManoProtect` |
   | Launcher name | `ManoProtect` |
   | Version name | `2.0.0` |
   | Version code | `2` |
   | Display mode | `standalone` |
   | Status bar color | `#4F46E5` |
   | Navigation bar color | `#4F46E5` |
   | Background color | `#FFFFFF` |
   | Splash screen icon | Seleccionar el icono de ManoProtect |
   | Include source code | ✅ Sí (para verificar) |

4. Click en **"Generate"**
5. **Descarga y VERIFICA** que el .zip contiene los iconos correctos

### Paso 4: Verificar ANTES de subir
Descomprime el .zip y verifica en:
- `app/src/main/res/values/strings.xml` → Debe decir "ManoProtect", NO "StartBooking"
- `app/src/main/res/drawable/` → Los iconos deben ser el escudo verde/morado

---

## OPCIÓN 2: Bubblewrap CLI

### Requisitos
- Node.js 14+
- Java JDK 8 o 11
- Android SDK

### Paso 1: Instalar Bubblewrap
```bash
npm install -g @nickvidal/nickvidal-cli
```

### Paso 2: Crear proyecto
```bash
mkdir manoprotect-twa
cd manoprotect-twa

# Usa el manifest.json de tu app
bubblewrap init --manifest https://manoprotectt.com/manifest.json
```

### Paso 3: Responder las preguntas EXACTAMENTE así:

```
? Package ID: com.manoprotect.app
? App name: ManoProtect
? Launcher name: ManoProtect
? Display mode: standalone
? Orientation: portrait  
? Theme color: #4F46E5
? Background color: #FFFFFF
? Start URL: /
? Icon URL: /icons/icon-512x512.png (o ruta completa)
? Maskable icon URL: /icons/icon-512x512.png
? Splash screen icon URL: /icons/icon-512x512.png
? Fallback type: customtabs
? Enable notifications: yes
```

### Paso 4: Generar .aab
```bash
bubblewrap build
```

El archivo `app-release-bundle.aab` estará listo.

---

## Archivos de Configuración Incluidos

He preparado los siguientes archivos en `/app/android/`:

- **twa-manifest.json** - Configuración completa para Bubblewrap
- **res/values/strings.xml** - Strings de la app (nombre, URLs)
- **res/values/colors.xml** - Colores de marca ManoProtect

Puedes usar estos como referencia o copiarlos directamente a tu proyecto Android.

---

## ✅ CHECKLIST FINAL ANTES DE SUBIR

### Verificación de Contenido (Ya corregido ✅)
- [x] Sin estadísticas falsas
- [x] Sin certificaciones falsas  
- [x] Sin logos de medios falsos
- [x] Solo testimonios reales de Google Reviews
- [x] Período de prueba: 7 días (NO 15 ni 30)
- [x] Sin "miles de familias protegidas"

### Verificación del .AAB
- [ ] El splash screen muestra "ManoProtect" (NO StartBooking)
- [ ] El icono es el escudo verde/morado con mano
- [ ] El nombre de la app es "ManoProtect"
- [ ] Los colores son indigo/verde (#4F46E5, #10B981)

### Assets para Google Play Console
- [ ] **Icono 512x512**: Usar `/app/frontend/public/manoprotect_icon_512x512.png`
- [ ] **Feature Graphic 1024x500**: Usar `/app/frontend/public/manoprotect_feature_1024x500.png`
- [ ] Screenshots actualizados (sin contenido falso)

---

## 📝 DESCRIPCIÓN PARA GOOGLE PLAY (Actualizada)

### Descripción corta (80 caracteres):
```
Protege a tu familia de estafas digitales. Localización y alertas en tiempo real.
```

### Descripción larga:
```
ManoProtect es tu aliado contra las estafas digitales. 

🛡️ PROTECCIÓN INTELIGENTE
• Análisis de mensajes y emails sospechosos con IA
• Alertas instantáneas de posibles fraudes
• Detección de phishing y smishing

👨‍👩‍👧‍👦 PROTECCIÓN FAMILIAR
• Localización en tiempo real de familiares
• Zonas seguras con notificaciones
• Botón SOS de emergencia
• Ideal para cuidar a personas mayores

📱 FÁCIL DE USAR
• Interfaz sencilla para todas las edades
• Configuración en minutos
• Sin conocimientos técnicos necesarios

✨ CARACTERÍSTICAS
• Protección 24/7
• Alertas por SMS
• Historial de ubicaciones
• Chat de soporte

Prueba gratis durante 7 días. Sin compromiso, cancela cuando quieras.

Contacto: info@manoprotectt.com
Web: https://manoprotectt.com
```

---

## 🔧 Solución al error "SB StartBooking"

El problema ocurrió porque el .aab se generó usando configuración de otro proyecto. Para solucionarlo:

1. **NO uses** el .aab anterior
2. **Genera uno nuevo** siguiendo esta guía
3. **Verifica** que el strings.xml dice "ManoProtect"
4. **Sube** el nuevo .aab a Google Play Console
5. **Actualiza** también el icono de alta resolución con el nuevo

---

## URLs Importantes

- **App en preview**: https://safe-alerts.preview.emergentagent.com
- **Manifest.json**: https://manoprotectt.com/manifest.json
- **Icono 512x512**: `/app/frontend/public/manoprotect_icon_512x512.png`
- **Nuevo icono generado**: Alta calidad, sin pixelación

---

**Fecha de actualización**: Febrero 2025
**Versión**: 2.0.0
