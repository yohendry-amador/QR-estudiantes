# Guia de despliegue para compartir EduPortal QR

Esta configuracion deja el backend en Render y el frontend en Vercel.

## 1. Subir el proyecto a GitHub o GitLab

Esta carpeta no tiene un repositorio Git inicializado. Crea un repo y sube todo el proyecto desde la raiz `QR-estudiantes`.

Ejemplo:

```bash
git init
git add .
git commit -m "Prepare deployment"
git branch -M main
git remote add origin <URL_DEL_REPO>
git push -u origin main
```

## 2. Desplegar backend en Render

1. En Render, crea un Blueprint desde el repo.
2. Render debe detectar `render.yaml` en la raiz.
3. El Blueprint crea:
   - `qr-backend` como Web Service Docker.
   - `qr-postgres` como PostgreSQL.
   - `qr-redis` como Key Value compatible con Redis.
4. Cuando Render pida `CORS_ORIGIN`, puedes poner temporalmente:

```bash
http://localhost:3001
```

5. Espera el deploy del backend.
6. Copia la URL publica del backend. Debe verse parecida a:

```bash
https://qr-backend.onrender.com
```

7. Verifica salud:

```bash
https://qr-backend.onrender.com/api/v1/health
```

La respuesta esperada contiene `"status":"ok"`.

## 3. Desplegar frontend en Vercel

1. Importa el mismo repo en Vercel.
2. Configura el Root Directory como:

```bash
qr-attendance
```

3. Agrega esta variable de entorno en Production:

```bash
NEXT_PUBLIC_API_URL=https://<TU_BACKEND_RENDER>.onrender.com/api/v1
```

4. Despliega el frontend.
5. Copia la URL final de Vercel, por ejemplo:

```bash
https://qr-attendance.vercel.app
```

## 4. Ajustar CORS final en Render

En Render, abre `qr-backend` > Environment y actualiza:

```bash
CORS_ORIGIN=https://<TU_FRONTEND_VERCEL>.vercel.app,http://localhost:3001
```

Luego redeploy del backend.

## 5. Credenciales de prueba

El seed se ejecuta al arrancar el contenedor y crea usuarios base:

```bash
Admin: admin@eduportal.com / Admin123!
Profesor: jperez@eduportal.com / Prof123!
Estudiante: mrodriguez@eduportal.com / Estu123!
```

Cambia estas contrasenas antes de usarlo como produccion real.

## Notas

- Render Free puede dormir el backend si no recibe trafico; la primera carga puede tardar.
- `NEXT_PUBLIC_API_URL` queda integrado durante el build de Next.js. Si cambias la URL del backend, redeploya el frontend.
- Si el login falla por CORS, revisa que `CORS_ORIGIN` tenga exactamente el dominio de Vercel, sin slash final.