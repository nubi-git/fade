import { env } from "./env";

export const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Si no hay claves configuradas, se omite la verificación (útil en desarrollo). */
export function isTurnstileConfigured(): boolean {
  return Boolean(env.PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
}

/** Valida el token del widget contra Cloudflare. `ok` es true si pasa (o si no
 * está configurado). `codes` trae los error-codes de Cloudflare para diagnóstico. */
export async function verifyTurnstile(
  token: string | null,
  ip?: string | null,
): Promise<{ ok: boolean; codes?: string[] }> {
  if (!isTurnstileConfigured()) return { ok: true };
  if (!token) return { ok: false, codes: ["missing-input-response"] };

  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET_KEY!);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return { ok: data.success === true, codes: data["error-codes"] };
  } catch {
    return { ok: false, codes: ["network-error"] };
  }
}
