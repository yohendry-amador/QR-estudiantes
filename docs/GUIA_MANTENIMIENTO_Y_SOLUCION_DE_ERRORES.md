# Guía de mantenimiento y solución de errores

## Objetivo
Esta guía resume los problemas más comunes encontrados en el proyecto y cómo resolverlos de forma ordenada.

## 1. Problemas de autenticación y redirección

### Síntoma
El usuario inicia sesión pero no entra al dashboard correcto.

### Causa más frecuente
El frontend no está interpretando bien la respuesta del backend o el rol no llega correctamente.

### Solución
- Verificar que la respuesta del backend tenga el formato esperado.
- Asegurar que el cliente del frontend extraiga correctamente el campo data.
- Confirmar que el rol recuperado sea ADMIN, PROFESSOR o STUDENT.

## 2. Problemas de login por usuarios inexistentes

### Síntoma
El login falla aunque las credenciales parezcan correctas.

### Causa más frecuente
No existe el usuario en la base de datos o el password hash no coincide.

### Solución
- Ejecutar el seed del backend.
- Verificar la tabla de usuarios en la base.
- Confirmar que el password se haya almacenado correctamente.

## 3. Problemas de infraestructura con Docker

### Síntoma
El backend o frontend no suben correctamente o aparecen estados inesperados.

### Solución
- Revisar el estado de los contenedores con docker compose ps.
- Limpiar volúmenes y recrear el entorno si es necesario.
- Verificar que PostgreSQL, Redis y los servicios principales estén saludables.

## 4. Proceso recomendado para validar cambios

1. Ejecutar build del frontend.
2. Ejecutar build del backend.
3. Levantar servicios con Docker.
4. Validar login para cada rol.
5. Revisar el dashboard correspondiente.

## 5. Credenciales de prueba recomendadas
- Admin: admin@eduportal.com / Admin123!
- Profesor: jperez@eduportal.com / Prof123!
- Estudiante: mrodriguez@eduportal.com / Estu123!
