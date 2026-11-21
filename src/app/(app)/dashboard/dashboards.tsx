import Link from "next/link";
import { cn } from "cn";
import { ArrowUpRight, CalendarPlus, Check, ClipboardList, CreditCard, Flag, GitCompare, Settings2, Sparkles, Target, TrendingUp, UserPlus, Users } from "lucide-react";
import { formatBRL } from "@/lib/billing/plans";
import { ColumnChart, Meter } from "@/components/ui/column-chart";
import { GapRadar, type GapRadarItem } from "@/components/ui/gap-radar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { BigNumber, CardHead, Chip, Row, RowList, SoftCard } from "@/components/ui/surface";
import { CycleStageBar } from "../ciclos/stage-bar";
import { statusLabel as cycleStatusLabel } from "@/components/ui/listing";
import type { LeaderDashboardData } from "@/lib/dashboard/leader-home";
import { teamPhase, TEAM_PHASES } from "@/lib/dashboard/team-phase";
import type { SessionUser } from "@/lib/db/queries/users";
import type { ReactNode } from "react";

export function SkillBars({
  skills,
}: {
  skills: { name: string; currentLevel: number; previousLevel: number | null; scaleMax: number }[];
}) {
  if (!skills.length) {
    return <p className="text-sm text-muted-foreground">Nenhuma skill registrada.</p>;
  }
  return (
    <div className="space-y-3.5">
      {skills.map((skill, index) => (
        <div key={skill.name}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{skill.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {skill.previousLevel ?? "–"} → {skill.currentLevel}/{skill.scaleMax}
            </span>
          </div>
          <Meter value={skill.currentLevel} max={skill.scaleMax} delay={index * 60} />
        </div>
      ))}
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <p className="text-sm text-muted-foreground">{kicker}</p> : null}
        <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function OpenLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Abrir"
      className="inline-flex size-8 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border transition-transform hover:-translate-y-0.5"
    >
      <ArrowUpRight className="size-4" />
    </Link>
  );
}

type OnboardingStep = { id: string; label: string; done: boolean; href: string };

type SubscriptionSummary = {
  planName: string;
  seats: number;
  seatsUsed: number;
  monthlyCents: number;
  since: string;
};

function OnboardingCard({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((step) => step.done).length;
  const nextId = steps.find((step) => !step.done)?.id;
  return (
    <SoftCard className="xl:col-span-2">
      <CardHead
        title="Primeiros passos"
        hint={`${done} de ${steps.length} prontos. O próximo passo libera o primeiro ciclo.`}
      />
      <div className="chart-track mb-5 h-2 overflow-hidden rounded-full">
        <div
          className="bar-in chart-bar h-full rounded-full bg-primary"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>
      <ol className="divide-y divide-border/70">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Link href={step.href} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  step.done ? "bg-primary text-dark" : "bg-white text-ink-muted ring-1 ring-border",
                )}
              >
                {step.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm",
                  step.done && "text-muted-foreground line-through decoration-ink-subtle/50",
                  step.id === nextId && "font-semibold",
                )}
              >
                {step.label}
              </span>
              {step.id === nextId ? (
                <span className="rounded-full bg-dark px-3 py-1 text-xs font-medium text-white">Fazer agora</span>
              ) : (
                <ArrowUpRight className="size-4 shrink-0 text-ink-subtle" />
              )}
            </Link>
          </li>
        ))}
      </ol>
    </SoftCard>
  );
}

function PlanCard({ subscription }: { subscription: SubscriptionSummary }) {
  return (
    <SoftCard tone="dark" className="flex h-full flex-col">
      <CardHead
        title="Plano contratado"
        hint="Vagas em uso diante do que a empresa contratou."
        tone="dark"
        action={<CreditCard className="size-4 text-white/60" />}
      />
      <p className="text-[2rem] leading-none font-semibold tracking-tight text-primary">
        {subscription.planName}
      </p>
      <p className="mt-2 text-sm text-white/60">
        {formatBRL(subscription.monthlyCents)}/mês · desde {formatShortDate(subscription.since)}
      </p>
      <div className="mt-auto pt-6">
        <div className="mb-1.5 flex justify-between text-sm text-white">
          <span>Pessoas</span>
          <span className="tabular-nums text-white/60">
            {subscription.seatsUsed}/{subscription.seats}
          </span>
        </div>
        <div className="chart-track h-2 overflow-hidden rounded-full">
          <div
            className="bar-in chart-bar h-full rounded-full bg-primary"
            style={{ width: `${Math.min((subscription.seatsUsed / Math.max(subscription.seats, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </SoftCard>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(value),
  );
}

function daysUntil(value: string) {
  const end = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function HrDashboardView({
  user,
  stats,
  chart,
  cycle,
  pendingPeople,
  attention,
  invited,
  teams,
  onboarding,
  subscription,
}: {
  user: SessionUser;
  onboarding: OnboardingStep[];
  subscription: SubscriptionSummary | null;
  stats: {
    people: number;
    cycles: number;
    openCycles: number;
    plans: number;
    submittedEvaluations: number;
  };
  chart: { label: string; value: number; max: number }[];
  cycle: {
    id: string;
    name: string;
    status: string;
    startsAt: string;
    endsAt: string;
    peopleCount: number;
    selfDone: number;
    leaderDone: number;
  } | null;
  pendingPeople: { employeeId: string; name: string; detail: string; done: boolean }[];
  attention: {
    employeeId: string;
    name: string;
    kind: "self" | "leader" | "both" | "gap" | "invite";
    label: string;
    href: string;
  }[];
  invited: { employeeId: string; name: string; title: string | null }[];
  teams: { name: string; count: number }[];
}) {
  const coverage = cycle
    ? Math.round((((cycle.selfDone + cycle.leaderDone) / Math.max(cycle.peopleCount * 2, 1)) * 100))
    : 0;
  const statusLabel = cycleStatusLabel(cycle?.status) === "—" ? "Sem ciclo" : cycleStatusLabel(cycle?.status);
  const selfMissing = cycle ? Math.max(cycle.peopleCount - cycle.selfDone, 0) : 0;
  const leaderMissing = cycle ? Math.max(cycle.peopleCount - cycle.leaderDone, 0) : 0;
  const readyCount = attention.filter((item) => item.kind === "gap").length;
  const daysLeft = cycle ? daysUntil(cycle.endsAt) : null;
  const nextStep = !cycle
    ? "Abra um ciclo para gerar as avaliações da empresa."
    : daysLeft !== null && daysLeft < 0
      ? "O prazo do ciclo já passou. Feche o que ainda está em aberto."
      : selfMissing > 0
        ? `Ainda faltam ${selfMissing} autoavaliaç${selfMissing === 1 ? "ão" : "ões"}.`
        : leaderMissing > 0
          ? `Ainda faltam ${leaderMissing} avaliaç${leaderMissing === 1 ? "ão" : "ões"} de líder.`
          : readyCount > 0
            ? `${readyCount} pessoa${readyCount === 1 ? "" : "s"} já pode${readyCount === 1 ? "" : "m"} entrar na conversa de GAP.`
            : "Nada pendente neste ciclo.";

  const attentionPreview = attention.slice(0, 4);
  const attentionRemaining = Math.max(attention.length - attentionPreview.length, 0);
  const attentionHref = cycle ? `/avaliacoes/${cycle.id}` : "/people/avaliacoes";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Visão geral de hoje</p>
            <h1 className="text-[2.6rem] leading-tight font-semibold tracking-tight">
              Olá, {user.name.split(" ")[0]}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <BigNumber value={String(stats.people)} label="Pessoas" icon={<Users className="size-3.5" />} />
            <BigNumber value={String(stats.submittedEvaluations)} label="Avaliações" icon={<Target className="size-3.5" />} />
            <BigNumber value={String(stats.plans)} label="PDIs" icon={<Sparkles className="size-3.5" />} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/pessoas", label: "Cadastrar pessoa", icon: UserPlus },
            { href: "/ciclos", label: "Abrir um ciclo", icon: CalendarPlus },
            { href: "/people/desenvolvimento", label: "Evolução da empresa", icon: Sparkles },
            { href: "/competencias", label: "Ajustar competências", icon: Settings2 },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-border px-4 text-sm font-medium text-foreground transition-all hover:-translate-y-px hover:bg-ink-subtle/25"
            >
              <item.icon className="size-3.5 text-ink-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SoftCard className="flex h-full flex-col">
          <CardHead
            title="Andamento"
            hint={
              cycle
                ? `${statusLabel} · quem já enviou autoavaliação e avaliação do líder`
                : "Abra um ciclo para acompanhar os envios da empresa."
            }
            action={cycle ? <OpenLink href={`/ciclos/${cycle.id}`} /> : <OpenLink href="/ciclos" />}
          />
          {cycle ? (
            <div className="flex flex-1 flex-col justify-between gap-6 pt-6">
              <div className="flex justify-center">
                <ProgressRing value={coverage} label="enviadas" size={220} />
              </div>
              <div className="w-full space-y-3.5">
                <div className="group/meter">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>Autoavaliação</span>
                    <span className="tabular-nums text-muted-foreground">
                      {cycle.selfDone}/{cycle.peopleCount}
                    </span>
                  </div>
                  <Meter value={cycle.selfDone} max={Math.max(cycle.peopleCount, 1)} />
                </div>
                <div className="group/meter">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>Avaliação do líder</span>
                    <span className="tabular-nums text-muted-foreground">
                      {cycle.leaderDone}/{cycle.peopleCount}
                    </span>
                  </div>
                  <Meter value={cycle.leaderDone} max={Math.max(cycle.peopleCount, 1)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {cycle.peopleCount} {cycle.peopleCount === 1 ? "pessoa" : "pessoas"} neste ciclo
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Abra um ciclo para a empresa começar as avaliações.
            </p>
          )}
        </SoftCard>

        <SoftCard className="flex h-full flex-col xl:col-span-2">
          <CardHead
            title="Atenção"
            hint={nextStep}
            action={<OpenLink href={attentionHref} />}
          />
          {attentionPreview.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada pedindo ação agora.</p>
          ) : (
            <div className="flex-1">
              <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">
                Mais urgentes
              </p>
              <div className="divide-y divide-border/70">
                {attentionPreview.map((item) => (
                  <Link
                    key={`${item.kind}-${item.employeeId}`}
                    href={item.href}
                    className="flex items-center gap-3 py-2.5 transition-colors hover:text-foreground"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-ink-muted">
                      {item.kind === "gap" ? (
                        <GitCompare className="size-3.5" />
                      ) : item.kind === "invite" ? (
                        <UserPlus className="size-3.5" />
                      ) : (
                        <ClipboardList className="size-3.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.label}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-subtle" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
            {daysLeft !== null ? (
              <p className="text-[11px] text-muted-foreground">
                {daysLeft < 0
                  ? `Prazo encerrado há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) === 1 ? "" : "s"}`
                  : daysLeft === 0
                    ? "O ciclo fecha hoje"
                    : `${daysLeft} dia${daysLeft === 1 ? "" : "s"} até o fim do ciclo`}
              </p>
            ) : (
              <span />
            )}
            {attentionRemaining > 0 ? (
              <Link href={attentionHref} className="text-xs font-medium text-accent-strong hover:underline">
                Ver todas as {attention.length} pendências
              </Link>
            ) : attention.length > 0 ? (
              <Link href={attentionHref} className="text-xs font-medium text-accent-strong hover:underline">
                Abrir avaliações
              </Link>
            ) : null}
          </div>
        </SoftCard>
      </div>

      <SoftCard>
        <CardHead
          title="Média de competências"
          hint="Média da nota mais recente de cada competência na empresa."
          action={<OpenLink href="/relatorios" />}
        />
        <GapRadar
          items={chart.map((item) => ({
            id: item.label,
            label: item.label,
            self: item.value,
            leader: null,
            max: item.max,
          }))}
          labels={{ self: "Média da empresa" }}
        />
      </SoftCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SoftCard>
          <CardHead
            title="Pessoas convidadas"
            hint={
              invited.length
                ? `${invited.length} ${invited.length === 1 ? "pessoa ainda não fez" : "pessoas ainda não fizeram"} o primeiro acesso`
                : "Todo mundo já entrou na plataforma."
            }
          />
          {invited.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todo mundo já acessou a plataforma.</p>
          ) : (
            <RowList>
              {invited.slice(0, 3).map((person) => (
                <Row key={person.employeeId}>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {person.title ?? "Convite enviado"}
                    </span>
                  </span>
                  <Chip tone="muted">Convite</Chip>
                </Row>
              ))}
            </RowList>
          )}
          <Link
            href="/pessoas"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-dark px-4 text-sm font-medium text-white transition-colors hover:bg-foreground"
          >
            Ver todas
          </Link>
        </SoftCard>

        <SoftCard>
          <CardHead
            title="Times"
            hint="Como as pessoas estão distribuídas entre os times."
            action={<OpenLink href="/times" />}
          />
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum time cadastrado.</p>
          ) : (
            <div className="space-y-3.5">
              {teams.map((team, index) => (
                <div key={team.name} className="group/meter">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{team.name}</span>
                    <span className="tabular-nums text-muted-foreground">{team.count}</span>
                  </div>
                  <Meter value={team.count} max={Math.max(stats.people, 1)} delay={index * 50} />
                </div>
              ))}
            </div>
          )}
        </SoftCard>
      </div>
    </div>
  );
}

export function LeaderDashboardView({
  user,
  cycle,
  people,
  participants,
  selfDone,
  leaderDone,
  withPlan,
  avgPdi,
  skills,
}: { user: SessionUser } & LeaderDashboardData) {
  const leaderCoverage = participants ? Math.round((leaderDone / participants) * 100) : 0;
  const days = cycle ? daysUntil(cycle.endsAt) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Acompanhamento do seu time</p>
          <h1 className="text-[2.6rem] leading-tight font-semibold tracking-tight">
            Olá, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <BigNumber value={String(people.length)} label="Liderados" icon={<Users className="size-3.5" />} />
          <BigNumber
            value={`${leaderDone}/${participants}`}
            label="Avaliados"
            icon={<ClipboardList className="size-3.5" />}
          />
          <BigNumber value={`${avgPdi}%`} label="PDI médio" icon={<Sparkles className="size-3.5" />} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SoftCard className="flex h-full flex-col xl:col-span-2">
          <CardHead
            title="Ciclo do time"
            hint={
              cycle
                ? `${cycle.name}: autoavaliações do time e as avaliações que você ainda deve fazer`
                : "Quando o RH abrir um ciclo, o andamento do time aparece aqui."
            }
          />
          {cycle ? (
            <div className="flex flex-1 flex-col gap-6 pt-2">
              <CycleStageBar status={cycle.status} />
              <div className="flex flex-1 flex-col items-center gap-8 sm:flex-row sm:items-center">
                <div className="flex shrink-0 justify-center sm:w-56">
                  <ProgressRing value={leaderCoverage} label="avaliados por você" size={184} />
                </div>
                <div className="w-full flex-1 space-y-3.5">
                <div className="group/meter">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>Autoavaliação</span>
                    <span className="tabular-nums text-muted-foreground">
                      {selfDone}/{participants}
                    </span>
                  </div>
                  <Meter value={selfDone} max={Math.max(participants, 1)} />
                </div>
                <div className="group/meter">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>Sua avaliação</span>
                    <span className="tabular-nums text-muted-foreground">
                      {leaderDone}/{participants}
                    </span>
                  </div>
                  <Meter value={leaderDone} max={Math.max(participants, 1)} delay={60} />
                </div>
                {days !== null ? (
                  <p className="text-[11px] text-muted-foreground">
                    {days < 0
                      ? `Prazo encerrado há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`
                      : days === 0
                        ? "O ciclo fecha hoje"
                        : `${days} dia${days === 1 ? "" : "s"} até o fim do ciclo`}
                  </p>
                ) : null}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Quando o RH abrir um ciclo, o andamento do time aparece aqui.
            </p>
          )}
        </SoftCard>

        <SoftCard>
          <CardHead
            title="Meu time"
            hint={`${withPlan} de ${people.length} já ${withPlan === 1 ? "abriu" : "abriram"} um plano de desenvolvimento`}
          />
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum liderado atribuído.</p>
          ) : (
            <div className="flex h-full flex-col">
              <div className="space-y-2">
                {people.slice(0, 3).map((person) => {
                  const phase = TEAM_PHASES.find((item) => item.id === teamPhase(person));
                  return (
                    <Link
                      key={person.employeeId}
                      href={`/pdi?employee=${person.employeeId}`}
                      className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white px-3 py-2.5 transition-colors hover:bg-accent-wash"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{person.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {person.title ?? "Sem cargo"}
                        </span>
                      </span>
                      <Chip tone={phase?.id === "done" ? "accent" : "muted"}>{phase?.label}</Chip>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/meu-time/pessoas"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-dark px-4 text-sm font-medium text-white transition-colors hover:bg-foreground"
              >
                Ver todos
              </Link>
            </div>
          )}
        </SoftCard>
      </div>

      <SoftCard>
        <CardHead
          title="Competências do time"
          hint="Nota média atual de cada competência entre os liderados."
        />
        <ColumnChart items={skills} prominent />
      </SoftCard>
    </div>
  );
}

export function EmployeeDashboardView({
  user,
  radar,
  cycleName,
  goalCount,
  pendingEvaluation,
  showEvolution,
}: {
  user: SessionUser;
  radar: GapRadarItem[];
  cycleName: string | null;
  goalCount: number;
  pendingEvaluation: { href: string; started: boolean } | null;
  showEvolution: boolean;
}) {
  const hasSelf = radar.some((item) => item.self != null);
  const hasPair = radar.some((item) => item.self != null && item.leader != null);
  const shortcuts = [
    {
      href: pendingEvaluation?.href ?? "/avaliacoes",
      label: pendingEvaluation
        ? pendingEvaluation.started
          ? "Continuar autoavaliação"
          : "Fazer autoavaliação"
        : "Minhas avaliações",
      icon: ClipboardList,
    },
    { href: "/pdi", label: "Meu PDI", icon: Flag },
    ...(showEvolution ? [{ href: "/evolucao", label: "Ver evolução", icon: TrendingUp }] : []),
  ];

  return (
    <div className={hasSelf ? "space-y-8" : "flex min-h-[calc(100dvh-7.75rem)] flex-col"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">{user.title ?? "Seu desenvolvimento"}</p>
            <h1 className="text-[2.6rem] leading-tight font-semibold tracking-tight">
              Olá, {user.name.split(" ")[0]}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <BigNumber value={String(goalCount)} label="Objetivos" icon={<Target className="size-3.5" />} />
            <BigNumber value={String(radar.length)} label="Competências" icon={<Sparkles className="size-3.5" />} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-border px-4 text-sm font-medium text-foreground transition-all hover:-translate-y-px hover:bg-ink-subtle/25"
            >
              <item.icon className="size-3.5 text-ink-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {hasSelf ? (
        <SoftCard>
          <CardHead
            title="Competências"
            hint={
              hasPair
                ? `Autoavaliação e nota do líder${cycleName ? ` em ${cycleName}` : ""}.`
                : `Sua autoavaliação${cycleName ? ` em ${cycleName}` : ""}. A do líder entra quando for enviada.`
            }
            action={<OpenLink href="/avaliacoes" />}
          />
          <GapRadar items={radar} />
        </SoftCard>
      ) : (
        <EmptyState
          icon={ClipboardList}
          action={{
            href: pendingEvaluation?.href ?? "/avaliacoes",
            label: pendingEvaluation?.started ? "Continuar autoavaliação" : "Fazer autoavaliação",
          }}
        >
          A autoavaliação mostra onde você está. Faça a sua para ver as competências aqui.
        </EmptyState>
      )}
    </div>
  );
}
