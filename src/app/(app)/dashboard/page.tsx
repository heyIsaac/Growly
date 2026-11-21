import { requireUser } from "@/lib/auth/session";
import { listCycles } from "@/lib/db/queries/cycles";
import { getDevelopmentPlan, listEmployeeSkills, listSkillCycleScores } from "@/lib/db/queries/development";
import { openSelfEvaluation } from "@/lib/db/queries/evaluations";
import { EmployeeDashboardView } from "./dashboards";

export default async function DashboardPage() {
  const user = await requireUser();
  const employeeId = user.employeeId;
  const [skills, plan, scores, cycles] = await Promise.all([
    employeeId ? listEmployeeSkills(user.companyId, employeeId) : Promise.resolve([]),
    employeeId ? getDevelopmentPlan(user.companyId, employeeId) : Promise.resolve(null),
    employeeId ? listSkillCycleScores(user.companyId, employeeId) : Promise.resolve([]),
    listCycles(user.companyId),
  ]);

  const latest = new Map<string, { at: number; cycle: string; self: number | null; leader: number | null }>();
  for (const row of scores) {
    const at = row.startsAt.getTime();
    const current = latest.get(row.skillId);
    if (!current || at > current.at) {
      latest.set(row.skillId, { at, cycle: row.cycleName, self: null, leader: null });
    }
    const slot = latest.get(row.skillId);
    if (!slot || slot.cycle !== row.cycleName) continue;
    if (row.type === "SELF") slot.self = row.level;
    if (row.type === "LEADER") slot.leader = row.level;
  }
  const cycleName = [...latest.values()].sort((a, b) => b.at - a.at)[0]?.cycle ?? null;

  const openSelf = employeeId ? await openSelfEvaluation(user.companyId, employeeId) : null;

  return (
    <EmployeeDashboardView
      user={user}
      radar={skills.map((skill) => {
        const score = latest.get(skill.skillId);
        return {
          id: skill.skillId,
          label: skill.name,
          self: score?.self ?? null,
          leader: score?.leader ?? null,
          max: skill.scaleMax,
        };
      })}
      cycleName={cycleName}
      goalCount={plan?.goals.length ?? 0}
      pendingEvaluation={openSelf}
      showEvolution={cycles.length >= 2}
    />
  );
}
