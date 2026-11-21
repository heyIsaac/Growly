import Link from "next/link";
import { notFound } from "next/navigation";
import { advanceCycle, startCycle } from "@/lib/actions/mutations";
import { requireRole } from "@/lib/auth/session";
import {
  getCycle,
  listCycleParticipants,
  listCycleSkillRows,
} from "@/lib/db/queries/cycles";
import { listEvaluations } from "@/lib/db/queries/evaluations";
import { EmptyRow, ListCard, ListRow, Cell, StatusPill, statusLabel, statusTone } from "@/components/ui/listing";
import { CardHead, Chip, SoftCard } from "@/components/ui/surface";
import { Meter } from "@/components/ui/column-chart";
import { ProgressRing } from "@/components/ui/progress-ring";
import { PageIntro } from "../../dashboard/dashboards";
import { CycleStageBar } from "../stage-bar";

function advanceLabel(status: string) {
  if (status === "SELF_EVALUATION") return "Abrir avaliação do líder";
  if (status === "LEADER_EVALUATION") return "Abrir comparação";
  if (status === "COMPARISON" || status === "FEEDBACK") return "Encerrar ciclo";
  return null;
}

function CycleAction({ cycleId, status }: { cycleId: string; status: string }) {
  const label = advanceLabel(status);
  if (status === "DRAFT") {
    return (
      <form action={startCycle}>
        <input type="hidden" name="cycleId" value={cycleId} />
        <button className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-dark transition-all hover:bg-primary-hover active:translate-y-px">
          Iniciar ciclo
        </button>
      </form>
    );
  }
  if (!label) {
    return <StatusPill tone={statusTone(status)}>{statusLabel(status)}</StatusPill>;
  }
  return (
    <form action={advanceCycle}>
      <input type="hidden" name="cycleId" value={cycleId} />
      <button className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-dark transition-all hover:bg-primary-hover active:translate-y-px">
        {label}
      </button>
    </form>
  );
}

function formatRange(startsAt: Date, endsAt: Date) {
  const format = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  return `${format.format(startsAt)} – ${format.format(endsAt)}`;
}

export default async function CycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { id } = await params;
  const cycle = await getCycle(user.companyId, id);
  if (!cycle) notFound();
  const [participants, skills, evaluations] = await Promise.all([
    listCycleParticipants(user.companyId, id),
    listCycleSkillRows(user.companyId, id),
    listEvaluations(user.companyId),
  ]);
  const mine = evaluations.filter((item) => item.cycleId === id);
  const submitted = mine.filter((item) => item.status === "SUBMITTED").length;
  const coverage = mine.length ? Math.round((submitted / mine.length) * 100) : 0;
  const selfDone = mine.filter((item) => item.type === "SELF" && item.status === "SUBMITTED").length;
  const leaderDone = mine.filter((item) => item.type === "LEADER" && item.status === "SUBMITTED").length;
  const peopleCount = Math.max(participants.length, 1);

  return (
    <div className="space-y-5">
      <PageIntro
        title={cycle.name}
        kicker={formatRange(cycle.startsAt, cycle.endsAt)}
        action={<CycleAction cycleId={cycle.id} status={cycle.status} />}
      />

      <SoftCard>
        <CycleStageBar status={cycle.status} />
      </SoftCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <SoftCard className="flex items-center gap-6">
          <ProgressRing value={coverage} label="enviadas" size={148} />
          <div className="min-w-0 flex-1 space-y-4">
            <CardHead
              title="Andamento"
              hint={`${submitted} de ${mine.length} avaliações já enviadas, entre autoavaliação e líder.`}
            />
            <div className="group/meter">
              <div className="mb-1.5 flex justify-between text-sm">
                <span>Autoavaliação</span>
                <span className="tabular-nums text-muted-foreground">
                  {selfDone}/{participants.length}
                </span>
              </div>
              <Meter value={selfDone} max={peopleCount} />
            </div>
            <div className="group/meter">
              <div className="mb-1.5 flex justify-between text-sm">
                <span>Avaliação do líder</span>
                <span className="tabular-nums text-muted-foreground">
                  {leaderDone}/{participants.length}
                </span>
              </div>
              <Meter value={leaderDone} max={peopleCount} />
            </div>
          </div>
        </SoftCard>
        <SoftCard>
          <CardHead
            title="Competências no ciclo"
            hint="O que cada pessoa e o líder vão avaliar neste ciclo."
          />
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Chip key={skill.skillId} tone="white">
                {skill.name}
              </Chip>
            ))}
          </div>
        </SoftCard>
      </div>

      <ListCard columns={["Participante", "Autoavaliação", "Líder", ""]}>
        {participants.length === 0 ? <EmptyRow>Nenhum participante.</EmptyRow> : null}
        {participants.map((person) => {
          const self = mine.find(
            (item) => item.employeeId === person.employeeId && item.type === "SELF",
          );
          const leader = mine.find(
            (item) => item.employeeId === person.employeeId && item.type === "LEADER",
          );
          return (
            <ListRow key={person.employeeId}>
              <Cell className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent-strong">
                  {person.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-medium">{person.name}</span>
              </Cell>
              <Cell>
                <StatusPill tone={self?.status ? statusTone(self.status) : "muted"}>
                  {statusLabel(self?.status)}
                </StatusPill>
              </Cell>
              <Cell>
                <StatusPill tone={leader?.status ? statusTone(leader.status) : "muted"}>
                  {statusLabel(leader?.status)}
                </StatusPill>
              </Cell>
              <Cell>
                <Link
                  className="rounded-full bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-accent-wash hover:text-accent-strong"
                  href={`/avaliacoes/${cycle.id}?employee=${person.employeeId}&type=SELF`}
                >
                  Ver comparação
                </Link>
              </Cell>
            </ListRow>
          );
        })}
      </ListCard>
    </div>
  );
}
