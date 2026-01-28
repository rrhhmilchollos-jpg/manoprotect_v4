# ManoBank - Sistema Bancario Digital

## Estado: EN DESARROLLO
Proyecto independiente conectado con ManoProtect para servicios antifraude.

## Arquitectura

```
/app/manobank/
├── frontend/           # React (puerto 3001)
│   ├── src/
│   │   ├── pages/     # Páginas de la aplicación
│   │   ├── components/# Componentes reutilizables
│   │   └── context/   # Context API (Auth, etc.)
│   └── public/
├── backend/            # FastAPI (puerto 8002)
│   ├── routes/        # Endpoints API
│   ├── services/      # Lógica de negocio
│   └── models/        # Modelos Pydantic
└── .env               # Variables de entorno
```

## Integración con ManoProtect

ManoBank consume la API de ManoProtect para:
- **Verificación de fraude**: Cada transacción se verifica en tiempo real
- **Alertas de seguridad**: Recibe alertas de la base de datos de estafadores
- **Reportes**: Envía actividades sospechosas para análisis

### Endpoints de integración (ManoProtect)
- `POST /api/fraud/check` - Verificar si una operación es fraudulenta
- `POST /api/fraud/report` - Reportar actividad sospechosa
- `GET /api/fraud/alerts/{user_id}` - Obtener alertas de un usuario

## Rutas de la aplicación

### Portal de Clientes
- `/` - Landing page
- `/login` - Login de clientes
- `/registro` - Registro de nuevos clientes
- `/dashboard` - Panel del cliente

### Portal de Empleados
- `/banco` - Login de empleados
- `/banco/sistema` - Sistema interno bancario

## Iniciar en desarrollo

```bash
# Backend (puerto 8002)
cd /app/manobank/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8002

# Frontend (puerto 3001)
cd /app/manobank/frontend
yarn install
yarn start
```

## Variables de entorno

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=manobank_db
MANOPROTECT_API_URL=http://localhost:8001/api
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8002
REACT_APP_MANOPROTECT_URL=http://localhost:3000
PORT=3001
```

## Credenciales de prueba

(Crear usuarios en la base de datos manobank_db)

## Funcionalidades

### Implementadas ✅
- Landing page
- Login/Registro de clientes
- Dashboard de cliente (básico)
- Portal de empleados (básico)
- Integración con API de fraude ManoProtect

### Pendientes 📋
- Sistema completo de cuentas
- Transferencias SEPA/Bizum
- Tarjetas virtuales
- KYC completo
- Préstamos
- Gestión de empleados

## Notas

- Este proyecto está separado de ManoProtect pero comparte servicios de seguridad
- La base de datos es independiente (manobank_db)
- Los dominios serán: manobank.es, www.manobank.es
