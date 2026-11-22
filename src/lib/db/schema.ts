import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const applicationStatus = pgEnum("application_status", APPLICATION_STATUSES);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// El id es el SHA-256 del token que viaja en la cookie: si la tabla se filtra,
// los tokens no se pueden reutilizar.
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    position: text("position").notNull(),
    status: applicationStatus("status").notNull().default("applied"),
    location: text("location"),
    jobUrl: text("job_url"),
    salary: text("salary"),
    contact: text("contact"),
    notes: text("notes"),
    appliedOn: date("applied_on", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("applications_user_id_idx").on(t.userId),
    index("applications_user_status_idx").on(t.userId, t.status),
  ],
);

export const statusChanges = pgTable(
  "status_changes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    fromStatus: applicationStatus("from_status"),
    toStatus: applicationStatus("to_status").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("status_changes_application_id_idx").on(t.applicationId, t.changedAt)],
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dueOn: date("due_on", { mode: "string" }).notNull(),
    message: text("message").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reminders_user_id_idx").on(t.userId),
    index("reminders_pending_idx").on(t.sentAt, t.dueOn),
  ],
);

export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type StatusChange = typeof statusChanges.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
