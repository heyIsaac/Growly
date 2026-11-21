import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { evaluationCycles } from "./cycles";
import { companies } from "./companies";
import { employees } from "./employees";
import { evaluationStatusEnum, evaluationTypeEnum } from "./enums";
import { skills } from "./skills";

export const evaluations = pgTable(
  "evaluations",
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
    evaluatorEmployeeId: uuid("evaluator_employee_id").references(
      () => employees.id,
      { onDelete: "set null" },
    ),
    type: evaluationTypeEnum("type").notNull(),
    status: evaluationStatusEnum("status").notNull().default("DRAFT"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    evolvedComment: text("evolved_comment"),
    developComment: text("develop_comment"),
    achievementComment: text("achievement_comment"),
    nextCycleComment: text("next_cycle_comment"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("evaluations_cycle_employee_type_uidx").on(
      table.cycleId,
      table.employeeId,
      table.type,
    ),
    index("evaluations_company_id_idx").on(table.companyId),
  ],
);

export const evaluationAnswers = pgTable(
  "evaluation_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    evaluationId: uuid("evaluation_id")
      .notNull()
      .references(() => evaluations.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level").notNull(),
    comment: text("comment"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("evaluation_answers_evaluation_skill_uidx").on(
      table.evaluationId,
      table.skillId,
    ),
    index("evaluation_answers_company_id_idx").on(table.companyId),
  ],
);
