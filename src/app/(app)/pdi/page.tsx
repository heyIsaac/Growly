import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { createGoal } from "@/lib/actions/mutations";
import { requireUser } from "@/lib/auth/session";
import { listSkills } from "@/lib/db/queries/directory";
import { getDevelopmentPlan } from "@/lib/db/queries/development";
import { areaClass, fieldClass, labelClass } from "@/components/ui/field";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Cell, EmptyRow, ListCard, ListRow } from "@/components/ui/listing";
import { Chip, SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../dashboard/dashboards";
import { formatDue, STATUS_LABEL } from "../desenvolvimento/plan-view";
import { resolveDevelopmentTarget } from "../desenvolvimento/target";

const STEPS = [
  {
    title: "Objetivo",
    text: "O que a pessoa vai desenvolver, ligado a uma competência, com prazo e um sinal claro de que chegou lá.",
  },
  {
    title: "Ações",
    text: "Os passos combinados para chegar no objetivo. Sem ação, o objetivo fica só como intenção.",
  },
  {
    title: "Execução",
    text: "Cada ação concluída recalcula o progresso. Quando todas fecham, o objetivo fica concluído.",
  },
];

export default async function PdiPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>;
}) {
  const user = await requireUser();
  const { employee } = await searchParams;
  const { targetId, readOnly, personName } = await resolveDevelopmentTarget(user, employee);
  if (!targetId) return null;

  const [plan, catalog] = await Promise.all([
    getDevelopmentPlan(user.companyId, targetId),
    listSkills(user.companyId),
  ]);
  const goals = plan?.goals ?? [];

  function goalHref(goalId: string) {
    if (!readOnly) return `/pdi/${goalId}`;
    return `/pdi/${goalId}?employee=${targetId}`;
  }

  return (
    <div className="space-y-5">
      <PageIntro
        title="PDI"
        kicker={
          readOnly
            ? `Plano de ${personName ?? "esta pessoa"}`
            : "Objetivos, ações e o que falta para concluir"
        }
        action={
          readOnly ? null : (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/pdi/conversa"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-card"
              >
                <Sparkles className="size-4" />
                Criar objetivo com IA
              </Link>
            <FormDrawer
              label="Novo objetivo"
              title="Criar objetivo"
              description="O plano abre automaticamente com o primeiro objetivo."
              submitLabel="Criar objetivo"
              action={createGoal}
            >
              <div>
                <label className={labelClass}>Título</label>
                <input name="title" required className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea name="description" className={areaClass} />
              </div>
              <div>
                <label className={labelClass}>Competência relacionada</label>
                <select name="skillId" className={fieldClass}>
                  <option value="">Nenhuma</option>
                  {catalog.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Prazo</label>
                <input name="dueDate" type="date" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Como saber que chegou lá</label>
                <input name="successIndicator" className={fieldClass} />
              </div>
            </FormDrawer>
            </div>
          )
        }
      />
      <div className="grid gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <SoftCard key={step.title}>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">0{index + 1}</p>
            <p className="mt-2 text-lg font-semibold">{step.title}</p>
            <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{step.text}</p>
          </SoftCard>
        ))}
      </div>
      <ListCard columns={["Objetivo", "Competência", "Prazo", "Progresso", ""]}>
        {goals.length === 0 ? (
          <EmptyRow>
            {readOnly
              ? "Nenhum objetivo neste PDI ainda."
              : "Crie o primeiro objetivo. O plano abre junto com ele."}
          </EmptyRow>
        ) : null}
        {goals.map((goal) => (
            <ListRow key={goal.id} href={goalHref(goal.id)}>
              <Cell>
                <span className="block truncate font-medium">{goal.title}</span>
                <span className="mt-1 block md:hidden">
                  <Chip tone={goal.status === "DONE" ? "accent" : "muted"}>{STATUS_LABEL[goal.status]}</Chip>
                </span>
              </Cell>
              <Cell className="text-muted-foreground">{goal.skillName ?? "Sem competência"}</Cell>
              <Cell className="text-muted-foreground">{goal.dueDate ? formatDue(goal.dueDate) : "Sem prazo"}</Cell>
              <Cell>
                <div className="flex items-center gap-3">
                  <div className="chart-track h-1.5 min-w-16 flex-1 overflow-hidden rounded-full">
                    <div className="chart-bar h-full rounded-full bg-accent-strong" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{goal.progress}%</span>
                </div>
              </Cell>
              <Cell className="flex items-center justify-end gap-3">
                <span className="hidden md:inline">
                  <Chip tone={goal.status === "DONE" ? "accent" : "muted"}>{STATUS_LABEL[goal.status]}</Chip>
                </span>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-card text-foreground">
                  <ChevronRight className="size-4" />
                </span>
              </Cell>
            </ListRow>
        ))}
      </ListCard>
    </div>
  );
}
