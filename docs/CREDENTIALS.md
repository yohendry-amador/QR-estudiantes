# Credenciales del Proyecto EduPortal

## ⚠️ AVISO IMPORTANTE
**Cambia todas las contraseñas en producción. Estas credenciales son para desarrollo.**

---

## Base de Datos

| Servicio   | Host       | Puerto | Usuario    | Contraseña      | Base de Datos  |
|------------|------------|--------|------------|-----------------|----------------|
| PostgreSQL | localhost  | 5432   | attendance | TempPassword123 | attendance_db  |
| PostgreSQL | postgres  | 5432   | attendance | TempPassword123 | attendance_db  |

### Connection String
```bash
# Desarrollo (local)
postgresql://attendance:TempPassword123@localhost:5432/attendance_db?schema=public

# Producción Docker
postgresql://attendance:TempPassword123@postgres:5432/attendance_db?schema=public
```

---

## Redis

| Servicio | Host     | Puerto | Contraseña |
|----------|----------|--------|------------|
| Redis    | localhost | 6379   | (sin password) |
| Redis    | redis    | 6379   | (sin password) |

### Connection String
```bash
# Desarrollo
redis://localhost:6379

# Producción Docker
redis://redis:6379
```

---

## Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://attendance:TempPassword123@localhost:5432/attendance_db?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="eduportal-jwt-secret-key-2026-secure-change-in-production"
JWT_REFRESH_SECRET="eduportal-refresh-secret-key-2026-secure-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# QR Code Generation
QR_SECRET_KEY="eduportal-qr-secret-key-2026"
QR_EXPIRES_SECONDS=60

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3001"
```

---

## Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Docker Compose

### Variables de Entorno en Docker

```yaml
# PostgreSQL
POSTGRES_USER: attendance
POSTGRES_PASSWORD: TempPassword123
POSTGRES_DB: attendance_db

# Backend
DATABASE_URL: "postgresql://attendance:TempPassword123@postgres:5432/attendance_db?schema=public"
REDIS_URL: "redis://redis:6379"
JWT_SECRET: "eduportal-jwt-secret-key-2026-secure"
JWT_REFRESH_SECRET: "eduportal-refresh-secret-key-2026-secure"
JWT_EXPIRES_IN: "15m"
JWT_REFRESH_EXPIRES_IN: "7d"
QR_SECRET_KEY: "eduportal-qr-secret-key-2026"
QR_EXPIRES_SECONDS: "60"
PORT: 3000
NODE_ENV: production
CORS_ORIGIN: "http://localhost:3001"

# Frontend
NEXT_PUBLIC_API_URL: "http://localhost:3000/api/v1"
```

---

## Usuarios de Prueba (Seed)

| Email                      | Contraseña   | Rol        | Nombre           |
|----------------------------|--------------|------------|------------------|
| admin@eduportal.com        | Admin123!    | ADMIN      | Administrador     |
| jperez@eduportal.com       | Prof123!     | PROFESSOR  | Juan Pérez       |
| lgomez@eduportal.com       | Prof123!     | PROFESSOR  | Laura Gómez      |
| mrodriguez@eduportal.com   | Estu123!     | STUDENT    | María Rodríguez  |
| acarlos@eduportal.com      | Estu123!     | STUDENT    | Ana Carlos       |
| pmartinez@eduportal.com    | Estu123!     | STUDENT    | Pedro Martínez   |

---

## Puertos de Servicios

| Servicio       | Puerto | URL                                    |
|----------------|--------|----------------------------------------|
| Backend API    | 3000   | http://localhost:3000/api/v1          |
| Frontend       | 3001   | http://localhost:3001                 |
| PostgreSQL     | 5432   | localhost:5432                        |
| Redis          | 6379   | localhost:6379                        |
| Adminer (DB)   | 8080   | http://localhost:8080                  |

---

## Docker Commands

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver estado de los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres

# Detener todos los servicios
docker-compose down

# Reiniciar (con rebuild)
docker-compose down && docker-compose up -d --build

# Acceso a PostgreSQL desde contenedor
docker exec -it eduportal-postgres psql -U attendance -d attendance_db

# Acceso a Redis desde contenedor
docker exec -it eduportal-redis redis-cli
```

---

## Configuración para Producción

### Cambios Obligatorios

1. **Cambiar todas las contraseñas:**
   - `TempPassword123` → Nueva contraseña segura
   - `eduportal-jwt-secret-key-2026-secure` → Generar nuevo secret
   - `eduportal-refresh-secret-key-2026-secure` → Generar nuevo secret
   - `eduportal-qr-secret-key-2026` → Generar nuevo secret

2. **Configurar variables de entorno reales:**
   ```bash
   # En producción, usa variables de entorno del sistema
   JWT_SECRET=$PRODUCTION_JWT_SECRET
   DATABASE_URL=$PRODUCTION_DATABASE_URL
   ```

3. **Habilitar SSL/TLS:**
   - Usar HTTPS en el frontend
   - Configurar certificados SSL en el backend

4. **Credenciales de producción sugeridas:**
   ```bash
   # Generar secrets seguros
   openssl rand -base64 64  # Para JWT_SECRET
   openssl rand -base64 32  # Para QR_SECRET_KEY

   # Contraseña de PostgreSQL
   # Mínimo 16 caracteres, incluir mayúsculas, minúsculas, números y símbolos
   ```

---

## Adminer (Gestión Visual de DB)

- **URL:** http://localhost:8080
- **Sistema:** PostgreSQL
- **Servidor:** postgres (o localhost desde host)
- **Puerto:** 5432
- **Usuario:** attendance
- **Contraseña:** TempPassword123
- **Base de datos:** attendance_db