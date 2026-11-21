import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DEFAULT_SKILLS } from "./default-skills";
import {
  cycleParticipants,
  cycleSkills,
  developmentActions,
  developmentGoals,
  developmentPlans,
  employeeSkills,
  employees,
  evaluationAnswers,
  evaluationCycles,
  evaluations,
  roles,
  skills,
  teams,
  users,
} from "./schema";

type Db = NodePgDatabase;

async function ensureTeam(db: Db, companyId: string, name: string) {
  const [existing] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.companyId, companyId), eq(teams.name, name)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(teams)
    .values({ companyId, name })
    .returning();
  return created;
}

async function ensureRole(db: Db, companyId: string, title: string) {
  const [existing] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.companyId, companyId), eq(roles.title, title)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(roles)
    .values({ companyId, title })
    .returning();
  return created;
}

async function ensureSkill(
  db: Db,
  companyId: string,
  name: string,
  category: "TECHNICAL" | "BEHAVIORAL" | "CULTURE",
  description: string,
) {
  const [existing] = await db
    .select()
    .from(skills)
    .where(and(eq(skills.companyId, companyId), eq(skills.name, name)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(skills)
    .values({ companyId, name, category, description })
    .returning();
  return created;
}

async function ensurePerson(
  db: Db,
  params: {
    companyId: string;
    name: string;
    email: string;
    role: "ADMIN" | "LEADER" | "EMPLOYEE";
    teamId: string;
    roleId: string;
    managerId?: string | null;
    area: string;
    seniority: string;
  },
) {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.companyId, params.companyId), eq(users.email, params.email)))
    .limit(1);

  const user =
    existingUser ??
    (
      await db
        .insert(users)
        .values({
          companyId: params.companyId,
          email: params.email,
          name: params.name,
          role: params.role,
          status: "INVITED",
        })
        .returning()
    )[0];

  const [existingEmployee] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, user.id))
    .limit(1);

  if (existingEmployee) {
    await db
      .update(employees)
      .set({
        teamId: params.teamId,
        roleId: params.roleId,
        managerId: params.managerId ?? null,
        area: params.area,
        seniority: params.seniority,
      })
      .where(eq(employees.id, existingEmployee.id));
    return existingEmployee;
  }

  const [created] = await db
    .insert(employees)
    .values({
      companyId: params.companyId,
      userId: user.id,
      teamId: params.teamId,
      roleId: params.roleId,
      managerId: params.managerId ?? null,
      area: params.area,
      seniority: params.seniority,
      hiredAt: "2024-03-01",
      status: "ACTIVE",
    })
    .returning();
  return created;
}

export async function enrichGrowlyDemo(db: Db, companyId: string) {
  const peopleTeam = await ensureTeam(db, companyId, "People");
  const productTeam = await ensureTeam(db, companyId, "Produto");
  const engineeringTeam = await ensureTeam(db, companyId, "Engenharia");

  const peopleRole = await ensureRole(db, companyId, "People Partner");
  const managerRole = await ensureRole(db, companyId, "Engineering Manager");
  const designerRole = await ensureRole(db, companyId, "Product Designer");
  const engineerRole = await ensureRole(db, companyId, "Software Engineer");

  const skillRows = await Promise.all(
    DEFAULT_SKILLS.map((skill) =>
      ensureSkill(db, companyId, skill.name, skill.category, skill.description),
    ),
  );

  const ana = await ensurePerson(db, {
    companyId,
    name: "Ana Ribeiro",
    email: "admin@growly.dev",
    role: "ADMIN",
    teamId: peopleTeam.id,
    roleId: peopleRole.id,
    area: "RH",
    seniority: "Sênior",
  });
  const lucas = await ensurePerson(db, {
    companyId,
    name: "Lucas Mendes",
    email: "lider@growly.dev",
    role: "LEADER",
    teamId: engineeringTeam.id,
    roleId: managerRole.id,
    area: "Engenharia",
    seniority: "Sênior",
  });
  const marina = await ensurePerson(db, {
    companyId,
    name: "Marina Alves",
    email: "colab@growly.dev",
    role: "EMPLOYEE",
    teamId: engineeringTeam.id,
    roleId: engineerRole.id,
    managerId: lucas.id,
    area: "Engenharia",
    seniority: "Pleno",
  });
  await ensurePerson(db, {
    companyId,
    name: "Pedro Lima",
    email: "pedro@growly.dev",
    role: "EMPLOYEE",
    teamId: engineeringTeam.id,
    roleId: engineerRole.id,
    managerId: lucas.id,
    area: "Engenharia",
    seniority: "Júnior",
  });
  await ensurePerson(db, {
    companyId,
    name: "Julia Nunes",
    email: "julia@growly.dev",
    role: "EMPLOYEE",
    teamId: productTeam.id,
    roleId: designerRole.id,
    managerId: lucas.id,
    area: "Produto",
    seniority: "Pleno",
  });

  await db
    .update(teams)
    .set({ leaderEmployeeId: lucas.id })
    .where(eq(teams.id, engineeringTeam.id));

  const [existingCycle] = await db
    .select()
    .from(evaluationCycles)
    .where(and(eq(evaluationCycles.companyId, companyId), eq(evaluationCycles.name, "Ciclo 2026.1")))
    .limit(1);

  if (existingCycle) {
    console.log("Demo cycle already exists.");
    return;
  }

  const [cycle] = await db
    .insert(evaluationCycles)
    .values({
      companyId,
      name: "Ciclo 2026.1",
      startsAt: new Date("2026-01-06"),
      endsAt: new Date("2026-03-31"),
      status: "COMPARISON",
    })
    .returning();

  await db.insert(cycleParticipants).values(
    [marina.id, lucas.id].map((employeeId) => ({
      companyId,
      cycleId: cycle.id,
      employeeId,
    })),
  );
  await db.insert(cycleSkills).values(
    skillRows.map((skill) => ({
      companyId,
      cycleId: cycle.id,
      skillId: skill.id,
    })),
  );

  const levels = [
    { skill: skillRows[0], self: 4, leader: 4 },
    { skill: skillRows[1], self: 4, leader: 3 },
    { skill: skillRows[2], self: 3, leader: 4 },
    { skill: skillRows[3], self: 4, leader: 4 },
    { skill: skillRows[4], self: 5, leader: 4 },
  ];

  const [selfEval] = await db
    .insert(evaluations)
    .values({
      companyId,
      cycleId: cycle.id,
      employeeId: marina.id,
      evaluatorEmployeeId: marina.id,
      type: "SELF",
      status: "SUBMITTED",
      submittedAt: new Date("2026-02-10"),
      evolvedComment: "Passei a documentar decisões antes das reviews.",
      developComment: "Quero melhorar a colaboração entre times.",
      achievementComment: "Entreguei o fluxo de avaliações do ciclo.",
      nextCycleComment: "Reduzir retrabalho nas handoffs.",
    })
    .returning();

  const [leaderEval] = await db
    .insert(evaluations)
    .values({
      companyId,
      cycleId: cycle.id,
      employeeId: marina.id,
      evaluatorEmployeeId: lucas.id,
      type: "LEADER",
      status: "SUBMITTED",
      submittedAt: new Date("2026-02-18"),
    })
    .returning();

  await db.insert(evaluationAnswers).values(
    levels.flatMap((item) => [
      {
        companyId,
        evaluationId: selfEval.id,
        skillId: item.skill.id,
        level: item.self,
        comment: "Percepção da autoavaliação.",
      },
      {
        companyId,
        evaluationId: leaderEval.id,
        skillId: item.skill.id,
        level: item.leader,
        comment: "Percepção do líder.",
      },
    ]),
  );

  for (const item of levels) {
    await db.insert(employeeSkills).values({
      companyId,
      employeeId: marina.id,
      skillId: item.skill.id,
      currentLevel: item.leader,
      previousLevel: Math.max(1, item.leader - 1),
    });
  }

  const [plan] = await db
    .insert(developmentPlans)
    .values({ companyId, employeeId: marina.id })
    .returning();

  const [goal] = await db
    .insert(developmentGoals)
    .values({
      companyId,
      planId: plan.id,
      title: "Alinhar handoffs com produto",
      description: "Reduzir idas e voltas entre engenharia e design.",
      skillId: skillRows[1].id,
      dueDate: "2026-06-30",
      progress: 40,
      successIndicator: "Duas entregas seguidas sem retrabalho de escopo.",
      status: "IN_PROGRESS",
    })
    .returning();

  await db.insert(developmentGoals).values({
    companyId,
    planId: plan.id,
    title: "Mentoria de qualidade técnica",
    description: "Apoiar um colega júnior em reviews semanais.",
    skillId: skillRows[3].id,
    dueDate: "2026-05-15",
    progress: 20,
    successIndicator: "Quatro reviews registradas no ciclo.",
    status: "IN_PROGRESS",
  });

  await db.insert(developmentActions).values([
    {
      companyId,
      goalId: goal.id,
      title: "Combinar um ritual semanal com produto",
      done: true,
    },
    {
      companyId,
      goalId: goal.id,
      title: "Registrar o checklist de handoff",
      done: false,
    },
  ]);

  console.log("Growly Demo enriquecida.");
}
