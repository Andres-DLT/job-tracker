import "server-only";
import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

let client: Resend | null = null;

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // En desarrollo, sin API key, el correo se imprime en consola.
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email] Para: ${input.to}\n[email] Asunto: ${input.subject}\n${input.text}\n`);
      return { ok: true };
    }
    return { ok: false, error: "RESEND_API_KEY no está configurada" };
  }

  client ??= new Resend(apiKey);
  const { data, error } = await client.emails.send(
    {
      from: process.env.EMAIL_FROM || "Job Tracker <onboarding@resend.dev>",
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (error) return { ok: false, error: `${error.name}: ${error.message}` };
  return { ok: true, id: data?.id };
}
