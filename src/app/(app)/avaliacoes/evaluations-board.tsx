import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Cell, ListCard, ListRow, StatusPill, statusLabel, statusTone } from "@/components/ui/listing";
import { TabLinks } from "@/components/ui/tab-links";
import { PageIntro } from "../dashboard/dashboards";

export type EvaluationRow = {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  type: "SELF" | "LEADER";
  status: string;
};

export function EvaluationsBoard({
  tab,
  selfEvals,
  receivedEvals,
  basePath,
  title,
  selfKicker,
  receivedKicker,
  showPerson,
  selfStart,
}: {
  tab: "auto" | "recebidas";
  selfEvals: EvaluationRow[];
  receivedEvals: EvaluationRow[];
  basePath: string;
  title: string;
  selfKicker: string;
  receivedKicker: string;
  showPerson: boolean;
  selfStart?: { href: string; started: boolean } | null;
}) {
  const rows = tab === "recebidas" ? receivedEvals : selfEvals;
  const receivedHref = basePath.includes("?")
    ? `${basePath}&aba=recebidas`
    : `${basePath}?aba=recebidas`;
  const showSelfStart = tab === "auto" && Boolean(selfStart);
  const showEmpty = rows.length === 0 && !showSelfStart;

  return (
    <div className={showSelfStart || showEmpty ? "flex min-h-[calc(100dvh-7.75rem)] flex-col gap-5" : "space-y-5"}>
      <div className="space-y-5">
      <PageIntro title={title} kicker={tab === "recebidas" ? receivedKicker : selfKicker} />

      <TabLinks
        active={tab}
        tabs={[
          { value: "auto", label: "Autoavaliações", href: basePath, count: selfEvals.length },
          {
            value: "recebidas",
            label: "Avaliações recebidas",
            href: receivedHref,
            count: receivedEvals.length,
          },
        ]}
      />
      </div>

      {showSelfStart && selfStart ? (
        <EmptyState
          icon={ClipboardList}
          action={{
            href: selfStart.href,
            label: selfStart.started ? "Continuar autoavaliação" : "Fazer autoavaliação",
          }}
        >
          Sua autoavaliação ainda está em aberto. É por ela que o ciclo começa.
        </EmptyState>
      ) : showEmpty ? (
        <EmptyState icon={ClipboardList}>
          {tab === "recebidas"
            ? "Nenhuma avaliação de líder ainda."
            : "Nenhuma autoavaliação ainda."}
        </EmptyState>
      ) : (
      <ListCard columns={showPerson ? ["Ciclo", "Pessoa", "Status"] : ["Ciclo", "Status"]}>
        {rows.map((item) => (
          <ListRow key={item.id}>
            <Cell>
              <Link
                href={`/avaliacoes/${item.cycleId}?employee=${item.employeeId}&type=${item.type}`}
                className="font-medium hover:underline"
              >
                {item.cycleName}
              </Link>
            </Cell>
            {showPerson ? <Cell className="text-muted-foreground">{item.employeeName}</Cell> : null}
            <Cell className="flex items-center justify-between gap-3">
              <StatusPill tone={statusTone(item.status)}>
                {tab === "recebidas" && item.status === "SUBMITTED" ? "Recebida" : statusLabel(item.status)}
              </StatusPill>
              <Link
                href={`/avaliacoes/${item.cycleId}?employee=${item.employeeId}&type=${item.type}`}
                aria-label={`Ver ${item.cycleName}`}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-accent-wash hover:text-accent-strong"
              >
                <ChevronRight className="size-4" />
              </Link>
            </Cell>
          </ListRow>
        ))}
      </ListCard>
      )}
    </div>
  );
}
