import { env } from "./env";

export const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Si no hay claves configuradas, se omite la verificación (útil en desarrollo). */
export function isTurnstileConfigured(): boolean {
  return Boolean(env.PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
}

/** Valida el token del widget contra Cloudflare. Devuelve true si pasa (o si no está configurado). */
export async function verifyTurnstile(token: string | null, ip?: string | null): Promise<boolean> {
  if (!isTurnstileConfigured()) return true;
  if (!token) return false;

  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET_KEY!);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
