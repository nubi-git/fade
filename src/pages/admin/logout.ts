import type { APIRoute } from "astro";
import { SESSION_COOKIE, invalidateSession } from "../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await invalidateSession(token).catch(() => {});
    cookies.delete(SESSION_COOKIE, { path: "/" });
  }
  return redirect("/admin/login");
};
