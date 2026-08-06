# Errores detectados y soluciones aplicadas

## 1. Login no redirigía al dashboard correcto

### Problema
El frontend enviaba a todos los usuarios a la ruta principal tras iniciar sesión, sin diferenciar por rol.

### Solución
Se agregó la lógica de redirección por rol en:
- qr-attendance/src/lib/auth/redirect.ts
- qr-attendance/src/app/login/page.tsx
- qr-attendance/src/components/auth-guard.tsx

### Comportamiento actual
- ADMIN -> /admin
- PROFESSOR -> /professor
- STUDENT -> /student

## 2. Backend no arrancaba correctamente por problemas de autenticación a PostgreSQL

### Problema
El backend no podía conectar con la base de datos porque la configuración de Docker y el estado previo de los volúmenes estaban desalineados.

### Solución
Se recreó la infraestructura de Docker para limpiar el estado anterior y rearmar los servicios.

## 3. El sistema no tenía usuarios válidos para login

### Problema
La base de datos se había creado, pero la tabla de usuarios estaba vacía, por lo que el backend rechazaba cualquier intento de login.

### Solución
Se corrigió y ejecutó el seed del backend para crear usuarios con roles y contraseñas válidas.

## Credenciales de prueba
- Admin: admin@eduportal.com / Admin123!
- Profesor: jperez@eduportal.com / Prof123!
- Estudiante: mrodriguez@eduportal.com / Estu123!

## Verificación realizada
- Backend responde en http://localhost:3000/api/v1/health
- El endpoint de login devuelve tokens válidos
- El frontend está disponible en http://localhost:3001/login
