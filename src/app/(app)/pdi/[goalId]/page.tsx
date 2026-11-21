import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Flag, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { createAction, toggleAction } from "@/lib/actions/mutations";
import { requireUser } from "@/lib/auth/session";
import { getDevelopmentPlan } from "@/lib/db/queries/development";
import { fieldClass } from "@/components/ui/field";
import { CardHead, Chip, SoftCard } from "@/components/ui/surface";
import { formatDue, STATUS_LABEL } from "../../desenvolvimento/plan-view";
import { resolveDevelopmentTarget } from "../../desenvolvimento/target";

export default async function GoalPage({
  params,
  searchParams,
}: {
  params: Promise<{ goalId: string }>;
  searchParams: Promise<{ employee?: string }>;
}) {
  const user = await requireUser();
  const { goalId } = await params;
  const { employee } = await searchParams;
  const { targetId, readOnly, personName } = await resolveDevelopmentTarget(user, employee);
  if (!targetId) return null;

  const plan = await getDevelopmentPlan(user.companyId, targetId);
  const goal = plan?.goals.find((item) => item.id === goalId);
  if (!goal) notFound();

  const done = goal.actions.filter((action) => action.done).length;
  const backHref = readOnly ? `/pdi?employee=${targetId}` : "/pdi";

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Link
          href={backHref}
          aria-label="Voltar ao PDI"
          className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border transition-colors hover:bg-card"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {readOnly ? `Objetivo de ${personName ?? "esta pessoa"}` : "Objetivo"}
          </p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">{goal.title}</h1>
            <Chip tone={goal.status === "DONE" ? "accent" : "white"}>{STATUS_LABEL[goal.status]}</Chip>
          </div>
          {goal.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{goal.description}</p>
          ) : null}
        </div>
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.85fr)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact icon={Sparkles} label="Competência" value={goal.skillName ?? "Não ligada"} />
          <Fact icon={Calendar} label="Prazo" value={goal.dueDate ? formatDue(goal.dueDate) : "Sem prazo"} />
          {goal.successIndicator ? (
            <SoftCard tone="accent" className="sm:col-span-2">
              <FactLabel icon={Flag} label="Como saber que chegou lá" tone="accent" />
              <p className="mt-3 text-base leading-relaxed">{goal.successIndicator}</p>
            </SoftCard>
          ) : null}
        </div>
        <SoftCard className="flex flex-col">
          <FactLabel icon={TrendingUp} label="Execução" />
          <p className="mt-4 text-[2.4rem] leading-none font-semibold tabular-nums">{goal.progress}%</p>
          <div className="chart-track mt-4 h-2 overflow-hidden rounded-full">
            <div className="chart-bar h-full rounded-full bg-accent-strong" style={{ width: `${goal.progress}%` }} />
          </div>
          <p className="mt-auto pt-4 text-sm text-muted-foreground">
            {goal.actions.length
              ? `${done} de ${goal.actions.length} ações concluídas`
              : "O progresso anda quando as ações são concluídas"}
          </p>
        </SoftCard>
      </div>

      <SoftCard>
        <CardHead
          title="Ações"
          hint={
            goal.actions.length
              ? "Cada ação concluída recalcula o progresso do objetivo."
              : "Sem ação, o objetivo fica só como intenção."
          }
        />
        {goal.actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ação ainda.</p>
        ) : (
          <div className="space-y-2">
            {goal.actions.map((action) =>
              readOnly ? (
                <div key={action.id} className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white px-4 py-3">
                  <span className={action.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                    {action.title}
                  </span>
                  <Chip tone={action.done ? "accent" : "muted"}>{action.done ? "Concluída" : "Em aberto"}</Chip>
                </div>
              ) : (
                <form
                  key={action.id}
                  action={toggleAction}
                  className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white px-4 py-3"
                >
                  <span className={action.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
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
        )}
        {readOnly ? null : (
          <form action={createAction} className="mt-4 flex gap-2">
            <input type="hidden" name="goalId" value={goal.id} />
            <input
              name="title"
              required
              minLength={2}
              placeholder="Qual é o próximo passo?"
              className={fieldClass}
            />
            <button className="h-11 shrink-0 rounded-full bg-dark px-4 text-sm font-medium text-white hover:bg-foreground">
              Adicionar
            </button>
          </form>
        )}
      </SoftCard>
    </div>
  );
}

function FactLabel({
  icon: Icon,
  label,
  tone = "muted",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "muted" | "accent";
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-accent-strong">
        <Icon className="size-4" />
      </span>
      <p
        className={
          tone === "accent"
            ? "text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase"
            : "text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase"
        }
      >
        {label}
      </p>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <SoftCard>
      <FactLabel icon={icon} label={label} />
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </SoftCard>
  );
}
