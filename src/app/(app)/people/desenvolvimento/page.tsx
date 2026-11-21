import { requireRole } from "@/lib/auth/session";
import {
  listDevelopmentGoals,
  listDevelopmentOverview,
  listEmployeeSkills,
} from "@/lib/db/queries/development";
import { BigNumber, CardHead, SoftCard } from "@/components/ui/surface";
import { ColumnChart, EvolutionChart } from "@/components/ui/column-chart";
import { DevelopmentFilters } from "../../desenvolvimento/filters";
import { planSituation } from "../../desenvolvimento/helpers";

const BASE = "/people/desenvolvimento";

export default async function CompanyDevelopmentPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; q?: string; situacao?: string; time?: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { q, situacao, time } = await searchParams;
  const [overview, allGoals, allSkills] = await Promise.all([
    listDevelopmentOverview(user.companyId),
    listDevelopmentGoals(user.companyId),
    listEmployeeSkills(user.companyId),
  ]);

  const term = q?.trim().toLowerCase() ?? "";
  const rows = overview.filter((person) => {
    const situation = planSituation(person);
    const matchesSearch =
      !term ||
      person.name.toLowerCase().includes(term) ||
      (person.title ?? "").toLowerCase().includes(term) ||
      (person.teamName ?? "").toLowerCase().includes(term) ||
      person.email.toLowerCase().includes(term);
    const matchesSituation =
      !situacao ||
      (situacao === "com-pdi" && Boolean(person.planId)) ||
      (situacao === "sem-plano" && !person.planId) ||
      (situacao === "andamento" && situation.status === "IN_PROGRESS") ||
      (situacao === "concluido" && situation.status === "DONE");
    const matchesTeam = !time || person.teamName === time;
    return matchesSearch && matchesSituation && matchesTeam;
  });

  const peopleIds = new Set(rows.map((person) => person.employeeId));
  const goals = allGoals.filter((goal) => peopleIds.has(goal.employeeId));
  const skills = allSkills.filter((skill) => peopleIds.has(skill.employeeId));

  const withPlan = rows.filter((person) => person.planId).length;
  const withoutPlan = rows.length - withPlan;
  const avgProgress = rows.length
    ? Math.round(rows.reduce((sum, person) => sum + person.progress, 0) / rows.length)
    : 0;
  const teams = [...new Set(overview.map((person) => person.teamName).filter(Boolean))] as string[];

  const goalsBySkill = new Map<string, number>();
  for (const goal of goals) {
    const label = goal.skillName ?? "Sem competência";
    goalsBySkill.set(label, (goalsBySkill.get(label) ?? 0) + 1);
  }
  const skillPdiMax = Math.max(1, ...goalsBySkill.values());
  const skillPdis = [...goalsBySkill.entries()].map(([label, value]) => ({
    label,
    value,
    max: skillPdiMax,
  }));

  const evolutionBySkill = new Map<
    string,
    { label: string; previousTotal: number; currentTotal: number; count: number; max: number }
  >();
  for (const skill of skills) {
    const current = evolutionBySkill.get(skill.skillId) ?? {
      label: skill.name,
      previousTotal: 0,
      currentTotal: 0,
      count: 0,
      max: skill.scaleMax,
    };
    current.previousTotal += skill.previousLevel ?? skill.currentLevel;
    current.currentTotal += skill.currentLevel;
    current.count += 1;
    evolutionBySkill.set(skill.skillId, current);
  }
  const evolution = [...evolutionBySkill.values()].map((skill) => ({
    label: skill.label,
    previous: skill.count ? Math.round(skill.previousTotal / skill.count) : 0,
    current: skill.count ? Math.round(skill.currentTotal / skill.count) : 0,
    max: skill.max,
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Competências e planos da empresa</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">Evolução da empresa</h1>
          <DevelopmentFilters teams={teams} basePath={BASE} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <BigNumber value={String(withPlan)} label="Com PDI" />
        <BigNumber value={String(withoutPlan)} label="Sem plano" />
        <BigNumber value={`${avgProgress}%`} label="Progresso médio" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SoftCard>
          <CardHead title="Evolução das competências" hint="Média da empresa agora, comparada com o ciclo anterior." />
          <EvolutionChart items={evolution} />
        </SoftCard>
        <SoftCard>
          <CardHead title="Competências com PDI" hint="Quantos objetivos estão ligados a cada competência." />
          {skillPdis.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum objetivo ligado a competência ainda.</p>
          ) : (
            <ColumnChart items={skillPdis} />
          )}
        </SoftCard>
      </div>
    </div>
  );
}
