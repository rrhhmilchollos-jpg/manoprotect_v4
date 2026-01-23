# ManoBank S.A. - Plan de Respuesta a Incidentes de Seguridad

## 1. DEFINICIÓN DE INCIDENTE

Un incidente de seguridad es cualquier evento que comprometa o pueda comprometer:
- Confidencialidad de datos
- Integridad de sistemas
- Disponibilidad de servicios
- Cumplimiento normativo

## 2. CLASIFICACIÓN

| Nivel | Descripción | Ejemplos |
|-------|-------------|----------|
| **CRÍTICO** | Compromiso confirmado de datos o sistemas | Brecha de datos, ransomware activo |
| **ALTO** | Intento de ataque exitoso parcial | Acceso no autorizado detectado |
| **MEDIO** | Actividad sospechosa | Escaneo de puertos, phishing |
| **BAJO** | Eventos menores | Spam, intentos de login fallidos |

## 3. EQUIPO DE RESPUESTA (CSIRT)

| Rol | Responsabilidad |
|-----|-----------------|
| CISO | Líder del equipo, decisiones finales |
| Security Engineer | Análisis técnico y contención |
| SRE | Infraestructura y recuperación |
| Legal/Compliance | Obligaciones legales y reporting |
| Comunicación | Gestión de stakeholders |

## 4. FASES DE RESPUESTA

### 4.1 Detección (0-15 min)
- [ ] Alerta recibida y validada
- [ ] Clasificación inicial de severidad
- [ ] Activación del CSIRT si es ALTO/CRÍTICO

### 4.2 Contención (15 min - 2h)
- [ ] Aislamiento del sistema afectado
- [ ] Preservación de evidencias
- [ ] Bloqueo de vectores de ataque
- [ ] Comunicación inicial interna

### 4.3 Erradicación (2h - 24h)
- [ ] Identificación de causa raíz
- [ ] Eliminación de amenaza
- [ ] Parcheo de vulnerabilidades
- [ ] Verificación de integridad

### 4.4 Recuperación (24h - 72h)
- [ ] Restauración de servicios
- [ ] Monitoreo intensivo
- [ ] Validación de funcionamiento
- [ ] Comunicación a afectados si procede

### 4.5 Lecciones Aprendidas (Post-incidente)
- [ ] Post-mortem documentado
- [ ] Actualización de controles
- [ ] Formación si es necesario
- [ ] Informe a dirección

## 5. NOTIFICACIONES OBLIGATORIAS

### 5.1 GDPR (Brecha de datos personales)
- **A quién:** AEPD
- **Plazo:** 72 horas
- **Contenido:** Naturaleza, afectados, medidas

### 5.2 PSD2 (Incidente operativo grave)
- **A quién:** Banco de España
- **Plazo:** Inmediato (informe preliminar en 24h)

### 5.3 Clientes
- **Cuándo:** Si hay riesgo para sus derechos
- **Cómo:** Email + notificación en app

## 6. CONTACTOS

| Entidad | Contacto |
|---------|----------|
| AEPD | [Canal oficial] |
| Banco de España | [Canal oficial] |
| INCIBE-CERT | incidencias@incibe-cert.es |
| Policía Nacional | denuncias.ciberdelincuencia@policia.es |

## 7. CHECKLIST RÁPIDO

```
□ ¿Hay datos personales comprometidos? → Notificar AEPD
□ ¿Afecta a operaciones bancarias? → Notificar BdE
□ ¿Es delito? → Denunciar a Policía
□ ¿Afecta a clientes? → Comunicar a afectados
□ ¿Es noticia? → Preparar comunicado
```

---

**Versión:** 1.0
**Fecha:** Enero 2026
**Aprobado por:** CISO
