import Link from "next/link";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listPeople, listTeams } from "@/lib/db/queries/directory";
import { listEvaluations } from "@/lib/db/queries/evaluations";
import {
  Cell,
  EmptyRow,
  ListCard,
  ListRow,
  StatusPill,
  statusLabel,
  statusTone,
} from "@/components/ui/listing";
import { PageIntro } from "../../dashboard/dashboards";

type Evaluation = Awaited<ReturnType<typeof listEvaluations>>[number];

function matches(value: string | null | undefined, term: string) {
  return (value ?? "").toLowerCase().includes(term);
}

function SearchForm({
  time,
  q,
  placeholder,
}: {
  time?: string;
  q?: string;
  placeholder: string;
}) {
  return (
    <form action="/people/avaliacoes" className="relative w-full max-w-xs">
      {time ? <input type="hidden" name="time" value={time} /> : null}
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-subtle" />
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border-0 bg-card pr-4 pl-10 text-sm outline-none transition-colors placeholder:text-ink-subtle hover:bg-border focus:bg-white focus:ring-1 focus:ring-border"
      />
    </form>
  );
}

function EvalStatus({ evaluation }: { evaluation: Evaluation | undefined }) {
  if (!evaluation) {
    return <span className="text-sm text-ink-subtle">Não iniciada</span>;
  }
  return (
    <Link
      href={`/avaliacoes/${evaluation.cycleId}?employee=${evaluation.employeeId}&type=${evaluation.type}`}
      className="inline-flex hover:opacity-80"
    >
      <StatusPill tone={statusTone(evaluation.status)}>{statusLabel(evaluation.status)}</StatusPill>
    </Link>
  );
}

export default async function CompanyEvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string; q?: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  const { time, q } = await searchParams;
  const term = q?.trim().toLowerCase() ?? "";
  const [teams, people, evaluations] = await Promise.all([
    listTeams(user.companyId),
    listPeople(user.companyId),
    listEvaluations(user.companyId),
  ]);

  const unassigned = people.filter((person) => !person.teamId);
  const teamOptions = [
    ...teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: people.filter((person) => person.teamId === team.id),
    })),
    ...(unassigned.length
      ? [{ id: "sem-time", name: "Sem time", members: unassigned }]
      : []),
  ];
  const visibleTeams = teamOptions.filter((team) => !term || matches(team.name, term));
  const selected = time ? teamOptions.find((team) => team.id === time) ?? null : null;

  function latest(employeeId: string, type: "SELF" | "LEADER") {
    return evaluations.find((item) => item.employeeId === employeeId && item.type === type);
  }

  function submitted(members: { employeeId: string }[], type: "SELF" | "LEADER") {
    return members.filter((person) => latest(person.employeeId, type)?.status === "SUBMITTED").length;
  }

  if (!selected) {
    return (
      <div className="space-y-5">
        <PageIntro
          title="Avaliações da empresa"
          kicker="Escolha um time para ver as pessoas"
          action={<SearchForm q={q} placeholder="Buscar time" />}
        />
        <ListCard columns={["Time", "Pessoas", "Auto", "Líder"]}>
          {visibleTeams.length === 0 ? (
            <EmptyRow>{term ? "Nenhum time encontrado." : "Nenhum time cadastrado."}</EmptyRow>
          ) : null}
          {visibleTeams.map((team) => (
            <ListRow key={team.id} href={`/people/avaliacoes?time=${team.id}`}>
              <Cell className="font-medium">{team.name}</Cell>
              <Cell className="tabular-nums text-muted-foreground">{team.members.length}</Cell>
              <Cell className="tabular-nums text-muted-foreground">
                {submitted(team.members, "SELF")}/{team.members.length}
              </Cell>
              <Cell className="flex items-center justify-between gap-3">
                <span className="tabular-nums text-muted-foreground">
                  {submitted(team.members, "LEADER")}/{team.members.length}
                </span>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-foreground">
                  <ChevronRight className="size-4" />
                </span>
              </Cell>
            </ListRow>
          ))}
        </ListCard>
      </div>
    );
  }

  const members = selected.members.filter(
    (person) =>
      !term ||
      matches(person.name, term) ||
      matches(person.email, term) ||
      matches(person.title, term),
  );

  return (
    <div className="space-y-5">
      <PageIntro
        title={selected.name}
        kicker="Avaliações das pessoas deste time"
        action={<SearchForm time={selected.id} q={q} placeholder="Buscar pessoa" />}
      />
      <Link
        href="/people/avaliacoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Times
      </Link>
      <ListCard columns={["Pessoa", "Ciclo", "Autoavaliação", "Avaliação do líder"]}>
        {members.length === 0 ? (
          <EmptyRow>{term ? "Nenhuma pessoa encontrada." : "Este time ainda não tem pessoas."}</EmptyRow>
        ) : null}
        {members.map((person) => {
          const self = latest(person.employeeId, "SELF");
          const leader = latest(person.employeeId, "LEADER");
          return (
            <ListRow key={person.employeeId}>
              <Cell>
                <span className="block truncate font-medium">{person.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {person.title ?? "Sem cargo"}
                </span>
              </Cell>
              <Cell className="text-muted-foreground">{self?.cycleName ?? leader?.cycleName ?? "—"}</Cell>
              <Cell>
                <EvalStatus evaluation={self} />
              </Cell>
              <Cell>
                <EvalStatus evaluation={leader} />
              </Cell>
            </ListRow>
          );
        })}
      </ListCard>
    </div>
  );
}
