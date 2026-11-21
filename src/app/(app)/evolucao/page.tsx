import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { listCycles } from "@/lib/db/queries/cycles";
import { listEmployeeSkills, listSkillCycleScores } from "@/lib/db/queries/development";
import { cn } from "cn";
import { CycleEvolutionChart, type CyclePoint } from "@/components/ui/cycle-evolution-chart";
import { CardHead, SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../dashboard/dashboards";
import { resolveDevelopmentTarget } from "../desenvolvimento/target";

export default async function EvolutionPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; competencia?: string }>;
}) {
  const user = await requireUser();
  const companyCycles = await listCycles(user.companyId);
  if (companyCycles.length < 2) redirect("/dashboard");
  const { employee, competencia } = await searchParams;
  const { targetId, readOnly, personName } = await resolveDevelopmentTarget(user, employee);
  if (!targetId) return null;

  const [catalog, scores] = await Promise.all([
    listEmployeeSkills(user.companyId, targetId),
    listSkillCycleScores(user.companyId, targetId),
  ]);

  const skills = new Map<string, { id: string; name: string; max: number }>();
  for (const skill of catalog) {
    skills.set(skill.skillId, { id: skill.skillId, name: skill.name, max: skill.scaleMax });
  }
  for (const row of scores) {
    skills.set(row.skillId, { id: row.skillId, name: row.skillName, max: row.scaleMax });
  }
  const skillList = [...skills.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const selected = skillList.find((skill) => skill.id === competencia) ?? skillList[0];

  const cycles = new Map<string, CyclePoint & { at: number }>();
  for (const row of scores) {
    if (!selected || row.skillId !== selected.id) continue;
    const current = cycles.get(row.cycleId) ?? {
      id: row.cycleId,
      label: row.cycleName,
      self: null,
      leader: null,
      at: row.startsAt.getTime(),
    };
    if (row.type === "SELF") current.self = row.level;
    if (row.type === "LEADER") current.leader = row.level;
    cycles.set(row.cycleId, current);
  }
  const points = [...cycles.values()]
    .sort((a, b) => a.at - b.at)
    .map(({ at: _at, ...point }) => point);

  function skillHref(skillId: string) {
    const params = new URLSearchParams();
    if (readOnly && targetId) params.set("employee", targetId);
    params.set("competencia", skillId);
    return `/evolucao?${params.toString()}`;
  }

  return (
    <div className="space-y-5">
      <PageIntro
        title="Evolução"
        kicker={
          readOnly
            ? `Notas de ${personName ?? "esta pessoa"} em cada ciclo`
            : "Sua nota em cada competência, ciclo a ciclo"
        }
      />
      {skillList.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma competência cadastrada ainda.</p>
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {skillList.map((skill) => {
              const active = skill.id === selected?.id;
              return (
                <Link
                  key={skill.id}
                  href={skillHref(skill.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-dark text-white" : "bg-card text-muted-foreground hover:bg-white hover:text-foreground",
                  )}
                >
                  {skill.name}
                </Link>
              );
            })}
          </div>
          <SoftCard>
            <CardHead
              title={selected?.name ?? "Competência"}
              hint="O eixo de baixo é o ciclo. Passe o cursor para ver a nota da autoavaliação e a do líder."
            />
            <CycleEvolutionChart points={points} max={selected?.max ?? 5} />
          </SoftCard>
        </>
      )}
    </div>
  );
}
