import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  developmentPlans,
  employees,
  evaluationCycles,
  evaluations,
} from "@/lib/db/schema";

export async function companySnapshot(companyId: string) {
  const [people] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.companyId, companyId));
  const [cycles] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(evaluationCycles)
    .where(eq(evaluationCycles.companyId, companyId));
  const [plans] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(developmentPlans)
    .where(eq(developmentPlans.companyId, companyId));
  const [submitted] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(evaluations)
    .where(
      and(eq(evaluations.companyId, companyId), eq(evaluations.status, "SUBMITTED")),
    );
  const [openCycles] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(evaluationCycles)
    .where(
      and(
        eq(evaluationCycles.companyId, companyId),
        sql`${evaluationCycles.status} not in ('CLOSED', 'DRAFT')`,
      ),
    );

  return {
    people: people?.value ?? 0,
    cycles: cycles?.value ?? 0,
    openCycles: openCycles?.value ?? 0,
    plans: plans?.value ?? 0,
    submittedEvaluations: submitted?.value ?? 0,
  };
}
