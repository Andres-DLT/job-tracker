import { timingSafeEqual } from "node:crypto";
import { processDueReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Lo invoca Vercel Cron una vez al día (ver vercel.json). */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production") {
    return Response.json({ error: "RESEND_API_KEY no está configurada" }, { status: 500 });
  }

  const result = await processDueReminders();
  if (result.failed > 0) console.error("[cron/reminders]", result.errors);
  return Response.json(result, { status: result.failed > 0 ? 500 : 200 });
}
