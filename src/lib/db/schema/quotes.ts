import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { subscriptionPlanEnum } from "./enums";

export const quoteRequests = pgTable("quote_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  plan: subscriptionPlanEnum("plan").notNull(),
  seats: integer("seats").notNull(),
  message: text("message"),
  ...timestamps,
});
