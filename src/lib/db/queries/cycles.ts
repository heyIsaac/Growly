import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cycleParticipants,
  cycleSkills,
  employees,
  evaluationCycles,
  skills,
  users,
} from "@/lib/db/schema";

export async function listCycles(companyId: string) {
  return db
    .select()
    .from(evaluationCycles)
    .where(eq(evaluationCycles.companyId, companyId))
    .orderBy(asc(evaluationCycles.startsAt));
}

export async function getCycle(companyId: string, cycleId: string) {
  const [cycle] = await db
    .select()
    .from(evaluationCycles)
    .where(
      and(
        eq(evaluationCycles.companyId, companyId),
        eq(evaluationCycles.id, cycleId),
      ),
    )
    .limit(1);
  return cycle ?? null;
}

export async function listCycleParticipants(companyId: string, cycleId: string) {
  return db
    .select({
      employeeId: employees.id,
      name: users.name,
      email: users.email,
    })
    .from(cycleParticipants)
    .innerJoin(employees, eq(employees.id, cycleParticipants.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .where(
      and(
        eq(cycleParticipants.companyId, companyId),
        eq(cycleParticipants.cycleId, cycleId),
      ),
    )
    .orderBy(asc(users.name));
}

export async function listCycleSkillRows(companyId: string, cycleId: string) {
  return db
    .select({
      skillId: skills.id,
      name: skills.name,
      description: skills.description,
      scaleMax: skills.scaleMax,
    })
    .from(cycleSkills)
    .innerJoin(skills, eq(skills.id, cycleSkills.skillId))
    .where(
      and(eq(cycleSkills.companyId, companyId), eq(cycleSkills.cycleId, cycleId)),
    )
    .orderBy(asc(skills.name));
}
