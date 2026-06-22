import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { sessions, users, type User } from "./db/schema";

const SESSION_TTL_DAYS = 7;
export const SESSION_COOKIE = "fade_session";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function newId() {
  return randomUUID();
}

/** Crea una sesión para un usuario y devuelve el token + fecha de expiración. */
export async function createSession(userId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

/** Valida un token de sesión y devuelve el usuario (o null si no es válido/expiró). */
export async function validateSession(token: string | undefined): Promise<User | null> {
  if (!token) return null;
  const rows = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }
  return row.user;
}

export async function invalidateSession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}
