import { MessageCircle, Sparkles, Wrench } from "lucide-react";
import { createSkill } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import { listSkills } from "@/lib/db/queries/directory";
import { listEmployeeSkills } from "@/lib/db/queries/development";
import { fieldClass, labelClass } from "@/components/ui/field";
import { FormDrawer } from "@/components/ui/form-drawer";
import { EmptyRow } from "@/components/ui/listing";
import { Meter } from "@/components/ui/column-chart";
import { Chip, SoftCard } from "@/components/ui/surface";
import { PageIntro } from "../dashboard/dashboards";

const CATEGORIES = [
  {
    id: "TECHNICAL",
    label: "Técnico",
    hint: "Como a pessoa entrega o trabalho",
    icon: Wrench,
  },
  {
    id: "BEHAVIORAL",
    label: "Comportamental",
    hint: "Como colabora e se relaciona",
    icon: MessageCircle,
  },
  {
    id: "CULTURE",
    label: "Cultura",
    hint: "Como vive os valores da empresa",
    icon: Sparkles,
  },
] as const;

export default async function SkillsPage() {
  const user = await requireRole(["ADMIN"]);
  const [catalog, levels] = await Promise.all([
    listSkills(user.companyId),
    listEmployeeSkills(user.companyId),
  ]);

  const usage = new Map<string, { total: number; count: number; max: number }>();
  for (const row of levels) {
    const current = usage.get(row.skillId) ?? { total: 0, count: 0, max: row.scaleMax };
    current.total += row.currentLevel;
    current.count += 1;
    usage.set(row.skillId, current);
  }

  return (
    <div className="space-y-6">
      <PageIntro
        title="Competências"
        kicker="O que a empresa avalia em cada ciclo"
        action={
          <FormDrawer
            label="Nova competência"
            title="Adicionar competência"
            description="Entra nos próximos ciclos. A escala é a mesma para todas."
            submitLabel="Adicionar"
            action={createSkill}
          >
            <div>
              <label className={labelClass}>Nome</label>
              <input name="name" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Descrição</label>
              <input name="description" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <select name="category" className={fieldClass}>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </FormDrawer>
        }
      />

      {catalog.length === 0 ? <EmptyRow>Nenhuma competência cadastrada.</EmptyRow> : null}

      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const items = catalog.filter((skill) => skill.category === category.id);
          if (items.length === 0) return null;
          return (
            <SoftCard key={category.id} className="space-y-5">
              <div className="flex items-center gap-3 border-b border-border/80 pb-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-ink-muted">
                  <category.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[1.6rem] leading-tight font-semibold tracking-tight">
                    {category.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{category.hint}</p>
                </div>
                <Chip tone="white">{items.length}</Chip>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((skill) => {
                  const stats = usage.get(skill.id);
                  const average = stats?.count ? stats.total / stats.count : 0;
                  const averageLabel = stats?.count
                    ? average.toLocaleString("pt-BR", {
                        minimumFractionDigits: Number.isInteger(average) ? 0 : 1,
                        maximumFractionDigits: 1,
                      })
                    : "—";
                  return (
                    <div
                      key={skill.id}
                      className="flex items-center gap-6 rounded-[1.35rem] bg-white p-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[1.6rem] leading-tight font-semibold tracking-tight">
                          {skill.name}
                        </p>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {skill.description ?? "Sem descrição ainda."}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {stats?.count
                            ? `${stats.count} pessoa${stats.count === 1 ? "" : "s"} avaliada${stats.count === 1 ? "" : "s"}`
                            : "Ainda sem avaliações"}
                        </p>
                      </div>
                      <div className="w-[9.5rem] shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">Média</p>
                        <p className="mt-1 text-[2.15rem] leading-none font-semibold tracking-tight tabular-nums text-accent-strong">
                          {averageLabel}
                        </p>
                        <div className="mt-3">
                          <Meter value={average} max={stats?.max ?? skill.scaleMax} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SoftCard>
          );
        })}
      </div>
    </div>
  );
}
