import Link from "next/link";
import { createCycle, startCycle } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import { listCycles } from "@/lib/db/queries/cycles";
import { countPeople, listSkills } from "@/lib/db/queries/directory";
import { listEvaluations } from "@/lib/db/queries/evaluations";
import { StatusPill, statusLabel, statusTone } from "@/components/ui/listing";
import { fieldClass, labelClass } from "@/components/ui/field";
import { FormDrawer } from "@/components/ui/form-drawer";
import { BigNumber, Chip, SoftCard } from "@/components/ui/surface";
import { ProgressRing } from "@/components/ui/progress-ring";
import { PageIntro } from "../dashboard/dashboards";
import { CycleStageBar } from "./stage-bar";

function formatRange(startsAt: Date, endsAt: Date) {
  const format = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  return `${format.format(startsAt)} – ${format.format(endsAt)}`;
}

export default async function CyclesPage() {
  const user = await requireRole(["ADMIN"]);
  const [cycles, people, skills, evaluations] = await Promise.all([
    listCycles(user.companyId),
    countPeople(user.companyId),
    listSkills(user.companyId),
    listEvaluations(user.companyId),
  ]);

  const open = cycles.filter((cycle) => cycle.status !== "DRAFT" && cycle.status !== "CLOSED").length;
  const drafts = cycles.filter((cycle) => cycle.status === "DRAFT").length;
  const closed = cycles.filter((cycle) => cycle.status === "CLOSED").length;

  return (
    <div className="space-y-5">
      <PageIntro
        title="Ciclos"
        kicker="A empresa inteira avalia no mesmo período"
        action={
          <FormDrawer
            label="Novo ciclo"
            title="Criar ciclo"
            description="Toda a empresa participa, com todas as competências ativas."
            submitLabel="Criar ciclo"
            action={createCycle}
          >
            <div>
              <label className={labelClass}>Nome do ciclo</label>
              <input name="name" required placeholder="Ciclo 2026.2" className={fieldClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Início</label>
                <input name="startsAt" type="date" required className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Fim</label>
                <input name="endsAt" type="date" required className={fieldClass} />
              </div>
            </div>
            <div className="rounded-[1.2rem] bg-white p-4">
              <p className="text-sm font-medium">Escopo automático</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {people} pessoas ativas e {skills.length} competências entram no ciclo.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Chip key={skill.id} tone="muted">
                    {skill.name}
                  </Chip>
                ))}
              </div>
            </div>
          </FormDrawer>
        }
      />

      <div className="flex flex-wrap gap-3">
        <BigNumber value={String(open)} label="Em andamento" />
        <BigNumber value={String(drafts)} label="Rascunho" />
        <BigNumber value={String(closed)} label="Encerrado" />
      </div>

      <SoftCard>
        <p className="mb-3 text-sm font-medium">Caminho do ciclo</p>
        <CycleStageBar preview />
        <p className="mt-3 text-sm text-muted-foreground">
          Ao iniciar, cada pessoa ativa recebe autoavaliação e avaliação do líder. A conversa de GAP
          abre quando as duas são enviadas.
        </p>
      </SoftCard>

      {cycles.length === 0 ? (
        <p className="rounded-[1.75rem] bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum ciclo criado ainda.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cycles.map((cycle) => {
            const rows = evaluations.filter((item) => item.cycleId === cycle.id);
            const submitted = rows.filter((item) => item.status === "SUBMITTED").length;
            const coverage = rows.length
              ? Math.round((submitted / rows.length) * 100)
              : 0;
            const selfDone = rows.filter(
              (item) => item.type === "SELF" && item.status === "SUBMITTED",
            ).length;
            const leaderDone = rows.filter(
              (item) => item.type === "LEADER" && item.status === "SUBMITTED",
            ).length;
            const peopleCount = Math.max(
              rows.filter((item) => item.type === "SELF").length,
              rows.filter((item) => item.type === "LEADER").length,
            );

            return (
              <div key={cycle.id} className="flex items-center gap-5 rounded-[1.75rem] bg-card p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/ciclos/${cycle.id}`}
                      className="text-[1.6rem] leading-tight font-semibold tracking-tight hover:underline"
                    >
                      {cycle.name}
                    </Link>
                    <StatusPill tone={statusTone(cycle.status)}>
                      {statusLabel(cycle.status)}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatRange(cycle.startsAt, cycle.endsAt)}
                    {peopleCount
                      ? ` · ${peopleCount} ${peopleCount === 1 ? "pessoa" : "pessoas"}`
                      : ""}
                  </p>
                  <div className="mt-4">
                    <CycleStageBar status={cycle.status} />
                  </div>
                  {peopleCount ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Auto {selfDone}/{peopleCount} · Líder {leaderDone}/{peopleCount}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Ainda sem avaliações geradas.
                    </p>
                  )}
                  <div className="mt-4">
                    {cycle.status === "DRAFT" ? (
                      <form action={startCycle}>
                        <input type="hidden" name="cycleId" value={cycle.id} />
                        <button className="h-9 rounded-full bg-primary px-4 text-xs font-medium text-dark transition-all hover:bg-primary-hover active:translate-y-px">
                          Iniciar ciclo
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={`/ciclos/${cycle.id}`}
                        className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-medium transition-colors hover:bg-accent-wash hover:text-accent-strong"
                      >
                        Ver progresso
                      </Link>
                    )}
                  </div>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <ProgressRing value={coverage} label="enviadas" size={108} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
