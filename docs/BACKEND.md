# Backend / Gestor de contenidos — FADE

Astro SSR (adapter Node) + MySQL (Drizzle ORM) + auth propia. Panel en `/admin`.

## 1. Variables de entorno
Copiá `.env.example` a `.env` y completá las credenciales de MySQL:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=fade
DB_PASSWORD=********
DB_NAME=fade
SECURE_COOKIES=true   # true en producción (https), false en local
```

## 2. Crear las tablas
Con la base creada en MySQL (`CREATE DATABASE fade;`):

```bash
npm run db:push        # sincroniza el esquema (users, sessions, projects)
```

## 3. Crear el primer administrador
```bash
npm run seed:admin -- admin@fade.com "una-clave-segura" "Nombre Admin"
```

## 4. Desarrollo
```bash
npm run dev            # http://localhost:4321  (admin en /admin)
```

## 5. Producción (VPS)
```bash
npm run build
node ./dist/server/entry.mjs    # levanta el servidor (puerto 4321 por defecto)
```
Recomendado: correrlo con **pm2** o **systemd** detrás de **nginx** (reverse proxy + HTTPS).

- El puerto se puede cambiar con `HOST` y `PORT` (env del adapter Node).
- Las imágenes subidas se guardan en la carpeta `uploads/` (junto al proceso) y se
  sirven en `/uploads/...`. Asegurate de que esa carpeta sea **persistente** y esté en los backups.
- Backups: base de datos MySQL + carpeta `uploads/`.

## Roles
- `admin`: gestiona todo (incluye, a futuro, usuarios).
- `editor`: gestiona contenido.
- No hay registro público: los usuarios se crean con `seed:admin` (o, más adelante, desde el panel).

## Estructura relevante
- `src/lib/db/` — esquema y conexión Drizzle.
- `src/lib/auth.ts` — hash de contraseña y sesiones.
- `src/middleware.ts` — protege `/admin/*`.
- `src/pages/admin/` — login, dashboard y CRUD de proyectos.
- `src/pages/proyectos.astro` y `src/pages/proyecto/[slug].astro` — vistas públicas (leen de la base).
