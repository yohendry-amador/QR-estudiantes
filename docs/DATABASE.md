# Documentación de Base de Datos - EduPortal

## 1. Requisitos Previos

- PostgreSQL 15+ instalado
- Node.js 18+ y npm
- Docker y Docker Compose (opcional)

---

## 2. Instalación con Docker Compose (Recomendado)

### 2.1 Crear y ejecutar contenedores

```bash
# Navegar al directorio del proyecto
cd QR-estudiantes

# Iniciar todos los servicios
docker-compose up -d

# Verificar que los servicios están corriendo
docker-compose ps

# Ver logs en tiempo real (Ctrl+C para salir)
docker-compose logs -f
```

### 2.2 Verificar servicios

```bash
# Probar PostgreSQL
docker exec -it eduportal-postgres psql -U attendance -d attendance_db -c "SELECT version();"

# Probar Redis
docker exec -it eduportal-redis redis-cli ping
# Respuesta esperada: PONG

# Probar Backend
curl http://localhost:3000/api/v1/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

### 2.3 Acceder a Adminer (gestión visual)

1. Abrir navegador en: http://localhost:8080
2. Completar:
   - Sistema: PostgreSQL
   - Servidor: postgres
   - Puerto: 5432
   - Usuario: attendance
   - Contraseña: TempPassword123
   - Base de datos: attendance_db

---

## 3. Instalación Manual (sin Docker)

### 3.1 Instalar PostgreSQL

**Windows:**
1. Descargar PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Instalar con pgAdmin incluido
3. Agregar PostgreSQL al PATH

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Crear Base de Datos y Usuario

```bash
# Conectar como postgres
sudo -u postgres psql

# En la consola psql, ejecutar:
CREATE USER attendance WITH PASSWORD 'TempPassword123';
CREATE DATABASE attendance_db OWNER attendance;
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance;
\q

# Verificar conexión
psql -U attendance -d attendance_db -h localhost
```

### 3.3 Instalar y configurar Redis

**Windows:**
```powershell
# Usar Chocolatey
choco install redis-64
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3.4 Verificar que Redis funciona

```bash
redis-cli ping
# Respuesta esperada: PONG
```

---

## 4. Configurar Backend

### 4.1 Instalar dependencias

```bash
cd Backend
npm install
```

### 4.2 Configurar variables de entorno

Crear archivo `Backend/.env` (ya existe, verificar credenciales):

```bash
DATABASE_URL="postgresql://attendance:TempPassword123@localhost:5432/attendance_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="eduportal-jwt-secret-key-2026-secure"
JWT_REFRESH_SECRET="eduportal-refresh-secret-key-2026-secure"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
QR_SECRET_KEY="eduportal-qr-secret-key-2026"
QR_EXPIRES_SECONDS=60
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"
```

### 4.3 Generar cliente Prisma

```bash
npx prisma generate
```

### 4.4 Crear tablas en la base de datos

```bash
# Opción A: Con migración (recomendado para desarrollo)
npx prisma migrate dev --name init

# Opción B: Directo (crea tablas sin migración)
npx prisma db push

# Opción C: Solo aplicar migraciones existentes (producción)
npx prisma migrate deploy
```

### 4.5 Poblar datos iniciales (Seed)

```bash
npx prisma db seed
```

---

## 5. Estructura de la Base de Datos

### 5.1 Diagrama de Entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Student   │     │  Professor  │
│─────────────│     │─────────────│     │─────────────│
│ id          │     │ id          │     │ id          │
│ email       │     │ studentCode  │     │ employeeCode│
│ passwordHash│     │ firstName   │     │ firstName   │
│ role        │     │ lastName    │     │ lastName    │
│ isActive    │     └──────┬──────┘     └──────┬──────┘
└─────────────┘            │                  │
       │                   │                  │
       │              ┌────┴────┐            │
       │              │         │            │
       │         ┌────┴───┐ ┌───┴────┐       │
       │         │Enrollment│ │ Section│>─────┘
       │         │──────────│ │────────│
       │         │ studentId│ │courseId│
       │         │ sectionId│ │profId  │
       │         └────┬────┘ └───┬────┘
       │              │          │
       │         ┌────┴────┐  ┌──┴────┐
       │         │Session  │  │ Course │
       │         │─────────│  │────────│
       │         │ sectionId│  │ code   │
       │         │ qrCode  │  │ name   │
       │         │ status  │  │credits │
       │         └────┬────┘  └────────┘
       │              │
       │         ┌────┴────┐
       │         │Attendance│
       │         │─────────│
       │         │studentId │
       │         │sessionId │
       │         │status    │
       │         │method    │
       │         └──────────┘
       │
   ┌───┴────┐
   │AuditLog │
   │─────────│
   │userId   │
   │action   │
   │entityType│
   └─────────┘
```

### 5.2 Tablas Principales

| Tabla         | Descripción                              |
|---------------|------------------------------------------|
| User          | Cuentas de usuario (login)               |
| Student       | Perfiles de estudiantes                  |
| Professor     | Perfiles de profesores                   |
| Course        | Cursos (ej: Matemáticas I)               |
| Section       | Secciones/grupos de un curso             |
| Enrollment    | Inscripciones estudiante-sección         |
| Session       | Sesiones de asistencia (QR)              |
| Attendance    | Registros de asistencia                  |
| AuditLog      | Log de auditoría                         |

### 5.3 Enums

```sql
-- Roles de usuario
'STUDENT', 'PROFESSOR', 'ADMIN'

-- Estado de inscripción
'ACTIVE', 'DROPPED', 'COMPLETED'

-- Estado de sesión
'ACTIVE', 'CLOSED', 'CANCELLED'

-- Estado de asistencia
'PRESENT', 'ABSENT', 'TARDY', 'JUSTIFIED'

-- Método de registro
'QR_SCAN', 'MANUAL'
```

---

## 6. Scripts de Mantenimiento

### 6.1 Ver estado de la base

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Ver conexión y status
npx prisma migrate status
```

### 6.2 Resetear base de datos

```bash
# Precaución: Elimina todos los datos
npx prisma migrate reset
# Responde 'y' a las confirmaciones
```

### 6.3 Backup y Restore

```bash
# Backup (desde host)
pg_dump -U attendance -d attendance_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U attendance -d attendance_db < backup_20260101.sql

# Backup con Docker
docker exec -it eduportal-postgres pg_dump -U attendance attendance_db > backup.sql
```

### 6.4 Ver consultas lentas

```sql
-- En psql, activar timing
\timing on

-- Ver conexiones activas
SELECT * FROM pg_stat_activity WHERE datname = 'attendance_db';
```

---

## 7. Troubleshooting

### Error: "Connection refused"

```bash
# Verificar PostgreSQL está corriendo
sudo systemctl status postgresql    # Linux
brew services list                  # macOS
docker-compose ps                  # Docker

# Verificar puerto
lsof -i :5432
```

### Error: "Password authentication failed"

```bash
# Verificar credenciales en .env
# Verificar usuario existe
psql -U postgres -c "\du"
```

### Error: "Database does not exist"

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE attendance_db OWNER attendance;
\q
```

### Error: "Migration failed"

```bash
# Ver errores detallados
npx prisma migrate dev --name init --verbose

# Si hay conflictos, resetear
npx prisma migrate reset
```

---

## 8. Datos del Seed

### Profesores
| Código | Nombre  | Apellido | Email                  |
|--------|---------|----------|------------------------|
| EMP001 | Juan    | Pérez    | jperez@eduportal.com   |
| EMP002 | Laura   | Gómez    | lgomez@eduportal.com   |

### Cursos
| Código | Nombre            | Créditos |
|--------|-------------------|----------|
| MAT101 | Matemáticas I    | 4        |
| FIS101 | Física General    | 4        |
| PRO101 | Programación I    | 4        |
| QUI101 | Química General   | 3        |

### Secciones
| Código | Curso   | Profesor   | Horario              | Aula |
|--------|---------|------------|----------------------|------|
| A      | MAT101  | Juan P.    | Lun-Mié-Vie 10:00   | 101  |
| B      | MAT101  | Laura G.   | Mar-Jue 14:00       | 102  |
| A      | FIS101  | Juan P.    | Lun-Mié 08:00        | 201  |
| A      | PRO101  | Laura G.   | Mar-Jue-Vie 16:00   | LAB1 |

### Estudiantes
| Código   | Nombre  | Apellido   | Email                      |
|----------|---------|------------|----------------------------|
| 2026001  | María   | Rodríguez  | mrodriguez@eduportal.com   |
| 2026002  | Ana     | Carlos     | acarlos@eduportal.com      |
| 2026003  | Pedro   | Martínez   | pmartinez@eduportal.com    |

### Inscripciones
| Estudiante       | Sección         | Estado  |
|------------------|-----------------|---------|
| María Rodríguez  | MAT101-A (Juan) | ACTIVE  |
| María Rodríguez  | PRO101-A (Laura)| ACTIVE  |
| Ana Carlos       | MAT101-B (Laura)| ACTIVE  |
| Pedro Martínez   | MAT101-A (Juan) | ACTIVE  |

---

## 9. Verificación Final

```bash
# 1. Backend corriendo
curl http://localhost:3000/api/v1/health
# Esperado: {"status":"ok"}

# 2. Login funciona
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduportal.com","password":"Admin123!"}'
# Esperado: {"accessToken":"...","refreshToken":"...","user":{...}}

# 3. Frontend accesible
curl http://localhost:3001
# Esperado: HTML de la página
```