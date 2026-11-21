import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { userRoleEnum, userStatusEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    authUserId: text("auth_user_id"),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull().default("EMPLOYEE"),
    status: userStatusEnum("status").notNull().default("INVITED"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_auth_user_id_uidx").on(table.authUserId),
    uniqueIndex("users_company_email_uidx").on(table.companyId, table.email),
    index("users_company_id_idx").on(table.companyId),
  ],
);
