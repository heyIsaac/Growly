import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { loadLeaderDashboard } from "@/lib/dashboard/leader-home";
import { TEAM_PHASES, teamPhase } from "@/lib/dashboard/team-phase";
import { Chip } from "@/components/ui/surface";

export default async function TeamPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const user = await requireRole(["LEADER"]);
  const { ciclo } = await searchParams;
  const dashboard = await loadLeaderDashboard(user.companyId, user.employeeId, ciclo);
  const { people, cycle } = dashboard;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Link
          href="/meu-time"
          aria-label="Voltar à visão do time"
          className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border transition-colors hover:bg-card"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">{cycle ? cycle.name : "Sem ciclo aberto"}</p>
          <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">Meu time</h1>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {TEAM_PHASES.map((phase) => {
          const column = people.filter((person) => teamPhase(person) === phase.id);
          return (
            <section key={phase.id} className="rounded-[1.75rem] bg-card p-3">
              <div className="flex items-start justify-between gap-3 px-2 pt-1 pb-3">
                <div>
                  <p className="text-sm font-semibold">{phase.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{phase.hint}</p>
                </div>
                <Chip tone="white">{column.length}</Chip>
              </div>
              {column.length === 0 ? (
                <p className="rounded-[1.15rem] bg-white/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  Ninguém nesta fase.
                </p>
              ) : (
                <div className="space-y-2">
                  {column.map((person) => (
                    <article key={person.employeeId} className="rounded-[1.15rem] bg-white p-4">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{person.title ?? "Sem cargo"}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {person.hasPlan
                          ? `PDI ${person.pdiProgress}% · ${person.goalCount} objetivo${person.goalCount === 1 ? "" : "s"}`
                          : "Sem PDI aberto"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/pdi?employee=${person.employeeId}`}
                          className="flex-1 rounded-full bg-card px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-accent-wash hover:text-accent-strong"
                        >
                          Ver PDI
                        </Link>
                        {cycle ? (
                          <Link
                            href={`/avaliacoes/${cycle.id}?employee=${person.employeeId}&type=LEADER`}
                            className="flex-1 rounded-full bg-dark px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-foreground"
                          >
                            {person.leaderStatus === "SUBMITTED" ? "Ver avaliação" : "Avaliar"}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
