import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { employees } from "./employees";
import { cycleStatusEnum } from "./enums";
import { skills } from "./skills";

export const evaluationCycles = pgTable(
  "evaluation_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    selfDeadline: timestamp("self_deadline", { withTimezone: true }),
    leaderDeadline: timestamp("leader_deadline", { withTimezone: true }),
    status: cycleStatusEnum("status").notNull().default("DRAFT"),
    ...timestamps,
  },
  (table) => [index("evaluation_cycles_company_id_idx").on(table.companyId)],
);

export const cycleParticipants = pgTable(
  "cycle_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => evaluationCycles.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("cycle_participants_cycle_employee_uidx").on(
      table.cycleId,
      table.employeeId,
    ),
    index("cycle_participants_company_id_idx").on(table.companyId),
  ],
);

export const cycleSkills = pgTable(
  "cycle_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => evaluationCycles.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("cycle_skills_cycle_skill_uidx").on(
      table.cycleId,
      table.skillId,
    ),
    index("cycle_skills_company_id_idx").on(table.companyId),
  ],
);
