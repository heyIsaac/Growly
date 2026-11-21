import { createAction, toggleAction } from "@/lib/actions/mutations";
import { fieldClass } from "@/components/ui/field";
import { Chip, SoftCard } from "@/components/ui/surface";
import { EmptyRow } from "@/components/ui/listing";
import type { getDevelopmentPlan } from "@/lib/db/queries/development";

type Plan = NonNullable<Awaited<ReturnType<typeof getDevelopmentPlan>>>;

export const STATUS_LABEL = {
  NOT_STARTED: "Não iniciado",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
} as const;

export function formatDue(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function PlanView({
  goals,
  readOnly = false,
}: {
  goals: Plan["goals"];
  readOnly?: boolean;
}) {
  if (goals.length === 0) {
    return (
      <EmptyRow>
        {readOnly
          ? "Nenhum objetivo neste PDI ainda."
          : "Crie o primeiro objetivo. O plano abre junto com ele."}
      </EmptyRow>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {goals.map((goal) => {
        const done = goal.actions.filter((action) => action.done).length;
        return (
          <SoftCard key={goal.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg leading-tight font-semibold tracking-tight">{goal.title}</p>
                {goal.description ? (
                  <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{goal.description}</p>
                ) : null}
              </div>
              <Chip tone={goal.status === "DONE" ? "accent" : "white"}>{STATUS_LABEL[goal.status]}</Chip>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-[1.1rem] bg-white px-4 py-3">
                <dt className="text-xs text-ink-subtle">Competência</dt>
                <dd className="mt-1 font-medium">{goal.skillName ?? "Não ligada a uma competência"}</dd>
              </div>
              <div className="rounded-[1.1rem] bg-white px-4 py-3">
                <dt className="text-xs text-ink-subtle">Prazo</dt>
                <dd className="mt-1 font-medium">{goal.dueDate ? formatDue(goal.dueDate) : "Sem prazo"}</dd>
              </div>
            </dl>

            {goal.successIndicator ? (
              <p className="mt-3 rounded-[1.1rem] bg-accent-wash px-4 py-3 text-sm text-accent-strong">
                <span className="font-semibold">Como saber que chegou lá. </span>
                {goal.successIndicator}
              </p>
            ) : null}

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-sm">
                <span>Execução</span>
                <span className="tabular-nums text-muted-foreground">
                  {goal.actions.length ? `${done}/${goal.actions.length} ações` : `${goal.progress}%`}
                </span>
              </div>
              <div className="chart-track h-2.5 overflow-hidden rounded-full">
                <div className="chart-bar h-full rounded-full bg-accent-strong" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold tracking-[0.12em] text-ink-subtle uppercase">Ações</p>
              {goal.actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma ação ainda. Cada ação concluída avança o progresso do objetivo.
                </p>
              ) : null}
              {goal.actions.map((action) =>
                readOnly ? (
                  <p key={action.id} className="rounded-[1.1rem] bg-white px-4 py-3 text-sm">
                    <span className={action.done ? "text-muted-foreground line-through" : ""}>
                      {action.title}
                    </span>
                  </p>
                ) : (
                  <form
                    key={action.id}
                    action={toggleAction}
                    className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white px-4 py-3 text-sm"
                  >
                    <span className={action.done ? "text-muted-foreground line-through" : ""}>
                      {action.title}
                    </span>
                    <input type="hidden" name="actionId" value={action.id} />
                    <button className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent-wash hover:text-accent-strong">
                      {action.done ? "Reabrir" : "Concluir"}
                    </button>
                  </form>
                ),
              )}
            </div>

            {readOnly ? null : (
              <form action={createAction} className="mt-3 flex gap-2">
                <input type="hidden" name="goalId" value={goal.id} />
                <input
                  name="title"
                  required
                  minLength={2}
                  placeholder="Adicionar uma ação"
                  className={fieldClass}
                />
                <button className="h-11 shrink-0 rounded-full bg-dark px-4 text-sm font-medium text-white hover:bg-foreground">
                  Adicionar
                </button>
              </form>
            )}
          </SoftCard>
        );
      })}
    </div>
  );
}
