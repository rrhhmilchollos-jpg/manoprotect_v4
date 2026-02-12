# ManoProtect SOS Keychain - Especificaciones Técnicas para Fabricación

## 📱 PRODUCTO: ManoProtect SOS Button

### Descripción General
Dispositivo de emergencia portátil tipo llavero con conectividad GPS/GSM para envío de alertas SOS a familiares y servicios de emergencia 112.

---

## 🎨 DISEÑO EXTERIOR

### Dimensiones
- **Largo**: 65mm
- **Ancho**: 40mm
- **Grosor**: 15mm
- **Peso**: 35g (con batería)

### Materiales
- **Carcasa**: ABS + PC resistente a impactos (IP67 resistente al agua)
- **Botón SOS**: Silicona médica, color rojo #DC2626
- **Acabado**: Mate suave al tacto (soft-touch coating)

### Colores Corporativos
- **Color principal**: Verde Esmeralda ManoProtect #10B981
- **Logo**: Blanco #FFFFFF (serigrafía o grabado láser)
- **Botón SOS**: Rojo emergencia #DC2626
- **LED indicador**: Multi-color (verde/amarillo/rojo)

### Logo y Branding
- Logo del escudo ManoProtect centrado en la parte superior
- Texto "ManoProtect" debajo del logo
- Texto "SOS" en el botón central
- En la parte trasera: "www.manoprotect.com" + número de serie

---

## 🔧 ESPECIFICACIONES TÉCNICAS

### Conectividad
| Componente | Especificación |
|------------|----------------|
| GSM/GPRS | Quad-band 850/900/1800/1900 MHz |
| GPS | u-blox NEO-6M o similar (precisión 2.5m) |
| SIM | Nano SIM / eSIM integrada |
| Bluetooth | BLE 5.0 (para configuración con app) |

### Batería
| Especificación | Valor |
|----------------|-------|
| Tipo | Li-Po recargable |
| Capacidad | 400mAh |
| Autonomía standby | 7-10 días |
| Autonomía uso activo | 48-72 horas |
| Carga | Micro USB / USB-C |
| Tiempo de carga | 2 horas |

### Sensores
- **Acelerómetro**: Detección de caídas automática
- **GPS**: Localización en tiempo real
- **Sensor de presión**: Confirmación de pulsación del botón

### Audio
- **Micrófono**: MEMS omnidireccional
- **Altavoz**: 0.5W para comunicación bidireccional
- **Sirena**: 85dB para alertar entorno cercano

---

## ⚙️ FUNCIONALIDADES

### Botón SOS Principal
1. **Pulsación corta (1 vez)**: Envía ubicación GPS a familiares registrados
2. **Pulsación larga (3 segundos)**: Activa llamada de emergencia al 112
3. **Triple pulsación rápida**: Alerta silenciosa (sin sonido) a familiares

### Detección Automática de Caídas
- El acelerómetro detecta caídas bruscas
- Envía alerta automática si no hay movimiento en 30 segundos
- Ideal para personas mayores

### Comunicación Bidireccional
- Permite hablar directamente con familiares o servicios de emergencia
- Altavoz integrado para escuchar respuestas

### LED Indicador
| Color | Significado |
|-------|-------------|
| Verde fijo | Dispositivo encendido, batería OK |
| Verde parpadeante | Enviando ubicación |
| Amarillo | Batería baja (<20%) |
| Rojo parpadeante | Alerta SOS activa |
| Rojo fijo | Sin conexión GSM |

---

## 📦 CONTENIDO DEL PAQUETE

Cada unidad incluye:
1. Dispositivo ManoProtect SOS Keychain
2. Cable de carga USB
3. Argolla para llavero (acero inoxidable)
4. Cordón de cuello (opcional, para mayores)
5. Guía de inicio rápido (español)
6. Tarjeta de activación con código QR
7. Pegatina "Protegido por ManoProtect" para el hogar

---

## 🔗 INTEGRACIÓN CON PLATAFORMA

### Activación del Dispositivo
1. Usuario descarga app ManoProtect (Android/iOS)
2. Escanea código QR del dispositivo
3. El dispositivo se vincula automáticamente a la cuenta familiar
4. Se configura lista de contactos de emergencia

### API de Comunicación
```
POST /api/sos-device/activate
POST /api/sos-device/alert
GET  /api/sos-device/location
POST /api/sos-device/call-112
```

### Datos Transmitidos
- Coordenadas GPS (lat/lng)
- Nivel de batería
- Estado del dispositivo
- Timestamp de eventos
- Audio bidireccional (cuando se activa llamada)

---

## 🏭 FABRICACIÓN - REQUISITOS

### Certificaciones Necesarias
- **CE** (Europa)
- **FCC** (si se vende en USA)
- **IP67** (resistencia al agua y polvo)
- **RoHS** (materiales no tóxicos)

### Proveedores Sugeridos
1. **Shenzhen, China**: Fabricantes especializados en dispositivos GPS tracker
2. **Alibaba**: Buscar "SOS GPS tracker keychain OEM"
3. **Referencias**: GT06N, TK102, Similar devices

### Cantidad Mínima de Pedido (MOQ)
- Estimado: 500-1000 unidades para personalización completa
- Coste estimado por unidad: 15-25€ (dependiendo de volumen)

### Tiempo de Producción
- Prototipo: 2-3 semanas
- Producción en masa: 4-6 semanas

---

## 💰 MODELO DE NEGOCIO

### Opciones de Venta
1. **Incluido en plan Familiar**: 1 dispositivo gratis, adicionales 29€
2. **Venta individual**: 49€ (sin suscripción, solo GPS)
3. **Pack Familiar (5 uds)**: 149€

### Coste Operativo Mensual
- SIM/datos por dispositivo: ~2€/mes
- Incluido en suscripción Premium/Familiar

---

## 📞 INTEGRACIÓN CON 112

### Requisitos Legales España
- El dispositivo debe poder realizar llamadas al 112
- Debe transmitir ubicación automáticamente (AML - Advanced Mobile Location)
- Cumplir con normativa de telecomunicaciones española

### Flujo de Emergencia
1. Usuario pulsa botón 3 segundos
2. Dispositivo llama al 112 automáticamente
3. Transmite ubicación GPS al operador
4. Abre canal de audio bidireccional
5. Simultáneamente notifica a familiares en la app

---

## 🖼️ ARCHIVOS DE DISEÑO

### Imágenes Generadas
1. **Vista frontal**: manoprotect_sos_keychain_front.png
2. **Uso real (lifestyle)**: manoprotect_sos_keychain_lifestyle.png
3. **Diagrama técnico**: manoprotect_sos_keychain_technical.png

### Logos para Fabricante
- Logo vectorial disponible en: `/app/frontend/public/manoprotect_logo.svg`
- Colores Pantone: Verde ManoProtect = Pantone 3405 C

---

## ✅ CHECKLIST PARA FABRICACIÓN

- [ ] Finalizar diseño 3D CAD
- [ ] Aprobar muestras de color
- [ ] Seleccionar proveedor de SIM/eSIM
- [ ] Obtener certificación CE
- [ ] Pruebas de resistencia IP67
- [ ] Integración API con backend ManoProtect
- [ ] Pruebas de llamada al 112
- [ ] Empaquetar con instrucciones en español
- [ ] Configurar sistema de envío por mensajería

---

**Documento creado**: Febrero 2026
**Versión**: 1.0
**Contacto**: info@manoprotect.com
