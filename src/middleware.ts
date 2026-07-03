import { defineMiddleware } from "astro:middleware";
import { SESSION_COOKIE, validateSession } from "./lib/auth";

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
      const expectedHost =
        context.request.headers.get("x-forwarded-host") ?? context.url.host;
      if (originHost !== expectedHost) {
        // DEBUG temporal: muestra los valores para diagnosticar el proxy.
        return new Response(
          `Origen no permitido | origin=${originHost} | expected=${expectedHost} | x-forwarded-host=${context.request.headers.get(
            "x-forwarded-host",
          )} | url.host=${context.url.host} | host-header=${context.request.headers.get(
            "host",
          )}`,
          { status: 403 },
        );
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
