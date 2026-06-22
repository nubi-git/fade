import { db } from "./db";
import { settings } from "./db/schema";

/** Devuelve todos los ajustes como un mapa clave→valor. */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

/** Crea o actualiza un ajuste. */
export async function setSetting(key: string, value: string | null) {
  await db
    .insert(settings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}
