import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cycleParticipants,
  employees,
  evaluationAnswers,
  evaluationCycles,
  evaluations,
  roles,
  skills,
  teams,
  users,
} from "@/lib/db/schema";

export type CycleReportPerson = {
  name: string;
  team: string;
  title: string;
  self: string;
  leader: string;
};

export type CycleReportSkill = {
  name: string;
  scaleMax: number;
  self: number | null;
  leader: number | null;
  gap: number | null;
};

export type CycleReport = {
  companyName: string;
  cycle: {
    id: string;
    name: string;
    status: string;
    startsAt: Date;
    endsAt: Date;
  };
  people: CycleReportPerson[];
  skills: CycleReportSkill[];
  selfDone: number;
  leaderDone: number;
};

const EVAL_STATUS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Enviada",
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export async function loadCycleReport(companyId: string, companyName: string, cycleId: string) {
  const [cycle] = await db
    .select()
    .from(evaluationCycles)
    .where(and(eq(evaluationCycles.companyId, companyId), eq(evaluationCycles.id, cycleId)))
    .limit(1);
  if (!cycle) return null;

  const peopleRows = await db
    .select({
      employeeId: employees.id,
      name: users.name,
      team: teams.name,
      title: roles.title,
      type: evaluations.type,
      status: evaluations.status,
    })
    .from(cycleParticipants)
    .innerJoin(employees, eq(employees.id, cycleParticipants.employeeId))
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(teams, eq(teams.id, employees.teamId))
    .leftJoin(roles, eq(roles.id, employees.roleId))
    .leftJoin(
      evaluations,
      and(
        eq(evaluations.cycleId, cycleParticipants.cycleId),
        eq(evaluations.employeeId, cycleParticipants.employeeId),
      ),
    )
    .where(and(eq(cycleParticipants.companyId, companyId), eq(cycleParticipants.cycleId, cycleId)))
    .orderBy(asc(users.name));

  const answers = await db
    .select({
      skillName: skills.name,
      scaleMax: skills.scaleMax,
      type: evaluations.type,
      level: evaluationAnswers.level,
    })
    .from(evaluationAnswers)
    .innerJoin(evaluations, eq(evaluations.id, evaluationAnswers.evaluationId))
    .innerJoin(skills, eq(skills.id, evaluationAnswers.skillId))
    .where(
      and(
        eq(evaluations.companyId, companyId),
        eq(evaluations.cycleId, cycleId),
        eq(evaluations.status, "SUBMITTED"),
      ),
    );

  const byPerson = new Map<string, CycleReportPerson>();
  for (const row of peopleRows) {
    const current = byPerson.get(row.employeeId) ?? {
      name: row.name,
      team: row.team ?? "Sem time",
      title: row.title ?? "Sem cargo",
      self: "Não iniciada",
      leader: "Não iniciada",
    };
    if (row.type === "SELF" && row.status) current.self = EVAL_STATUS[row.status] ?? row.status;
    if (row.type === "LEADER" && row.status) current.leader = EVAL_STATUS[row.status] ?? row.status;
    byPerson.set(row.employeeId, current);
  }
  const people = [...byPerson.values()];

  const buckets = new Map<string, { scaleMax: number; self: number[]; leader: number[] }>();
  for (const answer of answers) {
    const bucket = buckets.get(answer.skillName) ?? {
      scaleMax: answer.scaleMax,
      self: [],
      leader: [],
    };
    if (answer.type === "SELF") bucket.self.push(answer.level);
    if (answer.type === "LEADER") bucket.leader.push(answer.level);
    buckets.set(answer.skillName, bucket);
  }

  const skillsReport: CycleReportSkill[] = [...buckets.entries()]
    .map(([name, bucket]) => {
      const self = bucket.self.length
        ? round1(bucket.self.reduce((sum, level) => sum + level, 0) / bucket.self.length)
        : null;
      const leader = bucket.leader.length
        ? round1(bucket.leader.reduce((sum, level) => sum + level, 0) / bucket.leader.length)
        : null;
      return {
        name,
        scaleMax: bucket.scaleMax,
        self,
        leader,
        gap: self != null && leader != null ? round1(self - leader) : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    companyName,
    cycle: {
      id: cycle.id,
      name: cycle.name,
      status: cycle.status,
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
    },
    people,
    skills: skillsReport,
    selfDone: people.filter((person) => person.self === "Enviada").length,
    leaderDone: people.filter((person) => person.leader === "Enviada").length,
  } satisfies CycleReport;
}
