import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";

/** Organizational job titles. Permission profiles live on users.role. */
export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [index("roles_company_id_idx").on(table.companyId)],
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    leaderEmployeeId: uuid("leader_employee_id"),
    ...timestamps,
  },
  (table) => [index("teams_company_id_idx").on(table.companyId)],
);
