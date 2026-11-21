import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { saveEvaluation } from "@/lib/actions/mutations";
import { requireUser } from "@/lib/auth/session";
import { getCycle, listCycleSkillRows } from "@/lib/db/queries/cycles";
import { listDirectReports } from "@/lib/db/queries/directory";
import { getEvaluation } from "@/lib/db/queries/evaluations";
import { areaClass, ghostButtonClass, primaryButtonClass } from "@/components/ui/field";
import { GapRadar } from "@/components/ui/gap-radar";
import { CardHead, Chip, SoftCard } from "@/components/ui/surface";
import { statusLabel } from "@/components/ui/listing";
import { PageIntro } from "../../dashboard/dashboards";

export default async function EvaluationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cycleId: string }>;
  searchParams: Promise<{ employee?: string; type?: string }>;
}) {
  const user = await requireUser();
  const { cycleId } = await params;
  const query = await searchParams;
  const employeeId = query.employee ?? user.employeeId ?? "";
  const type = query.type === "LEADER" ? "LEADER" : "SELF";

  if (type === "SELF" && employeeId !== user.employeeId && user.role === "EMPLOYEE") {
    redirect("/avaliacoes");
  }
  if (type === "LEADER" && user.role === "LEADER" && user.employeeId) {
    const reports = await listDirectReports(user.companyId, user.employeeId);
    if (!reports.some((item) => item.employeeId === employeeId) && employeeId !== user.employeeId) {
      redirect("/avaliacoes");
    }
  }

  const cycle = await getCycle(user.companyId, cycleId);
  if (!cycle) notFound();

  const [skills, selfEval, leaderEval] = await Promise.all([
    listCycleSkillRows(user.companyId, cycleId),
    getEvaluation({ companyId: user.companyId, cycleId, employeeId, type: "SELF" }),
    getEvaluation({ companyId: user.companyId, cycleId, employeeId, type: "LEADER" }),
  ]);

  const current = type === "SELF" ? selfEval : leaderEval;
  const canEdit =
    current?.evaluation.status !== "SUBMITTED" &&
    ((type === "SELF" && user.employeeId === employeeId) ||
      (type === "LEADER" && user.role === "LEADER"));

  const bothSubmitted =
    selfEval?.evaluation.status === "SUBMITTED" &&
    leaderEval?.evaluation.status === "SUBMITTED";
  const submitted = current?.evaluation.status === "SUBMITTED";
  const statusText = !current
    ? "Não iniciada"
    : submitted && type === "LEADER"
      ? "Recebida"
      : current.evaluation.status
        ? statusLabel(current.evaluation.status)
        : "Não iniciada";

  function viewHref(nextType: "SELF" | "LEADER") {
    return `/avaliacoes/${cycleId}?employee=${employeeId}&type=${nextType}`;
  }

  return (
    <div className="space-y-5">
      <PageIntro
        title={type === "SELF" ? "Autoavaliação" : "Avaliação recebida"}
        kicker={cycle.name}
        action={<Chip tone={submitted ? "dark" : "white"}>{statusText}</Chip>}
      />

      <div className="inline-flex gap-1 rounded-full bg-card p-1">
        {(
          [
            ["SELF", "Autoavaliação"],
            ["LEADER", "Avaliação recebida"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={viewHref(value)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              type === value ? "bg-dark text-white" : "text-muted-foreground hover:bg-white hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {bothSubmitted ? (
        <SoftCard>
          <CardHead title="Comparação" hint="Onde a nota da pessoa e a do líder coincidem, e onde aparece GAP." />
          <GapRadar
            items={skills.map((skill) => ({
              id: skill.skillId,
              label: skill.name,
              self: selfEval?.answers.find((item) => item.skillId === skill.skillId)?.level ?? null,
              leader:
                leaderEval?.answers.find((item) => item.skillId === skill.skillId)?.level ?? null,
              max: skill.scaleMax,
            }))}
          />
        </SoftCard>
      ) : null}

      <form action={saveEvaluation} className="space-y-4">
        <input type="hidden" name="cycleId" value={cycleId} />
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="type" value={type} />

        <SoftCard>
          <CardHead
            title="Competências"
            hint={
              canEdit
                ? `Marque o nível que descreve a prática hoje, de 1 a ${skills[0]?.scaleMax ?? 5}.`
                : type === "LEADER"
                  ? "Notas e comentários que o líder registrou."
                  : "Notas e comentários registrados na autoavaliação."
            }
          />
          <div className="space-y-3">
            {skills.map((skill) => {
              const answer = current?.answers.find((item) => item.skillId === skill.skillId);
              if (!canEdit) {
                return (
                  <div key={skill.skillId} className="flex items-start justify-between gap-4 rounded-[1.2rem] bg-white p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{skill.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {answer?.comment?.trim() ? answer.comment : "Sem comentário."}
                      </p>
                    </div>
                    <p className="text-[1.6rem] leading-none font-semibold text-accent-strong tabular-nums">
                      {answer?.level ?? "—"}
                      <span className="ml-0.5 text-sm font-medium text-muted-foreground">/{skill.scaleMax}</span>
                    </p>
                  </div>
                );
              }
              return (
                <div key={skill.skillId} className="rounded-[1.2rem] bg-white p-4">
                  <input type="hidden" name="skillId" value={skill.skillId} />
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Array.from({ length: skill.scaleMax }, (_, index) => index + 1).map((level) => (
                      <label
                        key={level}
                        className="relative inline-flex cursor-pointer items-center justify-center"
                      >
                        <input
                          type="radio"
                          name={`level_${skill.skillId}`}
                          value={level}
                          defaultChecked={answer?.level === level}
                          className="peer sr-only"
                        />
                        <span className="flex size-10 items-center justify-center rounded-full bg-card text-sm font-medium transition-all peer-checked:bg-dark peer-checked:text-white">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    name={`comment_${skill.skillId}`}
                    defaultValue={answer?.comment ?? ""}
                    placeholder="Comentário"
                    className={`${areaClass} mt-3 min-h-16 bg-card`}
                  />
                </div>
              );
            })}
          </div>
        </SoftCard>

        {type === "SELF" ? (
          <SoftCard>
            <CardHead
              title="Reflexão"
              hint="O que avançou, o que ainda falta desenvolver e o combinado para o próximo ciclo."
            />
            {canEdit ? (
              <div className="grid gap-3 md:grid-cols-2">
                <textarea name="evolvedComment" defaultValue={current?.evaluation.evolvedComment ?? ""} placeholder="O que evoluiu?" className={areaClass} />
                <textarea name="developComment" defaultValue={current?.evaluation.developComment ?? ""} placeholder="O que precisa desenvolver?" className={areaClass} />
                <textarea name="achievementComment" defaultValue={current?.evaluation.achievementComment ?? ""} placeholder="Principal conquista?" className={areaClass} />
                <textarea name="nextCycleComment" defaultValue={current?.evaluation.nextCycleComment ?? ""} placeholder="O que melhorar no próximo ciclo?" className={areaClass} />
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {(
                  [
                    ["O que evoluiu", current?.evaluation.evolvedComment],
                    ["O que precisa desenvolver", current?.evaluation.developComment],
                    ["Principal conquista", current?.evaluation.achievementComment],
                    ["Próximo ciclo", current?.evaluation.nextCycleComment],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-[1.2rem] bg-white px-4 py-3.5">
                    <p className="text-xs text-ink-subtle">{label}</p>
                    <p className="mt-1 text-sm">{value?.trim() ? value : "Sem resposta."}</p>
                  </div>
                ))}
              </div>
            )}
          </SoftCard>
        ) : null}

        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <button name="intent" value="draft" className={ghostButtonClass}>
              Salvar rascunho
            </button>
            <button name="intent" value="submit" className={primaryButtonClass}>
              Enviar avaliação
            </button>
          </div>
        ) : submitted ? (
          <p className="text-sm text-muted-foreground">
            {type === "LEADER"
              ? "Esta avaliação já foi recebida e não pode mais ser alterada."
              : "Esta avaliação já foi enviada e não pode mais ser alterada."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Esta avaliação ainda não foi registrada.</p>
        )}
      </form>
    </div>
  );
}
