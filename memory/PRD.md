# ManoBank S.A. - PRD (Product Requirements Document)

## Estado: Sistema Bancario Completo ✅
**Última actualización:** 23 Enero 2026

---

## 1. Visión General

**ManoBank S.A.** es un sistema bancario digital completo diseñado para cumplir con la regulación española (Banco de España, SEPBLAC). Incluye:

- **Core Bancario**: Ledger inmutable con trazabilidad blockchain
- **Compliance**: AML, KYC, Sanciones, Reporting regulatorio
- **Portal de Clientes**: Dashboard estilo CaixaBank
- **Portal de Empleados**: Gestión administrativa completa
- **Detección de Fraude**: Alertas en tiempo real

### Información Legal
| Campo | Valor |
|-------|-------|
| Entidad | ManoBank S.A. |
| CIF | B19427723 |
| Regulador | Banco de España |
| Licencia | Entidad de Dinero Electrónico |
| Nº Licencia | ES-EMI-2026-001 |

---

## 2. Arquitectura Técnica

```
/app/backend/
├── ledger/
│   └── ledger_service.py          # Libro mayor inmutable (SHA-256 chaining)
├── compliance/
│   ├── aml/
│   │   └── aml_service.py         # Anti-Money Laundering
│   ├── kyc/
│   │   └── kyc_service.py         # Know Your Customer
│   ├── reporting/
│   │   └── reporting_service.py   # SEPBLAC reports
│   ├── sanctions/                  # Listas de sanciones
│   └── audit/                      # Auditoría
├── policies/                       # Políticas regulatorias
│   ├── aml_policy.md
│   ├── kyc_policy.md
│   ├── risk_policy.md
│   ├── sanctions_policy.md
│   ├── incident_response.md
│   └── drp_bcp.md
├── routes/
│   ├── auth_routes.py             # Autenticación + 2FA
│   ├── banking_core_routes.py     # Ledger, AML, KYC, Reporting
│   ├── compliance_routes.py       # Compliance dashboard
│   └── manobank_admin_routes.py   # Administración
└── services/
    └── compliance_service.py      # Audit logs inmutables
```

---

## 3. Servicios Implementados ✅

### 3.1 Ledger Service (Libro Mayor Legal)
- ✅ Entradas inmutables con hash SHA-256
- ✅ Encadenamiento estilo blockchain (previous_hash → integrity_hash)
- ✅ Verificación de integridad del libro
- ✅ Estados de cuenta por cliente
- ✅ Reversiones con trazabilidad completa

**Tipos de entradas:**
- DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT
- FEE, INTEREST_CREDIT, INTEREST_DEBIT
- LOAN_DISBURSEMENT, LOAN_REPAYMENT
- CARD_PURCHASE, CARD_REFUND
- FREEZE, UNFREEZE, SEIZURE
- REVERSAL, ADJUSTMENT

### 3.2 AML Service (Anti-Money Laundering)
- ✅ Screening de transacciones en tiempo real
- ✅ Screening de clientes (sanciones + PEP)
- ✅ Detección de structuring (fraccionamiento)
- ✅ Velocity checks (límites de frecuencia)
- ✅ Alertas automáticas con niveles de riesgo
- ✅ Filing de SAR (Suspicious Activity Report)

**Umbrales configurados:**
| Concepto | Valor |
|----------|-------|
| High Value Transaction | €10,000 |
| SAR Automatic Review | €50,000 |
| Velocity Limit | 10 tx/día |
| Structuring Detection | €9,000+ cercano al umbral |

**Países de alto riesgo (FATF):**
AF, BY, CF, CD, CU, GN, IR, IQ, KP, LY, ML, MM, NI, PK, RU, SO, SS, SD, SY, VE, YE, ZW

### 3.3 KYC Service (Know Your Customer)
- ✅ Workflow completo de verificación
- ✅ 4 niveles: Basic, Standard, Enhanced, Full
- ✅ Gestión de documentos (DNI, NIE, Pasaporte, etc.)
- ✅ Video verificación integrada (Zoom SDK)
- ✅ Timeline de eventos por proceso
- ✅ Aprobación/Rechazo con notas

**Documentos soportados:**
- DNI, NIE, Pasaporte
- Permiso de residencia
- Prueba de domicilio
- Extracto bancario
- Declaración de impuestos
- Nómina
- Selfie / Selfie con documento

### 3.4 Reporting Service (Informes Regulatorios)
- ✅ Reporte diario de efectivo (>€1,000)
- ✅ Reporte mensual de operaciones
- ✅ Reporte de audit trail
- ✅ Exportación XML para SEPBLAC
- ✅ Workflow de aprobación y envío

**Tipos de reportes:**
- `daily_cash`: Transacciones en efectivo >€1,000
- `monthly_operations`: Resumen mensual
- `quarterly_stats`: Estadísticas trimestrales
- `suspicious_activity`: SAR
- `audit_trail`: Trazabilidad para auditores

### 3.5 Compliance Service (Auditoría)
- ✅ Audit logs inmutables con hash SHA-256
- ✅ 40+ tipos de eventos de auditoría
- ✅ Niveles de riesgo (low, medium, high, critical)
- ✅ Dashboard de compliance
- ✅ Verificación de integridad de logs

---

## 4. APIs Implementadas

### Ledger APIs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ledger/summary` | Estadísticas del ledger |
| GET | `/api/ledger/account/{id}/statement` | Estado de cuenta |
| GET | `/api/ledger/verify` | Verificar integridad |

### AML APIs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/aml/dashboard` | Dashboard AML |
| GET | `/api/aml/alerts` | Alertas pendientes |
| PATCH | `/api/aml/alerts/{id}` | Actualizar estado alerta |
| POST | `/api/aml/alerts/{id}/sar` | Crear SAR |
| POST | `/api/aml/screen-customer` | Screening de cliente |

### KYC APIs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/kyc/dashboard` | Dashboard KYC |
| GET | `/api/kyc/pending` | KYC pendientes |
| GET | `/api/kyc/{id}` | Detalle de proceso |
| POST | `/api/kyc/initiate` | Iniciar proceso |
| POST | `/api/kyc/{id}/approve` | Aprobar KYC |
| POST | `/api/kyc/{id}/reject` | Rechazar KYC |

### Reporting APIs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reporting/dashboard` | Dashboard de reportes |
| GET | `/api/reporting/pending` | Reportes pendientes |
| POST | `/api/reporting/daily-cash` | Generar reporte diario |
| POST | `/api/reporting/monthly-operations` | Generar reporte mensual |
| POST | `/api/reporting/audit-trail` | Generar audit trail |
| POST | `/api/reporting/{id}/submit` | Enviar a regulador |
| GET | `/api/reporting/{id}/export` | Exportar XML |

### Compliance APIs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/compliance/summary` | Resumen de compliance |
| GET | `/api/compliance/policies` | Lista de políticas |
| GET | `/api/compliance/audit-logs` | Logs de auditoría |
| POST | `/api/compliance/reports` | Generar reporte |

---

## 5. Testing

### Iteration 18 (Actual)
- ✅ **24/24 tests backend pasados (100%)**
- ✅ Ledger integrity verification
- ✅ AML customer screening
- ✅ KYC workflow completo
- ✅ Regulatory reporting
- ✅ Authentication requirements

### Credenciales de Test
| Usuario | Email | Password |
|---------|-------|----------|
| Director General | rrhh.milchollos@gmail.com | 19862210Des |

---

## 6. Integraciones de Terceros

| Servicio | Estado | Uso |
|----------|--------|-----|
| Twilio | ✅ Integrado | SMS 2FA |
| Zoom Video SDK | ✅ Integrado | Video KYC |
| ReportLab | ✅ Integrado | PDFs |
| MongoDB | ✅ Integrado | Base de datos |

### MOCKED (Requieren integración real)
- **Listas de sanciones**: Usar Refinitiv World-Check o Dow Jones
- **Base de datos PEP**: Usar API externa de PEP
- **SEPBLAC API**: Integrar con sistema real del regulador

---

## 7. Pendientes (Backlog)

### P1 - Alta Prioridad
- [ ] Integración BaaS real (Swan/Mambu/Solaris)
- [ ] API SEPBLAC real para envío de reportes
- [ ] Listas de sanciones en tiempo real

### P2 - Media Prioridad
- [ ] Panel de compliance visual en frontend
- [ ] Dashboard de AML en frontend
- [ ] 2FA para portal de clientes

### P3 - Baja Prioridad
- [ ] App móvil clientes (APK via GitHub Actions)
- [ ] Integración Open Banking (PSD2)
- [ ] Grabación de llamadas KYC

---

## Changelog

### 23 Enero 2026 - Arquitectura Bancaria Completa
- ✅ **Ledger Service**: Libro mayor inmutable con hash SHA-256 y blockchain chaining
- ✅ **AML Service**: Anti-Money Laundering con screening de transacciones y clientes
- ✅ **KYC Service**: Know Your Customer con workflow completo
- ✅ **Reporting Service**: Informes regulatorios para SEPBLAC
- ✅ **Banking Core Routes**: 20+ nuevos endpoints
- ✅ **Configuración legal en .env**: Entidad, CIF, regulador, licencia
- ✅ **24/24 tests pasados** (iteration_18)
- ✅ **Compliance Service** con audit logs inmutables

### 21 Enero 2026
- ✅ Sistema de detección de fraude
- ✅ 13/13 tests pasados (iteration_16)
