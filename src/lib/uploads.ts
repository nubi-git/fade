import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { slugify } from "./slug";

// Carpeta persistente fuera del build (en el VPS vive junto al proceso).
export const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", // imágenes
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", // documentos
]);

// Extensiones que se optimizan (se convierten a WebP y se redimensionan).
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

export interface SaveUploadOptions {
  /** Ancho máximo en px. Si la imagen es más ancha se reduce (nunca se agranda). */
  maxWidth?: number;
  /** Calidad WebP 1-100 (por defecto 80). */
  quality?: number;
}

/**
 * Guarda un File del formData en /uploads y devuelve la ruta pública (/uploads/...).
 *
 * - Imágenes: se optimizan a **WebP**, se redimensionan a `maxWidth` y se
 *   nombran con un slug legible (ej. `torre-norte-a1b2c3d4.webp`).
 * - Documentos (PDF, etc.): se guardan tal cual, con nombre legible.
 *
 * Devuelve null si no hay archivo válido.
 */
export async function saveUpload(
  file: FormDataEntryValue | null,
  opts: SaveUploadOptions = {},
): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  if (file.size === 0) return null;

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    throw new Error(`Tipo de archivo no permitido: ${ext}`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const base = slugify(basename(file.name, extname(file.name))) || "archivo";
  const suffix = randomUUID().slice(0, 8);
  const input = Buffer.from(await file.arrayBuffer());

  if (IMAGE_EXT.has(ext)) {
    const { maxWidth = 1600, quality = 80 } = opts;
    const filename = `${base}-${suffix}.webp`;
    const output = await sharp(input, { animated: true })
      .rotate() // respeta la orientación EXIF de las fotos y la normaliza
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await writeFile(join(UPLOAD_DIR, filename), output);
    return `/uploads/${filename}`;
  }

  // Documentos: se guardan sin modificar.
  const filename = `${base}-${suffix}${ext}`;
  await writeFile(join(UPLOAD_DIR, filename), input);
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
