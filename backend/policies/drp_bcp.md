# ManoBank S.A. - Plan de Recuperación ante Desastres (DRP) y Continuidad de Negocio (BCP)

## 1. OBJETIVOS

- **RPO (Recovery Point Objective):** 1 hora máximo de pérdida de datos
- **RTO (Recovery Time Objective):** 4 horas para servicios críticos

## 2. CLASIFICACIÓN DE SISTEMAS

| Sistema | Criticidad | RTO | RPO |
|---------|------------|-----|-----|
| Core bancario | Crítica | 2h | 15min |
| Pagos/Transferencias | Crítica | 2h | 15min |
| App/Web clientes | Alta | 4h | 1h |
| KYC/AML | Alta | 4h | 1h |
| Email corporativo | Media | 8h | 4h |
| CRM/Marketing | Baja | 24h | 24h |

## 3. INFRAESTRUCTURA DE RESPALDO

### 3.1 Arquitectura
```
PRIMARIO (EU-West-1)          SECUNDARIO (EU-Central-1)
┌─────────────────┐           ┌─────────────────┐
│ Kubernetes      │◄─────────►│ Kubernetes      │
│ PostgreSQL      │  Réplica  │ PostgreSQL      │
│ Redis           │  Síncrona │ Redis           │
│ Storage         │           │ Storage         │
└─────────────────┘           └─────────────────┘
```

### 3.2 Backups
- Base de datos: cada 15 minutos
- Archivos: cada hora
- Configuraciones: cada cambio
- Retención: 30 días online, 1 año offline

## 4. ESCENARIOS DE DESASTRE

### 4.1 Fallo de Sistema Individual
- **Acción:** Failover automático a réplica
- **Tiempo:** <5 minutos
- **Responsable:** SRE on-call

### 4.2 Fallo de Zona de Disponibilidad
- **Acción:** Activación de site secundario
- **Tiempo:** <30 minutos
- **Responsable:** CTO + SRE

### 4.3 Fallo de Región Completa
- **Acción:** Activación de DR site
- **Tiempo:** <4 horas
- **Responsable:** Crisis Committee

### 4.4 Ciberataque / Ransomware
- **Acción:** Aislamiento + restauración desde backup limpio
- **Tiempo:** Variable
- **Responsable:** CISO + equipo de respuesta

## 5. PROCEDIMIENTO DE ACTIVACIÓN

### 5.1 Detección
1. Alerta de monitoreo (Prometheus/Grafana)
2. Validación por SRE on-call
3. Clasificación de severidad

### 5.2 Escalado
| Severidad | Tiempo máximo | Escala a |
|-----------|---------------|----------|
| SEV1 | Inmediato | CTO + CISO |
| SEV2 | 15 min | Tech Lead |
| SEV3 | 1 hora | SRE Team |
| SEV4 | 4 horas | Ticket normal |

### 5.3 Comunicación
- Clientes: Status page + push notification
- Regulador: <24 horas si afecta operaciones
- Prensa: Solo a través de Comunicación

## 6. PRUEBAS

| Tipo | Frecuencia | Última prueba |
|------|------------|---------------|
| Failover automático | Mensual | - |
| Restauración backup | Trimestral | - |
| DR completo | Semestral | - |
| Simulacro ciberataque | Anual | - |

## 7. CONTACTOS DE EMERGENCIA

| Rol | Nombre | Teléfono |
|-----|--------|----------|
| CTO | [Pendiente] | - |
| CISO | [Pendiente] | - |
| SRE Lead | [Pendiente] | - |
| Proveedor Cloud | AWS Support | - |

## 8. DOCUMENTACIÓN RELACIONADA

- Runbooks de recuperación (Confluence)
- Inventario de sistemas (CMDB)
- Contratos de soporte (Legal)

---

**Versión:** 1.0
**Fecha:** Enero 2026
**Próxima revisión:** Julio 2026
**Aprobado por:** CTO, CISO
