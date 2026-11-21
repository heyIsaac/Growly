import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { employees } from "./employees";
import { skillCategoryEnum } from "./enums";

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    category: skillCategoryEnum("category").notNull().default("TECHNICAL"),
    scaleMax: integer("scale_max").notNull().default(5),
    ...timestamps,
  },
  (table) => [
    index("skills_company_id_idx").on(table.companyId),
    uniqueIndex("skills_company_name_uidx").on(table.companyId, table.name),
  ],
);

export const employeeSkills = pgTable(
  "employee_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    currentLevel: integer("current_level").notNull().default(0),
    previousLevel: integer("previous_level"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("employee_skills_employee_skill_uidx").on(
      table.employeeId,
      table.skillId,
    ),
    index("employee_skills_company_id_idx").on(table.companyId),
  ],
);
