import "server-only";
import { createHash } from "node:crypto";
import { and, asc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, reminders, users } from "@/lib/db/schema";
import { diffDaysISO, formatDate, todayISO } from "@/lib/dates";
import { sendEmail } from "@/lib/email";
import { STATUS_META, type ApplicationStatus } from "@/lib/status";
import { appUrl, escapeHtml } from "@/lib/utils";

type DueReminder = {
  id: string;
  dueOn: string;
  message: string;
  applicationId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  userId: string;
  userName: string;
  userEmail: string;
};

export type ProcessResult = {
  date: string;
  users: number;
  sent: number;
  failed: number;
  errors: string[];
};

const SEND_DELAY_MS = 600; // Resend limita las peticiones por segundo

/**
 * Envía un correo por usuario con todos sus recordatorios vencidos (hoy o antes) y
 * aún no enviados. Cada lote se "reclama" marcando sent_at antes de enviar, de modo
 * que dos ejecuciones simultáneas del cron no dupliquen correos; si el envío falla,
 * se libera para reintentarlo en la siguiente ejecución.
 */
export async function processDueReminders(now = new Date()): Promise<ProcessResult> {
  const today = todayISO(now);

  const due: DueReminder[] = await db
    .select({
      id: reminders.id,
      dueOn: reminders.dueOn,
      message: reminders.message,
      applicationId: applications.id,
      company: applications.company,
      position: applications.position,
      status: applications.status,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reminders)
    .innerJoin(applications, eq(reminders.applicationId, applications.id))
    .innerJoin(users, eq(reminders.userId, users.id))
    .where(and(isNull(reminders.sentAt), lte(reminders.dueOn, today)))
    .orderBy(asc(reminders.dueOn));

  const byUser = Map.groupBy(due, (r) => r.userId);
  const result: ProcessResult = { date: today, users: 0, sent: 0, failed: 0, errors: [] };

  for (const [userId, items] of byUser) {
    const claimed = await db
      .update(reminders)
      .set({ sentAt: now })
      .where(
        and(
          inArray(
            reminders.id,
            items.map((r) => r.id),
          ),
          isNull(reminders.sentAt),
        ),
      )
      .returning({ id: reminders.id });

    const claimedIds = new Set(claimed.map((c) => c.id));
    const batch = items.filter((r) => claimedIds.has(r.id));
    if (batch.length === 0) continue; // otra ejecución ya los reclamó

    result.users++;
    const email = buildReminderEmail(batch, today);
    const idempotencyKey = `reminders/${createHash("sha256")
      .update([...claimedIds].sort().join(","))
      .digest("hex")}`;

    let outcome: Awaited<ReturnType<typeof sendEmail>>;
    try {
      outcome = await sendEmail({ to: batch[0].userEmail, ...email, idempotencyKey });
    } catch (err) {
      outcome = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }

    if (outcome.ok) {
      result.sent += batch.length;
    } else {
      result.failed += batch.length;
      result.errors.push(`usuario ${userId}: ${outcome.error}`);
      await db
        .update(reminders)
        .set({ sentAt: null })
        .where(inArray(reminders.id, [...claimedIds]));
    }

    if (byUser.size > 1) await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
  }

  return result;
}

export function buildReminderEmail(items: DueReminder[], today: string) {
  const base = appUrl();
  const first = items[0];
  const subject =
    items.length === 1
      ? `Recordatorio: ${first.position} en ${first.company}`
      : `Tienes ${items.length} recordatorios de tus postulaciones`;

  const whenLabel = (dueOn: string) => {
    const late = diffDaysISO(dueOn, today);
    return late <= 0 ? "Para hoy" : `Vencido · ${formatDate(dueOn)}`;
  };

  const text = [
    `Hola ${first.userName},`,
    "",
    "Estos son tus recordatorios pendientes:",
    "",
    ...items.flatMap((r) => [
      `• ${r.position} — ${r.company} (${STATUS_META[r.status].label})`,
      `  ${whenLabel(r.dueOn)}: ${r.message}`,
      `  ${base}/applications/${r.applicationId}`,
      "",
    ]),
    `Ver todas tus postulaciones: ${base}/applications`,
  ].join("\n");

  const rows = items
    .map(
      (r) => `
      <tr><td style="padding:16px 0;border-top:1px solid #e4e4e7">
        <div style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:.04em">${escapeHtml(whenLabel(r.dueOn))}</div>
        <div style="font-size:16px;font-weight:600;color:#18181b;margin-top:4px">${escapeHtml(r.position)} · ${escapeHtml(r.company)}</div>
        <div style="font-size:14px;color:#3f3f46;margin-top:6px;white-space:pre-line">${escapeHtml(r.message)}</div>
        <a href="${base}/applications/${r.applicationId}" style="display:inline-block;margin-top:10px;font-size:14px;color:#4f46e5;text-decoration:none">Abrir postulación →</a>
      </td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:28px">
      <tr><td style="font-size:14px;font-weight:600;color:#4f46e5">Job Tracker</td></tr>
      <tr><td style="font-size:20px;font-weight:600;color:#18181b;padding:12px 0 16px">Hola ${escapeHtml(first.userName)}, tienes ${items.length === 1 ? "un recordatorio" : `${items.length} recordatorios`}</td></tr>
      ${rows}
      <tr><td style="padding-top:20px;border-top:1px solid #e4e4e7">
        <a href="${base}/applications" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:10px 16px;border-radius:8px;font-size:14px;text-decoration:none">Ver mis postulaciones</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  return { subject, html, text };
}
