import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companies } from "./companies";
import { paymentMethodEnum, subscriptionPlanEnum, subscriptionStatusEnum } from "./enums";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    orderCode: text("order_code").notNull().unique(),
    plan: subscriptionPlanEnum("plan").notNull(),
    seats: integer("seats").notNull(),
    monthlyCents: integer("monthly_cents").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    cardLast4: text("card_last4"),
    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    ...timestamps,
  },
  (table) => [index("subscriptions_company_id_idx").on(table.companyId)],
);
