"use server";

import { planById } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { quoteSchema, type QuoteInput } from "@/lib/validation/quote";

export type QuoteResult = { ok: true } | { ok: false; error: string };

export async function requestQuote(input: QuoteInput): Promise<QuoteResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const plan = planById(data.plan);
  if (data.seats < plan.minSeats) {
    return { ok: false, error: `O plano ${plan.name} começa em ${plan.minSeats} pessoas.` };
  }

  await db.insert(quoteRequests).values({
    name: data.name,
    companyName: data.companyName,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    plan: data.plan,
    seats: data.seats,
    message: data.message || null,
  });

  return { ok: true };
}
