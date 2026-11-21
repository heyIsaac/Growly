import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { employees } from "./employees";
import { goalStatusEnum } from "./enums";
import { skills } from "./skills";

export const developmentPlans = pgTable(
  "development_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .unique()
      .references(() => employees.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("development_plans_company_id_idx").on(table.companyId)],
);

export const developmentGoals = pgTable(
  "development_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => developmentPlans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    skillId: uuid("skill_id").references(() => skills.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
    progress: integer("progress").notNull().default(0),
    successIndicator: text("success_indicator"),
    status: goalStatusEnum("status").notNull().default("NOT_STARTED"),
    ...timestamps,
  },
  (table) => [index("development_goals_company_id_idx").on(table.companyId)],
);

export const developmentActions = pgTable(
  "development_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => developmentGoals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    dueDate: date("due_date"),
    ...timestamps,
  },
  (table) => [index("development_actions_company_id_idx").on(table.companyId)],
);
