import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { companyStatusEnum } from "./enums";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  status: companyStatusEnum("status").notNull().default("ACTIVE"),
  ...timestamps,
});
