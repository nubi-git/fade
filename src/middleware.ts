import { defineMiddleware } from "astro:middleware";
import { readFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { SESSION_COOKIE, validateSession } from "./lib/auth";

// Carpeta persistente de archivos subidos (misma que usa lib/uploads.ts).
const UPLOAD_DIR = join(process.cwd(), "uploads");

// Content-Type por extensión para servir /uploads/ desde la app (detrás de
// Passenger todas las peticiones pasan por Node; los estáticos del build los
// sirve Astro, pero uploads/ es una carpeta aparte que hay que servir a mano).
const UPLOAD_MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

// CSP: permite recursos propios + los externos que realmente usamos
// (Google Fonts, mapas embebidos, Cloudflare Turnstile). 'unsafe-inline' es
// necesario por los scripts/estilos inline que inyecta Astro.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const onRequest = defineMiddleware(async (context, next) => {
  // Sirve los archivos subidos (/uploads/...) desde la carpeta persistente.
  if (context.url.pathname.startsWith("/uploads/")) {
    const name = basename(context.url.pathname);
    if (!name || name.includes("..")) {
      return new Response("No encontrado", { status: 404 });
    }
    try {
      const data = await readFile(join(UPLOAD_DIR, name));
      const type = UPLOAD_MIME[extname(name).toLowerCase()] ?? "application/octet-stream";
      return new Response(data, {
        headers: {
          "Content-Type": type,
          // Nombres con hash único → se pueden cachear agresivamente.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new Response("No encontrado", { status: 404 });
    }
  }

  // Anti-CSRF: en peticiones que modifican estado, si viene header Origin
  // (todo navegador lo envía en envíos cross-site) debe coincidir con el host.
  if (UNSAFE_METHODS.has(context.request.method)) {
    const origin = context.request.headers.get("origin");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        return new Response("Origen inválido", { status: 403 });
      }
      // Detrás de un reverse proxy (Passenger), el host real que pidió el
      // navegador viene en x-forwarded-host; lo usamos como fuente de verdad.
      // Detrás de Passenger, context.url.host es "localhost" (la dirección
      // interna donde escucha el adapter Node). El host real que pidió el
      // navegador viene en x-forwarded-host o, en su defecto, en el header Host.
      const expectedHost =
        context.request.headers.get("x-forwarded-host") ??
        context.request.headers.get("host") ??
        context.url.host;
      if (originHost !== expectedHost) {
        return new Response("Origen no permitido", { status: 403 });
      }
    }
  }

  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const user = await validateSession(token).catch(() => null);
  context.locals.user = user;

  const path = context.url.pathname;
  const isAdmin = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  if (isAdmin && !isLogin && !user) {
    return context.redirect("/admin/login");
  }
  if (isLogin && user) {
    return context.redirect("/admin");
  }

  const response = await next();

  // Cabeceras de seguridad
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  response.headers.set("Content-Security-Policy", CSP);
  // Las páginas del admin no deben cachearse ni indexarse
  if (isAdmin) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
});
