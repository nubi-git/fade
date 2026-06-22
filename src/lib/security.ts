/** Obtiene la IP del cliente respetando el reverse proxy (nginx / Cloudflare). */
export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/* ---- Rate limiting (ventana fija, en memoria del proceso) ---- */
interface Entry {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Entry>();

export interface RateResult {
  ok: boolean;
  retryAfter: number; // segundos hasta poder reintentar
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

// Limpieza periódica para no acumular claves viejas.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }, 60_000).unref?.();
}

/* ---- Redirects seguros (solo rutas internas relativas) ---- */
export function safeRedirectPath(input: string | null | undefined, fallback = "/"): string {
  if (!input) return fallback;
  // Debe ser una ruta absoluta interna: empieza con "/" pero no con "//" ni "/\"
  if (!/^\/(?![/\\])/.test(input)) return fallback;
  return input;
}
