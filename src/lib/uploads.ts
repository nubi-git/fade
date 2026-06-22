import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { randomUUID } from "node:crypto";

// Carpeta persistente fuera del build (en el VPS vive junto al proceso).
export const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", // imágenes
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", // documentos
]);

/**
 * Guarda un File del formData en /uploads y devuelve la ruta pública (/uploads/...).
 * Devuelve null si no hay archivo válido.
 */
export async function saveUpload(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  if (file.size === 0) return null;

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    throw new Error(`Tipo de archivo no permitido: ${ext}`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

/**
 * Borra del disco un archivo subido. Solo actúa sobre rutas /uploads/...
 * (ignora imágenes estáticas de /images u otras). Silencioso si no existe.
 */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  const name = basename(url);
  if (!name || name.includes("..")) return;
  await unlink(join(UPLOAD_DIR, name)).catch(() => {});
}
