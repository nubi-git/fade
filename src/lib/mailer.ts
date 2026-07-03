import nodemailer from "nodemailer";
import { env } from "./env";

export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: port === 465, // SSL en 465, STARTTLS en 587
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export interface ContactPayload {
  nombre: string;
  email: string;
  empresa?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  mensaje: string;
}

/** Envía el mensaje del formulario de contacto al destinatario indicado. */
export async function sendContactEmail(to: string, data: ContactPayload) {
  const from = env.SMTP_FROM || env.SMTP_USER!;
  const lines = [
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    data.empresa ? `Empresa: ${data.empresa}` : null,
    data.cargo ? `Cargo: ${data.cargo}` : null,
    data.telefono ? `Teléfono: ${data.telefono}` : null,
    "",
    data.mensaje,
  ].filter((l) => l !== null);

  await getTransporter().sendMail({
    from: `"FADE — Web" <${from}>`,
    to,
    replyTo: data.email,
    subject: `Nuevo contacto web — ${data.nombre}`,
    text: lines.join("\n"),
  });
}
