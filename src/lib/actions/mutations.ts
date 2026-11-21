"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  companies,
  cycleParticipants,
  cycleSkills,
  developmentActions,
  developmentGoals,
  developmentPlans,
  employees,
  evaluationAnswers,
  evaluationCycles,
  evaluations,
  roles,
  skills,
  teams,
  users,
} from "@/lib/db/schema";
import { pdiProposalSchema, type PdiProposal } from "@/lib/ai/pdi-proposal";
import {
  cycleSchema,
  goalSchema,
  personSchema,
  roleSchema,
  skillSchema,
  teamSchema,
} from "@/lib/validation/forms";

function optionalId(value: string | undefined) {
  return value ? value : null;
}

export async function createPerson(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const parsed = personSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    userRole: formData.get("userRole"),
    teamId: formData.get("teamId") || "",
    roleId: formData.get("roleId") || "",
    managerId: formData.get("managerId") || "",
    area: formData.get("area") || undefined,
    seniority: formData.get("seniority") || undefined,
    hiredAt: formData.get("hiredAt") || undefined,
  });

  const [user] = await db
    .insert(users)
    .values({
      companyId: actor.companyId,
      email: parsed.email.toLowerCase(),
      name: parsed.name,
      role: parsed.userRole,
      status: "INVITED",
    })
    .returning();

  await db.insert(employees).values({
    companyId: actor.companyId,
    userId: user.id,
    teamId: optionalId(parsed.teamId),
    roleId: optionalId(parsed.roleId),
    managerId: optionalId(parsed.managerId),
    area: parsed.area,
    seniority: parsed.seniority,
    hiredAt: parsed.hiredAt || null,
  });

  revalidatePath("/pessoas");
}

export async function updatePerson(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const employeeId = String(formData.get("employeeId"));
  const parsed = personSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    userRole: formData.get("userRole"),
    teamId: formData.get("teamId") || "",
    roleId: formData.get("roleId") || "",
    managerId: formData.get("managerId") || "",
    area: formData.get("area") || undefined,
    seniority: formData.get("seniority") || undefined,
    hiredAt: formData.get("hiredAt") || undefined,
  });

  const [employee] = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, actor.companyId)))
    .limit(1);
  if (!employee) return;

  await db
    .update(users)
    .set({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      role: parsed.userRole,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, employee.userId), eq(users.companyId, actor.companyId)));

  await db
    .update(employees)
    .set({
      teamId: optionalId(parsed.teamId),
      roleId: optionalId(parsed.roleId),
      managerId: optionalId(parsed.managerId),
      area: parsed.area,
      seniority: parsed.seniority,
      hiredAt: parsed.hiredAt || null,
      updatedAt: new Date(),
    })
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, actor.companyId)));

  revalidatePath("/pessoas");
  revalidatePath(`/pessoas/${employeeId}`);
}

export async function deletePerson(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const employeeId = String(formData.get("employeeId"));
  if (!employeeId || employeeId === actor.employeeId) return;

  const [employee] = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, actor.companyId)))
    .limit(1);
  if (!employee) return;

  await db.delete(employees).where(eq(employees.id, employeeId));
  await db.delete(users).where(and(eq(users.id, employee.userId), eq(users.companyId, actor.companyId)));

  revalidatePath("/pessoas");
  revalidatePath("/people");
  revalidatePath("/dashboard");
}

export async function setPersonActive(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const employeeId = String(formData.get("employeeId"));
  const active = formData.get("active") === "true";

  const [employee] = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, actor.companyId)))
    .limit(1);
  if (!employee) return;

  await db
    .update(employees)
    .set({ status: active ? "ACTIVE" : "INACTIVE", updatedAt: new Date() })
    .where(eq(employees.id, employeeId));
  await db
    .update(users)
    .set({ status: active ? "ACTIVE" : "INACTIVE", updatedAt: new Date() })
    .where(and(eq(users.id, employee.userId), eq(users.companyId, actor.companyId)));

  revalidatePath("/pessoas");
}

export async function createTeam(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const parsed = teamSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  await db.insert(teams).values({
    companyId: actor.companyId,
    name: parsed.name,
    description: parsed.description,
  });
  revalidatePath("/times");
}

export async function createRole(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const parsed = roleSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  await db.insert(roles).values({
    companyId: actor.companyId,
    title: parsed.title,
    description: parsed.description,
  });
  revalidatePath("/times");
}

export async function createSkill(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const parsed = skillSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
  });
  await db.insert(skills).values({
    companyId: actor.companyId,
    name: parsed.name,
    description: parsed.description,
    category: parsed.category,
  });
  revalidatePath("/competencias");
  revalidatePath("/desenvolvimento");
}

export async function updateCompany(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  await db
    .update(companies)
    .set({ name, updatedAt: new Date() })
    .where(eq(companies.id, actor.companyId));
  revalidatePath("/dashboard");
}

export async function createCycle(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const parsed = cycleSchema.parse({
    name: formData.get("name"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  const [activePeople, companySkills] = await Promise.all([
    db
      .select({ id: employees.id })
      .from(employees)
      .where(and(eq(employees.companyId, actor.companyId), eq(employees.status, "ACTIVE"))),
    db
      .select({ id: skills.id })
      .from(skills)
      .where(eq(skills.companyId, actor.companyId)),
  ]);

  const [cycle] = await db
    .insert(evaluationCycles)
    .values({
      companyId: actor.companyId,
      name: parsed.name,
      startsAt: new Date(parsed.startsAt),
      endsAt: new Date(parsed.endsAt),
      status: "DRAFT",
    })
    .returning();

  if (activePeople.length) {
    await db.insert(cycleParticipants).values(
      activePeople.map((person) => ({
        companyId: actor.companyId,
        cycleId: cycle.id,
        employeeId: person.id,
      })),
    );
  }
  if (companySkills.length) {
    await db.insert(cycleSkills).values(
      companySkills.map((skill) => ({
        companyId: actor.companyId,
        cycleId: cycle.id,
        skillId: skill.id,
      })),
    );
  }

  revalidatePath("/ciclos");
  redirect(`/ciclos/${cycle.id}`);
}

export async function startCycle(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const cycleId = String(formData.get("cycleId"));
  const cycle = await db
    .select()
    .from(evaluationCycles)
    .where(
      and(eq(evaluationCycles.id, cycleId), eq(evaluationCycles.companyId, actor.companyId)),
    )
    .limit(1);
  if (!cycle[0]) return;

  await db
    .update(evaluationCycles)
    .set({ status: "SELF_EVALUATION", updatedAt: new Date() })
    .where(eq(evaluationCycles.id, cycleId));

  const participants = await db
    .select()
    .from(cycleParticipants)
    .where(
      and(
        eq(cycleParticipants.cycleId, cycleId),
        eq(cycleParticipants.companyId, actor.companyId),
      ),
    );

  for (const participant of participants) {
    const existing = await db
      .select()
      .from(evaluations)
      .where(
        and(
          eq(evaluations.cycleId, cycleId),
          eq(evaluations.employeeId, participant.employeeId),
          eq(evaluations.type, "SELF"),
        ),
      )
      .limit(1);
    if (existing[0]) continue;
    await db.insert(evaluations).values({
      companyId: actor.companyId,
      cycleId,
      employeeId: participant.employeeId,
      type: "SELF",
      status: "DRAFT",
    });
    await db.insert(evaluations).values({
      companyId: actor.companyId,
      cycleId,
      employeeId: participant.employeeId,
      type: "LEADER",
      status: "DRAFT",
    });
  }

  revalidatePath("/ciclos");
  revalidatePath(`/ciclos/${cycleId}`);
  revalidatePath("/avaliacoes");
  revalidatePath("/dashboard");
  revalidatePath("/people");
}

const NEXT_CYCLE_STATUS = {
  SELF_EVALUATION: "LEADER_EVALUATION",
  LEADER_EVALUATION: "COMPARISON",
  COMPARISON: "CLOSED",
  FEEDBACK: "CLOSED",
} as const;

export async function advanceCycle(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const cycleId = String(formData.get("cycleId"));
  const [cycle] = await db
    .select()
    .from(evaluationCycles)
    .where(
      and(eq(evaluationCycles.id, cycleId), eq(evaluationCycles.companyId, actor.companyId)),
    )
    .limit(1);
  if (!cycle) return;

  const next = NEXT_CYCLE_STATUS[cycle.status as keyof typeof NEXT_CYCLE_STATUS];
  if (!next) return;

  await db
    .update(evaluationCycles)
    .set({ status: next, updatedAt: new Date() })
    .where(eq(evaluationCycles.id, cycleId));

  revalidatePath("/ciclos");
  revalidatePath(`/ciclos/${cycleId}`);
  revalidatePath("/avaliacoes");
  revalidatePath("/dashboard");
  revalidatePath("/people");
}

export async function saveEvaluation(formData: FormData) {
  const actor = await requireUser();
  const cycleId = String(formData.get("cycleId"));
  const employeeId = String(formData.get("employeeId"));
  const type = formData.get("type") === "LEADER" ? "LEADER" : "SELF";
  const submit = formData.get("intent") === "submit";

  if (actor.role === "ADMIN" && !(type === "SELF" && actor.employeeId === employeeId)) {
    redirect("/avaliacoes");
  }
  if (type === "SELF" && actor.employeeId !== employeeId) {
    redirect("/avaliacoes");
  }
  if (type === "LEADER" && actor.role === "EMPLOYEE") {
    redirect("/avaliacoes");
  }
  if (type === "LEADER" && actor.role === "LEADER") {
    const [report] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.companyId, actor.companyId),
          eq(employees.managerId, actor.employeeId ?? ""),
        ),
      )
      .limit(1);
    if (!report) redirect("/avaliacoes");
  }

  const [evaluation] = await db
    .select()
    .from(evaluations)
    .where(
      and(
        eq(evaluations.companyId, actor.companyId),
        eq(evaluations.cycleId, cycleId),
        eq(evaluations.employeeId, employeeId),
        eq(evaluations.type, type),
      ),
    )
    .limit(1);

  let current = evaluation;
  if (!current) {
    const [cycle] = await db
      .select({ status: evaluationCycles.status })
      .from(evaluationCycles)
      .where(and(eq(evaluationCycles.id, cycleId), eq(evaluationCycles.companyId, actor.companyId)))
      .limit(1);
    const [participant] = await db
      .select({ id: cycleParticipants.id })
      .from(cycleParticipants)
      .where(
        and(
          eq(cycleParticipants.cycleId, cycleId),
          eq(cycleParticipants.employeeId, employeeId),
          eq(cycleParticipants.companyId, actor.companyId),
        ),
      )
      .limit(1);
    if (!cycle || cycle.status === "CLOSED" || cycle.status === "DRAFT") return;
    if (!participant && type === "SELF" && actor.employeeId === employeeId) {
      await db.insert(cycleParticipants).values({
        companyId: actor.companyId,
        cycleId,
        employeeId,
      });
    } else if (!participant) {
      return;
    }
    const [created] = await db
      .insert(evaluations)
      .values({
        companyId: actor.companyId,
        cycleId,
        employeeId,
        type,
        status: "DRAFT",
        evaluatorEmployeeId: actor.employeeId,
      })
      .returning();
    current = created;
  }
  if (!current) return;

  const skillIds = formData.getAll("skillId").map(String);
  for (const skillId of skillIds) {
    const level = Number(formData.get(`level_${skillId}`) ?? 0);
    const comment = String(formData.get(`comment_${skillId}`) ?? "");
    const [answer] = await db
      .select()
      .from(evaluationAnswers)
      .where(
        and(
          eq(evaluationAnswers.evaluationId, current.id),
          eq(evaluationAnswers.skillId, skillId),
        ),
      )
      .limit(1);
    if (answer) {
      await db
        .update(evaluationAnswers)
        .set({ level, comment, updatedAt: new Date() })
        .where(eq(evaluationAnswers.id, answer.id));
    } else {
      await db.insert(evaluationAnswers).values({
        companyId: actor.companyId,
        evaluationId: current.id,
        skillId,
        level,
        comment,
      });
    }
  }

  await db
    .update(evaluations)
    .set({
      evolvedComment: String(formData.get("evolvedComment") ?? ""),
      developComment: String(formData.get("developComment") ?? ""),
      achievementComment: String(formData.get("achievementComment") ?? ""),
      nextCycleComment: String(formData.get("nextCycleComment") ?? ""),
      status: submit ? "SUBMITTED" : "DRAFT",
      submittedAt: submit ? new Date() : null,
      evaluatorEmployeeId: type === "LEADER" ? actor.employeeId : actor.employeeId,
      updatedAt: new Date(),
    })
    .where(eq(evaluations.id, current.id));

  revalidatePath("/avaliacoes");
  redirect(`/avaliacoes/${cycleId}?employee=${employeeId}&type=${type}`);
}

export async function createGoal(formData: FormData) {
  const actor = await requireUser();
  if (!actor.employeeId) return;
  const parsed = goalSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    skillId: formData.get("skillId") || "",
    dueDate: formData.get("dueDate") || undefined,
    successIndicator: formData.get("successIndicator") || undefined,
  });

  let [plan] = await db
    .select()
    .from(developmentPlans)
    .where(
      and(
        eq(developmentPlans.companyId, actor.companyId),
        eq(developmentPlans.employeeId, actor.employeeId),
      ),
    )
    .limit(1);

  if (!plan) {
    [plan] = await db
      .insert(developmentPlans)
      .values({ companyId: actor.companyId, employeeId: actor.employeeId })
      .returning();
  }

  await db.insert(developmentGoals).values({
    companyId: actor.companyId,
    planId: plan.id,
    title: parsed.title,
    description: parsed.description,
    skillId: optionalId(parsed.skillId),
    dueDate: parsed.dueDate || null,
    successIndicator: parsed.successIndicator,
    status: "NOT_STARTED",
  });
  revalidatePath("/pdi");
  revalidatePath("/evolucao");
  revalidatePath("/desenvolvimento");
  revalidatePath("/dashboard");
  revalidatePath("/meu-time");
}

export async function saveProposedGoal(
  input: PdiProposal,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireUser();
  if (!actor.employeeId) {
    return { ok: false, error: "Sua conta ainda não tem um perfil de colaborador." };
  }
  const parsed = pdiProposalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "A proposta veio incompleta. Peça outro objetivo." };
  }

  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.id, parsed.data.skillId), eq(skills.companyId, actor.companyId)))
    .limit(1);
  if (!skill) {
    return { ok: false, error: "Essa competência não faz parte da empresa." };
  }

  let [plan] = await db
    .select()
    .from(developmentPlans)
    .where(
      and(
        eq(developmentPlans.companyId, actor.companyId),
        eq(developmentPlans.employeeId, actor.employeeId),
      ),
    )
    .limit(1);

  if (!plan) {
    [plan] = await db
      .insert(developmentPlans)
      .values({ companyId: actor.companyId, employeeId: actor.employeeId })
      .returning();
  }

  const [goal] = await db
    .insert(developmentGoals)
    .values({
      companyId: actor.companyId,
      planId: plan.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      skillId: skill.id,
      dueDate: parsed.data.dueDate ?? null,
      successIndicator: parsed.data.successIndicator,
      status: "NOT_STARTED",
    })
    .returning({ id: developmentGoals.id });

  await db.insert(developmentActions).values(
    parsed.data.actions.map((title) => ({
      companyId: actor.companyId,
      goalId: goal.id,
      title,
    })),
  );

  revalidatePath("/pdi");
  revalidatePath("/evolucao");
  revalidatePath("/desenvolvimento");
  revalidatePath("/dashboard");
  revalidatePath("/meu-time");
  return { ok: true };
}

async function syncGoalProgress(companyId: string, goalId: string) {
  const rows = await db
    .select({ done: developmentActions.done })
    .from(developmentActions)
    .where(and(eq(developmentActions.companyId, companyId), eq(developmentActions.goalId, goalId)));
  if (!rows.length) return;
  const done = rows.filter((row) => row.done).length;
  const progress = Math.round((done / rows.length) * 100);
  await db
    .update(developmentGoals)
    .set({
      progress,
      status: progress === 100 ? "DONE" : progress === 0 ? "NOT_STARTED" : "IN_PROGRESS",
      updatedAt: new Date(),
    })
    .where(and(eq(developmentGoals.id, goalId), eq(developmentGoals.companyId, companyId)));
}

export async function createAction(formData: FormData) {
  const actor = await requireUser();
  if (!actor.employeeId) return;
  const goalId = String(formData.get("goalId"));
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return;

  const [goal] = await db
    .select({ id: developmentGoals.id })
    .from(developmentGoals)
    .innerJoin(developmentPlans, eq(developmentPlans.id, developmentGoals.planId))
    .where(
      and(
        eq(developmentGoals.id, goalId),
        eq(developmentGoals.companyId, actor.companyId),
        eq(developmentPlans.employeeId, actor.employeeId),
      ),
    )
    .limit(1);
  if (!goal) return;

  await db.insert(developmentActions).values({
    companyId: actor.companyId,
    goalId,
    title,
  });
  await syncGoalProgress(actor.companyId, goalId);
  revalidatePath("/pdi");
  revalidatePath(`/pdi/${goalId}`);
  revalidatePath("/desenvolvimento");
  revalidatePath("/dashboard");
  revalidatePath("/meu-time");
}

export async function toggleAction(formData: FormData) {
  const actor = await requireUser();
  if (!actor.employeeId) return;
  const actionId = String(formData.get("actionId"));
  const [action] = await db
    .select({
      id: developmentActions.id,
      done: developmentActions.done,
      goalId: developmentActions.goalId,
      ownerId: developmentPlans.employeeId,
    })
    .from(developmentActions)
    .innerJoin(developmentGoals, eq(developmentGoals.id, developmentActions.goalId))
    .innerJoin(developmentPlans, eq(developmentPlans.id, developmentGoals.planId))
    .where(
      and(
        eq(developmentActions.id, actionId),
        eq(developmentActions.companyId, actor.companyId),
        eq(developmentPlans.employeeId, actor.employeeId),
      ),
    )
    .limit(1);
  if (!action) return;
  await db
    .update(developmentActions)
    .set({ done: !action.done, updatedAt: new Date() })
    .where(eq(developmentActions.id, actionId));
  await syncGoalProgress(actor.companyId, action.goalId);
  revalidatePath("/pdi");
  revalidatePath(`/pdi/${action.goalId}`);
  revalidatePath("/evolucao");
  revalidatePath("/desenvolvimento");
  revalidatePath("/dashboard");
  revalidatePath("/meu-time");
}
