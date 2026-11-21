import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, subscriptions } from "@/lib/db/schema";

export async function findOrder(code: string) {
  const [row] = await db
    .select({
      orderCode: subscriptions.orderCode,
      plan: subscriptions.plan,
      seats: subscriptions.seats,
      monthlyCents: subscriptions.monthlyCents,
      paymentMethod: subscriptions.paymentMethod,
      cardLast4: subscriptions.cardLast4,
      createdAt: subscriptions.createdAt,
      companyName: companies.name,
    })
    .from(subscriptions)
    .innerJoin(companies, eq(companies.id, subscriptions.companyId))
    .where(eq(subscriptions.orderCode, code))
    .limit(1);
  return row ?? null;
}

export async function findCompanySubscription(companyId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.companyId, companyId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}
