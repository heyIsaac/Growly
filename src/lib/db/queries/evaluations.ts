import { and, desc, eq, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cycleParticipants,
  evaluationAnswers,
  evaluationCycles,
  evaluations,
  skills,
  users,
  employees,
} from "@/lib/db/schema";

export async function listEvaluations(companyId: string) {
  return db
    .select({
      id: evaluations.id,
      cycleId: evaluations.cycleId,
      cycleName: evaluationCycles.name,
      cycleStatus: evaluationCycles.status,
      employeeId: evaluations.employeeId,
      employeeName: users.name,
      type: evaluations.type,
      status: evaluations.status,
      submittedAt: evaluations.submittedAt,
    })
    .from(evaluations)
    .innerJoin(evaluationCycles, eq(evaluationCycles.id, evaluations.cycleId))
    .innerJoin(employees, eq(employees.id, evaluations.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .where(eq(evaluations.companyId, companyId))
    .orderBy(desc(evaluations.updatedAt));
}

export async function openSelfEvaluation(companyId: string, employeeId: string) {
  const rows = await db
    .select({
      cycleId: evaluationCycles.id,
      evaluationStatus: evaluations.status,
    })
    .from(cycleParticipants)
    .innerJoin(evaluationCycles, eq(evaluationCycles.id, cycleParticipants.cycleId))
    .leftJoin(
      evaluations,
      and(
        eq(evaluations.cycleId, cycleParticipants.cycleId),
        eq(evaluations.employeeId, cycleParticipants.employeeId),
        eq(evaluations.type, "SELF"),
      ),
    )
    .where(
      and(
        eq(cycleParticipants.companyId, companyId),
        eq(cycleParticipants.employeeId, employeeId),
        notInArray(evaluationCycles.status, ["DRAFT", "CLOSED"]),
      ),
    )
    .orderBy(desc(evaluationCycles.startsAt));

  const pending = rows.find((row) => row.evaluationStatus !== "SUBMITTED");
  if (pending) {
    return {
      href: `/avaliacoes/${pending.cycleId}?employee=${employeeId}&type=SELF`,
      started: pending.evaluationStatus === "DRAFT",
    };
  }

  const [cycle] = await db
    .select({ id: evaluationCycles.id })
    .from(evaluationCycles)
    .where(
      and(
        eq(evaluationCycles.companyId, companyId),
        notInArray(evaluationCycles.status, ["DRAFT", "CLOSED"]),
      ),
    )
    .orderBy(desc(evaluationCycles.startsAt))
    .limit(1);
  if (!cycle) return null;

  return {
    href: `/avaliacoes/${cycle.id}?employee=${employeeId}&type=SELF`,
    started: false,
  };
}

export async function getEvaluation(params: {
  companyId: string;
  cycleId: string;
  employeeId: string;
  type: "SELF" | "LEADER";
}) {
  const [evaluation] = await db
    .select()
    .from(evaluations)
    .where(
      and(
        eq(evaluations.companyId, params.companyId),
        eq(evaluations.cycleId, params.cycleId),
        eq(evaluations.employeeId, params.employeeId),
        eq(evaluations.type, params.type),
      ),
    )
    .limit(1);

  if (!evaluation) return null;

  const answers = await db
    .select({
      skillId: evaluationAnswers.skillId,
      name: skills.name,
      level: evaluationAnswers.level,
      comment: evaluationAnswers.comment,
    })
    .from(evaluationAnswers)
    .innerJoin(skills, eq(skills.id, evaluationAnswers.skillId))
    .where(
      and(
        eq(evaluationAnswers.companyId, params.companyId),
        eq(evaluationAnswers.evaluationId, evaluation.id),
      ),
    );

  return { evaluation, answers };
}
