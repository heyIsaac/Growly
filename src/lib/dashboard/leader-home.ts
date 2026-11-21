import { pickDisplayedCycle } from "@/lib/dashboard/pick-cycle";
import { listCycles } from "@/lib/db/queries/cycles";
import { listDirectReports } from "@/lib/db/queries/directory";
import { listDevelopmentOverview, listEmployeeSkills } from "@/lib/db/queries/development";
import { listEvaluations } from "@/lib/db/queries/evaluations";

export async function loadLeaderDashboard(
  companyId: string,
  leaderEmployeeId: string | null,
  cicloId?: string,
) {
  const reports = leaderEmployeeId ? await listDirectReports(companyId, leaderEmployeeId) : [];
  const [cycles, evaluations, overview, skills] = await Promise.all([
    listCycles(companyId),
    listEvaluations(companyId),
    listDevelopmentOverview(companyId),
    listEmployeeSkills(companyId),
  ]);

  const reportIds = new Set(reports.map((person) => person.employeeId));
  const cycle = pickDisplayedCycle(cycles, cicloId);
  const cycleEvaluations = cycle
    ? evaluations.filter((item) => item.cycleId === cycle.id && reportIds.has(item.employeeId))
    : [];

  const people = reports.map((person) => {
    const self = cycleEvaluations.find(
      (item) => item.employeeId === person.employeeId && item.type === "SELF",
    );
    const leader = cycleEvaluations.find(
      (item) => item.employeeId === person.employeeId && item.type === "LEADER",
    );
    const plan = overview.find((item) => item.employeeId === person.employeeId);
    return {
      employeeId: person.employeeId,
      name: person.name,
      title: person.title,
      selfStatus: self?.status ?? null,
      leaderStatus: leader?.status ?? null,
      hasPlan: Boolean(plan?.planId),
      goalCount: plan?.goalCount ?? 0,
      pdiProgress: plan?.progress ?? 0,
    };
  });

  const bySkill = new Map<
    string,
    { name: string; total: number; count: number; prevTotal: number; prevCount: number; max: number }
  >();
  for (const skill of skills) {
    if (!reportIds.has(skill.employeeId)) continue;
    const current = bySkill.get(skill.skillId) ?? {
      name: skill.name,
      total: 0,
      count: 0,
      prevTotal: 0,
      prevCount: 0,
      max: skill.scaleMax,
    };
    current.total += skill.currentLevel;
    current.count += 1;
    if (skill.previousLevel != null) {
      current.prevTotal += skill.previousLevel;
      current.prevCount += 1;
    }
    bySkill.set(skill.skillId, current);
  }

  const inCycle = people.filter((person) => person.leaderStatus || person.selfStatus);
  const withPlan = people.filter((person) => person.hasPlan);

  return {
    cycle: cycle
      ? {
          id: cycle.id,
          name: cycle.name,
          status: cycle.status,
          endsAt: cycle.endsAt.toISOString(),
        }
      : null,
    people,
    participants: inCycle.length,
    selfDone: people.filter((person) => person.selfStatus === "SUBMITTED").length,
    leaderDone: people.filter((person) => person.leaderStatus === "SUBMITTED").length,
    withPlan: withPlan.length,
    avgPdi: withPlan.length
      ? Math.round(withPlan.reduce((sum, person) => sum + person.pdiProgress, 0) / withPlan.length)
      : 0,
    cycleOptions: cycles.map((item) => ({ id: item.id, name: item.name })),
    skills: [...bySkill.values()].map((skill) => ({
      label: skill.name,
      value: Math.round((skill.total / skill.count) * 10) / 10,
      previous: skill.prevCount ? Math.round((skill.prevTotal / skill.prevCount) * 10) / 10 : null,
      max: skill.max,
    })),
  };
}

export type LeaderDashboardData = Awaited<ReturnType<typeof loadLeaderDashboard>>;
