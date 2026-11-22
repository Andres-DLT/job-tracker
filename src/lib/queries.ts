import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, reminders, statusChanges } from "@/lib/db/schema";
import { addDaysISO, todayISO } from "@/lib/dates";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";
import { isUuid } from "@/lib/utils";

// Todas las consultas reciben el userId de la sesión y filtran por él.

const nextReminderSql = sql<string | null>`(
  select min(${reminders.dueOn}) from ${reminders}
  where ${reminders.applicationId} = ${applications.id} and ${reminders.sentAt} is null
)`;

export async function listApplications(
  userId: string,
  filters: { q?: string; status?: ApplicationStatus } = {},
) {
  const conditions = [eq(applications.userId, userId)];
  if (filters.status) conditions.push(eq(applications.status, filters.status));
  if (filters.q) {
    const pattern = `%${filters.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(or(ilike(applications.company, pattern), ilike(applications.position, pattern))!);
  }

  return db
    .select({
      id: applications.id,
      company: applications.company,
      position: applications.position,
      status: applications.status,
      location: applications.location,
      appliedOn: applications.appliedOn,
      updatedAt: applications.updatedAt,
      nextReminder: nextReminderSql,
    })
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.updatedAt));
}

export type ApplicationListItem = Awaited<ReturnType<typeof listApplications>>[number];

/** Memoizada por petición: la usan tanto generateMetadata como la página. */
export const getApplication = cache(async (userId: string, id: string) => {
  if (!isUuid(id)) return null;
  const [application] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
  if (!application) return null;

  const [history, appReminders] = await Promise.all([
    db
      .select()
      .from(statusChanges)
      .where(eq(statusChanges.applicationId, id))
      .orderBy(desc(statusChanges.changedAt)),
    db
      .select()
      .from(reminders)
      .where(eq(reminders.applicationId, id))
      .orderBy(sql`${reminders.sentAt} is not null`, asc(reminders.dueOn)),
  ]);

  return { application, history, reminders: appReminders };
});

export async function getDashboard(userId: string) {
  const today = todayISO();

  const [statusCounts, [responded], upcoming, activity] = await Promise.all([
    db
      .select({ status: applications.status, total: count() })
      .from(applications)
      .where(eq(applications.userId, userId))
      .groupBy(applications.status),

    // Postulaciones que en algún momento recibieron respuesta (entrevista, oferta o rechazo).
    db
      .select({ total: sql<number>`count(distinct ${statusChanges.applicationId})`.mapWith(Number) })
      .from(statusChanges)
      .innerJoin(applications, eq(statusChanges.applicationId, applications.id))
      .where(
        and(
          eq(applications.userId, userId),
          inArray(statusChanges.toStatus, ["interviewing", "offer", "rejected"]),
        ),
      ),

    db
      .select({
        id: reminders.id,
        dueOn: reminders.dueOn,
        message: reminders.message,
        applicationId: applications.id,
        company: applications.company,
        position: applications.position,
      })
      .from(reminders)
      .innerJoin(applications, eq(reminders.applicationId, applications.id))
      .where(
        and(
          eq(reminders.userId, userId),
          isNull(reminders.sentAt),
          lte(reminders.dueOn, addDaysISO(today, 14)),
        ),
      )
      .orderBy(asc(reminders.dueOn))
      .limit(6),

    db
      .select({
        id: statusChanges.id,
        fromStatus: statusChanges.fromStatus,
        toStatus: statusChanges.toStatus,
        changedAt: statusChanges.changedAt,
        applicationId: applications.id,
        company: applications.company,
        position: applications.position,
      })
      .from(statusChanges)
      .innerJoin(applications, eq(statusChanges.applicationId, applications.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(statusChanges.changedAt))
      .limit(8),
  ]);

  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
    ApplicationStatus,
    number
  >;
  for (const row of statusCounts) byStatus[row.status] = row.total;

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const sent = total - byStatus.wishlist; // candidaturas realmente enviadas
  const responseRate =
    sent > 0 ? Math.min(100, Math.round(((responded?.total ?? 0) / sent) * 100)) : null;

  return { today, byStatus, total, sent, responseRate, upcoming, activity };
}
