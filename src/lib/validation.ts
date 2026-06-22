import { z } from "zod";

/** Texto opcional: recorta y convierte vacío en null. */
const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null);

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} es obligatorio.`);

/** Esquema de Proyecto. Normaliza y sanitiza los datos. */
export const projectSchema = z.object({
  name: requiredText("El nombre"),
  type: requiredText("El tipo"),
  year: z
    .preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z.number().int().min(1900, "Año inválido.").max(2100, "Año inválido.").nullable()
    )
    .optional()
    .transform((v) => v ?? null),
  location: optionalText,
  client: optionalText,
  direction: optionalText,
  summary: optionalText,
  description: optionalText,
  published: z.preprocess((v) => v === "1" || v === true || v === "on", z.boolean()),
  sortOrder: z.preprocess(
    (v) => (v === "" || v == null ? 0 : Number(v)),
    z.number().int().catch(0)
  ),
});
export type ProjectInput = z.infer<typeof projectSchema>;

/** Esquema de Documento de Medios. */
export const mediaSchema = z.object({
  title: requiredText("El título"),
  docDate: optionalText,
  published: z.preprocess((v) => v === "1" || v === true || v === "on", z.boolean()),
  sortOrder: z.preprocess(
    (v) => (v === "" || v == null ? 0 : Number(v)),
    z.number().int().catch(0)
  ),
});
export type MediaInput = z.infer<typeof mediaSchema>;

/** Esquema del formulario de contacto público. */
export const contactSchema = z.object({
  nombre: requiredText("El nombre"),
  email: z.string().trim().email("Ingresá un email válido."),
  empresa: optionalText,
  cargo: optionalText,
  telefono: optionalText,
  mensaje: requiredText("El mensaje"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type FieldErrors = Record<string, string>;

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

/** Convierte FormData a objeto plano y valida con el esquema dado. */
export function parseForm<T>(schema: z.ZodType<T>, form: FormData): ParseResult<T> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (value instanceof File) continue; // los archivos se manejan aparte
    raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const path = String(issue.path[0] ?? "");
    if (path && !errors[path]) errors[path] = issue.message;
  }
  return { success: false, errors };
}
