import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  developmentActions,
  developmentGoals,
  developmentPlans,
  employeeSkills,
  employees,
  evaluationAnswers,
  evaluationCycles,
  evaluations,
  skills,
  users,
} from "@/lib/db/schema";
import { listPeople } from "@/lib/db/queries/directory";

export async function listEmployeeSkills(companyId: string, employeeId?: string) {
  return db
    .select({
      id: employeeSkills.id,
      employeeId: employeeSkills.employeeId,
      skillId: skills.id,
      name: skills.name,
      category: skills.category,
      scaleMax: skills.scaleMax,
      currentLevel: employeeSkills.currentLevel,
      previousLevel: employeeSkills.previousLevel,
    })
    .from(employeeSkills)
    .innerJoin(skills, eq(skills.id, employeeSkills.skillId))
    .where(
      and(
        eq(employeeSkills.companyId, companyId),
        employeeId ? eq(employeeSkills.employeeId, employeeId) : undefined,
      ),
    )
    .orderBy(asc(skills.name));
}

export async function listDevelopmentOverview(companyId: string) {
  const [people, plans, goals] = await Promise.all([
    listPeople(companyId),
    db
      .select({
        id: developmentPlans.id,
        employeeId: developmentPlans.employeeId,
      })
      .from(developmentPlans)
      .where(eq(developmentPlans.companyId, companyId)),
    db
      .select({
        planId: developmentGoals.planId,
        progress: developmentGoals.progress,
        status: developmentGoals.status,
      })
      .from(developmentGoals)
      .where(eq(developmentGoals.companyId, companyId)),
  ]);

  const byPlan = new Map<string, { count: number; progress: number; done: number }>();
  for (const goal of goals) {
    const current = byPlan.get(goal.planId) ?? { count: 0, progress: 0, done: 0 };
    current.count += 1;
    current.progress += goal.progress;
    if (goal.status === "DONE") current.done += 1;
    byPlan.set(goal.planId, current);
  }

  return people.map((person) => {
    const plan = plans.find((item) => item.employeeId === person.employeeId);
    const stats = plan ? byPlan.get(plan.id) : undefined;
    return {
      ...person,
      planId: plan?.id ?? null,
      goalCount: stats?.count ?? 0,
      doneCount: stats?.done ?? 0,
      progress: stats?.count ? Math.round(stats.progress / stats.count) : 0,
    };
  });
}

export async function listDevelopmentGoals(companyId: string) {
  return db
    .select({
      id: developmentGoals.id,
      title: developmentGoals.title,
      progress: developmentGoals.progress,
      status: developmentGoals.status,
      dueDate: developmentGoals.dueDate,
      skillId: developmentGoals.skillId,
      skillName: skills.name,
      employeeId: developmentPlans.employeeId,
      employeeName: users.name,
    })
    .from(developmentGoals)
    .innerJoin(developmentPlans, eq(developmentPlans.id, developmentGoals.planId))
    .innerJoin(employees, eq(employees.id, developmentPlans.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(skills, eq(skills.id, developmentGoals.skillId))
    .where(eq(developmentGoals.companyId, companyId))
    .orderBy(asc(developmentGoals.dueDate));
}

export async function getDevelopmentPlan(companyId: string, employeeId: string) {
  const [plan] = await db
    .select()
    .from(developmentPlans)
    .where(
      and(
        eq(developmentPlans.companyId, companyId),
        eq(developmentPlans.employeeId, employeeId),
      ),
    )
    .limit(1);

  if (!plan) return null;

  const goals = await db
    .select({
      id: developmentGoals.id,
      title: developmentGoals.title,
      description: developmentGoals.description,
      skillId: developmentGoals.skillId,
      dueDate: developmentGoals.dueDate,
      progress: developmentGoals.progress,
      successIndicator: developmentGoals.successIndicator,
      status: developmentGoals.status,
      skillName: skills.name,
    })
    .from(developmentGoals)
    .leftJoin(skills, eq(skills.id, developmentGoals.skillId))
    .where(
      and(
        eq(developmentGoals.companyId, companyId),
        eq(developmentGoals.planId, plan.id),
      ),
    );

  const actions = goals.length
    ? await db
        .select()
        .from(developmentActions)
        .where(eq(developmentActions.companyId, companyId))
    : [];

  return {
    plan,
    goals: goals.map((goal) => ({
      ...goal,
      actions: actions.filter((action) => action.goalId === goal.id),
    })),
  };
}

export async function listSkillCycleScores(companyId: string, employeeId: string) {
  return db
    .select({
      skillId: skills.id,
      skillName: skills.name,
      scaleMax: skills.scaleMax,
      cycleId: evaluationCycles.id,
      cycleName: evaluationCycles.name,
      startsAt: evaluationCycles.startsAt,
      type: evaluations.type,
      level: evaluationAnswers.level,
    })
    .from(evaluationAnswers)
    .innerJoin(evaluations, eq(evaluations.id, evaluationAnswers.evaluationId))
    .innerJoin(evaluationCycles, eq(evaluationCycles.id, evaluations.cycleId))
    .innerJoin(skills, eq(skills.id, evaluationAnswers.skillId))
    .where(
      and(
        eq(evaluationAnswers.companyId, companyId),
        eq(evaluations.employeeId, employeeId),
        eq(evaluations.status, "SUBMITTED"),
      ),
    )
    .orderBy(asc(evaluationCycles.startsAt), asc(skills.name));
}
