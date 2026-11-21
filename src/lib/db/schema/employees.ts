import { date, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { employeeStatusEnum } from "./enums";
import { roles, teams } from "./org";
import { users } from "./users";

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
    managerId: uuid("manager_id"),
    area: text("area"),
    seniority: text("seniority"),
    hiredAt: date("hired_at"),
    avatarUrl: text("avatar_url"),
    status: employeeStatusEnum("status").notNull().default("ACTIVE"),
    ...timestamps,
  },
  (table) => [
    index("employees_company_id_idx").on(table.companyId),
    index("employees_company_team_idx").on(table.companyId, table.teamId),
    index("employees_manager_id_idx").on(table.managerId),
  ],
);
